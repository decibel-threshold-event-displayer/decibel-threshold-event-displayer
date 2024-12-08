import {assertNotThrows, assertThrows} from './util.js';

import {
    InvalidDataChunkError,
    InvalidFileError,
    InvalidFormatChunkError,
    InvalidRiffChunkError,
    buildWrapper
} from "../wavefilewrapper.js";

export async function testPassNullInConstructor() {
    await assertThrows(async () => {
        await buildWrapper(null);
    }, InvalidFileError);
}

export async function testPassNonFileInConstructor() {
    await assertThrows(async () => {
        await buildWrapper(4);
    }, InvalidFileError);
}

export async function testInvalidRiffIdentifier() {
     await assertThrows(async () => {
         await buildWrapper("./resources/invalid_riff_identifier.wav");
    }, InvalidRiffChunkError);
}

export async function testInvalidWaveFormat() {
    await assertThrows(async () => {
        await buildWrapper('./resources/invalid_wave_format.wav');
    }, InvalidRiffChunkError);
}

export async function testInvalidFmtIdentifier() {
    await assertThrows(async () => {
        await buildWrapper('./resources/invalid_fmt_identifier.wav');
    }, InvalidFormatChunkError);
}

export async function testIllegalNumberOfBitsPerSample() {
    await assertThrows(async () => {
        await buildWrapper("./resources/illegal_number_of_bit_per_sample.wav");
    }, InvalidFormatChunkError);
}

export async function testInvalidDataIdentifier() {
    await assertThrows(async() => {
        await buildWrapper('./resources/invalid_data_identifier.wav');
    }, InvalidDataChunkError);
}

export async function testReadValidAudioFile() {
    await assertNotThrows(async() => {
        await buildWrapper('./resources/valid.wav');
    });
}