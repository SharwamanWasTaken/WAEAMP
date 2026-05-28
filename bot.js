const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

const TOKEN = process.env.TOKEN;
const waitingForRmi = new Set();

client.once('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);
});

client.on(Events.ChannelCreate, async (channel) => {
    if (!channel.name.startsWith('ticket-')) return;

    await new Promise(r => setTimeout(r, 3000));

    const member = channel.guild.members.cache.find(m => channel.permissionOverwrites.cache.has(m.id) && !m.user.bot);

    if (!member) {
        await channel.send('❌ Could not find the ticket owner.');
        return;
    }

    await channel.send(`-i ${member}`);
    await new Promise(r => setTimeout(r, 5000));

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('option1').setLabel('Option 1 - 14 Days').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('option2').setLabel('Option 2 - 7 Days').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('option3').setLabel('Option 3 - Instant').setStyle(ButtonStyle.Success),
    );

    await channel.send({
        content: `✅ Since we currently have over **300+ people** trying to claim, we added a few options to help everyone get their rewards faster:\n\n▶️ \`Option 1\` : You wouldn't have to invite anyone, **BUT** it'll take __14 days__ for your reward\n▶️ \`Option 2\` : You can invite **3 extra people** on top of your reward and you can wait __7 days__\n▶️ \`Option 3\` : You can invite **6 extra people** on top of your rewards and you can get it **INSTANTLY**\n\n👉 Please choose an option:`,
        components: [row]
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    const channel = interaction.channel;

    if (interaction.customId === 'option1') {
        await interaction.reply({ content: '📸 Please take a screenshot as proof! This ticket will close in **10 seconds**.' });
        await new Promise(r => setTimeout(r, 10000));
        await channel.delete().catch(() => {});
    }

    if (interaction.customId === 'option2') {
        await interaction.reply({ content: '👥 Please invite **3 people** and then create a new ticket to claim your reward! This ticket will close in **10 seconds**.' });
        await new Promise(r => setTimeout(r, 10000));
        await channel.delete().catch(() => {});
    }

    if (interaction.customId === 'option3') {
        await interaction.reply({ content: '👉 Please type `-rmi` to claim your reward!' });
        waitingForRmi.add(channel.id);
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!waitingForRmi.has(message.channel.id)) return;

    if (message.content.trim().toLowerCase() === '-rmi') {
        waitingForRmi.delete(message.channel.id);
        await message.channel.send('✅ Done! Please wait for a staff member to arrive and give you your reward!');
    } else {
        await message.channel.send('⚠️ Please type `-rmi` or this ticket will close in **15 seconds**!');
        await new Promise(r => setTimeout(r, 15000));
        if (waitingForRmi.has(message.channel.id)) {
            waitingForRmi.delete(message.channel.id);
            await message.channel.delete().catch(() => {});
        }
    }
});

client.login(TOKEN);
