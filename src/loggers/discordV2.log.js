'use strict'


const {Client, GatewayIntentBits} = require('discord.js')
const {
    TOKEN_DISCORD,
    CHANNELID_DISCORD } = process.env
class LoggerService{

    constructor(){
        this.client = new Client({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        })
        // Add channel id
        this.channelId = CHANNELID_DISCORD
        
        this.client.on('ready', ()=>{
            console.log(`Logged is as ${this.client.user.tag}`)
            }
        )
        this.client.login(TOKEN_DISCORD)

    }

    sendToFormatCode(logData){
        const {code, message = 'This is some additional information about the code.', title = 'Code example'} = logData
        const codeMessage = {
            content: message,
            embeds:[
                {
                    color: parseInt('00ff00', 16), // Convert hex color code to int
                    title,
                    description: '```json\n' + JSON.stringify(code, null, 2) + '\n```'
                }
            ]
        }
        this.sendToMessage(codeMessage)
    
    }
    sendToMessage(message = 'message'){
        const channel = this.client.channels.cache.get(this.channelId)
        if(!channel){
            console.log(`Couldn't find the channel...`, this.channelId)
            return;
        }
        channel.send(message).catch(e => console.log(e))
    }
}


// const loggerService = new LoggerService()
module.exports = new LoggerService()