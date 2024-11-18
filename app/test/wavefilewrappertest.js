import {assertNotThrows, assertThrows, fetchLocalFile} from './util.js';
import {
    InvalidDataChunkError,
    InvalidFileError,
    InvalidFormatChunkError,
    InvalidRiffChunkError,
    WaveFileWrapper
} from "../wavefilewrapper.js";

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