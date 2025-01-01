"use strict";

import {Component} from "../component.js";

export class About extends Component {
    constructor() {
        super("About", "", "center");
        this.#init();
    }

    async #init() {
        // Load the corresponding HTML template
        await this._load("about/about.html");
    }
} 