const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');

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
const MONGODB_URI = process.env.MONGODB_URI;
const inviteCache = new Map();
const waitingForOption = new Map();
const waitingForRmi = new Map();
const INVITE_REWARDS_CHANNEL = '1474732359889850411';

let db;

async function connectDB() {
    const mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db('weamp');
    console.log('Connected to MongoDB!');
}

const rewards = {
    '1': { name: 'Mcfa', type: 'minecraft' },
    '2': { name: 'Minecraft Redeem Code', type: 'minecraft' },
    '3': { name: 'Roblox 50$ Giftcard', type: 'website' },
    '4': { name: 'Roblox 100$ Giftcard', type: 'website' },
    '5': { name: 'Nitro Basic Yearly', type: 'website' },
    '6': { name: 'Nitro Boost Yearly', type: 'website' },
};

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

client.once('ready', async () => {
    console.log(`Bot is online as ${client.user.tag}`);
    await connectDB();
    for (const guild of client.guilds.cache.values()) {
        try {
            const invites = await guild.invites.fetch();
            inviteCache.set(guild.id, new Map(invites.map(inv => [inv.code, { uses: inv.uses, inviter: inv.inviter?.id }])));
        } catch (e) {
            console.log(`Could not fetch invites for ${guild.name}`);
        }
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
        return {
            joins: data.joins.length,
            left: data.left.length,
            fake: data.fake.length,
        };
    } catch (e) {
        console.log('Error fetching invite stats:', e.message);
        return { joins: 0, left: 0, fake: 0 };
    }
}

async function getMinecraftAccount() {
    try {
        const account = await db.collection('minecraft_accounts').findOneAndDelete({});
        return account;
    } catch (e) {
        console.log('Error getting minecraft account:', e.message);
        return null;
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
                    const account = await getMinecraftAccount();
                    if (!account) {
                        await message.channel.send('❌ No accounts available right now. Please contact staff!');
                        return;
                    }
                    await message.channel.send(
                        `**${reward.name}**\n` +
                        `||Email = ${account.email}||\n` +
                        `Pass = ${account.pass}\n` +
                        `||${account.email}:${account.pass}||\n\n` +
                        `${message.author} Are we **LEGIT?**\n` +
                        `@Staff Please screenshot and post in proofs. Thanks!`
                    );
                } else {
                    await message.channel.send(
                        `**${reward.name}**\n\n` +
                        `Redeem here: https://yourwebsite.vercel.app\n\n` +
                        `${message.author} Are we **LEGIT?**\n` +
                        `@Staff Please screenshot and post in proofs. Thanks!`
                    );
                }

                await new Promise(r => setTimeout(r, 30000));
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
