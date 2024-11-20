import * as waveFileWrapperTest from './wavefilewrappertest.js';
import {buildWrapper} from "../wavefilewrapper.js";

const output = document.getElementById("output");

async function runTestGroup(testModule, name) {
    // Get all tests in the module
    const tests = Object.keys(testModule).filter(
        (key) => typeof testModule[key] === 'function'
    );

    let successful = 0;
    let failed = 0;

    for (let i in tests) {
        const testName = tests[i];

        try {
            await testModule[testName]();

            output.innerHTML += "Test " + testName + " was successful<br>";
            successful++;
        } catch (error) {
            output.innerHTML += "Test " + testName + " failed: " + error + "<br>";
            failed++;
        }
    }

    output.innerHTML += `Run ${tests.length} Tests from "${name}". Successful: ${successful}. Failed: ${failed}<br>`;
    output.innerHTML += "--------------------------------------------------------------------------------<br>";
}

async function createWavObject() {
    output.innerHTML = "";
    const file = document.getElementById("file").files[0];

    try {
        const wrapper = await buildWrapper(file);
        output.innerHTML += wrapper.toString();
    } catch (error) {
        output.innerHTML += `Error while building the wrapper: ${error.message}`;
    }
}

function runTests() {
    output.innerHTML = "";
    runTestGroup(waveFileWrapperTest, "Wave File Wrapper");
}

function init() {
    document.getElementById("btnWaveFileWrapper").addEventListener('click', () => createWavObject());
    document.getElementById("btnRunTests").addEventListener('click', () => runTests());
}

init()