const DeepSpeech = require('deepspeech');
const Sox = require('sox-stream');
const MemoryStream = require('memory-stream');
const Duplex = require('stream').Duplex;
const Wav = require('node-wav');
const fs = require('fs');

/**
 * Use this class to transcribe audio or video stream
 */
class Transcriber {
    constructor (alpha,beta,modelPath,desiredSampleRate,scorerPath) {
        this.alpha      = alpha;
        this.beta       = beta;
        this.modelPath  = modelPath;
        this.sampleRate = desiredSampleRate;
        this.scorerPath = scorerPath;
        this.model      = new DeepSpeech.Model(this.modelPath);
        this.model.enableExternalScorer(this.scorerPath);
    }

    /**
     * @returns alpha value
     */
    get alpha() {
        return this.alpha;
    }

    /**
     * @returns beta value
     */
    get beta() {
        return this.beta;
    }

    /**
     * @returns the model path used
     */
    get modelPath() {
        return this.modelPath;
    }

    /**
     * @returns the sample rate used
     */
    get sampleRate() {
        return this.sampleRate;
    }

    /**
     * @returns the deepspeech model
     */
    get model() {
        return this.model;
    }
    
    #bufferToStream(buffer) {
        let stream = new Duplex();
        stream.push(buffer);
        stream.push(null);
        return stream;
    }

    /**
     * 
     * @param {*} audioFile 
     * @returns a string with the transcribed text
     */
    transcribe_audio(audioFile) {
        const buffer = fs.readFileSync(audioFile);
        const result = Wav.decode(buffer);
        
        if (result.sampleRate < this.sampleRate) {
            console.error('Warning: original sample rate (' + result.sampleRate + ') is lower than ' + desiredSampleRate + 'Hz. Up-sampling might produce erratic speech recognition.');
        }
    
        let audioStream = new MemoryStream();

        this.bufferToStream(buffer).
        pipe(Sox({
                input:  { 
                    volume: 0.8,
                },
                global: {
                    'no-dither': true,
                },
                output: {
                    bits: 16,
                    rate: this.sampleRate,
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
}