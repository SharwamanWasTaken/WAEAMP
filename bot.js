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

client.once('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);
    const guilds = client.guilds.cache;
    for (const guild of guilds.values()) {
        const invites = await guild.invites.fetch();
        client.inviteCache = new Map(invites.map(inv => [inv.code, inv.uses]));
    }
});

client.on(Events.ChannelCreate, async (channel) => {
    if (!channel.name.startsWith('ticket-')) return;

    await new Promise(r => setTimeout(r, 3000));

    const members = await channel.guild.members.fetch();
    const ticketNumber = channel.name.split('-')[1];
    const member = members.find(m => m.user.discriminator !== '0' 
        ? `${m.user.username}${m.user.discriminator}` === ticketNumber
        : m.user.username === ticketNumber) 
        || channel.guild.members.cache.find(m => channel.permissionOverwrites.cache.has(m.id) && !m.user.bot);

    if (!member) {
        await channel.send('❌ Could not find the ticket owner.');
        return;
    }

    const invites = await channel.guild.invites.fetch();
    const userInvites = invites.filter(inv => inv.inviter && inv.inviter.id === member.id);
    const totalInvites = userInvites.reduce((acc, inv) => acc + inv.uses, 0);

    if (totalInvites < 1) {
        await channel.send(`❌ ${member} you do not meet the invite requirement (you have **${totalInvites}** invites). This ticket will be closed.`);
        await new Promise(r => setTimeout(r, 5000));
        await channel.delete();
        return;
    }

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
        await interaction.reply({ content: '📸 Please take a screenshot as proof, then create a new ticket in **14 days** to claim your reward!', ephemeral: false });
        await new Promise(r => setTimeout(r, 5000));
        await channel.delete();
    }

    if (interaction.customId === 'option2' || interaction.customId === 'option3') {
        const extra = interaction.customId === 'option2' ? '3' : '6';
        const wait = interaction.customId === 'option2' ? '7 days' : 'INSTANTLY';
        await interaction.reply({ content: `👍 Please do \`-rmi\` to register your extra **${extra} invites**. Once done, wait for a staff member to arrive and give you your reward (${wait})!`, ephemeral: false });
    }
});

client.login(TOKEN);
