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
const inviteCache = new Map();

client.once('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);
    const guilds = client.guilds.cache;
    for (const guild of guilds.values()) {
        const invites = await guild.invites.fetch();
        inviteCache.set(guild.id, new Map(invites.map(inv => [inv.code, inv.uses])));
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.content === '!invitepanel') {
        const button = new ButtonBuilder()
            .setCustomId('check_invites')
            .setLabel('Check Invites')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await message.channel.send({
            content: '👥 Click the button below to check your invites!',
            components: [row]
        });
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'check_invites') {
        const guild = interaction.guild;
        const invites = await guild.invites.fetch();
        const userInvites = invites.filter(inv => inv.inviter && inv.inviter.id === interaction.user.id);
        const totalUses = userInvites.reduce((acc, inv) => acc + inv.uses, 0);

        await interaction.reply({
            content: `👋 You have **${totalUses}** invite(s)!`,
            ephemeral: true
        });
    }
});

client.login(TOKEN);