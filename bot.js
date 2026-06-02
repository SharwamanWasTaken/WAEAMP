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
const waitingForOption = new Map(); // channelId -> userId
const waitingForRmi = new Map(); // userId -> reward

const INVITE_REWARDS_CHANNEL = '1474732359889850411';

// rewards
const rewards = {
'1': { name: 'Mcfa', type: 'minecraft' },
'2': { name: 'Minecraft Redeem Code', type: 'minecraft' },
'3': { name: 'Roblox 50$ Giftcard', type: 'website' },
'4': { name: 'Roblox 100$ Giftcard', type: 'website' },
'5': { name: 'Nitro Basic Yearly', type: 'website' },
'6': { name: 'Nitro Boost Yearly', type: 'website' },
};

// sample accounts
const minecraftAccounts = [
{ email: '[test1@gmail.com](mailto:test1@gmail.com)', pass: 'pass1' },
{ email: '[test2@gmail.com](mailto:test2@gmail.com)', pass: 'pass2' },
];

client.once('ready', async () => {
console.log(`Logged in as ${client.user.tag}`);

```
for (const guild of client.guilds.cache.values()) {
    const invites = await guild.invites.fetch().catch(() => null);
    if (!invites) continue;

    inviteCache.set(guild.id,
        new Map(invites.map(inv => [inv.code, { uses: inv.uses, inviter: inv.inviter?.id }]))
    );
}

const commands = [
    new SlashCommandBuilder().setName('rmi').setDescription('Claim reward & reset invites'),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

console.log('Commands registered');
```

});

// invite tracking
client.on(Events.GuildMemberAdd, async (member) => {
const guild = member.guild;

```
const newInvites = await guild.invites.fetch();
const oldInvites = inviteCache.get(guild.id);

const used = newInvites.find(i => {
    const old = oldInvites.get(i.code);
    return old && i.uses > old.uses;
});

inviteCache.set(guild.id,
    new Map(newInvites.map(inv => [inv.code, { uses: inv.uses, inviter: inv.inviter?.id }]))
);

if (!used) return;

const inviter = used.inviter?.id;
if (!inviter) return;

if (!client.inviteData) client.inviteData = new Map();

if (!client.inviteData.has(inviter)) {
    client.inviteData.set(inviter, { joins: [], left: [], fake: [] });
}

const data = client.inviteData.get(inviter);

const age = (Date.now() - member.user.createdTimestamp) / 86400000;

if (age < 7) data.fake.push(member.id);
else data.joins.push(member.id);
```

});

// stats
function getStats(userId) {
if (!client.inviteData || !client.inviteData.has(userId)) {
return { joins: 0, left: 0, fake: 0 };
}
const d = client.inviteData.get(userId);
return { joins: d.joins.length, left: d.left.length, fake: d.fake.length };
}

// ticket create
client.on(Events.ChannelCreate, async (channel) => {
if (!channel.name.startsWith('ticket-')) return;

```
await new Promise(r => setTimeout(r, 2000));

const member = channel.guild.members.cache.find(m =>
    channel.permissionOverwrites.cache.has(m.id) && !m.user.bot
);

if (!member) return;

const stats = getStats(member.id);
const total = stats.joins - stats.left - stats.fake;

await channel.send(
    `${member} You have **${total} invites**.\n\n` +
    `Reply with a number (1-6) to choose reward.`
);

waitingForOption.set(channel.id, member.id);
```

});

// message handler
client.on(Events.MessageCreate, async (msg) => {
if (msg.author.bot) return;

```
// reward selection
if (waitingForOption.has(msg.channel.id)) {
    const reward = rewards[msg.content.trim()];
    if (!reward) return;

    waitingForOption.delete(msg.channel.id);
    waitingForRmi.set(msg.author.id, reward);

    await msg.channel.send(`Use **/rmi** to receive your reward.`);
}
```

});

// slash command
client.on(Events.InteractionCreate, async (interaction) => {
if (!interaction.isChatInputCommand()) return;

```
if (interaction.commandName === 'rmi') {
    const userId = interaction.user.id;

    if (!waitingForRmi.has(userId)) {
        return interaction.reply({ content: 'No pending reward.', ephemeral: true });
    }

    const reward = waitingForRmi.get(userId);
    waitingForRmi.delete(userId);

    // reset invites
    if (client.inviteData?.has(userId)) {
        client.inviteData.set(userId, { joins: [], left: [], fake: [] });
    }

    // give reward
    if (reward.type === 'minecraft') {
        if (minecraftAccounts.length === 0) {
            return interaction.reply('No accounts left.');
        }

        const acc = minecraftAccounts.shift();

        return interaction.reply(
            `**${reward.name}**\n||Email: ${acc.email}||\n||Pass: ${acc.pass}||`
        );
    } else {
        return interaction.reply(
            `**${reward.name}**\nRedeem: https://index-html-six-gold.vercel.app`
        );
    }
}
```

});

client.login(TOKEN);
