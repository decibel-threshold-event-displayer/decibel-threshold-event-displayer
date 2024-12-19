"use strict";

const CHUNK_OFFSET_RIFF = 0;
const CHUNK_OFFSET_FORMAT = 12;
const CHUNK_OFFSET_LIST = 36;

const CHUNK_LENGTH_RIFF = 12;
const CHUNK_LENGTH_FORMAT = 24;

const RIFF_OFFSET_IDENTIFIER = 0;
const RIFF_OFFSET_FILE_FORMAT_ID = 8;

const FORMAT_OFFSET_IDENTIFIER = 0;
const FORMAT_OFFSET_AUDIO_FORMAT = 8;
const FORMAT_OFFSET_NBR_OF_CHANNELS = 10;
const FORMAT_OFFSET_SAMPLES_PER_SECOND = 12;
const FORMAT_OFFSET_BITS_PER_SAMPLE = 22;

const LIST_OFFSET_IDENTIFIER = 0;
const LIST_OFFSET_SIZE = 4;

const DATA_OFFSET_IDENTIFIER = 0;
const DATA_OFFSET_SIZE = 4;
const DATA_OFFSET_SAMPLES = 8;

const RIFF_IDENTIFIER = 0x52494646; // 'RIFF'
const FORMAT_IDENTIFIER = 0x666D7420; // 'fmt '
const LIST_IDENTIFIER = 0x4C495354; // 'LIST'
const DATA_IDENTIFIER = 0x64617461; // 'data'

const WAVE_FILE_FORMAT = 0x57415645; // 'WAVE'


/**
 * The WaveFileWrapper class contains a *.wav files sample data and loads and parses *.wav files
 *    - readAndParse
 *    - readFile
 *    - fetchFile
 *    - parseFile
 *    - getDataOffset
 *    - parseAndVerifyRiffChunk
 *    - parseAndVerifyFormatChunk
 *    - parseAndVerifyDataChunk
 */
export class WaveFileWrapper {
    samples = [];
    nbrOfChannels = 0;
    nbrOfSamples = 0;
    samplesPerSecond = 0;
    bytesPerSample = 0;

    /**
     * Loads a *.wav file and parses it
     *
     * @param file{File|string}
     * @returns {Promise<void>}
     */
    async readAndParse(file) {
        let arrayBuffer;

        if (file instanceof File) {
            try {
                arrayBuffer = await this.readFile(file);
            } catch (error) {
                throw new InvalidFileError(`File can not be read: ${error.message}`);
            }
        } else if (typeof file === "string") {
            arrayBuffer = await this.fetchFile(file);
        } else {
            throw new InvalidFileError("No file to read was given");
        }

        this.parseFile(arrayBuffer);
    }

    /**
     * Reads a file from a File object and returns an ArrayBuffer
     *
     * @param file{File}
     * @returns {Promise<ArrayBuffer>}
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result)
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Fetches a file from a path and returns an ArrayBuffer
     *
     * @param filePath{string}
     * @returns {Promise<ArrayBuffer>}
     */
    fetchFile(filePath) {
        return fetch(filePath)
            .then(response => response.blob())
            .then(blob => blob.arrayBuffer())
            .catch(error => {
                throw new Error(`Error while fetching ${filePath}: ${error.message}`);
            });
    }

    /**
     * Parses and validates a *.wav file from an ArrayBuffer
     *
     * @param arrayBuffer{ArrayBuffer}
     */
    parseFile(arrayBuffer) {
        // https://en.wikipedia.org/wiki/WAV#WAV_file_header

        const riffView = new DataView(arrayBuffer, CHUNK_OFFSET_RIFF, CHUNK_LENGTH_RIFF);
        this.parseAndVerifyRiffChunk(riffView);

        const formatView = new DataView(arrayBuffer, CHUNK_OFFSET_FORMAT, CHUNK_LENGTH_FORMAT)
        this.parseAndVerifyFormatChunk(formatView);

        // skip list and find the start point of the data
        const listView = new DataView(arrayBuffer, CHUNK_OFFSET_LIST);
        let dataOffset = this.getDataOffset(listView)

        const dataView = new DataView(arrayBuffer, CHUNK_OFFSET_LIST + dataOffset);
        this.parseAndVerifyDataChunk(dataView);
    }

    /**
     * Takes a dataView object representing a *.wav file and returns the data offset
     *
     * @param dataView{DataView}
     * @returns {number}
     */
    getDataOffset(dataView) {
        // https://www.recordingblogs.com/wiki/list-chunk-of-a-wave-file
        const identifier = dataView.getInt32(LIST_OFFSET_IDENTIFIER);

        if (identifier === LIST_IDENTIFIER)
            return dataView.getInt32(LIST_OFFSET_SIZE, true) + 8;
        else
            return 0;
    }

    /**
     * Takes a dataView object representing a *.wav file and verifies it's riff chunk
     *
     * @param dataView{DataView}
     */
    parseAndVerifyRiffChunk(dataView) {
        // check identifier
        const identifier = dataView.getInt32(RIFF_OFFSET_IDENTIFIER);

        if (identifier !== RIFF_IDENTIFIER)
            throw new InvalidRiffChunkError("File identifier is not 'RIFF'");

        // check file format
        const fileFormatId = dataView.getInt32(RIFF_OFFSET_FILE_FORMAT_ID);

        if (fileFormatId !== WAVE_FILE_FORMAT)
            throw new InvalidRiffChunkError("RIFF format is not 'WAVE'");
    }

    /**
     * Takes a dataView object representing a *.wav file and verifies it's format chunk
     *
     * @param dataView{DataView}
     */
    parseAndVerifyFormatChunk(dataView) {
        // check identifier
        const identifier = dataView.getInt32(FORMAT_OFFSET_IDENTIFIER);

        if (identifier !== FORMAT_IDENTIFIER)
            throw new InvalidFormatChunkError("Format chunk identifier is not 'fmt'");

        const audioFormat = dataView.getInt16(FORMAT_OFFSET_AUDIO_FORMAT, true);

        // must be PCM for the moment
        if (audioFormat !== 1)
            throw new InvalidFormatChunkError("Only PCM Format is supported");

        this.nbrOfChannels = dataView.getInt16(FORMAT_OFFSET_NBR_OF_CHANNELS, true);
        this.samplesPerSecond = dataView.getInt32(FORMAT_OFFSET_SAMPLES_PER_SECOND, true);
        let bitsPerSample = dataView.getInt16(FORMAT_OFFSET_BITS_PER_SAMPLE, true);

        if (bitsPerSample % 8 !== 0)
            throw new InvalidFormatChunkError(`Bits per sample are ${bitsPerSample}, but have to be a multiple of 8`);

        this.bytesPerSample = bitsPerSample / 8;
    }

    /**
     * Takes a dataView object representing a *.wav file and verifies it's data chunk
     *
     * @param dataView{DataView}
     */
    parseAndVerifyDataChunk(dataView) {
        // check identifier
        const identifier = dataView.getInt32(DATA_OFFSET_IDENTIFIER);

        if (identifier !== DATA_IDENTIFIER)
            throw new InvalidDataChunkError("Data chunk identifier is not 'data'");

        const dataSize = dataView.getInt32(DATA_OFFSET_SIZE, true);

        const nbrOfSamples = dataSize / (this.bytesPerSample * this.nbrOfChannels);
        let offset = DATA_OFFSET_SAMPLES;

        for (let i = 0; i < nbrOfSamples; ++i) {
            this.samples[i] = [];

            for (let channel = 0; channel < this.nbrOfChannels; ++channel) {
                let sample = 0;

                for (let byte = 0; byte < this.bytesPerSample; ++byte) {
                    const b = dataView.getInt8(offset);
                    sample |= ((b & 0xFF) << (byte * 8));

                    // Convert to signed 16-bit value (two's complement)
                    if (sample >= 0x8000) {
                        sample -= 0x10000;
                    }

                    ++offset;
                }

                this.samples[i][channel] = sample;
            }
        }
    }

    /**
     * String representation of the WaveFileWrapper object
     *
     * @returns {string}
     */
    toString() {
        return `Filename: ${this.filename}\n
                Number of channels: ${this.nbrOfChannels}\n
                Number of samples ${this.nbrOfSamples}\n
                Samples per second ${this.samplesPerSecond}\n
                Bytes per samples ${this.bytesPerSample}\n`;
    }
}

/**
 * Base class for WaveFileWrapper exceptions
 */
export class WaveFileWrapperError extends Error {

    /**
     * Constructor for WaveFileWrapperError
     *
     * @param message{string}
     */
    constructor(message) {
        super(message);
        this.name = "WaveFileWrapperError";
    }
}

/**
 * InvalidFileError
 */
export class InvalidFileError extends WaveFileWrapperError {

    /**
     * Constructor for InvalidFileError
     *
     * @param message{string}
     */
    constructor(message) {
        super(message);
        this.name = "InvalidFileError";
    }
}

/**
 * InvalidRiffChunkError
 */
export class InvalidRiffChunkError extends WaveFileWrapperError {

    /**
     * Constructor for InvalidFileError
     *
     * @param message{string}
     */
    constructor(message) {
        super(message);
        this.name = "InvalidRiffChunkError";
    }
}

/**
 * InvalidFormatChunkError
 */
export class InvalidFormatChunkError extends WaveFileWrapperError {

    /**
     * Constructor for InvalidFileError
     *
     * @param message{string}
     */
    constructor(message) {
        super(message);
        this.name = "InvalidFormatChunkError";
    }
}

/**
 * InvalidDataChunkError
 */
export class InvalidDataChunkError extends WaveFileWrapperError {

    /**
     * Constructor for InvalidFileError
     *
     * @param message{string}
     */
    constructor(message) {
        super(message);
        this.name = "InvalidDataChunkError";
    }
}

/**
 * Builds a WaveFileWrapper object
 *
 * @param file{File|string}
 * @returns {Promise<WaveFileWrapper>}
 */
export async function buildWrapper(file) {
    const wrapper = new WaveFileWrapper();
    await wrapper.readAndParse(file);
    return wrapper;
}