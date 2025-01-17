# Decibel Threshold Event Displayer

- [Web Application](https://decibel-threshold-event-displayer.github.io/)
- [Project Documentation Download](./doc/report/report.pdf)

Noise pollution affects one in seven people in Switzerland, primarily caused by road
traffic, railways, and air traffic, along with secondary sources such as construction sites
and nightclubs. To address this issue, affected individuals must provide evidence, typically
through audio recordings. This project aims to create a free, open-source, and platform independent application, 
which helps individuals in documenting noise pollution.

The application processes *.wav files, filters the data by a given threshold and generates a
PDF with an according plot which can be used as evidence. For a meaningful interpretation of a *.wav file, the user must provide a minimal and maximal dB(A) provided by an
external tool, such as smartphone apps like DecibelX.

![Decibel Threshold Event Displayer - Application Screenshot](https://raw.githubusercontent.com/decibel-threshold-event-displayer/decibel-threshold-event-displayer.github.io/refs/heads/main/doc/assets/abstract_preview.png)

## Technologies
- JS/HTML/CSS/WASM
- [LaTeX.wasm: LaTeX Engines in Browsers](https://www.swiftlatex.com/) ([GNU Affero General Public License v3.0](https://github.com/SwiftLaTeX/SwiftLaTeX/blob/master/LICENSE))
- [LaTeX](https://www.latex-project.org/) ([The LaTeX Project Public License](https://www.latex-project.org/lppl.txt))
- [pgfplots](https://ctan.org/pkg/pgfplots) ([GNU General Public License, version 3 or newer](https://ctan.org/license/gpl3))
- [WAV](https://en.wikipedia.org/wiki/WAV)
- [Bootstrap](https://getbootstrap.com/) ([MIT License](https://github.com/twbs/bootstrap/blob/main/LICENSE))

## Local Development Setup
This application is client side only (HTML,CSS,JS,WASM) and does not require a build step,
but to work properly it needs a local web server because WASM is executed in a web worker.

Any local webserver should work to run the application, the webservers root path should be set to `./app`. 
The following options are used by the project team:

If `make` and `python` are installed:
```bash
make dev
```

If `python` is installed, but `make` is missing (e.g. Windows):
```bash
python -m http.server -d app || python3 -m http.server -d app 
```

## Build Documentation
The documentation is based on LaTeX and uses a lot of libraries, thus it needs a proper installation.
We strongly recommend the following installation guide: https://tug.org/texlive/quickinstall.html

The full installation guide is available here: https://tug.org/texlive/doc/texlive-en/texlive-en.html#installation

The whole documentation can be built with the following command:
```bash
make docs
```

The whole documentation can be cleaned with the following command:
```bash
make clean
```

Clean and rebuild:
```bash
make clean && make docs
```

## Authors
* Darius Degel: [darius.degel@students.bfh.ch](mailto:darius.degel@students.bfh.ch)
* Dominic Gernert: [dominic.gernert@students.bfh.ch](mailto:dominic.gernert@students.bfh.ch)
* Lukas von Allmen: [lukas.vonallmen@students.bfh.ch](lukas.vonallmen@students.bfh.ch)

## Advisor
Dr. Simon Kramer: [Website](https://www.simon-kramer.ch/)

## LICENSE
This project is released under the [GNU GENERAL PUBLIC LICENSE](https://github.com/decibel-threshold-event-displayer/decibel-threshold-event-displayer.github.io/blob/main/LICENSE).