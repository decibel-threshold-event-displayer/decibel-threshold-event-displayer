import { engine } from "../../engine.js";
import { Component } from "../component.js";

export class Home extends Component {
  #status;
  #embed;
  #renderButton;

  constructor() {
    super("Decibel Threshold Event Displayer", "", "center");
    this.#init();
  }

  async #init() {
    await this._load("home/home.html");
    this.#status = this._select("#status");
    this.#embed = this._select("#embed");
    this.#renderButton = this._select("#render");
    this.#renderButton.onclick = () => this.#render();
  }

  async #render() {
    const res = await engine.generate((status) => this.#onStatusUpdate(status));
    this.#embed.src = res;
  }

  #onStatusUpdate(status) {
    this.#status.innerHTML = `STATUS: ${status}`;
  }
}
