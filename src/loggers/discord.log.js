'use strict'

const {Client, GatewayIntentBits} = require('discord.js')

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.on('ready', ()=>{
    console.log(`Logged is as ${client.user.tag}`)
    }
)

const token = 'MTIzNTA2MDAzNzUyMTUxMDQ3Mw.GVeFyx.Ro5K2kFA_mH-XgF2xPQwmuX5ehbE7XaVPjInoQ'

client.login(token)

client.on('messageCreate', msg => {
    if(msg.author.bot) return;
    if(msg.content === 'hello'){
        msg.reply(`Muon gi ?`)
    }
})