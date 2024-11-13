const CHUNK_OFFSET_RIFF = 0;
const CHUNK_OFFSET_FORMAT = 12;
const CHUNK_OFFSET_LIST = 36;

const CHUNK_LENGTH_RIFF = 12;
const CHUNK_LENGHT_FORMAT = 24;

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

class WaveFileWrapper {
    constructor(file) { 
        if(!file)
            throw "No file given";

        this.filename = file.name;
        this.readAndParse(file);
    }

    readAndParse = function(file) {
        const reader = new FileReader()

        reader.addEventListener("loadend", () => {
            this.parseFile(reader.result);
        });

        reader.addEventListener("error", () => {
            throw "Error while reading the file:" + reader.error;
        });

        reader.readAsArrayBuffer(file);
    }

    parseFile = function(arrayBuffer) {
        // https://en.wikipedia.org/wiki/WAV#WAV_file_header

        let riffView = new DataView(arrayBuffer, CHUNK_OFFSET_RIFF, CHUNK_LENGTH_RIFF);
        this.parseAndVerifyRiffChunk(riffView);

        let formatView = new DataView(arrayBuffer, CHUNK_OFFSET_FORMAT, CHUNK_LENGHT_FORMAT)
        this.parseAndVerifyFormatChunk(formatView);

        // skip list and find the start point of the data
        let listView = new DataView(arrayBuffer, CHUNK_OFFSET_LIST);
        let dataOffset = this.getDataOffset(listView)

        let dataView = new DataView(arrayBuffer, CHUNK_OFFSET_LIST + dataOffset);
        this.parseAndVerifyDataChunk(dataView);
    };

    getDataOffset = function(dataView) {
        // https://www.recordingblogs.com/wiki/list-chunk-of-a-wave-file
        let identifier = dataView.getInt32(LIST_OFFSET_IDENTIFIER);

        if (identifier == LIST_IDENTIFIER) {
            return dataView.getInt32(LIST_OFFSET_SIZE, true) + 8;
        } else {
            return 0;
        }
    }

    parseAndVerifyRiffChunk = function(dataView) {
        // check identifiert
        var identifier = dataView.getInt32(RIFF_OFFSET_IDENTIFIER);

        if (identifier != RIFF_IDENTIFIER) {
            throw "File identifiert is not 'RIFF'";
        }

        // check file format
        var fileFormatId = dataView.getInt32(RIFF_OFFSET_FILE_FORMAT_ID);
    
        if (fileFormatId != WAVE_FILE_FORMAT){
            throw "RIFF format is not 'WAVE'";
        }
    }

    parseAndVerifyFormatChunk = function(dataView) {
        // check identifiert
        let identifier = dataView.getInt32(FORMAT_OFFSET_IDENTIFIER);

        if (identifier != FORMAT_IDENTIFIER) {
            throw "Format chunk identifiert is not 'fmt '";
        }

        let audioFormat = dataView.getInt16(FORMAT_OFFSET_AUDIO_FORMAT, true);

        // must be PCM for the moment
        if (audioFormat != 1) {
            throw "Only PCM Format is supported";
        }

        this.nbrOfChannels = dataView.getInt16(FORMAT_OFFSET_NBR_OF_CHANNELS, true);
        this.samplesPerSecond = dataView.getInt32(FORMAT_OFFSET_SAMPLES_PER_SECOND, true);
        let bitsPerSample = dataView.getInt16(FORMAT_OFFSET_BITS_PER_SAMPLE, true);

        if (bitsPerSample % 8 != 0) {
            throw "Bits per sample have to be a multiple of 8";
        }

        this.bytesPerSample = bitsPerSample / 8;
    }

    parseAndVerifyDataChunk = function(dataView) {
        // check identifier
        let identifier = dataView.getInt32(DATA_OFFSET_IDENTIFIER);
        console.log(identifier.toString(16));
        // must be "data"
        if (identifier != DATA_IDENTIFIER) {
            throw "Data chunk identifiert is not 'data'";
        }
        dataView.getI
        let dataSize = dataView.getInt32(DATA_OFFSET_SIZE, true);
        
        let nbrOfSamples = dataSize / (this.bytesPerSample * this.nbrOfChannels);
        let offset = DATA_OFFSET_SAMPLES;
        this.samples = [];
        

        for (let i = 0; i < nbrOfSamples; ++i) {
            this.samples[i] = [];
            
            // FIXME: dont use getInt16(), instead read as many bytes as this.bytesPerSamples defines
            for (let channel = 0; channel < this.nbrOfChannels; ++channel) {
                this.samples[i][channel] = dataView.getInt16(offset, true);
                
                offset += this.bytesPerSample;
            }
        }
    }
}

function test(){
    var f = document.getElementById("file").files[0];
    var wrapper = new WaveFileWrapper(f);
    console.log(wrapper);
}

async function init(){
    document.getElementById("test").addEventListener('click', () => test());
}

init()
