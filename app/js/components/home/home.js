import { Component } from "../component.js";

export class Home extends Component {
  constructor() {
    super("Decibel Threshold Event Displayer", "", "center");
    this.#init();
  }

  async #init() {
    await this._load("home/home.html");
  }
}
