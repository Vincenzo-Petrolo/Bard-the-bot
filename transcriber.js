import * as DeepSpeech from 'deepspeech'
import Sox from 'sox-stream'
import MemoryStream from 'memory-stream'
import * as Duplex from 'stream'

/**
 * Use this class to transcribe audio or video stream
 */
export class Transcriber {
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
    get_alpha() {
        return this.alpha;
    }

    /**
     * @returns beta value
     */
    get_beta() {
        return this.beta;
    }

    /**
     * @returns the model path used
     */
    get_modelPath() {
        return this.modelPath;
    }

    /**
     * @returns the sample rate used
     */
    get_sampleRate() {
        return this.sampleRate;
    }

    /**
     * @returns the deepspeech model
     */
    get_model() {
        return this.model;
    }
    
    bufferToStream(buffer) {
        let stream = new Duplex.Duplex();
        stream.push(buffer);
        stream.push(null);
        return stream;
    }

    /**
     * 
     * @param {*} audioFile 
     * @returns a string with the transcribed text
     */
    transcribe_audio(audioStream) {
        console.log("Sto trascrivendo...")
    
        let memStream = new MemoryStream();

        audioStream
        .pipe(Sox(
            {
            input:  { 
                volume: 1,
                type: 'raw',
                rate: 48000,
                encoding: 'signed-integer',
                bits: 16,
                channels: 2,
                endian:"little"
            },
            global: {
                'no-dither': true,
            },
            output: {
                bits: 16,
                rate: 16000,
                channels: 1,
                encoding: 'signed-integer',
                endian: 'little',
                compression: 0.0,
                type: 'raw'
            }
        })).pipe(memStream)

        memStream.on('finish', () => {
            let audioBuffer = memStream.toBuffer();
            
            const audioLength = (audioBuffer.length / 2) * (1 / this.sampleRate);
            console.log('audio length', audioLength);
            
            return this.model.stt(audioBuffer);
        });

    }
}