// based on router implementation by Stephan Fischli (fhs1)
// https://gitlab.ti.bfh.ch/fhs1-courses/webprog/todo-spa

import { logger } from "./logger.js";

const routes = {};

export const router = {
  register: function (path, Component, guard) {
    logger.debug(`Register component with path ${path}`);
    routes[path] = { Component, guard };
  },
  navigate: function (path) {
    if (location.hash === "#" + path) navigate(path);
    else location.hash = path;
  },
};

window.onhashchange = () => navigate(location.hash.replace("#", ""));

function navigate(path) {
  logger.debug(`Navigate to path ${path}`);
  let [name, parameter] = path.split("/").splice(1);
  name = name ? name.split("?")[0] : "";
  let route = routes["/" + name];
  if (route && (!route.guard || route.guard()))
    show(route.Component, parameter);
  else router.navigate("/");
}

function show(Component, parameter) {
  logger.debug(`Show component ${Component.name}`);

  let component = new Component(parameter);
  document.title = component.getTitle();
  main.replaceChildren(component.getView());
}
