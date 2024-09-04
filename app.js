require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ]
});

async function getLyrics(artist, title) {
  try {
    const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    return response.data.lyrics;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
}

const commands = [
  {
    name: 'lyrics',
    description: 'Search for a song and get its lyrics',
    options: [
      {
        name: 'query',
        type: ApplicationCommandOptionType.String,
        description: 'The song or artist to search for',
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

async function searchSongs(query) {
  try {
    const response = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
      }
    });
    return response.data.response.hits.slice(0, 5); // Return top 5 results
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot is in ${client.guilds.cache.size} guilds.`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'lyrics') {
    const query = interaction.options.getString('query');
    const songs = await searchSongs(query);

    if (songs.length === 0) {
      await interaction.reply('No songs found. Try a different search query.');
      return;
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId('song_select')
      .setPlaceholder('Select a song')
      .addOptions(songs.map(song => ({
        label: `${song.result.title} by ${song.result.primary_artist.name}`,
        value: `${song.result.primary_artist.name}|${song.result.title}`
      })));

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({
      content: 'Choose a song from the list:',
      components: [row],
    });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'song_select') {
    const [artist, title] = interaction.values[0].split('|');
    
    await interaction.deferReply();

    try {
      const lyrics = await getLyrics(artist, title);
      if (lyrics) {
        const formattedLyrics = `Lyrics for "${title}" by ${artist}:\n\n\`\`\`\n${lyrics}\n\`\`\``;
        const chunkSize = 1900;
        for (let i = 0; i < formattedLyrics.length; i += chunkSize) {
          const chunk = formattedLyrics.substring(i, i + chunkSize);
          if (i === 0) {
            await interaction.editReply(chunk);
          } else {
            await interaction.followUp(chunk);
          }
        }
      } else {
        await interaction.editReply('Sorry, I couldn\'t find lyrics for that song. Note that sometimes song lyrics aren\'t available due to copyright reasons.');
      }
    } catch (error) {
      console.error('Error in lyrics command:', error);
      await interaction.editReply('An error occurred while fetching the lyrics.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
