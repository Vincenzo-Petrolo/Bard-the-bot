import * as Readable from 'stream'
import * as Transcriber from './transcriber.js'
import * as Converter from './converter.js'
import * as JSONManager from './jsonManager.js'
import * as Discord from 'discord.js'
import * as fs from 'fs'

export class DiscordBot {
    constructor() {
        this.transcriber = new Transcriber.Transcriber(0,0,"./model/output_graph.pbmm",16000,"./model/scorer");
        this.jsonMan     = new JSONManager.JSONManager("tokens.json","songs.json","prints.json");
        this.discord     = new Discord.Client();
        this.messaggio   = null;
        this.PREFIX           = "\\";
        this._CMD_HELP        = this.PREFIX + 'help';
        this._CMD_JOIN        = this.PREFIX + 'join';
        this._CMD_LEAVE       = this.PREFIX + 'leave';
        this._CMD_DEBUG       = this.PREFIX + 'debug';
        this._CMD_TEST        = this.PREFIX + 'hello';
        this.guildMap = new Map();
        this.mapKeys = new Map();
        this.lastSong="";

        this.discord.login(this.jsonMan.get_tokens()["discord_token"]); //setups discord with the token
    }
    
    start() {
        this.init()
    }

    /**
     * This method defines all the callback functions that needs to be called
     * such as on message (when a message arrives from a user)
     */
    init() {
        this.discord.on('message', async (msg) => {
            this.messaggio = msg;
            try {
                if (!('guild' in msg) || !msg.guild) return;
                const mapKey = msg.guild.id;
                if (msg.content.trim().toLowerCase() == "*join") {
                    if (!msg.member.voice.channelID) {
                        msg.reply('Error: please join a voice channel first.')
                    } else {
                        if (!this.guildMap.has(this.mapKey)){
                            await this.connect(msg, mapKey)
                        }
                             
                        else
                            msg.reply('Already connected')
                    }
                } else if (msg.content.trim().toLowerCase() == this._CMD_LEAVE) {
                    if (this.guildMap.has(mapKey)) {
                        let val = this.guildMap.get(mapKey);
                        if (val.voice_Channel) val.voice_Channel.leave()
                        if (val.voice_Connection) val.voice_Connection.disconnect()
                        if (val.musicYTStream) val.musicYTStream.destroy()
                            this.guildMap.delete(mapKey)
                        msg.reply("Disconnected.")
                    } else {
                        msg.reply("Canenot leave because not connected.")
                    }
                } else if (msg.content.trim().toLowerCase() == this._CMD_HELP) {
                    msg.reply(getHelpString());
                }
                else if (msg.content.trim().toLowerCase() == this._CMD_DEBUG) {
                    console.log('toggling debug mode')
                    let val = this.guildMap.get(mapKey);
                    if (val.debug)
                        val.debug = false;
                    else
                        val.debug = true;
                }
                else if (msg.content.trim().toLowerCase() == this._CMD_TEST) {
                    msg.reply('hello back =)')
                }
            } catch (e) {
                console.log('discordClient message: ' + e)
                msg.reply('Error#180: Something went wrong, try again or contact the developers if this keeps happening.');
            }
        })
    }
    async connect(msg, mapKey) {
        try {

            const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);

            class Silence extends Readable.Readable {
                _read() {
                    this.push(SILENCE_FRAME);
                    this.destroy();
                }
            }
            let voice_Channel = await this.discord.channels.fetch(msg.member.voice.channelID);
            if (!voice_Channel) return msg.reply("Error: The voice channel does not exist!");
            let text_Channel = await this.discord.channels.fetch(msg.channel.id);
            if (!text_Channel) return msg.reply("Error: The text channel does not exist!");
            let voice_Connection = await voice_Channel.join();
            voice_Connection.play(new Silence(), { type: 'opus' });
            this.guildMap.set(mapKey, {
                'text_Channel': text_Channel,
                'voice_Channel': voice_Channel,
                'voice_Connection': voice_Connection,
                'musicQueue': [],
                'musicDispatcher': null,
                'musicYTStream': null,
                'currentPlayingTitle': null,
                'currentPlayingQuery': null,
                'debug': false,
            });
            this.speak_impl(voice_Connection, mapKey)
            voice_Connection.on('disconnect', async(e) => {
                if (e) console.log(e);
                this.guildMap.delete(mapKey);
            })
            msg.reply('connected!')
        } catch (e) {
            console.log('connect: ' + e)
            msg.reply('Error: unable to join your voice channel.');
            throw e;
        }
    }

    speak_impl(voice_Connection, mapKey) {
        voice_Connection.on('speaking', async (user, speaking) => {
            if (speaking.bitfield == 0 /*|| user.bot*/) {
                return
            }
                
            console.log(`I'm listening to ${user.username}`)

            // this creates a 16-bit signed PCM, stereo 48KHz stream
            const audioStream = voice_Connection.receiver.createStream(user, { mode: 'pcm' })
            let result = this.transcriber.transcribe_audio(audioStream)
            console.log("result: " + result)
            this.process_command(result);
        })
    }

    

    process_command(txt) {
        console.log(txt)
        //if (!this.check_txt_len(txt)) return;                                                // check message esists
        //let val = guildMap.get(mapKey);val.text_Channel.send(user.username + ': ' + txt);     //DEBUGGING    
        if (typeof(txt) == 'undefined') return;
        var arrofwords = txt.split(" ");                                             // array of every word
        console.log(arrofwords)
        arrofwords.forEach(element => {
            console.log(element)
            if (this.jsonMan.get_songs()[element]) {
                console.log("riproduco : " + json.get(element))
                this.discord.play.play(this.messaggio, json.get(element));
            }
        });
        /*
        let element = this.find_last_word(arrofwords);                                    // find last word
        if (element && this.check_last_elem(element)) {                                  //checking element not already used
            this.discord.player.play(this.messaggio, json.get(element));         //start music
            this.mem_last_song(element);
        }
        */
    }

    check_txt_len(txt) {
        return (txt && txt.length);
    }

    find_last_word(arrofwords) {
        let finalWord = arrofwords.reverse().indexOf(element => (json.search(element) != -1));
        return finalWord;
    }

    mem_last_song(element) {
        lastSong = element;
    }

    check_last_elem(element) {
        return element != lastSong;
    }
}