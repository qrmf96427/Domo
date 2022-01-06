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

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const { getConfig, Logger } = require('./helpers');

const main = async () => {
  const Config = await getConfig();

  const rest = new REST({ version: '9' }).setToken(Config.discord.token);

  try {
    Logger.Info('Started refreshing application (slash) commands');

    await rest.put(
      Routes.applicationGuildCommands(
        Config.discord.clientID,
        Config.debug.debugServerID
      ),
      {
        body: Config.discord.slashCommands,
      }
    );

    Logger.Info('Successfully refreshed application (slash) commands');
  } catch (error) {
    Logger.Error('registerSlashCommands.js', error);
  }
};

module.exports = main;
