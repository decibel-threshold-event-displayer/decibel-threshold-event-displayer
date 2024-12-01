import {assertNotThrows, assertThrows, fetchLocalFile} from './util.js';
import {
    InvalidDataChunkError,
    InvalidFileError,
    InvalidFormatChunkError,
    InvalidRiffChunkError,
    WaveFileWrapper,
    rmsToDb
} from "../wavefilewrapper.js";

const epsilon = 0.01;

export async function testPassNullInConstructor() {
    await assertThrows(() => {
        new WaveFileWrapper(null);
    }, InvalidFileError);
}

export async function testPassNonFileInConstructor() {
    await assertThrows(() => {
        new WaveFileWrapper(4);
    }, InvalidFileError);
}

export async function testInvalidRiffIdentifier() {
    await assertThrows(async () => {
        const file = await fetchLocalFile('./resources/invalid_riff_identifier.wav');
        new WaveFileWrapper(file);
    }, InvalidRiffChunkError);
}

export async function testInvalidWaveFormat() {
    await assertThrows(async () => {
        const file = await fetchLocalFile('./resources/invalid_wave_format.wav');
        new WaveFileWrapper(file);
    }, InvalidRiffChunkError);
}

export async function testInvalidFmtIdentifier() {
    await assertThrows(async () => {
        const file = await fetchLocalFile('./resources/invalid_fmt_identifier.wav');
        new WaveFileWrapper(file);
    }, InvalidFormatChunkError);
}

export async function testIllegalNumberOfBitsPerSample() {
    await assertThrows(async () => {
        const file = await fetchLocalFile('./resources/illegal_number_of_bit_per_sample.wav');
        new WaveFileWrapper(file);
    }, InvalidFormatChunkError);
}

export async function testInvalidDataIdentifier() {
    await assertThrows(async () => {
        const file = await fetchLocalFile('./resources/invalid_data_identifier.wav');
        new WaveFileWrapper(file);
    }, InvalidDataChunkError);
}

export async function testReadValidAudioFile() {
    await assertNotThrows(async () => {
        const file = await fetchLocalFile('./resources/valid.wav');
        new WaveFileWrapper(file);
    });
}

export async function testVerifySampleValues(){
    // Arrange
    const json = await fetchLocalFile('./resources/valid_sample_values.json');
    const expectedSampleValues = JSON.parse(new TextDecoder().decode(json));
    const file = await fetchLocalFile('./resources/valid.wav');

    // Act
    const waveFileWrapper = new WaveFileWrapper(file);

    // Assert
    for (let i = 0; i < expectedSampleValues.length; i++){
        if (expectedSampleValues[i] !== waveFileWrapper.samples[i][0]){
            throw Error("Sample value mismatch: index = " + i + ", expected = " + expectedSampleValues[i] + ", actual = " + waveFileWrapper.samples[i][0] + "");
        }
    }
}

export async function testVerifyMeanValues(){
    // Arrange
    const json = await fetchLocalFile('./resources/valid_mean_values.json');
    const expectedMeanValues = JSON.parse(new TextDecoder().decode(json));
    const file = await fetchLocalFile('./resources/valid.wav');

    // Act
    const waveFileWrapper = new WaveFileWrapper(file);
    const frames = waveFileWrapper.getFrames()

    // Assert
    for (let i = 0; i < expectedMeanValues.length; i++){
        const mean = frames[i].samples.reduce((a, b) => a + b) / frames[i].samples.length;
        console.log(mean)
        if (expectedMeanValues[i] !== mean){
            throw Error("Mean value mismatch: index = " + i + ", expected = " + expectedMeanValues[i] + ", actual = " + mean + "");
        }
    }
}

export async function testVerifySquareMeanValues(){
    // Arrange
    const json = await fetchLocalFile('./resources/valid_square_mean_values.json');
    const expectedMeanValues = JSON.parse(new TextDecoder().decode(json));
    const file = await fetchLocalFile('./resources/valid.wav');

    // Act
    const waveFileWrapper = new WaveFileWrapper(file);
    const frames = waveFileWrapper.getFrames()

    // Assert
    for (let i = 0; i < expectedMeanValues.length; i++){
        const squaredMean = frames[i].samples.map(sample => Math.pow(sample, 2)).reduce((a, b) => a + b) / frames[i].samples.length;
        console.log(frames[i].samples.map(sample => Math.pow(sample, 2)))
        if (expectedMeanValues[i] !== squaredMean){
            throw Error("Square mean value mismatch: index = " + i + ", expected = " + expectedMeanValues[i] + ", actual = " + squaredMean + "");
        }
    }
}

export async function testGetRMSFrames() {
    // Arrange
    const expectedRMSValues = [
        21.64333821736453,
        37.051704389757035,
        38.38045806921041,
        33.19422560862979,
        43.768309633723575,
        12.942707638974419,
        13.155339712944054,
        17.914743080834437,
        52.63297524503407,
        47.21190470186763,
        24.79068077652503,
        41.91000327971256,
        46.382441063426874,
        27.082055263756217,
        14.337638440109467,
        9.908954393531713,
        37.83140298449356
    ]
    const file = await fetchLocalFile('./resources/valid.wav');
    const waveFileWrapper = new WaveFileWrapper(file);

    // Act
    const rmsFrames = waveFileWrapper.getRMSFrames()

    console.log(waveFileWrapper.samplesPerSecond);
    console.log(waveFileWrapper.samples);
    console.log(rmsFrames);
    console.log(expectedRMSValues.map(frame => rmsToDb(frame)));

    //Assert
    for (let i = 0; i < expectedRMSValues.length; i++) {

        const diff = Math.abs(expectedRMSValues[i] - rmsFrames[i].rms);
        if (diff > epsilon){
            console.log(diff)
            throw Error("RMS value mismatch: index = " + i + ", diff = " + diff + ", expected = " + expectedRMSValues[i] + ", actual = " +  rmsFrames[i].rms + "");
        }
    }
}