# Lyrics Finder Discord Bot

Lyrics Finder is a Discord bot that helps users discover and share song lyrics directly in their Discord server.

## Features

- Search for songs using artist names, song titles, or lyrics
- Choose from a list of search results
- View full, formatted lyrics within Discord
- Easy to use with a simple slash command: `/lyrics`

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GENIUS_ACCESS_TOKEN=your_genius_access_token_here
   ```
4. Run the bot:
   ```
   npm start
   ```

## Usage

Once the bot is running and added to your server, use the `/lyrics` command followed by a song or artist name to search for lyrics.

## Dependencies

- discord.js
- axios
- dotenv

## Contributing

Contributions, issues, and feature requests are welcome!

## License

This project is licensed under the MIT License.

## Note

Lyrics are provided for personal use only. Please respect copyright laws and support the artists.