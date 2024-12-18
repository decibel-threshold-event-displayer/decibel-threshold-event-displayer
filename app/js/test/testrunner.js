import * as waveFileWrapperTest from './wavefilewrappertest.js';
import * as utilTest from './utiltest.js';

import {buildWrapper} from "../wavefilewrapper.js";

// get html elements of the output page
const testOutput = document.getElementById("testOutput");
const waveFileOutput = document.getElementById("waveFileOutput");


/**
 * Bootstraps a html table object for a test group.
 *
 * @param name{string}
 * @return a HTML table object with styling and a header
 */
function createResultTable(name) {
    const table = document.createElement('table');
    table.className = 'table table-bordered mb-4';

    // Add title
    const caption = table.createCaption();
    caption.className = 'caption-top';
    caption.innerHTML = `<h3>Test Results: ${name}</h3>`;

    // Create header row
    const header = table.createTHead();
    header.className = 'table-dark';
    const headerRow = header.insertRow();
    ['Test Name', 'Status', 'Error'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.scope = 'col';
        headerRow.appendChild(th);
    });

    return table;
}


/**
 * Runs a given test group and adds the result to the result page.
 * Every functions of the passed module is considered to be a independent test and is executed.
 * The passed name will be used to identify the test group in the frontend
 *
 * @param testModule{object}
 * @param name{string}
 */

async function runTestModule(testModule, name) {
    testOutput.innerHTML = "";
    // Get all tests in the module
    const tests = Object.keys(testModule).filter(
        (key) => typeof testModule[key] === 'function'
    );

    let successful = 0;
    let failed = 0;

    // get html elements for result
    const table = createResultTable(name);
    const tbody = table.createTBody();

    // run all tests
    for (let i in tests) {
        const testName = tests[i];
        const row = tbody.insertRow();

        // Add test name cell
        const nameCell = row.insertCell();
        nameCell.textContent = testName;

        // Add status cell
        const statusCell = row.insertCell();

        // Add error cell
        const errorCell = row.insertCell();

        // make sure to use await so the exceptions are thrown in this thread
        await testModule[testName]().then(response => {
            statusCell.innerHTML = '<span class="badge bg-success">Success</span>';
            successful++;
        }).catch(error => {
            statusCell.innerHTML = '<span class="badge bg-danger">Failed</span>';
            errorCell.textContent = error;
            errorCell.className = 'text-danger';
            failed++;
        });
    }

    // Add summary row
    const summaryRow = tbody.insertRow();
    const summaryCell = summaryRow.insertCell();
    summaryCell.colSpan = 3;
    summaryCell.className = 'table-secondary';
    summaryCell.innerHTML = `
        <strong>Summary:</strong> 
        Total Tests: ${tests.length}, 
        <span class="text-success">Successful: ${successful}</span>, 
        <span class="text-danger">Failed: ${failed}</span>
    `;

    testOutput.appendChild(table);
}

/**
 * Creates a WaveFileWrapper object from a given file and displays its content.
 */
async function createWavObject() {
    waveFileOutput.innerHTML = "";
    const file = document.getElementById("file").files[0];

    try {
        const wrapper = await buildWrapper(file);
        waveFileOutput.innerHTML = `
            <div class="alert alert-success">
                <h4 class="alert-heading">Wave File Details</h4>
                <table class="table table-sm mb-0">
                    <tbody>
                        <tr>
                            <th scope="row">Number of Channels</th>
                            <td>${wrapper.nbrOfChannels}</td>
                        </tr>
                        <tr>
                            <th scope="row">Sample Rate</th>
                            <td>${wrapper.samplesPerSecond.toLocaleString()} Hz</td>
                        </tr>
                        <tr>
                            <th scope="row">Bytes per Sample</th>
                            <td>${wrapper.bytesPerSample} bytes</td>
                        </tr>
                        <tr>
                            <th scope="row">Total Samples</th>
                            <td>${wrapper.samples.length.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <th scope="row">Duration</th>
                            <td>${(wrapper.samples.length / wrapper.samplesPerSecond).toFixed(2)} seconds</td>
                        </tr>
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        waveFileOutput.innerHTML = `
            <div class="alert alert-danger">
                Error while building the wrapper: ${error.message}
            </div>`;
    }
}

/**
 * Runs all test modules in sequence.
 */
function runTests() {
    runTestModule(utilTest, "Util");
    runTestModule(waveFileWrapperTest, "Wave File Wrapper");
}

/**
 * Add event listeners to the buttons on the result page.
 */
function init() {
    document.getElementById("btnWaveFileWrapper").addEventListener('click', createWavObject);
    document.getElementById("btnRunTests").addEventListener('click', runTests);
}

init();