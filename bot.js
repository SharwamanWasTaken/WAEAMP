const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder } = require('discord.js');

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
const waitingForOption = new Set();
const inviteCache = new Map();

client.once('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);
    for (const guild of client.guilds.cache.values()) {
        const invites = await guild.invites.fetch();
        inviteCache.set(guild.id, new Map(invites.map(inv => [inv.code, { uses: inv.uses, inviter: inv.inviter?.id }])));
    }
});

client.on(Events.GuildMemberAdd, async (member) => {
    const guild = member.guild;
    const newInvites = await guild.invites.fetch();
    const oldInvites = inviteCache.get(guild.id) || new Map();

    const usedInvite = newInvites.find(inv => {
        const old = oldInvites.get(inv.code);
        return old && inv.uses > old.uses;
    });

    inviteCache.set(guild.id, new Map(newInvites.map(inv => [inv.code, { uses: inv.uses, inviter: inv.inviter?.id }])));

    if (!usedInvite) return;
    const inviterId = usedInvite.inviter?.id;
    if (!inviterId) return;

    if (!client.inviteData) client.inviteData = new Map();
    if (!client.inviteData.has(inviterId)) {
        client.inviteData.set(inviterId, { joins: [], left: [], fake: [] });
    }

    const data = client.inviteData.get(inviterId);
    const accountAge = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);

    if (accountAge < 7) {
        data.fake.push(member.id);
    } else {
        data.joins.push(member.id);
    }
});

client.on(Events.GuildMemberRemove, async (member) => {
    if (!client.inviteData) return;
    for (const [inviterId, data] of client.inviteData.entries()) {
        if (data.joins.includes(member.id)) {
            data.joins = data.joins.filter(id => id !== member.id);
            data.left.push(member.id);
        }
    }
});

async function getInviteStats(guild, userId) {
    if (!client.inviteData || !client.inviteData.has(userId)) {
        const invites = await guild.invites.fetch();
        const userInvites = invites.filter(inv => inv.inviter?.id === userId);
        const total = userInvites.reduce((acc, inv) => acc + inv.uses, 0);
        return { joins: total, left: 0, fake: 0, rejoins: 0 };
    }
    const data = client.inviteData.get(userId);
    return {
        joins: data.joins.length,
        left: data.left.length,
        fake: data.fake.length,
        rejoins: 0
    };
}

client.on(Events.ChannelCreate, async (channel) => {
    if (!channel.name.startsWith('ticket-')) return;

    await new Promise(r => setTimeout(r, 3000));

    const member = channel.guild.members.cache.find(m => channel.permissionOverwrites.cache.has(m.id) && !m.user.bot);

    if (!member) {
        await channel.send('❌ Could not find the ticket owner.');
        return;
    }

    const stats = await getInviteStats(channel.guild, member.id);
    const total = stats.joins - stats.left - stats.fake;

    const embed = new EmbedBuilder()
        .setTitle('Invite log')
        .setDescription(`🔰 **${member.user.username}** has **${total}** invites`)
        .addFields(
            { name: 'Joins', value: `${stats.joins}`, inline: true },
            { name: 'Left', value: `${stats.left}`, inline: true },
            { name: 'Fake', value: `${stats.fake}`, inline: true },
            { name: 'Rejoins', value: `0`, inline: true },
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(0x2b2d31);

    await channel.send({ embeds: [embed] });
    await new Promise(r => setTimeout(r, 3000));

    if (total < 1) {
        await channel.send(`❌ ${member} you do not meet the invite requirement. This ticket will be closed.`);
        await new Promise(r => setTimeout(r, 5000));
        await channel.delete().catch(() => {});
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

    waitingForOption.add(channel.id);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    const channel = interaction.channel;

    waitingForOption.delete(channel.id);

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

    if (waitingForOption.has(message.channel.id)) {
        await message.channel.send('⚠️ Please choose one of the options below or this ticket will close in **15 seconds**!');
        await new Promise(r => setTimeout(r, 15000));
        if (waitingForOption.has(message.channel.id)) {
            waitingForOption.delete(message.channel.id);
            await message.channel.delete().catch(() => {});
        }
        return;
    }

    if (waitingForRmi.has(message.channel.id)) {
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
    }
});

client.login(TOKEN);
