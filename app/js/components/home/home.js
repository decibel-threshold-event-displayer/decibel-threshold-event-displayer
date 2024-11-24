import { engine } from "../../engine.js";
import { Component } from "../component.js";

export class Home extends Component {
  #status;
  #embed;
  #renderButton;
  #formData = {
    threshold: 90,
    minDb: null,
    maxDb: null,
    location: "",
    time: this.#formatDateToDatetimeLocal(new Date()),
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
    this.#status = this._select("#status");
    this.#embed = this._select("#embed");
    this.#renderButton = this._select("#render");
    this.#renderButton.onclick = () => this.#onRender();
    this._bind(this.#formData);
  }

  async #onRender() {
    if (!this.#validateForm()) return;
    const res = await engine.generate((status) => this.#onStatusUpdate(status));
    this.#embed.src = res;
  }

  #validateForm() {
    const form = this._select("form");
    const minDb = this._select("#minDb");
    const maxDb = this._select("#maxDb");

    if (minDb.value >= maxDb.value) maxDb.setCustomValidity("invalid");
    else maxDb.setCustomValidity("");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return false;
    }

    return true;
  }

  #onStatusUpdate(status) {
    this.#status.innerHTML = `STATUS: ${status}`;
  }

  #formatDateToDatetimeLocal(date) {
    const pad = (num) => String(num).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
