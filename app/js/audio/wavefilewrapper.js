"use strict";

const CHUNK_OFFSET_RIFF = 0;
const CHUNK_OFFSET_FORMAT = 12;
const CHUNK_OFFSET_OTHER = 36;

const CHUNK_LENGTH_RIFF = 12;
const CHUNK_LENGTH_FORMAT = 24;

const RIFF_OFFSET_IDENTIFIER = 0;
const RIFF_OFFSET_FILE_FORMAT_ID = 8;

const FORMAT_OFFSET_IDENTIFIER = 0;
const FORMAT_OFFSET_AUDIO_FORMAT = 8;
const FORMAT_OFFSET_NBR_OF_CHANNELS = 10;
const FORMAT_OFFSET_SAMPLES_PER_SECOND = 12;
const FORMAT_OFFSET_BITS_PER_SAMPLE = 22;

const OTHER_CHUNK_OFFSET_IDENTIFIER = 0;
const OTHER_CHUNK_OFFSET_SIZE = 4;

const DATA_OFFSET_IDENTIFIER = 0;
const DATA_OFFSET_SIZE = 4;
const DATA_OFFSET_SAMPLES = 8;

const RIFF_IDENTIFIER = 0x52494646; // 'RIFF'
const FORMAT_IDENTIFIER = 0x666D7420; // 'fmt '
const LIST_IDENTIFIER = 0x4C495354; // 'LIST'
const DATA_IDENTIFIER = 0x64617461; // 'data'

const WAVE_FILE_FORMAT = 0x57415645; // 'WAVE'

const PCM_FORMAT = "PCM";
const IEEE_FLOAT_FORMAT = "IEEE Float";


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

        // skip all chunks until we find the data chunk
        let offset = 0;
        const chunkView = new DataView(arrayBuffer, CHUNK_OFFSET_OTHER);

        while(true) {
            const identifier = chunkView.getInt32(OTHER_CHUNK_OFFSET_IDENTIFIER + offset);

            // we found the data chunk
            if (identifier === DATA_IDENTIFIER)
                break;
            
            // skip this chunk. the chunk size does not contain the byte for the identifier and the size,
            // which is why we need to add 8 
            offset += chunkView.getInt32(OTHER_CHUNK_OFFSET_SIZE + offset, true) + 8;

            if (offset > chunkView.byteLength - 8)
                throw new InvalidDataChunkError("File contains no data chunk"); 
        }

        const dataView = new DataView(arrayBuffer, CHUNK_OFFSET_OTHER + offset);
        this.parseAndVerifyDataChunk(dataView);
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

        // we only support PCM and IEEE Float
        if(audioFormat === 1)
            this.audioFormat = PCM_FORMAT;
        else if(audioFormat === 3)
            this.audioFormat = IEEE_FLOAT_FORMAT;
        else
            throw new InvalidFormatChunkError("Only PCM and IEEE Float formats are supported");

        this.nbrOfChannels = dataView.getInt16(FORMAT_OFFSET_NBR_OF_CHANNELS, true);
        this.samplesPerSecond = dataView.getInt32(FORMAT_OFFSET_SAMPLES_PER_SECOND, true);
        let bitsPerSample = dataView.getInt16(FORMAT_OFFSET_BITS_PER_SAMPLE, true);

        // verify bits per sample
        if (this.audioFormat === PCM_FORMAT && bitsPerSample !== 16 && bitsPerSample !== 24 && bitsPerSample !== 32)
            throw new InvalidFormatChunkError(`Bits per sample are ${bitsPerSample}, but have to be 16, 24 or 32 for PCM format`);
        else if (this.audioFormat === IEEE_FLOAT_FORMAT && bitsPerSample !== 32 && bitsPerSample !== 64)
            throw new InvalidFormatChunkError(`Bits per sample are ${bitsPerSample}, but have to be 32 or 64 for IEEE Float format`);

        this.bytesPerSample = bitsPerSample / 8;
    }

    /**
     * Takes a dataView object representing a *.wav file and verifies it's data chunk
     *
     * @param dataView{DataView}
     */
    parseAndVerifyDataChunk(dataView) {
        // check identifier (again, just to be sure)
        const identifier = dataView.getInt32(DATA_OFFSET_IDENTIFIER);

        if (identifier !== DATA_IDENTIFIER)
            throw new InvalidDataChunkError("Data chunk identifier is not 'data'");

        const dataSize = dataView.getInt32(DATA_OFFSET_SIZE, true);

        // calculate the number of samples
        const nbrOfSamples = dataSize / (this.bytesPerSample * this.nbrOfChannels);
        let offset = DATA_OFFSET_SAMPLES;

        for (let i = 0; i < nbrOfSamples; ++i) {
            // every sample is a itself an array containing the values for each channel
            this.samples[i] = [];

            for (let channel = 0; channel < this.nbrOfChannels; ++channel) {
                let sample = 0;
                
                if (this.audioFormat === PCM_FORMAT){
                    if (this.bytesPerSample === 2){
                        sample = dataView.getInt16(offset, true);
                        offset += 2;
                    } else if (this.bytesPerSample === 3){
                        sample = dataView.getInt16(offset, true) | (dataView.getInt8(offset + 2) << 16);
                        offset += 3;
                    } else {
                        sample = dataView.getInt32(offset, true);
                        offset += 4;
                    }

                } else { // float format
                    if (this.bytesPerSample === 4){
                        sample = dataView.getFloat32(offset, true);
                        offset += 4;
                    } else {
                        sample = dataView.getFloat64(offset, true);
                        offset += 8;
                    }
                }

                this.samples[i][channel] = sample;
            }
        }
    }

    unsignedToSigned(value) {
        const max = 1 << (this.bitsPerSample - 1); // Maximum positive value for signed
        return (value & (max - 1)) - (value & max);
      }

    /**
     * String representation of the WaveFileWrapper object
     *
     * @returns {string}
     */
    toString() {
        return `Filename: ${this.filename}\n
                Number of channels: ${this.nbrOfChannels}\n
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