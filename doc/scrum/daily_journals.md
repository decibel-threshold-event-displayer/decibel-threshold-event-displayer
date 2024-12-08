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


# 06.11.2024

**Participants**: Darius, Dominic, Lukas

**Protocol**: Lukas

---

Dominic:
- Finalize demo application: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/55
  - Implemented decibel mapping according to min and max db specified
  - Wrote documentation about how the process works
- Write report introduction: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/71
  - Wrote about the goals, requirements and the issue of calculating the decibel values
- Prepare intermediate presentation: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/28
  - created slides for the initial situation, the goals and the way audio processing works
- next steps:
  - Work on the WAV file reader

Darius:
- Write and rehearse Scrum part of the intermediate presentation https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/work_items/57
- Write project specification (system delimitation, requirements, boundaries, pre-conditions, and persona) https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/63
- Write Scrum report (scrum roles, sprint goals, requirements, and scrum adaptations) https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/work_items/57

Lukas:
- Defined contents of the Result PDF: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/21
- UX prototypes: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/63?show=38640
  - Created UX Prototype - Result PDF (based on Defined contents)
  - Created UX Prototype - Website (based on functional requirements)
  - Documented UX Prototypes
- Prepare intermediate presentation: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/28
  - Wrote about the given situation and how we plan to solve it
- next steps:
  - Enable repository mirroring: https://gitlab.ti.bfh.ch/decibel-threshold-event-displayer/decibel-threshold-event-displayer/-/issues/76


# 13.11.2024

**Participants**: Darius, Dominic, Lukas

**Protocol**: Lukas

---

The team didn't make any progress, because of the BFH block week


# 20.11.2024

**Participants**: Darius, Dominic, Lukas

**Protocol**: Lukas

---

Dominic:
- Continued working on the WAV file reader:
  - Implemented parsing logic to handle audio files
  - Added error handling for unsupported formats
  - Added testcases
- Documented the interface
- Next Steps:
  - Begin integration testing with audio filtering logic

Darius:
- Had no time to work on the project
- Next Steps:
  - Focus on implementing frontend

Lukas:
- Implemented and documented repository mirroring process
- Next Steps:
  - Implement the filtering algorithm


# 27.11.2024

**Participants**: Darius, Dominic, Lukas

**Protocol**: Lukas

Dominic:
- Implemented the assert function for the javascript test suite
- Next steps:
  - Working on test improvements

Darius:
- Demonstrated the following two tasks:
  - Implement SPA framework
  - Created html content of website
- Next:
  - Styling the website
  - Documentation

Lukas:
- Configure GitHub Pages to display the app as index
- Next steps
  - Filter data


# 08.12.2024

**Participants**: Darius, Dominic, Lukas

**Protocol**: Lukas

Dominic:
- Extended, improved and streamlined the JavaScript testing framework
  - All tests are now async/await
  - Created new test util functions
  - Improved the test frameworks UI
- Next steps:
  - Documentation for JavaScript test framework

Darius:
- Implemented the frontend:
  - Structure
  - Content
  - State management
  - Documentation
- Next:
  - Improve styling
  - Extend Documentation

Lukas:
- Implemented filter data logic
  - Calculate RMS
  - Apply threshold filter
  - Started to implement tests and got stuck
- Next steps
  - Resolve issues with filter data logic and tests
  - Write Documentation