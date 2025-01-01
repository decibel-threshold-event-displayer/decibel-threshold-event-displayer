"use strict";

import { engine } from "../../engine.js";
import { toast } from "../../toast.js";
import { ENGINE_GENERATE_STATUS } from "../../enum.js";
import { Component } from "../component.js";
import {
<<<<<<< HEAD
  FileDurationTooLongError,
  WaveFileWrapperError,
} from "../../audio/wavefilewrapper.js";
=======
  buildWrapper,
  WaveFileWrapperError,
} from "../../audio/wavefilewrapper.js";
import { FrameCollection } from "../../audio/frame.js";
>>>>>>> 5931329 (feat: refactoring and improve error handling/user feedback)

export class Home extends Component {
  #renderButton;
  #downloadButton;
  #pdfLink;
  #preview;
  #embed;
  #formData = {
<<<<<<< HEAD
    threshold: null,
    minDb: null,
    maxDb: null,
    location: "",
    time: "",
=======
    threshold: 90,
    minDb: null,
    maxDb: null,
    location: "",
    time: this.#formatDateToDatetimeLocal(new Date()),
>>>>>>> 5931329 (feat: refactoring and improve error handling/user feedback)
    device: "",
    distance: null,
    file: null,
  };

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
<<<<<<< HEAD
    this._selectAll('[data-bs-toggle="tooltip"]').forEach(
      (tooltip) => new bootstrap.Tooltip(tooltip)
    );
=======
>>>>>>> 5931329 (feat: refactoring and improve error handling/user feedback)
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
          "An error occured while parsing the audio file: " + error.message
        );
<<<<<<< HEAD
      } else if (error instanceof FileDurationTooLongError) {
        toast.show("Recordings must be shorter than 15 minutes.");
=======
>>>>>>> 5931329 (feat: refactoring and improve error handling/user feedback)
      } else {
        toast.show("Something went wrong preparing your file.");
      }
      console.error(error);
    }

    this.#renderButton.disabled = false;
  }

  #validateForm() {
    const form = this._select("form");
<<<<<<< HEAD
    const threshold = this._select("#threshold");
=======
>>>>>>> 5931329 (feat: refactoring and improve error handling/user feedback)
    const minDb = this._select("#minDb");
    const maxDb = this._select("#maxDb");
    const fileUpload = this._select("#file");

<<<<<<< HEAD
    if (parseInt(minDb.value) >= parseInt(maxDb.value))
      maxDb.setCustomValidity("invalid");
    else maxDb.setCustomValidity("");

    console.log(parseInt(threshold.value));

    if (
      isNaN(parseInt(threshold.value)) ||
      parseInt(threshold.value) >= parseInt(maxDb.value) ||
      parseInt(threshold.value) <= 0
    )
      threshold.setCustomValidity("invalid");
    else threshold.setCustomValidity("");

=======
    if (minDb.value >= maxDb.value) maxDb.setCustomValidity("invalid");
    else maxDb.setCustomValidity("");

>>>>>>> 5931329 (feat: refactoring and improve error handling/user feedback)
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
    var link = document.createElement("a");
    link.download = "report.pdf";
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
<<<<<<< HEAD
=======

  #formatDateToDatetimeLocal(date) {
    const pad = (num) => String(num).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
>>>>>>> 5931329 (feat: refactoring and improve error handling/user feedback)
}
