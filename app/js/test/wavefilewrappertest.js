import {assertNotThrows, assertThrows, fetchLocalFile} from './util.js';

import {
    InvalidDataChunkError,
    InvalidFileError,
    InvalidFormatChunkError,
    InvalidRiffChunkError,
    WaveFileWrapper,
    buildWrapper
} from "../wavefilewrapper.js";

export async function testPassNullInConstructor() {
    assertThrows(() => {
        buildWrapper(null);
    }, InvalidFileError);
}

export async function testPassNonFileInConstructor() {
    assertThrows(() => {
        buildWrapper(4);
    }, InvalidFileError);
}

export async function testInvalidRiffIdentifier() {
    await assertThrows(async () => {
        const file = await fetchLocalFile('./resources/invalid_riff_identifier.wav');
        buildWrapper(file);
    }, InvalidRiffChunkError);
}

export async function testInvalidWaveFormat() {
    await assertThrows(async () => {
        const file = await fetchLocalFile('./resources/invalid_wave_format.wav');
        buildWrapper(file);
    }, InvalidRiffChunkError);
}

export async function testInvalidFmtIdentifier() {
    await assertThrows(async () => {
        const file = await fetchLocalFile('./resources/invalid_fmt_identifier.wav');
        buildWrapper(file);
    }, InvalidFormatChunkError);
}

export async function testIllegalNumberOfBitsPerSample() {
    await assertThrows(async () => {
        const file = await fetchLocalFile('./resources/illegal_number_of_bit_per_sample.wav');
        buildWrapper(file);
    }, InvalidFormatChunkError);
}

export async function testInvalidDataIdentifier() {
    await assertThrows(async () => {
        const file = await fetchLocalFile('./resources/invalid_data_identifier.wav');
        buildWrapper(file);
    }, InvalidDataChunkError);
}

export async function testReadValidAudioFile() {
    await assertNotThrows(async () => {
        const file = await fetchLocalFile('./resources/valid.wav');
        new WaveFileWrapper(file);
    });
}