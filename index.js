const { defaultLogger, bugLogger } = require('./logger');
const utils = require('./utils');
const fs = require('fs');
const config = require('./config');
const path = require('path');
const pLimit = require('p-limit');

module.exports = {
    scan: scanAction
}

async function scanAction(sourceTarget, options) {
    if (options.verbose) { defaultLogger.setLevel('verbose') }
    if (options.enableFileLogging) { defaultLogger.enableFileTransport() }
    if (options.discordWebhook) { bugLogger.enableDiscordTransport(options.discordWebhook) }
    options.enableFileLogging = undefined
    options.discordWebhook = undefined
    if (options.useDocker) {
        await utils.isCommandExist('docker', defaultLogger);
        defaultLogger.error('Docker is not supported yet.');
        return;
    }
    await utils.isCommandExist('codeql', defaultLogger);
    if (fs.existsSync(sourceTarget) && fs.statSync(sourceTarget).isFile()) {
        const targets = fs.readFileSync(sourceTarget, 'utf8').split(/\r?\n/);
        const limit = pLimit(1);
        return await Promise.all(targets.map((target) => limit(() => scanAction(target, options))));
    }
    var isRemoteRepository = utils.isRemoteRepository(sourceTarget);
    var sourceFolderPath = '';
    if (isRemoteRepository) {
        defaultLogger.info(`Cloning remote repository ${sourceTarget}`)
        sourceFolderPath = await utils.cloneRemoteRepository(sourceTarget, defaultLogger);
    } else sourceFolderPath = sourceTarget;
    if (!fs.existsSync(sourceFolderPath)) {
        defaultLogger.error(`Source folder \`${sourceFolderPath}\` does not exist.`);
        return [];
    }
    sourceFolderPath = fs.realpathSync(sourceFolderPath);
    defaultLogger.info(`Creating CodeQL database for ${sourceFolderPath}...`)

    // Create Database
    var createDbOptions = { ...options };
    createDbOptions.output = options.dbOutput;
    var { args: createDbArgs, databasePath } = await utils.setupCreateDatabaseCommandArgs(sourceFolderPath, createDbOptions, defaultLogger);
    defaultLogger.verbose(`Options:`);
    for (const key in options) {
        const element = options[key];
        defaultLogger.verbose(`[+] ${key}: ${element}`);
    }
    createDbExitCode = await utils.executeCommand('codeql', createDbArgs, 'Create CodeQL database', defaultLogger);
    if (options.createDbOnly) {
        return databasePath;
    }

    // Scan Database
    const outputFolderPath = options.output ? options.output : path.resolve(`${databasePath.endsWith('-codeql-database') ? databasePath.slice(0, -16) : databasePath}-codeql-results`);
    if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath);
    }
    const languages = await utils.getDatabaseLanguages(databasePath, defaultLogger);
    for (const language of languages) {
        options.language = language;
        languageDatabasePath = path.resolve(`${databasePath}${path.sep}${language}`);
        const scanOption = { ...options };
        scanOption.output = path.resolve(outputFolderPath, `${language}-codeql-result.sarif`)
        defaultLogger.info(`Scanning ${language} code in ${databasePath}...`)
        var { args: scanArgs } = await utils.setupScanCommandArgs(languageDatabasePath, scanOption, defaultLogger);
        await utils.executeCommand('codeql', scanArgs, 'Scan CodeQL database', defaultLogger);
    }
    defaultLogger.info(`CodeQL scan results saved at ${outputFolderPath}.`)
    const resultFiles = fs.readdirSync(outputFolderPath);
    var alerts = [];
    for (const resultFile of resultFiles) {
        alerts = alerts.concat(await utils.parseSarif(path.resolve(outputFolderPath, resultFile), defaultLogger));
    }
    for (const alert of alerts) {
        defaultLogger.log({
            level: utils.castBugLevelToLogLevel(alert.level),
            message: `[${alert.id}][${alert.level}][precision:${alert.precision}][severity:${alert.severity}][${alert.location}] ${alert.title}`
        });
        bugLogger.log({
            level: utils.castBugLevelToLogLevel(alert.level),
            message: path.basename(sourceFolderPath),
            meta: alert
        });
    }
    if (isRemoteRepository && options.removeRemoteRepository) {
        defaultLogger.verbose(`Removing remote repository ${sourceFolderPath}`)
        utils.removeFolder(sourceFolderPath, defaultLogger);
    }
    if (options.removeDatabase) {
        defaultLogger.verbose(`Removing database folder ${databasePath}`)
        utils.removeFolder(databasePath, defaultLogger);
    }
    return alerts;
}

