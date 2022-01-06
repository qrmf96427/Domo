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

const chalk = require('chalk');
const { Client } = require('discord.js');

// Constants
const ConfigPath = path.join(__dirname, '..', '_config.json');

// Functions
const checkFileExists = async (absolouteFilePath) => {
  let workingPath = null;

  if (!path.isAbsolute(absolouteFilePath)) {
    workingPath = path.normalize(path.join(__dirname, absolouteFilePath));

    new Logging('UTC').Warn(
      `Path is not absoloute. Resolving "${absolouteFilePath} to "${workingPath}"`
    );
  } else workingPath = absolouteFilePath;

  new Logging('UTC').Debug(`Checking if "${workingPath}" exists..`);

  try {
    await fs.stat(workingPath);

    return true;
  } catch (error) {
    new Logging('UTC').Error('helpers.js (not original call)', error);

    return false;
  }
};

/**
 * Get the config for the project
 * @param {undefined | string} configPath The path to the JSON config file
 * @returns Config
 */
const getConfig = async (configPath) => {
  const _configPath = configPath || ConfigPath;

  const fileHandle = await fs.open(_configPath, 'r');

  const configFileContents = await fileHandle.readFile({ encoding: 'utf-8' });

  const config = JSON.parse(configFileContents);

  fileHandle.close();

  return config;
};

/***
 * Create a date string based on the {@link https://iso.org/iso-8601-date-and-time-format.html ISO 8601 Standard} (YYYY-MM-DD HH:MM:SS)
 * @param {Date} dateObj the date to be converted
 * @param {'UTC' | 'local'} tz timezone for the date to be converted in
 */
const getISO8601DateTimeString = (dateObj = new Date(), tz) => {
  function padNumber(length, number) {
    const strRep = String(number);
    let ret = null;

    if (strRep.length < length) ret = strRep.padStart(length, '0');
    else ret = strRep;

    return ret;
  }

  switch (tz) {
    case 'UTC':
      /// Date Section
      const utcFullYear = dateObj.getUTCFullYear();
      const utcMonth = dateObj.getUTCMonth() + 1; // NOTE: Jan -> 0; Dec -> 11
      const utcDate = dateObj.getUTCDate();
      /// Time
      const utcHours = dateObj.getUTCHours();
      const utcMinutes = dateObj.getUTCMinutes();
      const utcSeconds = dateObj.getUTCSeconds();
      const utcMilliseconds = dateObj.getUTCMilliseconds();

      return (
        `${utcFullYear}-${padNumber(2, utcMonth)}-${padNumber(2, utcDate)} ` +
        `${padNumber(2, utcHours)}:${padNumber(2, utcMinutes)}:` +
        `${padNumber(2, utcSeconds)}.${padNumber(3, utcMilliseconds)}`
      );

    case 'local':
      /// Date Section
      const localFullYear = dateObj.getFullYear();
      const localMonth = dateObj.getMonth() + 1; // NOTE: Jan -> 0; Dec -> 11
      const localDate = dateObj.getDate();
      /// Time
      const localHours = dateObj.getHours();
      const localMinutes = dateObj.getMinutes();
      const localSeconds = dateObj.getSeconds();
      const localMilliseconds = dateObj.getMilliseconds();

      return (
        `${localFullYear}-${padNumber(2, localMonth)}-` +
        `${padNumber(2, localDate)} ${padNumber(2, localHours)}:` +
        `${padNumber(2, localMinutes)}:${padNumber(2, localSeconds)}.` +
        padNumber(2, localMilliseconds)
      );

    default:
      throw new Error(
        `Unknown timezone field. Expected "UTC" or "local", but instead got ${tz}`
      );
  }
};

/**
 * @param {Client} client
 * @param {'COMPETING' | 'LISTENING' | 'PLAYING' | 'STREAMING' | 'WATCHING'} action
 * @param {string} activity
 * @param {string} url
 */
const setActivity = (client, action, activity, url) => {
  if (
    process.env.NODE_ENVIRONMENT === 'debug' ||
    process.env.NODE_ENVIRONMENT === 'DEBUG'
  ) {
    client.user.setActivity({ type: 'WATCHING', name: 'myself be developed' });
    new Logging('UTC').Debug(
      'Set status to "Watching myself be developed" (DEBUG ENVIRONMENT DEFAULT)'
    );
  } else {
    client.user.setActivity({
      type: action,
      name: activity,
      url,
    });
    new Logging('UTC').Debug(`Set status to "${action} ${activity}"`);
  }
};

// Classes
class Logging {
  /**
   * @param {'UTC' | 'local'} loggingTimeZone Timezone used in logs
   */
  constructor(loggingTimeZone) {
    this.tz = loggingTimeZone;
  }

  Announce(...message) {
    const loggingType = chalk.bold.magentaBright(`[ANNOUNCEMENT]`);
    const dateString = chalk.gray(
      `[${getISO8601DateTimeString(new Date(), this.tz)}]`
    );
    const msg = chalk.underline(message.join(' '));

    console.log(loggingType, dateString, msg);
  }

  Debug(...message) {
    // If we're not in a debug environment, don't print the debug logs
    if (
      process.env.NODE_ENVIRONMENT !== 'debug' &&
      process.env.NODE_ENVIRONMENT !== 'DEBUG'
    )
      return;

    const loggingType = chalk.bold.yellow(`[DEBUG]`);
    const dateString = chalk.gray(
      `[${getISO8601DateTimeString(new Date(), this.tz)}]`
    );

    console.log(loggingType, dateString, ...message);
  }

  /**
   * @param {string} file Filename so the error can be identified
   * @param {Error} error
   */
  Error(file, error) {
    const loggingType = chalk.bold.red(`[ERROR]`);
    const dateString = chalk.gray(
      `[${getISO8601DateTimeString(new Date(), this.tz)}]`
    );
    const filename = chalk.underline(file);
    const errorType = chalk.red(error.name);
    const errorMessage = chalk.italic(error.message);
    const errorStack = error.stack
      ? chalk.dim.italic(
          `\n${error.stack.replace(`${error.name}: ${error.message}\n`, '')}`
        )
      : '';

    console.error(
      loggingType,
      dateString,
      filename,
      errorType,
      errorMessage,
      errorStack
    );
  }

  Info(...message) {
    const loggingType = chalk.bold.blue(`[INFO]`);
    const dateString = chalk.gray(
      `[${getISO8601DateTimeString(new Date(), this.tz)}]`
    );

    console.log(loggingType, dateString, ...message);
  }

  Warn(...message) {
    const loggingType = chalk.bold.red(`[WARNING]`);
    const dateString = chalk.gray(
      `[${getISO8601DateTimeString(new Date(), this.tz)}]`
    );

    console.error(loggingType, dateString, ...message);
  }
}

/// Exports
module.exports = {
  /// Constants
  Logger: new Logging('UTC'),

  /// Functions
  checkFileExists,
  getConfig,
  getISO8601DateTimeString,
  setActivity,

  /// Classes
  Logging,
};
