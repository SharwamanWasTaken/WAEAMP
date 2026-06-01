const { Client, GatewayIntentBits, Events, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');

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
const waitingForOption = new Map();
const waitingForRmi = new Map();
const INVITE_REWARDS_CHANNEL = '1474732359889850411';
const WEAMP_ID = '1099693883912355860';
const STAFF_ROLE_ID = '1439186426691457066';

const rewards = {
    '1': { name: 'Mcfa', type: 'minecraft' },
    '2': { name: 'Minecraft Redeem Code', type: 'minecraft' },
    '3': { name: 'Roblox 50$ Giftcard', type: 'website' },
    '4': { name: 'Roblox 100$ Giftcard', type: 'website' },
    '5': { name: 'Nitro Basic Yearly', type: 'website' },
    '6': { name: 'Nitro Boost Yearly', type: 'website' },
};

const minecraftAccounts = [
     { email: 'gustavogtm@hotmail.com', pass: '99886578Gtm' },
    { email: 'pauloflima10@hotmail.com', pass: 'Ph147852' },
    { email: 'rileyjean728@hotmail.com', pass: '@Cupcake728' },
    { email: 'nongnnine2546@hotmail.com', pass: '@Ninerock140802' },
    { email: 'gabrielyuki04@hotmail.com', pass: '@Takahara0405' },
    { email: 'little_mushiii@hotmail.com', pass: 'arihb12345' },
    { email: 'cris26_leo@hotmail.com', pass: 'Camila29' },
    { email: 'ajfoster3469@outlook.com', pass: 'Conoldro9' },
    { email: 'lyndonalms@outlook.com', pass: 'Batman1972' },
    { email: 'brandichambers79@outlook.com', pass: 'Aaron$83' },
    { email: 'silviadvfernandez@hotmail.com', pass: 'Panchonenamika3' },
    { email: 'account12@gmail.com', pass: 'password12' },
    { email: 'account13@gmail.com', pass: 'password13' },
    { email: 'account14@gmail.com', pass: 'password14' },
    { email: 'account15@gmail.com', pass: 'password15' },
    { email: 'account16@gmail.com', pass: 'password16' },
    { email: 'account17@gmail.com', pass: 'password17' },
    { email: 'account18@gmail.com', pass: 'password18' },
    { email: 'account19@gmail.com', pass: 'password19' },
    { email: 'account20@gmail.com', pass: 'password20' },
    { email: 'account21@gmail.com', pass: 'password21' },
    { email: 'account22@gmail.com', pass: 'password22' },
    { email: 'account23@gmail.com', pass: 'password23' },
    { email: 'account24@gmail.com', pass: 'password24' },
    { email: 'account25@gmail.com', pass: 'password25' },
    { email: 'account26@gmail.com', pass: 'password26' },
    { email: 'account27@gmail.com', pass: 'password27' },
    { email: 'account28@gmail.com', pass: 'password28' },
    { email: 'account29@gmail.com', pass: 'password29' },
    { email: 'account30@gmail.com', pass: 'password30' },
    { email: 'account31@gmail.com', pass: 'password31' },
    { email: 'account32@gmail.com', pass: 'password32' },
    { email: 'account33@gmail.com', pass: 'password33' },
    { email: 'account34@gmail.com', pass: 'password34' },
    { email: 'account35@gmail.com', pass: 'password35' },
    { email: 'account36@gmail.com', pass: 'password36' },
    { email: 'account37@gmail.com', pass: 'password37' },
    { email: 'account38@gmail.com', pass: 'password38' },
    { email: 'account39@gmail.com', pass: 'password39' },
    { email: 'account40@gmail.com', pass: 'password40' },
    { email: 'account41@gmail.com', pass: 'password41' },
    { email: 'account42@gmail.com', pass: 'password42' },
    { email: 'account43@gmail.com', pass: 'password43' },
    { email: 'account44@gmail.com', pass: 'password44' },
    { email: 'account45@gmail.com', pass: 'password45' },
    { email: 'account46@gmail.com', pass: 'password46' },
    { email: 'account47@gmail.com', pass: 'password47' },
    { email: 'account48@gmail.com', pass: 'password48' },
    { email: 'account49@gmail.com', pass: 'password49' },
    { email: 'account50@gmail.com', pass: 'password50' },
    { email: 'account51@gmail.com', pass: 'password51' },
    { email: 'account52@gmail.com', pass: 'password52' },
    { email: 'account53@gmail.com', pass: 'password53' },
    { email: 'account54@gmail.com', pass: 'password54' },
    { email: 'account55@gmail.com', pass: 'password55' },
    { email: 'account56@gmail.com', pass: 'password56' },
    { email: 'account57@gmail.com', pass: 'password57' },
    { email: 'account58@gmail.com', pass: 'password58' },
    { email: 'account59@gmail.com', pass: 'password59' },
    { email: 'account60@gmail.com', pass: 'password60' },
];

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

client.once('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);
    for (const guild of client.guilds.cache.values()) {
        try {
            const invites = await guild.invites.fetch();
            inviteCache.set(guild.id, new Map(invites.map(inv => [inv.code, { uses: inv.uses, inviter: inv.inviter?.id }])));
        } catch (e) {
            console.log(`Could not fetch invites for ${guild.name}`);
        }
    }
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    const commands = [
        new SlashCommandBuilder()
            .setName('delall')
            .setDescription('Delete all ticket channels')
            .toJSON()
    ];
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Slash commands registered!');
    } catch (e) {
        console.log('Error registering commands:', e.message);
    }
});

client.on(Events.GuildMemberAdd, async (member) => {
    try {
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
    } catch (e) {
        console.log('Error in GuildMemberAdd:', e.message);
    }
});

client.on(Events.GuildMemberRemove, async (member) => {
    try {
        if (!client.inviteData) return;
        for (const [inviterId, data] of client.inviteData.entries()) {
            if (data.joins.includes(member.id)) {
                data.joins = data.joins.filter(id => id !== member.id);
                data.left.push(member.id);
            }
        }
    } catch (e) {
        console.log('Error in GuildMemberRemove:', e.message);
    }
});

async function getInviteStats(guild, userId) {
    try {
        if (!client.inviteData || !client.inviteData.has(userId)) {
            const invites = await guild.invites.fetch();
            const userInvites = invites.filter(inv => inv.inviter?.id === userId);
            const total = userInvites.reduce((acc, inv) => acc + inv.uses, 0);
            return { joins: total, left: 0, fake: 0 };
        }
        const data = client.inviteData.get(userId);
        return { joins: data.joins.length, left: data.left.length, fake: data.fake.length };
    } catch (e) {
        return { joins: 0, left: 0, fake: 0 };
    }
}

client.on(Events.ChannelCreate, async (channel) => {
    try {
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
                { name: 'Rejoins', value: `0 (7d)`, inline: true },
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(0x2b2d31);
        await channel.send({ embeds: [embed] });
        await new Promise(r => setTimeout(r, 2000));
        if (total < 1) {
            await channel.send(
                `${member} You have **0 invite(s)** right now. Check <#${INVITE_REWARDS_CHANNEL}> for the rewards.\n\n` +
                `Left: People who joined from your invite but left the server\n` +
                `Fake: Any account considered an ALT or new account\n` +
                `Rejoin: Members who left and rejoined with your link`
            );
            await new Promise(r => setTimeout(r, 10000));
            await channel.delete().catch(() => {});
            return;
        }
        await channel.send(
            `${member} You have **${total} invite(s)** right now. Here are your options:\n\n` +
            `1) Mcfa *(1 invite)*\n` +
            `2) Minecraft Redeem Code *(1 invite)*\n` +
            `3) Roblox 50$ Giftcard *(1 invite)*\n` +
            `4) Roblox 100$ Giftcard *(1 invite)*\n` +
            `5) Nitro Basic Yearly *(1 invite)*\n` +
            `6) Nitro Boost Yearly *(1 invite)*\n\n` +
            `Left: People who joined from your invite but left the server\n` +
            `Fake: Any account considered an ALT or new account\n` +
            `Rejoin: Members who left and rejoined with your link\n\n` +
            `**Reply with the number (1-6) or just type the reward name.**`
        );
        waitingForOption.set(channel.id, member.id);
    } catch (e) {
        console.log('Error in ChannelCreate:', e.message);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isChatInputCommand() && interaction.commandName === 'delall') {
            await interaction.reply({ content: '🗑️ Deleting all ticket channels...', ephemeral: true });
            const channels = interaction.guild.channels.cache.filter(c => c.name.startsWith('ticket-'));
            let count = 0;
            for (const channel of channels.values()) {
                await channel.delete().catch(() => {});
                count++;
            }
            await interaction.editReply({ content: `✅ Deleted **${count}** ticket channels!` });
            return;
        }
    } catch (e) {
        console.log('Error in InteractionCreate:', e.message);
    }
});

client.on(Events.MessageCreate, async (message) => {
    try {
        if (message.author.bot) return;
        if (waitingForOption.has(message.channel.id)) {
            const choice = message.content.trim();
            const reward = rewards[choice];
            if (!reward) {
                await message.channel.send(`⚠️ Please reply with a number between **1-6** or this ticket will close in **15 seconds**!`);
                await new Promise(r => setTimeout(r, 15000));
                if (waitingForOption.has(message.channel.id)) {
                    waitingForOption.delete(message.channel.id);
                    await message.channel.delete().catch(() => {});
                }
                return;
            }
            waitingForOption.delete(message.channel.id);
            waitingForRmi.set(message.channel.id, reward);
            await message.channel.send(`${message.author} Please type \`-rmi\` to receive your **${reward.name}**!`);
            return;
        }
        if (waitingForRmi.has(message.channel.id)) {
            if (message.content.trim().toLowerCase() === '-rmi') {
                const reward = waitingForRmi.get(message.channel.id);
                waitingForRmi.delete(message.channel.id);
                if (reward.type === 'minecraft') {
                    if (minecraftAccounts.length === 0) {
                        await message.channel.send('❌ No accounts available right now. Please contact staff!');
                        return;
                    }
                    const account = minecraftAccounts.shift();
                    await message.channel.send(
                        `**${reward.name}**\n` +
                        `||Email = ${account.email}||\n` +
                        `||Pass = ${account.pass}||\n\n` +
                        `<@${WEAMP_ID}> <@&${STAFF_ROLE_ID}> Are we **LEGIT?**\n` +
                        `Please screenshot and post in proofs. Thanks!`
                    );
                } else {
                    await message.channel.send(
                        `**${reward.name}**\n\n` +
                        `Redeem here: https://yourwebsite.vercel.app\n\n` +
                        `<@${WEAMP_ID}> <@&${STAFF_ROLE_ID}> Are we **LEGIT?**\n` +
                        `Please screenshot and post in proofs. Thanks!`
                    );
                }
                await new Promise(r => setTimeout(r, 300000));
                await message.channel.delete().catch(() => {});
            } else {
                await message.channel.send(`⚠️ Please type \`-rmi\` or this ticket will close in **15 seconds**!`);
                await new Promise(r => setTimeout(r, 15000));
                if (waitingForRmi.has(message.channel.id)) {
                    waitingForRmi.delete(message.channel.id);
                    await message.channel.delete().catch(() => {});
                }
            }
        }
    } catch (e) {
        console.log('Error in MessageCreate:', e.message);
    }
});

client.login(TOKEN);
