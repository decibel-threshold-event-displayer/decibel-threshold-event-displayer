# Journal

## 16.10.2024

**Participants**: Darius, Dominic, Lukas

**Protocol**: Dominic

---

Dominic:
- showcased backlog and scripts to create report and presentation https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/work_items/36 & https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/work_items/42
- next steps:
  - read up on possible project licences

Darius:
- prototype with kotlin:
  - demo with nativ pdflatex https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/work_items/34
  - demo with bundled pdflatex https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/work_items/37
- next steps:
  - try to bundle binaries with jar
  - evaluate pros and cons

Lukas:
- demo web prototype with swiftlatex https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/work_items/51
- next steps:
  - try to publish page on github pages
  - evaluate pros and cons


## 23.10.2024

**Participants**: Darius, Dominic, Lukas

**Protocol**: Lukas

---

Dominic:
- Tried to inform himself about Wavfiles: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/27
  - It turns out that the measurement of sound in DB is not as absolute as one might think
  - We added our concern/question to the faq.md
- next steps:
  - Implement prototype for audio/*.wav parsing and analyzation 
  - Read up on FLOSS licences

Darius:
- Finalized his work and documentation on: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/16
- next steps:
  - Work on System delimination, Requirements, Usability

Lukas:
- Finalized work and documentation on: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/9
  - Implement local loading of LaTeX dependencies
  - Implement parallel loading of LaTex dependencies
  - Finalized documentation
- next steps:
  - Create hello world program and github organization

# 30.10.2024

**Participants**: Darius, Dominic, Lukas

**Protocol**: Lukas

---

Dominic:
- Implement demo application: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/55?show=38641
  - Impelemnted a poc script which can analyze *.wav
  - Read a *.wav file recorded with https://apps.apple.com/ch/app/decibel-x-pro-dba-noise-meter/id1257651611
  - We discussed the outcome of this and decided that we have to discuss it with Mr. Kramer, as the result was inaccurat  
- Read up on FLOSS licences: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/19?show=38385
  - As all dependencies GPL3, we can safely use GPL3 oursfelf
- Create hello world program: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/6?show=38376
  - We discussed the local dev setup with the demo program and the implementation with make
  - We will ask Mr. Kramer which kind of automation tool he prefers
- next steps:
  - Ask Mr. Kramer how we should handle the fact, that it's mabe not technically feasable or accurate to work with *.wav files
  - Write project licences

Darius:
- Usability: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/work_items/69
- Requirements: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/work_items/65
- System delimination: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/work_items/64
  - Created first drafts of diagrams
  - We discussed the diagrams
- next steps:
  - Ask Mr. Kramer about the specifics of system delimination 
  - Work on System delimination, Requirements, Usability

Lukas:
- Create hello world program: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/6?show=38376
  - The demo application is implemented and can be started with `make dev`, we discussed the details 
- Create github account: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/56?show=38642
  - Created the GitHub organization and invited the other project members
  - Added the prototype as a GitHub Page for reference
- next steps:
  - Ask Mr. Kramer if usage of make instead of bash scripts is okey
  - Implement UX-Prototyping