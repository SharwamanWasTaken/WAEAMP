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
    const minecraftAccounts = [
    { email: 'fabiane.santosbarbosa@hotmail.com', pass: 'fabiane1' },
    { email: 'cpjaimes@live.com.mx', pass: 'MOYMIAMAYE2014' },
    { email: 'joilce_maninha@hotmail.com', pass: '68j96l00l' },
    { email: 'leonnegro@hotmail.co.uk', pass: 'Dinorah17' },
    { email: 'dawnloard@hotmail.com', pass: 'Daiane15' },
    { email: 'brissa31102000@hotmail.com', pass: 'Londres3' },
    { email: 'strawberryjeans@hotmail.co.uk', pass: 'Holiday98!' },
    { email: 'isabellesilva_estudos@hotmail.com', pass: 'Isabelle1@@' },
    { email: 'billymajig@hotmail.co.uk', pass: 'Cian1104!' },
    { email: 'amdouni.sonia@hotmail.fr', pass: 'sosochic09.' },
    { email: 'patriciaandrade93@hotmail.com', pass: 'pa14180609' },
    { email: 'injesus77@hotmail.com', pass: 'Nobu1219@' },
    { email: 'edentologo@hotmail.com', pass: 'Large151212' },
    { email: 'etrembla@hotmail.com', pass: 'Duckman01' },
    { email: 'r.gelec@live.fr', pass: 'RG14021979@' },
    { email: 'lebo.steffan@hotmail.com', pass: 'ma5asak146' },
    { email: 'ketsuzuki@hotmail.com', pass: 'Endless7' },
    { email: 'shaggi6e@hotmail.com', pass: 'Pablito0508' },
    { email: 'lucas.engrand@live.fr', pass: 'Rose12juin' },
    { email: 'simsimasim@hotmail.com', pass: 'Asma1234@' },
    { email: 'lr_viana@hotmail.com', pass: 'TWUDWnkIFk' },
    { email: 'jofre.araujo@hotmail.com', pass: 'Visam2011' },
    { email: 'pom1963@hotmail.com', pass: 'Harleen28!' },
    { email: 'baboa_11@hotmail.com', pass: 'Clik0828234717!' },
    { email: 'gomibako1209@outlook.com', pass: 'Decjapan01' },
    { email: 'penpuck_b@hotmail.co.th', pass: 'Pb3104643' },
    { email: 'juan201185@hotmail.com.ar', pass: 'Julieta1985' },
    { email: 'fabio_babu0808@hotmail.com', pass: 'Babu0215' },
    { email: 'housevi@hotmail.es', pass: 'Sonic2121' },
    { email: 'marcos.castro1984@hotmail.com', pass: 'Pakito84' },
    { email: 'camilonunes007007@hotmail.com', pass: 'olimac007' },
    { email: 'l_ange_sandy@hotmail.com', pass: 'Lilly2012' },
    { email: 'kce325@hotmail.com', pass: 'kao198170325' },
    { email: 'gavinshepard916@outlook.com', pass: 'Shinyiris1981$$' },
    { email: 'caroldm_@hotmail.com', pass: 'arthur18' },
    { email: 'sloug1989@hotmail.com', pass: 'Xavierroegiers' },
    { email: 'zengjiethebest@hotmail.com', pass: 'zengjie322' },
    { email: 'lu_lmatos@hotmail.com', pass: 'Lu102470' },
    { email: 'paulskyfarley@hotmail.co.uk', pass: 'Jeepm11jma' },
    { email: 'a.bravogarcia@hotmail.es', pass: 'Janito06' },
    { email: 'turkss@hotmail.co.uk', pass: 'Ambero900' },
    { email: 'miguelfuentes02@outlook.com', pass: 'Greenbay12' },
    { email: 'henry1233618@hotmail.com', pass: 'F38d9876!!' },
    { email: 'videopolisphoenix@hotmail.com', pass: '1Drackfell' },
    { email: 'colorclassic@live.jp', pass: 's68942732' },
    { email: 'stevanmil@hotmail.com', pass: 'Stivmil3' },
    { email: 'mr_ninao@hotmail.com', pass: 'Morales10' },
    { email: 'afgalarca@hotmail.com', pass: 'Vfg070513@' },
    { email: 'levirus6666@hotmail.com', pass: 'Pepito66' },
    { email: 'ssjaciara@hotmail.com', pass: 'Marxismo2' },
    { email: 'julietta.lafosse@outlook.fr', pass: 'Florian974' },
    { email: 'mickemands@hotmail.com', pass: 'Moni6600' },
    { email: 'kaitlynne2003@outlook.com', pass: 'Access5797.' },
    { email: 'sukup64@hotmail.com', pass: 'Onur0000' },
    { email: 'dani_gfall@hotmail.com', pass: 'Br1ghton' },
    { email: 'blue_girl182@hotmail.com', pass: 'Mayte182' },
    { email: 'winnie_the_pooh7971@hotmail.com', pass: 'Vicky891122@' },
    { email: 'ce_mirandaz@hotmail.com', pass: 'Superciego1' },
    { email: 'camie516@hotmail.com', pass: 'Rugrat22' },
    { email: 'cinthia_leon1993@hotmail.com', pass: 'carolina1993' },
    { email: 'lauchasanta@hotmail.com', pass: 'Lautii95' },
    { email: 'saaanty.cs@hotmail.com', pass: 'Asd123456789' },
    { email: 'bat.hug@hotmail.fr', pass: 'Fuschia78' },
    { email: 'roberto_mendex39@hotmail.com', pass: '69xunning' },

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
            .toJSON(),
        new SlashCommandBuilder()
            .setName('rmi')
            .setDescription('Reset invite count for yourself or a user')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to reset invites for (optional)')
                    .setRequired(false))
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

async function resetUserInvites(guild, userId) {
    try {
        // Clear our bot's tracking data
        if (client.inviteData && client.inviteData.has(userId)) {
            client.inviteData.delete(userId);
        }
        // Delete all actual Discord invites for this user
        const guildInvites = await guild.invites.fetch();
        const userInvites = guildInvites.filter(inv => inv.inviter?.id === userId);
        for (const invite of userInvites.values()) {
            await invite.delete().catch(() => {});
        }
        // Update invite cache to reflect 0 uses
        const newInvites = await guild.invites.fetch();
        inviteCache.set(guild.id, new Map(newInvites.map(inv => [inv.code, { uses: inv.uses, inviter: inv.inviter?.id }])));
        console.log(`Reset invites for user ${userId}`);
    } catch (e) {
        console.log('Error resetting invites:', e.message);
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
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'delall') {
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

        if (interaction.commandName === 'rmi') {
            const target = interaction.options.getUser('user') || interaction.user;
            await resetUserInvites(interaction.guild, target.id);
            await interaction.reply({ content: `✅ Invites fully reset for **${target.username}**! They are now at 0.`, ephemeral: true });
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
            await message.channel.send(`${message.author} Please type \`!rmi\` to receive your **${reward.name}**!`);
            return;
        }
        if (waitingForRmi.has(message.channel.id)) {
            if (message.content.trim().toLowerCase() === '!rmi') {
                const reward = waitingForRmi.get(message.channel.id);
                waitingForRmi.delete(message.channel.id);

                // Reset invites immediately
                await resetUserInvites(message.guild, message.author.id);

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
                        `Redeem here: https://index-html-six-gold.vercel.app\n\n` +
                        `<@${WEAMP_ID}> <@&${STAFF_ROLE_ID}> Are we **LEGIT?**\n` +
                        `Please screenshot and post in proofs. Thanks!`
                    );
                }
                await new Promise(r => setTimeout(r, 300000));
                await message.channel.delete().catch(() => {});
            } else {
                await message.channel.send(`⚠️ Please type \`!rmi\` or this ticket will close in **15 seconds**!`);
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
