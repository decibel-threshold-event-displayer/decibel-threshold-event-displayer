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

  _load(templatePath) {
    logger.debug(TEMPLATES_ROOT + templatePath);
    return fetch(TEMPLATES_ROOT + templatePath)
      .then((response) =>
        response.ok ? response.text() : Promise.reject(response)
      )
      .then((template) => (this.#view.innerHTML = template));
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

  _interpolate(model) {
    this.#view.innerHTML = this.#view.innerHTML.replace(
      /{{(\w+)}}/g,
      (placeholder, property) => model[property] || ""
    );
  }

  _select(selector) {
    return this.#view.querySelector(selector);
  }
}
