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

const fs = require('node:fs/promises');
const path = require('node:path');

const { Interaction, MessageEmbed } = require('discord.js');

const {
  Logger,
  checkFileExists,
  getISO8601DateTimeString,
  getConfig,
} = require('../helpers');

/**
 *
 * @param {Interaction<import('discord.js').CacheType>} interaction
 */
const InteractionHandler = async (interaction) => {
  const Config = getConfig();

  if (
    (process.env.NODE_ENVIRONMENT === 'debug' ||
      process.env.NODE_ENVIRONMENT === 'DEBUG') &&
    Config.debug.debugServerID !== interaction.guildId
  )
    return;

  // We only want to handle commands
  if (!interaction.isCommand()) return;

  // Debug message
  Logger.Debug(
    `Command ${interaction.commandName} invoked ` +
      `[${interaction.user.tag} (${interaction.user.id}) ` +
      `in #${interaction.channel.name} (${interaction.channelId}) ` +
      `in ${interaction.guild.name} ` +
      `(${interaction.guild.nameAcronym}) ` +
      `(${interaction.guildId})]`
  );

  // Hand off to specific command handler
  const possibleCommandHandlerLocation = path.join(
    __dirname,
    '..',
    'commands',
    `${interaction.commandName}.js`
  );

  if (!(await checkFileExists(possibleCommandHandlerLocation))) {
    const apologyForBrokenBotEmbed = new MessageEmbed()
      .setAuthor({
        name: 'Developers of Domo Bot',
      })
      .setDescription(
        "It seems that that command hasn't *acutally* been implemented. \n" +
          "We're sorry about any inconvienience caused."
      )
      .setFooter({
        text: `Error Occured: ${getISO8601DateTimeString(
          new Date(),
          'UTC'
        )} UTC`,
      });

    interaction.reply({ ephemeral: true, embeds: [apologyForBrokenBotEmbed] });

    Logger.Error(
      'handlers/interaction.js',
      new Error(
        `Command "${interaction.commandName}" has not been implemented in the correct location`
      )
    );

    return;
  }

  // Bring in the command handler and invoke it
  try {
    const commandHandler = require(possibleCommandHandlerLocation);

    commandHandler(interaction);
  } catch (error) {
    Logger.Error('interaction.js', error);
  }
};

module.exports = InteractionHandler;
