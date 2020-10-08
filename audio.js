class Audio {
    
    convert_video2audio(infile,outfile,cb) {
        //TODO
    }

    convert_audio(infile, outfile, cb) {
        try {
            let SoxCommand = require('sox-audio');
            let command = SoxCommand();
            streamin = fs.createReadStream(infile);
            streamout = fs.createWriteStream(outfile);
            command.input(streamin)
                .inputSampleRate(48000)
                .inputEncoding('signed')
                .inputBits(16)
                .inputChannels(2)
                .inputFileType('raw')
                .output(streamout)
                .outputSampleRate(16000)
                .outputEncoding('signed')
                .outputBits(16)
                .outputChannels(1)
                .outputFileType('wav');
    
            command.on('end', function() {
                streamout.close();
                streamin.close();
                cb();
            });
            command.on('error', function(err, stdout, stderr) {
                console.log('Cannot process audio: ' + err.message);
                console.log('Sox Command Stdout: ', stdout);
                console.log('Sox Command Stderr: ', stderr)
            });
    
            command.run();
        } catch (e) {
            console.log('convert_audio: ' + e)
        }
    }
}