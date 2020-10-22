import * as Readable from 'stream'
import * as Transcriber from './transcriber.js'
import * as JSONManager from './jsonManager.js'
import * as Discord from 'discord.js'
import Player from './node_modules/discord-player/src/Player.js'

export class DiscordBot {
    constructor() {
        this.transcriber = new Transcriber.Transcriber(0,0,"./model/output_graph.pbmm",16000,"./model/scorer");
        this.jsonMan     = new JSONManager.JSONManager("tokens.json","songs.json","prints.json");
        this.discord     = new Discord.Client();
        this.discord.player = new Player(this.discord);
        this.messaggio   = null;
        this.PREFIX           = "\\";
        this._CMD_HELP        = this.PREFIX + 'help';
        this._CMD_JOIN        = this.PREFIX + 'join';
        this._CMD_LEAVE       = this.PREFIX + 'leave';
        this._CMD_DEBUG       = this.PREFIX + 'debug';
        this._CMD_TEST        = this.PREFIX + 'hello';
        this._CMD_ADDSONG     = this.PREFIX + 'addmusic';
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
                console.log(this._CMD_ADDSONG)
                console.log(msg.content.split(" ")[0])
                console.log((msg.content.toLowerCase().split(" ")[0] == "\\addmusic"))
                if (msg.content.trim().toLowerCase() == this._CMD_JOIN) {
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
                else if (msg.content.toLowerCase().split(" ")[0] == "\\addmusic"){
                    this.jsonMan.add_song("ciao","pluto")
                    this.jsonMan.add_song(msg.content.split(" ")[1],msg.content.split(" ")[2]);        
                }
                else if (msg.content.toLowerCase().split(" ")[0] == "\\removemusic"){
                    this.jsonMan.remove_song(msg.content.split(" ")[1]);        
                }
            } catch (e) {
                console.log('discordClient message: ' + e)
                msg.reply('Error#180: Something went wrong, try again or contact the developers if this keeps happening.');
            }
        })
    }
    getFirstWord(str) {
        return str.split(" ")[0]

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
            this.speak_impl(voice_Connection)
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

    speak_impl(voice_Connection) {
        voice_Connection.on('speaking', async (user, speaking) => {
            if (speaking.bitfield == 0 /*|| user.bot*/) {
                return
            }
                
            console.log(`I'm listening to ${user.username}`);

            // this creates a 16-bit signed PCM, stereo 48KHz stream
            const audioStream = voice_Connection.receiver.createStream(user, { mode: 'pcm' });
            this.transcriber.transcribe_audio(audioStream,this);
        })
    }

    

    process_command(txt) {
        console.log("Processamento del testo...")
        var arrofwords = txt.split(" ");  
        var trovato = false;
        arrofwords.reverse().forEach(element => {
            console.log(element + "in JSON : " + (element in this.jsonMan.get_songs()))
            if (element in this.jsonMan.get_songs() && !trovato) {
                console.log("riproduco l'url per " + element)
                this.discord.player.play(this.messaggio, this.jsonMan.get_songs()[element]);
                trovato = true;
            }
        });                                           // array of every word
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