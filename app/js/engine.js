import { Component } from "./components/component.js";
import { ENGINE_GENERATE_STATUS, ENGINE_STATUS } from "./enum.js";
import { store } from "./store.js";

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

  async generate(data = {}, onStatusUpdate = (status) => {}) {
    try {
      onStatusUpdate(ENGINE_GENERATE_STATUS.INITIALIZATION);
      const engine = await this.#getEngine();

      onStatusUpdate(ENGINE_GENERATE_STATUS.READYING_FILE);
      let template = await Component.fetchTemplate("latex/template.tex");
      template = Component.interpolate(data, template);
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
