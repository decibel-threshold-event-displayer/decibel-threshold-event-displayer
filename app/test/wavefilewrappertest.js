import {assertNotThrows, assertThrows, fetchLocalFile, fetchLocalJson} from './util.js';
import {
    InvalidDataChunkError,
    InvalidFileError,
    InvalidFormatChunkError,
    InvalidRiffChunkError,
    WaveFileWrapper,
    rmsToDb
} from "../wavefilewrapper.js";

const epsilon = 0.000000000001;

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
    const expectedSampleValues = await fetchLocalJson('./resources/valid_sample_values.json');
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
    const expectedMeanValues = await fetchLocalJson('./resources/valid_mean_values.json');
    const file = await fetchLocalFile('./resources/valid.wav');
    const waveFileWrapper = new WaveFileWrapper(file);

    // Act
    const frames = waveFileWrapper.getFrames()

    // Assert
    for (let i = 0; i < expectedMeanValues.length; i++){
        const mean = frames[i].samples.reduce((a, b) => a + b) / frames[i].samples.length;
        if (expectedMeanValues[i] !== mean){
            throw Error("Mean value mismatch: index = " + i + ", expected = " + expectedMeanValues[i] + ", actual = " + mean + "");
        }
    }
}

export async function testVerifySquareMeanValues(){
    // Arrange
    const expectedMeanValues = await fetchLocalJson('./resources/valid_square_mean_values.json');
    const file = await fetchLocalFile('./resources/valid.wav');
    const waveFileWrapper = new WaveFileWrapper(file);

    // Act
    const frames = waveFileWrapper.getFrames()

    // Assert
    for (let i = 0; i < expectedMeanValues.length; i++){
        const squaredMean = frames[i].samples.map(sample => Math.pow(sample, 2)).reduce((a, b) => a + b) / frames[i].samples.length;
        if (expectedMeanValues[i] !== squaredMean){
            throw Error("Square mean value mismatch: index = " + i + ", expected = " + expectedMeanValues[i] + ", actual = " + squaredMean + "");
        }
    }
}

export async function testGetRMSFrames() {
    // Arrange
    const expectedRMSValues = await fetchLocalJson('./resources/valid_rms_values.json');
    const file = await fetchLocalFile('./resources/valid.wav');
    const waveFileWrapper = new WaveFileWrapper(file);

    // Act
    const rmsFrames = waveFileWrapper.getRMSFrames()

    //Assert
    for (let i = 0; i < expectedRMSValues.length; i++) {
        const diff = Math.abs(expectedRMSValues[i] - rmsFrames[i].rms);
        if (diff > epsilon){
            throw Error("RMS value mismatch: index = " + i + ", diff = " + diff + ", expected = " + expectedRMSValues[i] + ", actual = " +  rmsFrames[i].rms + "");
        }
    }
}

export async function testGetDbFrames() {
    // Arrange
    const expectedDbValues = await fetchLocalJson('./resources/valid_db_values.json');
    const file = await fetchLocalFile('./resources/valid.wav');
    const waveFileWrapper = new WaveFileWrapper(file);

    // Act
    const dbFrames = waveFileWrapper.getDbFrames()

    //Assert
    for (let i = 0; i < expectedDbValues.length; i++) {
        const diff = Math.abs(expectedDbValues[i] - dbFrames[i].db);
        if (diff > epsilon){
            throw Error("RMS value mismatch: index = " + i + ", diff = " + diff + ", expected = " + expectedDbValues[i] + ", actual = " +  dbFrames[i].db + "");
        }
    }
}

export async function testGetDbaFrames() {
    // Arrange
    const expectedDbaValues = await fetchLocalJson('./resources/valid_dba_values.json');
    const file = await fetchLocalFile('./resources/valid.wav');
    const waveFileWrapper = new WaveFileWrapper(file);
    const dbaMax = 96.2
    const dbaMin = 35.3

    // Act
    const dbaFrames = waveFileWrapper.getDbaFrames(dbaMin, dbaMax)

    //Assert
    for (let i = 0; i < expectedDbaValues.length; i++) {
        const diff = Math.abs(expectedDbaValues[i] - dbaFrames[i].dba);
        if (diff > epsilon){
            throw Error("RMS value mismatch: index = " + i + ", diff = " + diff + ", expected = " + expectedDbaValues[i] + ", actual = " +  dbaFrames[i].dba + "");
        }
    }
}