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
 * Takes a rms value and returns it as decibel
 *
 * @param rms
 * @returns {number}
 */
export function rmsToDb(rms) {
    // Validate arguments
    if (rms < 0 ) {
        throw new Error("Invalid argument, sample must be an integer equal or greater than 0!");
    }

    return 20 * Math.log10(rms)
}

/**
 * Represents a frame (window) of samples
 */
export class Frame {
    /**
     * Frame constructor
     *
     * @param samples
     * @param start
     * @param end
     */
    constructor(samples, start, end) {
        this.samples = samples;
        this.start = start;
        this.end = end;
    }

    /**
     * Converts a Frame to a RMSFrame
     *
     * @returns {RMSFrame}
     */
    toRMSFrame() {
        const sum = this.samples.map(sample => Math.pow(sample, 2)).reduce((a, b) => a + b);
        const mean = sum / this.samples.length;
        const meanSquare = Math.sqrt(mean);

        return new RMSFrame(meanSquare, this.start, this.end);
    }
}

/**
 * Represents a root-mean-square frame
 */
export class RMSFrame {
    /**
     * RMSFrame constructor
     *
     * @param rms
     * @param start
     * @param end
     */
    constructor(rms, start, end) {
        this.rms = rms;
        this.start = start;
        this.end = end;
    }

    /**
     * Converts a RMSFrame to a DbFrame
     *
     * @returns {DbFrame}
     */
    toDbFrame() {
        return new DbFrame(
            rmsToDb(this.rms),
            this.start,
            this.end
        );
    }
}

/**
 * Represents a decibel frame
 */
export class DbFrame{
    /**
     * DbFrame constructor
     *
     * @param db
     * @param start
     * @param end
     */
    constructor(db, start, end) {
        this.db = db;
        this.start = start;
        this.end = end;
    }
}

const longToByteArray = function(/*long*/long) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for ( var index = 0; index < byteArray.length; index ++ ) {
        var byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }

    return byteArray;
};

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
        // check identifier
        var identifier = dataView.getInt32(RIFF_OFFSET_IDENTIFIER);

        if (identifier !== RIFF_IDENTIFIER)
            throw new InvalidRiffChunkError("File identifier is not 'RIFF'");

        // check file format
        var fileFormatId = dataView.getInt32(RIFF_OFFSET_FILE_FORMAT_ID);

        if (fileFormatId !== WAVE_FILE_FORMAT)
            throw new InvalidRiffChunkError("RIFF format is not 'WAVE'");
    }

    parseAndVerifyFormatChunk(dataView) {
        // check identifier
        let identifier = dataView.getInt32(FORMAT_OFFSET_IDENTIFIER);

        if (identifier !== FORMAT_IDENTIFIER)
            throw new InvalidFormatChunkError("Format chunk identifier is not 'fmt '");

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
            throw new InvalidDataChunkError("Data chunk identifier is not 'data'");

        let dataSize = dataView.getInt32(DATA_OFFSET_SIZE, true);

        let nbrOfSamples = dataSize / (this.bytesPerSample * this.nbrOfChannels);
        let offset = DATA_OFFSET_SAMPLES;

        for (let i = 0; i < nbrOfSamples; ++i) {
            this.samples[i] = [];

            for (let channel = 0; channel < this.nbrOfChannels; ++channel) {
                let sample = 0;

                for (let byte = 0; byte < this.bytesPerSample; ++byte) {
                    let b = dataView.getInt8(offset);
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

    toString() {
        return `Filename: ${this.filename}\n
                Number of channels: ${this.nbrOfChannels}\n
                Number of samples ${this.nbrOfSamples}\n
                Samples per second ${this.samplesPerSecond}\n
                Bytes per samples ${this.bytesPerSample}\n`;
    }

    /**
     * Groups the sample in frames (windows), the group size is determined by the framesPerSecond and samplesPerSecond
     *
     * @param framesPerSecond
     * @returns {*[]}
     */
    getFrames(framesPerSecond = 0.3) {
        // Validate arguments
        if (!Number.isFinite(framesPerSecond) || framesPerSecond <= 0 ) {
            throw new Error("Invalid argument, framesPerSecond must be an integer greater than 0!");
        }

        // Check that we have at least some samples
        if (!this.samples || this.samples.length === 0) {
            throw new Error("No samples available to calculate RMS");
        }

        const frameSize =  Math.floor(framesPerSecond * this.samplesPerSecond);
        const frames = [];

        // We round up, otherwise some samples might get cut off or no samples get processed at all,
        // if the frameSize is larger than the number of samples
        const totalFrames = Math.ceil(this.samples.length / frameSize);

        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            console.log("================== frameIndex: " + frameIndex);
            const startSample = frameIndex * frameSize;
            // This handles the edge case for the last frame, where we might have fewer samples as the full frame
            const endSample = Math.min( startSample + frameSize, this.samples.length);
            console.log("startSample: " + startSample);
            console.log("endSample: " + endSample);
            const samples = [];

            for (let i = startSample; i < endSample; i++) {
                // We merge all channels and just take the mean
                const sum = this.samples[i].reduce((a, b) => a + b);
                const mean = sum / this.nbrOfChannels;
                samples.push(mean);
            }

            const samplesPerMillisecond =  this.samplesPerSecond * 1000;
            frames.push(new Frame(
                samples,
                startSample / samplesPerMillisecond,
                endSample /  samplesPerMillisecond
            ));
        }

        return frames;
    }

    /**
     * Calculate the root-mean-square value for all samples in a frame
     *
     * @param framesPerSecond
     * @returns {RMSFrame[]}
     */
    getRMSFrames(framesPerSecond = 0.3) {
        return this.getFrames().map(frame => frame.toRMSFrame());
    }

    /**
     * Gets the RMS frames and converts them to Db frames
     *
     * @param framesPerSecond
     * @returns {DbFrame[]}
     */
    getDbFrames(framesPerSecond = 0.3) {
        return this.getRMSFrames().map(rmsFrame => rmsFrame.toDbFrame())
    }

    /**
     * Gets the Db frames and filters them by a certain threshold
     *
     * @param threshold
     * @param framesPerSecond
     * @returns {RMSFrame[]}
     */
    getFilteredDbFrames(threshold, framesPerSecond = 0.3) {
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