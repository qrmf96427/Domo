// Copyright (c) 2022 Aiden Garth
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//

const { Client, Intents } = require('discord.js');

const InteractionHandler = require('./handlers/interaction');
const { getConfig, setActivity, Logger } = require('./helpers');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const main = async () => {
  const Config = await getConfig();

  client.on('ready', async () => {
    Logger.Info(
      `Logged into Discord as ${client.user.tag} (${client.user.id})`
    );

    Logger.Debug(
      'Bot Invite Link:',
      client.generateInvite({
        scopes: ['applications.commands', 'bot'],
        permissions: 'ADMINISTRATOR',
      })
    );

    setActivity(client, 'WATCHING', 'for your commands!');

    // We're doing this check, even though it should NEVER happen
    if (Config.discord.clientID !== client.user.id) {
      Logger.Error(
        'bot.js',
        new Error('Stored Client ID and Bot User ID mismatch')
      );

      // This is important enough to exit as we use the config ID
      // rather than the bot ID in most cases
      process.exit(1);
    }
  });

  client.on('interactionCreate', InteractionHandler);

  client.login(Config.discord.token);
};

module.exports = main;
