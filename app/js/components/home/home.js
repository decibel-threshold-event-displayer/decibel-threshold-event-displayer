"use strict";

import { engine } from "../../engine.js";
import { toast } from "../../toast.js";
import { ENGINE_GENERATE_STATUS } from "../../enum.js";
import { Component } from "../component.js";
import {
  FileDurationTooLongError,
  WaveFileWrapperError,
} from "../../audio/wavefilewrapper.js";

export class Home extends Component {
  #renderButton;
  #downloadButton;
  #pdfLink;
  #preview;
  #embed;
  #formData = {
    threshold: null,
    minDb: null,
    maxDb: null,
    location: "",
    time: "",
    device: "",
    distance: null,
    file: null,
  };
  #dateFormat = new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  constructor() {
    super("Decibel Threshold Event Displayer", "", "center");
    this.#init();
  }

  async #init() {
    await this._load("home/home.html");
    this.#preview = this._select("#preview");
    this.#preview.style.display = "none";
    this.#embed = this._select("#embed");
    this.#renderButton = this._select("#render");
    this.#renderButton.onclick = () => this.#onRender();
    this.#downloadButton = this._select("#download");
    this.#downloadButton.onclick = () => this.#onDownload();
    this.#downloadButton.style.display = "none";
    this._bind(this.#formData);
    this._selectAll('[data-bs-toggle="tooltip"]').forEach(
      (tooltip) => new bootstrap.Tooltip(tooltip)
    );
  }

  async #onRender() {
    if (!this.#validateForm()) return;

    this.#renderButton.disabled = true;
    this.#downloadButton.style.display = "none";
    this.#preview.style.display = "none";

    try {
      const res = await engine.generate(
        this._select("#file").files[0],
        this.#formData,
        (status) => this.#onStatusUpdate(status)
      );

      this.#embed.src = res + "#toolbar=0&navpanes=0&scrollbar=0";
      this.#pdfLink = res;
      this.#downloadButton.style.display = "block";
      this.#preview.style.display = "block";
    } catch (error) {
      if (error instanceof WaveFileWrapperError) {
        toast.show(
          "An error occurred while parsing the audio file: " + error.message
        );
      } else if (error instanceof FileDurationTooLongError) {
        toast.show("Recordings must be shorter than 15 minutes.");
      } else {
        toast.show("Something went wrong preparing your file.");
      }
      console.error(error);
    }

    this.#renderButton.disabled = false;
  }

  #validateForm() {
    const form = this._select("form");
    const threshold = this._select("#threshold");
    const minDb = this._select("#minDb");
    const maxDb = this._select("#maxDb");
    const fileUpload = this._select("#file");

    if (parseFloat(minDb.value) >= parseFloat(maxDb.value)) {
      console.log("asads")
      maxDb.setCustomValidity("invalid");
    }
    else maxDb.setCustomValidity("");

    if (
      isNaN(parseFloat(threshold.value)) ||
      parseFloat(threshold.value) >= parseFloat(maxDb.value) ||
      parseFloat(threshold.value) <= 0
    )
      threshold.setCustomValidity("invalid");
    else threshold.setCustomValidity("");

    if (!this.#formData.file?.endsWith(".wav"))
      fileUpload.setCustomValidity("invalid");
    else fileUpload.setCustomValidity("");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return false;
    }

    return true;
  }

  #onDownload() {
    const link = document.createElement("a");
    const now = new Date();
    const timestamp = this.#dateFormat.format(now).replaceAll(".", "_");
    link.download = `db_threshold_event_displayer_result_${timestamp}.pdf`;
    link.href = this.#pdfLink;
    link.click();
  }

  #onStatusUpdate(status) {
    this.#renderButton.innerHTML = this.#formatGenerationStatus(status);
  }

  #formatGenerationStatus(status) {
    switch (status) {
      case ENGINE_GENERATE_STATUS.INITIALIZATION:
        return "Initializing PDF engine...";
      case ENGINE_GENERATE_STATUS.ANALYZING_FILE:
        return "Analyzing your WAV file...";
      case ENGINE_GENERATE_STATUS.READYING_FILE:
        return "Preparing file structure...";
      case ENGINE_GENERATE_STATUS.GENERATING:
        return "Generating your PDF...";
      default:
        return "Generate PDF";
    }
  }
}
