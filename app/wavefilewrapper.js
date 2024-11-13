
class WaveFileWrapper {
    constructor(file) { 
        if(!file)
            throw "No file given";

        this.filename = file.name;
        this.readAndParse();
    }

    readAndParse = function(file) {
        const reader = new FileReader()

        reader.addEventListener("loadend", () => {
            this.parseFile(reader.result);
        });

        reader.addEventListener("error", () => {
            throw "Error while reading the file:" + reader.error;
        });

        reader.readAsArrayBuffer(document.getElementById("file").files[0]);
    }

    parseFile = function(arrayBuffer) {
        // https://en.wikipedia.org/wiki/WAV#WAV_file_header

        let riffView = new DataView(arrayBuffer, 0, 12);
        this.parseAndVerifyRiffChunk(riffView);

        let formatView = new DataView(arrayBuffer, 12, 24)
        this.parseAndVerifyFormatChunk(formatView);

        let dataView = new DataView(arrayBuffer, 36);
        this.parseDataChunk(dataView);
    };

    parseAndVerifyRiffChunk = function(dataView) {
        // check identifiert
        var fileTypeBlocId = dataView.getInt32(0);

        // must be "RIFF"
        if (fileTypeBlocId != 0x52494646) {
            throw "File identifiert is not 'RIFF'";
        }

        // check file format
        var fileFormatId = dataView.getInt32(8);
    
        // must be "WAVE" 
        if (fileFormatId != 0x57415645){
            throw "RIFF format is not 'WAVE'";
        }
    }

    parseAndVerifyFormatChunk = function(dataView) {
        // check identifiert
        let formatBlocId = dataView.getInt32(0);

        // must be "fmt "
        if (formatBlocId != 0x666D7420) {
            throw "Format chunk identifiert is not 'fmt '";
        }

        let audioFormat = dataView.getInt16(8, true);

        // must be PCM for the moment
        console.log(audioFormat.toString(16));
        if (audioFormat != 1) {
            throw "Only PCM Format is supported";
        }

        this.nbrOfChannels = dataView.getInt16(10, true);
        this.frequency = dataView.getInt32(12, true);
        this.bitsPerSample = dataView.getInt16(22, true);
    }

    parseDataChunk = function(dataView) {

    }
}


function test(){
    var f = document.getElementById("file").files[0];

    new WaveFileWrapper(f);
}

async function init(){
    document.getElementById("test").addEventListener('click', () => test());
}

init()
