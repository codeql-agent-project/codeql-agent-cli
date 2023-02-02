const logger = require('./logger');
const utils = require('./utils');
const fs = require('fs');
const config = require('./config');
const path = require('path');

module.exports = {
    scan
}

async function scanAction(sourceTarget, options) {
    if (options.verbose) { logger.setLevel('verbose') }
    if (options.userDocker) {
        await utils.isCommandExist('docker', logger);
        return;
    }
    await utils.isCommandExist('codeql', logger);
    // Create Database
    var createDbOptions = { ...options };
    createDbOptions.output = options.dbOutput;
    var isRemoteRepository = utils.isRemoteRepository(sourceTarget);
    if (isRemoteRepository) {
        logger.info(`Cloning remote repository ${sourceTarget}`)
        sourceFolderPath = await utils.cloneRemoteRepository(sourceTarget, logger);
    } else sourceFolderPath = sourceTarget;
    sourceFolderPath = fs.realpathSync(sourceFolderPath);
    logger.info(`Creating CodeQL database for ${sourceFolderPath}...`)
    var { args: createDbArgs, databasePath } = await utils.setupCreateDatabaseCommandArgs(sourceFolderPath, createDbOptions, logger);
    logger.verbose(`Options:`);
    for (const key in options) {
        const element = options[key];
        logger.verbose(`[+] ${key}: ${element}`);
    }
    createDbExitCode = await utils.executeCommand('codeql', createDbArgs, 'Create CodeQL database', logger);
    logger.info(`CodeQL database created at ${databasePath}.`)
    if (isRemoteRepository && options.removeRemoteRepository) {
        logger.info(`Removing remote repository ${sourceFolderPath}`)
        await utils.removeFolder(sourceFolderPath, logger);
    }
    if (options.createDbOnly) {
        return databasePath;
    }
    // Scan Database
    const outputFolderPath = options.output ? options.output : path.resolve(`${databasePath.endsWith('-codeql-database') ? databasePath.slice(0, -16) : databasePath}-codeql-results`);
    if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath);
    }
    const languages = await utils.getDatabaseLanguages(databasePath, logger);
    for (const language of languages) {
        options.language = language;
        languageDatabasePath = path.resolve(`${databasePath}${path.sep}${language}`);
        options.output = path.resolve(outputFolderPath, `${language}-codeql-result.sarif`)
        logger.info(`Scanning ${language} code in ${databasePath}...`)
        var { args: scanArgs } = await utils.setupScanCommandArgs(languageDatabasePath, options, logger);
        await utils.executeCommand('codeql', scanArgs, 'Scan CodeQL database', logger);
    }
    logger.info(`CodeQL scan results saved at ${outputFolderPath}.`)
    if (options.removeDatabase) {
        logger.info(`Removing database folder ${databasePath}`)
        await utils.removeFolder(databasePath, logger);
    }
    return outputFolderPath;
}


