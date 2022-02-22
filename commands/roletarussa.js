const Discord = require('discord.js')
const functions = require('../functions.js')
const config = require("../config/config.json")

module.exports =  {
    category: 'Economia',
    description: 'jogue com seus amigos, ultimo sobrevivente ganha!',
    slash: 'both',
    cooldown: '1s',
    guildOnly: true,
    testOnly: config.testOnly,
    minArgs: 1,
    expectedArgs: '<falcoins>',
    expectedArgsTypes: ['STRING'],
    options: [
    {
        name: 'falcoins',
        description: 'a quantidade de falcoins que você ira apostar',
        required: true,
        type: Discord.Constants.ApplicationCommandOptionTypes.STRING
    }],
    callback: async ({instance, guild, message, interaction, client, user, args}) => {
        try {
            const author = user
                try {
                    var bet = await functions.specialArg(args[0], user.id)
                } catch {
                    return instance.messageHandler.get(guild, "VALOR_INVALIDO", {VALUE: args[1]})
                } 
                if (await functions.readFile(user.id, 'Falcoins')) {
                    var pot = bet
                    const embed = new Discord.MessageEmbed()
                    .setTitle(instance.messageHandler.get(guild, "ROLETA_RUSSA"))
                    .setDescription(`${author.username}` + instance.messageHandler.get(guild, "ROLETA_RUSSA_COMECOU"))
                    .setColor('#0099ff')
                    .addFields({
                        name: instance.messageHandler.get(guild, "APOSTA"),
                        value: `${pot} Falcoins`,
                        inline: false
                    }, {
                        name: instance.messageHandler.get(guild, "JOGADORES"),
                        value: `${author}`,
                        inline: false
                    })
                    .setFooter({text: 'by Falcão ❤️'})
                    if (message) {
                        var answer = await message.reply({
                            embeds: [embed]
                        })
                    } else {
                        var answer = await interaction.reply({
                            embeds: [embed],
                            fetchReply: true
                        })
                    }
                    answer.react('✅')
                    functions.changeJSON(author.id, 'Falcoins', -bet)

                    var users = [author]
                    var names = [author]
                    if (instance.messageHandler.getLanguage(guild) === "portugues") {
                        mensagens = ['morreu', 'colocou a cabeça no lugar errado', 'viajou pro EUA', 'não tinha o high ground', 'descobriu que o chão era lava', 'descobriu que a terra é plana', 'não usou máscara']
                    } else {
                        mensagens = ['died', 'put their head on the wrong side', 'went to the USA', 'didn\'t have the high ground', 'found out that the floor was lava', 'found out that the earth is flat', 'didn\'t use a mask']
                    }
    
                    const filter = async (reaction, user) => {
                        return await functions.readFile(user.id, 'Falcoins') >= bet && reaction.emoji.name === '✅' && user.id !== client.user.id && !users.includes(user) 
                    }
    
                    const collector = answer.createReactionCollector({
                        filter,
                        time: 1000 * 60
                    })

                    collector.on('collect', async (reaction, user) => {
                        functions.changeJSON(user.id, 'Falcoins', -bet)
                        users.push(user)
                        names.push(user)
                        pot += bet
                        embed.fields[0] = {"name": instance.messageHandler.get(guild, "APOSTA"), "value": `${pot} falcoins`, "inline": false}
                        embed.fields[1] = {"name": instance.messageHandler.get(guild, "JOGADORES"), "value": `${names.join('\n')}`, "inline": false}
                        answer.edit({
                            embeds: [embed]
                        })
                    })
    
                    collector.on('end', async () => {
                        while (users.length > 1) {
                            var luck = functions.randint(0, users.length - 1)
                            var eliminated = users[luck]
                            names[luck] = `~~${names[luck]}~~ :skull:`
                            users.splice(luck, 1)
                            var embed2 = new Discord.MessageEmbed()
                             .setTitle(instance.messageHandler.get(guild, "ROLETA_RUSSA"))
                             .setDescription(`${eliminated} ${mensagens[functions.randint(0, mensagens.length -1)]}`)
                             .addFields({
                                name: instance.messageHandler.get(guild, "APOSTA"),
                                value: `${pot} Falcoins`,
                                inline: false
                             }, {
                                name: instance.messageHandler.get(guild, "JOGADORES"),
                                value: names.join('\n'),
                                inline: false
                             }, {
                                 name: instance.messageHandler.get(guild, "TEMPO_RESTANTE"),
                                 value: instance.messageHandler.get(guild, "ATIRANDO"),
                                 inline: false
                             })
                             .setFooter({text: 'by Falcão ❤️'})
                            if (message) {
                                var answer = await message.channel.send({
                                    embeds: [embed2]
                                })
                            } else {
                                var answer = await interaction.channel.send({
                                    embeds: [embed2]
                                })
                            }
                            await new Promise(resolve => setTimeout(resolve, 5000));
                        }
                        var winner = users[0]
                        functions.changeJSON(winner.id, 'Falcoins', pot)
                        functions.changeJSON(winner.id, 'Vitorias')
                        var embed3 = new Discord.MessageEmbed()
                        .setTitle(instance.messageHandler.get(guild, "ROLETA_RUSSA"))
                        .setDescription(`${winner} ganhou ${pot} falcoins`)
                        .setColor(3066993)
                        .addField(instance.messageHandler.get(guild, "SALDO_ATUAL"), `${await functions.format(await functions.readFile(winner.id, 'Falcoins'))} falcoins`, false)
                        .setFooter({text: 'by Falcão ❤️'})
                        if (message) {
                            await message.reply({
                                embeds: [embed3]
                            })
                        } else {
                            await interaction.followUp({
                                embeds: [embed3]
                            })
                        }
                    })
                } else if (bet <= 0) {
                    return instance.messageHandler.get(guild, "VALOR_INVALIDO", {VALUE: bet})
                } else {
                    return instance.messageHandler.get(guild, "FALCOINS_INSUFICIENTES")
                }
        } catch (error) {
            console.error(`roletarussa: ${error}`)
        }
    }
}   