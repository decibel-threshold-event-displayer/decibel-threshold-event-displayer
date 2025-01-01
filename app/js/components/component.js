// based on component implementation by Stephan Fischli (fhs1)
// https://gitlab.ti.bfh.ch/fhs1-courses/webprog/todo-spa
import { logger } from "../logger.js";

const TEMPLATES_ROOT = "templates/";

export class Component {
  #title;
  #view;

  constructor(title, template = "", styleClass = "", element = "div") {
    this.#title = title;
    this.#view = document.createElement(element);
    this.#view.innerHTML = template;
    this.#view.className = styleClass;
  }

  getTitle() {
    return this.#title;
  }

  getView() {
    return this.#view;
  }

  async _load(templatePath) {
    this.#view.innerHTML = await Component.fetchTemplate(templatePath);
  }

  static async fetchTemplate(templatePath) {
    logger.debug(TEMPLATES_ROOT + templatePath);
    const response = await fetch(TEMPLATES_ROOT + templatePath);
    const template = await (response.ok
      ? response.text()
      : Promise.reject(response));
    return template;
  }

  _bind(model) {
    this.#view
      .querySelectorAll(
        "input[data-model], select[data-model], textarea[data-model]"
      )
      .forEach((element) => {
        let property = element.getAttribute("data-model");
        if (model[property]) element.value = model[property];
        element.oninput = () => (model[property] = element.value);
      });
  }

  _interpolateHTML(model) {
    this.#view.innerHTML = Component.interpolate(model, this.#view.innerHTML);
  }

  static interpolate(model, template) {
    return template.replace(
      /{{(\w+)}}/g,
      (placeholder, property) => model[property] || "-"
    );
  }

  _select(selector) {
    return this.#view.querySelector(selector);
  }

  _selectAll(selector) {
    return this.#view.querySelectorAll(selector);
  }
}
