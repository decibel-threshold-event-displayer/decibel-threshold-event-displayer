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
 * Represents a root-mean-square
 */
class RMSFrame {
    constructor(millisecond, value) {
        this.millisecond = millisecond;
        this.value = value;
    }
}

export class WaveFileWrapper {
    samples = [];
    nbrOfChannels = 0;
    nbrOfSamples = 0;
    samplesPerSecond = 0;
    bytesPerSample = 0;

    constructor(file) {
        if (file instanceof ArrayBuffer) {
            this.filename = "Unknown File";
            this.parseFile(file);
        } else if (file instanceof File) {
            this.filename = file.name;
            this.readAndParse(file);
        } else {
            throw new InvalidFileError("No File given");
        }
    }

    readAndParse(file) {
        const reader = new FileReader()

        reader.addEventListener("loadend", () => {
            this.parseFile(reader.result);
        });

        reader.addEventListener("error", () => {
            throw new InvalidFileError("Error in FileReader():" + reader.error);
        });

        try {
            reader.readAsArrayBuffer(file);
        } catch (error) {
            throw new InvalidFileError("Error while reading the file:" + reader.error);
        }
    }

    parseFile(arrayBuffer) {
        // https://en.wikipedia.org/wiki/WAV#WAV_file_header

        let riffView = new DataView(arrayBuffer, CHUNK_OFFSET_RIFF, CHUNK_LENGTH_RIFF);
        this.parseAndVerifyRiffChunk(riffView);

        let formatView = new DataView(arrayBuffer, CHUNK_OFFSET_FORMAT, CHUNK_LENGTH_FORMAT)
        this.parseAndVerifyFormatChunk(formatView);

        // skip list and find the start point of the data
        let listView = new DataView(arrayBuffer, CHUNK_OFFSET_LIST);
        let dataOffset = this.getDataOffset(listView)

        let dataView = new DataView(arrayBuffer, CHUNK_OFFSET_LIST + dataOffset);
        this.parseAndVerifyDataChunk(dataView);
    };

    getDataOffset(dataView) {
        // https://www.recordingblogs.com/wiki/list-chunk-of-a-wave-file
        let identifier = dataView.getInt32(LIST_OFFSET_IDENTIFIER);

        if (identifier === LIST_IDENTIFIER)
            return dataView.getInt32(LIST_OFFSET_SIZE, true) + 8;
        else
            return 0;
    }

    parseAndVerifyRiffChunk(dataView) {
        // check identifiert
        var identifier = dataView.getInt32(RIFF_OFFSET_IDENTIFIER);

        if (identifier !== RIFF_IDENTIFIER)
            throw new InvalidRiffChunkError("File identifiert is not 'RIFF'");

        // check file format
        var fileFormatId = dataView.getInt32(RIFF_OFFSET_FILE_FORMAT_ID);

        if (fileFormatId !== WAVE_FILE_FORMAT)
            throw new InvalidRiffChunkError("RIFF format is not 'WAVE'");
    }

    parseAndVerifyFormatChunk(dataView) {
        // check identifiert
        let identifier = dataView.getInt32(FORMAT_OFFSET_IDENTIFIER);

        if (identifier !== FORMAT_IDENTIFIER)
            throw new InvalidFormatChunkError("Format chunk identifiert is not 'fmt '");

        let audioFormat = dataView.getInt16(FORMAT_OFFSET_AUDIO_FORMAT, true);

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

    parseAndVerifyDataChunk(dataView) {
        // check identifier
        let identifier = dataView.getInt32(DATA_OFFSET_IDENTIFIER);

        if (identifier !== DATA_IDENTIFIER)
            throw new InvalidDataChunkError("Data chunk identifiert is not 'data'");

        let dataSize = dataView.getInt32(DATA_OFFSET_SIZE, true);

        let nbrOfSamples = dataSize / (this.bytesPerSample * this.nbrOfChannels);
        let offset = DATA_OFFSET_SAMPLES;

        for (let i = 0; i < nbrOfSamples; ++i) {
            this.samples[i] = [];

            for (let channel = 0; channel < this.nbrOfChannels; ++channel) {
                let sample = 0;

                for (let byte = 0; byte < this.bytesPerSample; ++byte) {
                    let b = dataView.getInt8(offset);
                    sample = (b << (byte * 8)) | sample;
                    ++offset;
                }

                this.samples[i][channel] = sample;
            }
        }
    }

    toString() {
        return `Filename: ${this.filename}\n
                Number of channels: ${this.nbrOfChannels}\n
                Number of samples ${this.nbrOfSamples}\n
                Samples per second ${this.samplesPerSecond}\n
                Bytes per samples ${this.bytesPerSample}\n`;
    }

    /**
     * Takes the value of a sample and returns it as decibel
     *
     * @param sample
     * @returns {Promise<number>}
     */
    async sampleToDecibel(sample) {
        // Validate arguments
        if (!Number.isInteger(sample) || sample < 0 ) {
            throw new Error("Invalid argument, sample must be an integer equal or greater than 0!");
        }

        return 20 * Math.log10(sample)
    }

    /**
     * Calculate the root-mean-square value for all samples in a frame
     *
     * @param framesPerSecond
     * @returns {RMSFrame[]}
     */
    mapRMSFrames(framesPerSecond = 0.3) {
        // Validate arguments
        if (!Number.isFinite(framesPerSecond) || framesPerSecond <= 0 ) {
            throw new Error("Invalid argument, chungDurationMilliseconds must be an integer greater than 0!");
        }

        // Check that we have at least some samples
        if (!this.samples || this.samples.length === 0) {
            throw new Error("No samples available to calculate RMS");
        }

        const frameSize =  Math.floor(framesPerSecond * this.samplesPerSecond)

        const rmsFrames = [];
        // We round up, otherwise some samples might get cut off or no samples get processed at all,
        // if the frameSize is larger than the number of samples
        const totalFrames = Math.ceil(this.samples.length / frameSize);

        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            const startSample = frameIndex * frameSize;
            // This handles the edge case for the last frame, where we might have fewer samples as the full frame
            const endSample = Math.min( startSample + frameSize, this.samples.length);
            let frameSum = 0;

            for (let i = startSample; i < endSample; i++) {
                for (let channel = 0; channel < this.nbrOfChannels; channel++) {
                    const sample = this.samples[i][channel];
                    frameSum += sample ** 2;
                }
            }

            // This handles the edge case for the last frame, where we might have fewer samples as the full frame
            const actualFrameSize = endSample - startSample;
            const meanSquare = frameSum / (actualFrameSize * this.nbrOfChannels);
            rmsFrames.push(new RMSFrame(
                startSample / (this.samplesPerSecond * 1000),
                this.sampleToDecibel(Math.sqrt(meanSquare))
            ))
        }

        return rmsFrames;
    }

    /**
     * Gets the RMS frames and filters them by a certain threshold
     *
     * @param threshold
     * @param framesPerSecond
     * @returns {RMSFrame[]}
     */
    filterRMSFrames(threshold, framesPerSecond = 0.3) {
        const frames = this.mapRMSFrames(framesPerSecond);

        return frames.filter(frame => frame.value > threshold)
    }
}

export class WaveFileWrapperError extends Error {
    constructor(message) {
        super(message);
        this.name = "WaveFileWrapperError";
    }
}

export class InvalidFileError extends WaveFileWrapperError {
    constructor(message) {
        super(message);
        this.name = "InvalidFileError";
    }
}

export class InvalidRiffChunkError extends WaveFileWrapperError {
    constructor(message) {
        super(message);
        this.name = "InvalidRiffChunkError";
    }
}

export class InvalidFormatChunkError extends WaveFileWrapperError {
    constructor(message) {
        super(message);
        this.name = "InvalidFormatChunkError";
    }
}

export class InvalidDataChunkError extends WaveFileWrapperError {
    constructor(message) {
        super(message);
        this.name = "InvalidDataChunkError";
    }
}