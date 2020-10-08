const fs = require('fs');

class JSONManager {
    /**
     *  Create a JSON files manager, which provides a wrapper
     * for writes on files, and manages the JSON objects of the Bot.
     * 
     * @param {*} tokensFile filename
     * @param {*} songsFile  filename
     */
    constructor(tokensFile,songsFile) {
        this.tokensFile = tokensFile;
        this.songsFile  = songsFile;

        this.songs      = JSON.parse(fs.readFileSync(this.songsFile,'utf-8'));
        this.tokens     = JSON.parse(fs.readFileSync(this.tokensFile,'utf-8'));
    }

    /**
     * @returns the filename of the tokens
     */
    get tokensFile() {
        return this.tokensFile;
    }

    /**
     * @returns the filename of the songs
     */
    get songsFile() {
        return this.songsFile;
    }

    /**
     * @returns the JSON struct of songs : urls
     */
    get songs() {
        return this.songs;
    }

    /**
     * @returns the JSON struct of token_name : token
     */
    get tokens() {
        return this.tokens;
    }

    /**
     * Add a song to the JSON structure and make it persistent
     * Note that if the key exists already then it is overwrited,
     * otherwise it is updated
     * @param {*} keyName 
     * @param {*} url 
     */
    add_song(keyName,url) {
        this.songs[keyName] = url;
        fs.writeFile(this.songsFile,JSON.stringify(this.songs));
    }
    
    /**
     * Removes a key and save to the file
     * @param {*} keyName 
     */
    remove_song(keyName) {
        delete this.songs[keyName];
        fs.writeFile(this.songsFile,JSON.stringify(this.songs));
    }
}