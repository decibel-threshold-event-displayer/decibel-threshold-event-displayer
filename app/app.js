/* NOT USED ANYMORE */
/* TODO: DELETE */

const resultContainer = document.getElementById("result");
const button = document.getElementById("generate");
let engine = null;
let result = null;

function enableButton() {
  button.disabled = false;
  button.innerText = "Generate PDF";
}
function disableButton() {
  button.disabled = true;
  button.innerText = "Generating...";
}

async function init() {
  const dependencies = await fetch("./dependencies.local.json").then(
    (response) => response.json()
  );
  await Promise.all(dependencies.map(async (link) => fetch(link))).then(
    (responses) => Promise.all(responses.map((res) => res.text()))
  );

  engine = new PdfTeXEngine();
  await engine.loadEngine();
  await engine.latexWorker.postMessage({
    cmd: "settexliveurl",
    url: "/dependencies/",
  });
  button.addEventListener("click", () => generate());
}

async function generate() {
  if (button.disabled || !engine) {
    console.log("Engine not ready yet");
    return;
  }
  disableButton();

  const template = await fetch("./template.tex").then((response) =>
    response.text()
  );
  engine.writeMemFSFile("main.tex", template);
  engine.setEngineMainFile("main.tex");
  result = await engine.compileLaTeX();
  console.log(result.log);

  if (result.status === 0) {
    const pdfblob = new Blob([result.pdf], { type: "application/pdf" });
    const objectURL = URL.createObjectURL(pdfblob);
    console.log(objectURL);
    resultContainer.innerHTML = `<embed src="${objectURL}" width="100%" height="400px" type="application/pdf">`;
  }
}

init().then(enableButton);
