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

const { Interaction } = require('discord.js');

const { getConfig, Logger } = require('../helpers');

/**
 * @param {Interaction<import('discord.js').CacheType>} interaction
 */
const BotInfoCommandHandler = async (interaction) => {
  const Config = await getConfig();

  if (!interaction.isCommand()) return; // Make sure the Command Interaction stuff autocompletes
  if (interaction.commandName !== 'botinfo') return; // Should NEVER happen

  Logger.Debug('BotInfo Command Invoked');

  const botAuthors = ['<broken>'];

  Config.runtime.ownerIDs.forEach((ownerID) => {
    botAuthors.push(`<@${ownerID}> (\`${ownerID}\`)`);
  });

  interaction.reply({ content: botAuthors.toString() });
};

module.exports = BotInfoCommandHandler;
