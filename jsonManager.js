import * as fs from 'fs'

export class JSONManager {
    /**
     *  Create a JSON files manager, which provides a wrapper
     * for writes on files, and manages the JSON objects of the Bot.
     * 
     * @param {*} tokensFile filename
     * @param {*} songsFile  filename
     */
    constructor(tokensFile,songsFile,printsFile) {
        this.tokensFile = tokensFile;
        this.songsFile  = songsFile;
        this.printsFile = printsFile;

        this.songs      = JSON.parse(fs.readFileSync(this.songsFile,'utf-8'));
        this.tokens     = JSON.parse(fs.readFileSync(this.tokensFile,'utf-8'));
        this.prints     = JSON.parse(fs.readFileSync(this.printsFile,'utf-8'));
    }

    /**
     * @returns the filename of the tokens
     */
    get_tokensFile() {
        return this.tokensFile;
    }

    /**
     * @returns the filename of the songs
     */
    get_songsFile() {
        return this.songsFile;
    }

    /**
     * @returns the filename of the prints
     */
    get_printsFile() {
        return this.printsFile;
    }

    /**
     * @returns the JSON struct of songs : urls
     */
    get_songs() {
        return this.songs;
    }

    /**
     * @returns the JSON struct of token_name : token
     */
    get_tokens() {
        return this.tokens;
    }

    /**
     * @returns the prints JSON structure
     */
    get_prints() {
        return this.prints;
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
        fs.writeFile(this.songsFile,JSON.stringify(this.songs),(error) => {
            if (error) throw error;
        });
    }
    
    /**
     * Removes a key and save to the file
     * @param {*} keyName 
     */
    remove_song(keyName) {
        delete this.songs[keyName];
        fs.writeFile(this.songsFile,JSON.stringify(this.songs),(error) => {
            if (error) throw error;
        });
    }
}