import {assertNotThrows, assertThrows} from './util.js';

/**
 * This file contains all tests regarding the parsing of a .wav file.
 *
 * All tests throw an exception when they fail.
 *
 */
import {
    buildWrapper,
    InvalidDataChunkError,
    InvalidFileError,
    InvalidFormatChunkError,
    InvalidRiffChunkError
} from "../audio/wavefilewrapper.js";

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
    await assertThrows(async () => {
        await buildWrapper('./resources/invalid_data_identifier.wav');
    }, InvalidDataChunkError);
}

export async function testNoDataChunk() {
    await assertThrows(async () => {
        await buildWrapper('./resources/no_data_chunk.wav');
    }, InvalidDataChunkError);
}

export async function testReadValidAudioFile() {
    await assertNotThrows(async () => {
        await buildWrapper('./resources/valid.wav');
    });
}

export async function testReadValid32BitFloatFile() {
    await assertNotThrows(async () => {
        await buildWrapper('./resources/32bit_float_format.wav');
    });
}

export async function testReadValid64BitFloatFile() {
    await assertNotThrows(async () => {
        await buildWrapper('./resources/64bit_float_format.wav');
    });
}