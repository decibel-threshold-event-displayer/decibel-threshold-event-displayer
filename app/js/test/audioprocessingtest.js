import {fetchLocalJson} from './util.js';

/**
 * This file contains all tests regarding the parsing of a .wav file.
 *
 * All tests throw an exception when they fail.
 *
 */
import {buildWrapper} from "../audio/wavefilewrapper.js";
import {FrameCollection} from "../audio/frame.js";

/**
 * To test against any weird js behavior, we generate the reference values with python.
 * This means that there will be minimal differences in floating point numbers.
 * We use this epsilon value to account for those differences
 *
 * @type {number}
 */
const epsilon = 0.000000000001;

export async function testVerifySampleValues(){
    // Arrange
    const expectedSampleValues = await fetchLocalJson('./resources/valid_sample_values.json');

    // Act
    const waveFileWrapper = await buildWrapper('./resources/valid.wav');

    // Assert
    for (let i = 0; i < expectedSampleValues.length; i++){
        if (expectedSampleValues[i] !== waveFileWrapper.samples[i][0]){
            throw Error("Sample value mismatch: index = " + i + ", expected = " + expectedSampleValues[i] + ", actual = " + waveFileWrapper.samples[i][0] + "");
        }
    }
}

export async function testVerifyMeanValues(){
    // Arrange
    const expectedMeanValues = await fetchLocalJson('./resources/valid_mean_values.json');
    const waveFileWrapper = await buildWrapper('./resources/valid.wav');
    const frameDuration = 0.2;
    const frameCollection = new FrameCollection(
        waveFileWrapper.samples,
        waveFileWrapper.samplesPerSecond,
        frameDuration
    );

    // Act
    const frames = frameCollection.getFrames();

    // Assert
    for (let i = 0; i < expectedMeanValues.length; i++){
        const mean = frames[i].getSamples().reduce((a, b) => a + b) / frames[i].getSamples().length;
        if (expectedMeanValues[i] !== mean){
            throw Error("Mean value mismatch: index = " + i + ", expected = " + expectedMeanValues[i] + ", actual = " + mean + "");
        }
    }
}

export async function testVerifySquareMeanValues(){
    // Arrange
    const expectedMeanValues = await fetchLocalJson('./resources/valid_square_mean_values.json');
    const waveFileWrapper = await buildWrapper('./resources/valid.wav');
    const frameDuration = 0.2;
    const frameCollection = new FrameCollection(
        waveFileWrapper.samples,
        waveFileWrapper.samplesPerSecond,
        frameDuration
    );

    // Act
    const frames = frameCollection.getFrames();

    // Assert
    for (let i = 0; i < expectedMeanValues.length; i++){
        const squaredMean = frames[i].getSamples().map(sample => Math.pow(sample, 2)).reduce((a, b) => a + b) / frames[i].getSamples().length;
        if (expectedMeanValues[i] !== squaredMean){
            throw Error("Square mean value mismatch: index = " + i + ", expected = " + expectedMeanValues[i] + ", actual = " + squaredMean + "");
        }
    }
}

export async function testGetRMSValues() {
    // Arrange
    const expectedRMSValues = await fetchLocalJson('./resources/valid_rms_values.json');
    const waveFileWrapper = await buildWrapper('./resources/valid.wav');
    const frameDuration = 0.2;
    const frameCollection = new FrameCollection(
        waveFileWrapper.samples,
        waveFileWrapper.samplesPerSecond,
        frameDuration
    );

    // Act
    const rmsValues = frameCollection.getFrames().map(frame => frame.getRMS());

    //Assert
    for (let i = 0; i < expectedRMSValues.length; i++) {
        const diff = Math.abs(expectedRMSValues[i] - rmsValues[i]);
        if (diff > epsilon){
            throw Error("RMS value mismatch: index = " + i + ", diff = " + diff + ", expected = " + expectedRMSValues[i] + ", actual = " +  rmsValues[i] + "");
        }
    }
}

export async function testGetDbValues() {
    // Arrange
    const expectedDbValues = await fetchLocalJson('./resources/valid_db_values.json');
    const waveFileWrapper = await buildWrapper('./resources/valid.wav');
    const frameDuration = 0.2;
    const frameCollection = new FrameCollection(
        waveFileWrapper.samples,
        waveFileWrapper.samplesPerSecond,
        frameDuration
    );

    // Act
    const dbValues = frameCollection.getFrames().map(frame => frame.getDb());

    //Assert
    for (let i = 0; i < expectedDbValues.length; i++) {
        const diff = Math.abs(expectedDbValues[i] - dbValues[i]);
        if (diff > epsilon){
            throw Error("Db value mismatch: index = " + i + ", diff = " + diff + ", expected = " + expectedDbValues[i] + ", actual = " +  dbValues[i].db + "");
        }
    }
}

export async function testGetDbaValues() {
    // Arrange
    const expectedDbaValues = await fetchLocalJson('./resources/valid_dba_values.json');
    const waveFileWrapper = await buildWrapper('./resources/valid.wav');
    const frameDuration = 0.2;
    const dbaMax = 96.2;
    const dbaMin = 35.3;
    const frameCollection = new FrameCollection(
        waveFileWrapper.samples,
        waveFileWrapper.samplesPerSecond,
        frameDuration
    );

    // Act
    const dbaValues = frameCollection.getMappedDbaValues(dbaMin, dbaMax);

    //Assert
    for (let i = 0; i < expectedDbaValues.length; i++) {
        const diff = Math.abs(expectedDbaValues[i] - dbaValues[i]);
        if (diff > epsilon){
            throw Error("Dba value mismatch: index = " + i + ", diff = " + diff + ", expected = " + expectedDbaValues[i] + ", actual = " +  dbaValues[i] + "");
        }
    }
}

export async function testGetFilteredDbaValues() {
    // Arrange
    const expectedDbaValues = await fetchLocalJson('./resources/valid_dba_values.json');
    const waveFileWrapper = await buildWrapper('./resources/valid.wav');
    const frameDuration = 0.2;
    const dbaMax = 96.2;
    const dbaMin = 35.3;
    const threshold = 90;
    const filteredExpectedDbaValues = expectedDbaValues.map(v => v >= threshold ? v : 0);
    const frameCollection = new FrameCollection(
        waveFileWrapper.samples,
        waveFileWrapper.samplesPerSecond,
        frameDuration
    );

    // Act
    const filteredDbaFrames = frameCollection.getFilteredDbaValues(threshold, dbaMin, dbaMax);

    //Assert
    for (let i = 0; i < filteredExpectedDbaValues.length; i++) {
        const diff = Math.abs(filteredExpectedDbaValues[i] - filteredDbaFrames[i]);
        if (diff > epsilon){
            throw Error("Dba value mismatch: index = " + i + ", diff = " + diff + ", expected = " + filteredExpectedDbaValues[i] + ", actual = " +  filteredDbaFrames[i] + "");
        }
    }
}