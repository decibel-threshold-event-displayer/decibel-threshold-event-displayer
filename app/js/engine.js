import { Component } from "./components/component.js";
import { ENGINE_GENERATE_STATUS, ENGINE_STATUS } from "./enum.js";
import { store } from "./store.js";
import {
  buildWrapper,
  FileDurationTooLongError,
} from "./audio/wavefilewrapper.js";
import { FrameCollection } from "./audio/frame.js";

class Engine {
  #engine;
  #readyPromise;

  constructor() {
    this.#init();
  }

  async #init() {
    store.setEngineStatus(ENGINE_STATUS.LOADING);
    try {
      const dependencies = await fetch(
        "js/swiftlatex/dependencies.local.json"
      ).then((response) => response.json());

      await Promise.all(dependencies.map(async (link) => fetch(link))).then(
        (responses) => Promise.all(responses.map((res) => res.text()))
      );

      const engine = new PdfTeXEngine();
      await engine.loadEngine();
      await engine.latexWorker.postMessage({
        cmd: "settexliveurl",
        url: "/js/swiftlatex/dependencies/",
      });

      this.#engine = engine;

      store.setEngineStatus(ENGINE_STATUS.READY);
    } catch (e) {
      store.setEngineStatus(ENGINE_STATUS.ERROR);
      throw e;
    }
  }

  async #getEngine() {
    if (this.#engine) return this.#engine;
    else if (!this.#readyPromise)
      this.#readyPromise = this.#init()
        .then(() => this.#engine)
        .finally(() => (this.#readyPromise = null));
    return this.#readyPromise;
  }

  #getPlotData(filteredDbaValues, frameDuration) {
    return filteredDbaValues
      .map((dba, index) => {
        const startTime = index * frameDuration;
        const endTime = (index + 1) * frameDuration;
        const dbaInt = Math.round(dba);
        return `(${startTime.toFixed(2)},${dbaInt}) (${endTime.toFixed(
          2
        )},${dbaInt})`;
      })
      .join(" ");
  }

  #formatRecordingDate(date) {
    const pad = (num) => String(num).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}${hours}:${minutes}`;
  }

  #formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);

    if (minutes === 0) return `${secs}s`;
    else return `${minutes}m ${secs}s`;
  }

  async #analyzeFile(wavFile, threshold, minDb, maxDb) {
    const thresholdFloat = parseFloat(threshold);
    const waveFileWrapper = await buildWrapper(wavFile);

    if (waveFileWrapper.samples.length / waveFileWrapper.samplesPerSecond > 900)
      throw new FileDurationTooLongError();

    const frameCollection = new FrameCollection(
      waveFileWrapper.samples,
      waveFileWrapper.samplesPerSecond,
      waveFileWrapper.nbrOfChannels
    );

    const filteredDbaValues = frameCollection.getFilteredDbaValues(
      thresholdFloat,
      parseInt(minDb),
      parseInt(maxDb)
    );

    const maxDba = Math.max(...filteredDbaValues);

    const duration = waveFileWrapper.samples.length / waveFileWrapper.samplesPerSecond;
    var absoluteDurationOverThreshold = filteredDbaValues.filter((dbValue) => dbValue != 0).length * frameCollection.getFrameDuration();

    // check if the last frame exceeded the threshold
    // if so, we must adjust the absoluteDurtationoverThreshold, because the last frame
    // does not contain the same number of samples as the other frames and has therefore
    // a different duration then the others
    if (filteredDbaValues[filteredDbaValues.length - 1] !== 0) {
      const frames = frameCollection.getFrames();
      const lastFrame = frames[frames.length - 1];

      const nbrOfSamplesInFullFrame = Math.floor(frameCollection.getFrameDuration() * waveFileWrapper.samplesPerSecond);
      const diff = frameCollection.getFrameDuration() - ((lastFrame.getSamples().length / nbrOfSamplesInFullFrame) * frameCollection.getFrameDuration());
      absoluteDurationOverThreshold -= diff;
    }

    const relativDurationOverThreshold =
      (absoluteDurationOverThreshold / duration) * 100;

    const dbaValues = frameCollection.getMappedDbaValues(
      parseInt(minDb),
      parseInt(maxDb)
    );

    var average = 0;

    if (dbaValues.length !== 0)
      // to calculate the average, we set -Infinity values to 0
      average =
        dbaValues
          .map((dbaValue) => (dbaValue === -Infinity ? 0 : dbaValue))
          .reduce((sum, value) => sum + value, 0) / dbaValues.length;

    return {
      data: this.#getPlotData(
        filteredDbaValues,
        frameCollection.getFrameDuration()
      ),
      xmax: duration.toFixed(2),
      ymin: thresholdFloat,
      ymax: Math.ceil(Math.max(maxDba, thresholdFloat) * 1.1),
      duration: this.#formatTime(duration),
      absoluteDurationOverThreshold: this.#formatTime(
        absoluteDurationOverThreshold
      ),
      relativDurationOverThreshold: relativDurationOverThreshold.toFixed(2),
      average: average.toFixed(2),
    };
  }

  async generate(wavFile, data = {}, onStatusUpdate = (status) => {}) {
    try {
      onStatusUpdate(ENGINE_GENERATE_STATUS.INITIALIZATION);
      const engine = await this.#getEngine();

      onStatusUpdate(ENGINE_GENERATE_STATUS.ANALYZING_FILE);
      const analysis = await this.#analyzeFile(
        wavFile,
        data.threshold,
        data.minDb,
        data.maxDb
      );

      onStatusUpdate(ENGINE_GENERATE_STATUS.READYING_FILE);
      let template = await Component.fetchTemplate("latex/template.tex");
      template = Component.interpolate(
        {
          ...data,
          ...analysis,
          time: data.time ? new Date(data.time).toLocaleString() : undefined,
        },
        template
      );
      engine.writeMemFSFile("main.tex", template);
      engine.setEngineMainFile("main.tex");
      onStatusUpdate(ENGINE_GENERATE_STATUS.GENERATING);
      const result = await engine.compileLaTeX();

      if (result.status === 0) {
        const pdfblob = new Blob([result.pdf], { type: "application/pdf" });
        const objectURL = URL.createObjectURL(pdfblob);
        onStatusUpdate(ENGINE_GENERATE_STATUS.DONE);
        return objectURL;
      } else throw new Error("Something went wrong generating the PDF.");
    } catch (e) {
      onStatusUpdate(ENGINE_GENERATE_STATUS.ERROR);
      console.error(e);
      throw e;
    }
  }
}

export const engine = new Engine();
