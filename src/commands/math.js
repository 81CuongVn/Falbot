const {MessageEmbed} = require('discord.js')
const math = require('mathjs')
const {getRoleColor} = require('../utils/functions.js')
const {testOnly} = require("../config.json")

module.exports = {
    category: 'uteis',
    description: 'Resolve a mathematical expression',
    slash: 'both',
    cooldown: '1s',
    guildOnly: true,
    testOnly,
    minArgs: 1,
    expectedArgs: '<expression>',
    expectedArgsTypes: ['STRING'],
    options: [{
        name: 'expression',
        description: 'the mathematical expression to be solved',
        required: true,
        type: "STRING"
    }],
    callback: async ({instance, guild, user, text}) => {
        try {
            text = text.replaceAll("**",'^')
            answer = await math.evaluate(text).toString()

            const embed = new MessageEmbed()
             .setColor(await getRoleColor(guild, user.id))
             embed.addField(instance.messageHandler.get(guild, "RESULTADO"), answer, false)
             .setFooter({text: 'by Falcão ❤️'})
    
            return embed
        }catch (error) {
            console.error(`math: ${error}`)
        }
    }
}