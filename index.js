const DeepSpeech = require('deepspeech');
const Sox = require('sox-stream');
const MemoryStream = require('memory-stream');
const Duplex = require('stream').Duplex;
const Wav = require('node-wav');
const fs = require('fs');
/*
let songsMap = new Map();
const SONGS_FILE = 'songs.json';

function setup_songs_map() {
    const SONGS = JSON.parse(fs.readFileSync(SONGS_FILE, 'utf8') );
    full_songs_map(SONGS);
}

function full_songs_map(SONGS) {
    for (let key in SONGS) {
        songsMap.set(key,SONGS[key]);
    }
}

function add_song(keySong,url){
    validURL(url);
    //validKEY(key);
    add_song_runtime(keySong,url);
    add_song_json(keySong,url);
}

function add_song_runtime(keySong,url) {songsMap.set(keySong,url);}

function add_song_json(keySong,url){
    SONGS[keySong]=url;
}

setup_songs_map();add_song("pippo","https://www.youtube.com/watch?v=zAml4Y46ToQ");

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }
*/
// Deepspeech

const LM_ALPHA = 0;
const LM_BETA = 0;

let modelPath = './model/output_graph.pbmm';
let model = new DeepSpeech.Model(modelPath);
let desiredSampleRate = model.sampleRate();
let scorerPath = './model/scorer';

model.enableExternalScorer(scorerPath);

/**
 * Converts audio file to text using the deepspeech model
 * @param {*} audioFile 
 * @returns transcribed text
 */
function transcribe(audioFile) {
    const buffer = fs.readFileSync(audioFile);
    const result = Wav.decode(buffer);
    
    if (result.sampleRate < desiredSampleRate) {
        console.error('Warning: original sample rate (' + result.sampleRate + ') is lower than ' + desiredSampleRate + 'Hz. Up-sampling might produce erratic speech recognition.');
    }

    let audioStream = new MemoryStream();
    bufferToStream(buffer).
    pipe(Sox({
            input:  { 
                volume: 0.8,
            },
            global: {
                'no-dither': true,
            },
            output: {
                bits: 16,
                rate: desiredSampleRate,
                channels: 1,
                encoding: 'signed-integer',
                endian: 'little',
                compression: 0.0,
                type: 'raw'
            }
        })
    ).
    pipe(audioStream);
    audioStream.on('finish', () => {
        let audioBuffer = audioStream.toBuffer();
        
        const audioLength = (audioBuffer.length / 2) * (1 / desiredSampleRate);
        console.log('audio length', audioLength);
        
        let result = model.stt(audioBuffer);
        console.log(result);
        return result;
    });
}
/**
 * 
 * @param {*} buffer 
 * @returns a stream
 */
function bufferToStream(buffer) {
	let stream = new Duplex();
	stream.push(buffer);
	stream.push(null);
	return stream;
}

let test_record = 'record.wav'