require('dotenv/config')
const config = require("./config.json");
const { Client , IntentsBitField , GatewayIntentBits , Routes , Collection} = require('discord.js')
const { Configuration, OpenAIApi } = require('openai');
const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest')

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,

    ]
})

client.commands = new Collection();
const slashCommands = [];


client.on('ready',() => {
    client.user.setActivity(`insanlık ve yazılım arasındaki o köprüyüm`);
    console.log("Bot Açık.");

    let guildId = config.guildID
    let clientId = config.clientID
    let token = config.token


    const rest = new REST ({version: '10'}).setToken(token);

    rest.put(Routes.applicationGuildCommands(clientId , guildId) , { body: slashCommands })
        .then(data => console.log(`${data.length} komut başarıyla yüklendi.`))
        .catch(console.error);
});

const commandsPath = path.join(__dirname,'slashCommands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')) ;

for (const file of commandFiles) {
    const filePath = path.join(commandsPath , file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
    slashCommands.push(JSON.stringify(command.data));

    console.log(`${command.data.name} isimli komut yüklendi!`)
}


client.on('interactionCreate', async interaction =>{
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch(error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral:true})
    }
});

const configuration = new Configuration({
    apiKey: process.env.API_KEY
})

const openai = new OpenAIApi(configuration);

client.on('messageCreate' , async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.CHANNEL_ID) return;
    if (message.content.startsWith('!')) return;

    let conversationLog = [{ role: 'system' , content: "Sen çok iyi bir arkadaşsın"}];

    conversationLog.push({
        role: 'user',
        content: message.content,

    });

    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({limit:15});
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
        if (message.content.startsWith('!')) return;
        if (msg.author.id !== client.user.id && message.author.bot) return;
        if (msg.author.id !== message.author.id) return;

        conversationLog.push({
            role: 'user',
            content: message.content,
        });


    });

    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo-0613',
        messages: conversationLog,
    })

    message.reply(result.data.choices[0].message);
});




client.login(process.env.TOKEN)

