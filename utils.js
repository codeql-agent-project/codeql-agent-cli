const CONFIG = require('./config.json');

module.exports = {
    isCommandExist, isFolderExist, isSupportedLanguage, createIfNotExist, executeCommand, setupCreateDatabaseCommandArgs, getSourceLanguages, createCodeQLDatabase, normolizeString, isRemoteRepository, cloneRemoteRepository, removeFolder, setupScanCommandArgs, getDatabaseLanguages, parseSarif
}

/**
 * @description Check if a command exist in the PATH
 * @param {string} command - The command to check
 * @param {Object} logger - A logger instance
 * @returns {boolean} true if command exist, throw error if command does not exist
 */
async function isCommandExist(command, logger) {
    const which = require('which');
    try {
        which.sync(command);
        return true;
    }
    catch (e) {
        logger?.error(`Command \`${command}\` not found. Please install it and try again.`)
        process.exit(1);
    }
}

/**
 * @desc Checks if folder exist in the local file system
 * @param {string} folder - Folder path
 * @param {object} logger - A logger instance
 * @return throw error if folder does not exist
 */
async function isFolderExist(folder, logger) {
    const fs = require('fs');
    if (!fs.existsSync(folder) || !fs.lstatSync(folder).isDirectory()) {
        logger.error(`Folder ${folder} is not a directory. Please provide a valid directory path and try again.`);
        process.exit(1);
    }
}

/**
 * @desc Checks if language is in supported languages
 * @param {string[]} supportedLanguages - Supported languages
 * @param {string} language - Language to check
 * @param {object} logger - A logger instance
 * @return - throw error if language is not supported
*/
async function isSupportedLanguage(supportedLanguages, language, logger) {
    if (!supportedLanguages.includes(language)) {
        logger.error(`Language ${language} is not supported. Please provide a valid language and try again. Supported languages are: ${supportedLanguages.join(', ').trim()}.`);
        process.exit(1);
    }
}

/**
 * @desc create a folder if it does not exist
 * @param {string} folder - Folder path
 * @param {object} logger - A logger instance
 * @return - throw error if folder does not exist
*/
async function createIfNotExist(folder, logger) {
    const fs = require('fs');
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
}

/**
 * @desc execute a command
 * @param {string} commandPath - Command path
 * @param {string[]} commandArgs - Command arguments
 * @param {string} description - Command description
 * @param {object} logger - A logger instance
 * @return - program exit if command failed
*/
async function executeCommand(commandPath, commandArgs, description, logger) {
    const child_process = require('child_process');
    const args = commandArgs;
    const argsString = args.join(' ');
    try {
        void logger.verbose(`[${description}]: ${commandPath} ${argsString}...`);
        const result = child_process.spawn(commandPath, args, { shell: true });
        result.stdout?.on('data', function (data) {
            logger.verbose(`${description}: ${data.toString().trim()}`);
        });
        result.stderr?.on('data', function (data) {
            if (data.includes('A fatal error occurred')) {
                logger.error(`${description} failed: ${data} `);
                process.exit(1);
            }
            logger.verbose(`${description}: ${data.toString().trim()}`);
        });
        result.on('error', function (err) {
            logger.error(`${description} failed: ${err} `);
        });
        const exitCode = await new Promise((resolve, reject) => {
            result.on('close', resolve);
        });

        if (exitCode !== 0) {
            logger.warn(`There could be something that went wrong (exit code: ${exitCode}). Use --verbose for more information.`);
        }

        void logger.verbose(`[${description}]: Run command succeeded.`);
        return exitCode;
    } catch (err) {
        logger.error(`${description} failed: ${err.stderr || err} `);
        process.exit(1);
    }
}

/**
 * @desc setup create database command arguments
 * @param {string} sourceFolderPath - Source folder path
 * @param {object} options - Command options
 * @param {object} logger - A logger instance
 * @return - command arguments
*/
async function setupCreateDatabaseCommandArgs(sourceFolderPath, options, logger) {
    const fs = require('fs');
    sourceFolderPath = fs.realpathSync(sourceFolderPath);
    var args = [];
    const path = require('path');
    args.push('database', 'create');
    options.overwrite ? args.push(`--overwrite`) : null;
    args.push('--db-cluster');
    process.env.GITHUB_TOKEN ? null : args.push(`--language=${options.language ? normolizeString(options.language) : normolizeString((await getSourceLanguages(sourceFolderPath, logger)).join(','))}`)
    options.command ? args.push(`--command='${options.command}'`) : null;
    args.push(`--source-root=${sourceFolderPath}`);
    options.threads ? args.push(`--threads="${options.threads}"`) : null;
    options.verbose ? args.push(`--verbose`) : null;
    const databasePath = options.output ? options.output : path.resolve(process.cwd(), `${path.basename(sourceFolderPath)}-codeql-database`);
    args.push('--', databasePath);
    return { args, databasePath };
}

/**
 * @desc get source languages from source folder
 * @param {string} sourceFolderPath - Source folder path
 * @param {object} logger - A logger instance
 * @return {string[]} - source languages
*/
async function getSourceLanguages(sourceFolderPath, logger) {
    const linguist = require('linguist-js');
    const languages = Object.keys((await linguist(sourceFolderPath)).languages.results);
    var validLanguages = languages.filter(language => CONFIG.supportedLanguages.includes(normolizeString(language)));
    validLanguages = validLanguages.map(language => convertLanguageIndentifier(language));
    return validLanguages;
}

/**
 * @desc get database languages from database folder
 * @param {string} databasePath - Database folder path
 * @param {object} logger - A logger instance
 * @return {string[]} - database languages
*/
async function getDatabaseLanguages(databasePath, logger) {
    const fs = require('fs');
    const path = require('path');
    const files = fs.readdirSync(path.resolve(databasePath));
    const languages = files.filter(file => CONFIG.supportedLanguages.includes(normolizeString(file)));
    return languages;
}

/**
 * @desc convert language indentifier to coresponding language
 * @param {string} language - Language indentifier
 * @return {string} - supported language
*/
function convertLanguageIndentifier(language) {
    language = normolizeString(language)
    switch (language) {
        case 'c++':
            return 'cpp';
        case 'c#':
            return 'csharp';
        case 'typescript':
            return 'javascript';
        default:
            return language;
    }
}

/**
 * @desc create CodeQL database from source folder by given options
 * @param {string} sourceFolderPath - Source folder path
 * @param {object} options - Command options
 * @param {object} logger - A logger instance
 * @return {object} - { exitCode, databasePath}
*/
async function createCodeQLDatabase(sourceFolderPath, options, logger) {
    if (options.userDocker) {
        await isCommandExist('docker', logger);
    } else {
        await isCommandExist('codeql', logger);
        const { args, databasePath } = await setupCreateDatabaseCommandArgs(sourceFolderPath, options, logger);
        logger.verbose(`Options:`);
        for (const key in options) {
            const element = options[key];
            logger.verbose(`[+] ${key}: ${element}`);
        }
        const exitCode = await executeCommand('codeql', args, 'Create CodeQL database', logger);
        logger.verbose(`CodeQL database created at ${databasePath}.`)
        return { exitCode, databasePath };
    }
}

/**
 * @desc setup scan command arguments
 * @param {string} databaseFolderPath - Database folder path
 * @param {object} options - Command options
 * @param {object} logger - A logger instance
 * @return {object} - command arguments
*/
async function setupScanCommandArgs(databaseFolderPath, options, logger) {
    const fs = require('fs');
    const path = require('path');
    databaseFolderPath = fs.realpathSync(databaseFolderPath);
    var args = [];
    const outputPath = options.output ? options.output : path.resolve(process.cwd(), `${path.basename(sourceFolderPath)}-${options.language}-codeql-result.${options.format ? options.format : `sarif`}`);

    args.push('database', 'analyze');
    args.push(`--format=${options.format ? options.format : CONFIG.default.format}`);
    args.push(`--output=${outputPath}`);
    options.download ? args.push(`--download`) : null;
    options.threads ? args.push(`--threads=${options.threads}`) : null;
    options.verbose ? args.push(`--verbose`) : null;


    args.push('--', databaseFolderPath, options.query ? options.query : CONFIG.default.queries[options.language]);

    return { args, outputPath };
}

/**
 * @desc replace all white space and convert to lower case
 * @param {string} str - String to be normalized
 * @return {string} - normalized string
*/
function normolizeString(str) {
    return str.replace(/\s/g, '').toLowerCase();
}

/**
 * @desc check if the given repository is a remote repository
 * @param {string} repository - Repository URL
 * @return {boolean} - true if the given repository is a remote repository
*/
function isRemoteRepository(repository) {
    const GIT_URL_PATTERN = /^((https?|ssh|git|ftps?):\/\/)?(([^\/@]+)@)?([^\/:]+)[\/:]([^\/:]+)\/(.+)(.git)?\/?$/gm;
    return GIT_URL_PATTERN.test(repository);
}

/**
 * @desc clone a remote repository
 * @param {string} target - Repository URL
 * @param {object} logger - A logger instance
 * @return {string} - cloned repository relative path
*/
async function cloneRemoteRepository(target, logger) {
    await isCommandExist('git', logger);
    const GIT_URL_PATTERN = /^((https?|ssh|git|ftps?):\/\/)?(([^\/@]+)@)?([^\/:]+)[\/:]([^\/:]+)\/(.+)(.git)?\/?$/gm;
    const matches = Array.from(target.matchAll(GIT_URL_PATTERN))[0]
    const owner = matches[6];
    const repositoryName = matches[7].endsWith('.git') ? matches[7].slice(0, -4) : matches[7];
    await executeCommand('git', ['clone', target, `${owner}@${repositoryName}`], 'Clone remote repository', logger);
    return `${owner}@${repositoryName}`
}

/**
 * @desc remove a folder
 * @param {string} folderPath - Folder path
 * @param {object} logger - A logger instance
 * @return {void}
*/
async function removeFolder(folderPath, logger) {
    const fs = require('fs');
    try {
        await fs.rmSync(folderPath, { recursive: true, force: true });
    }
    catch (error) {
        logger.warning(`${error.message}`);
    }
}

/**
 * @desc get nested value of object by given path
 * @param {object} obj - Object
 * @param {[]string} paths - Paths
 * @param {boolean} isRequired - true if the value is required
 * @return {any} - value
 */
function getNestedValue(obj, paths, isRequired) {
    if (obj === undefined) {
        if (isRequired) {
            throw new Error(`The value is required.`);
        }
        return undefined;
    }
    if (paths.length === 0) {
        return obj;
    }
    const [head, ...tail] = paths;
    return getNestedValue(obj[head], tail, isRequired);
}

/**
 * @desc parse sarif file to array of alert: {id, title, level, severity, precision, location}
 * @param {string} sarifPath - Sarif file path
 * @param {object} logger - A logger instance
 * @return {object[]} - array of alert
*/
async function parseSarif(sarifPath, logger) {
    const fs = require('fs');
    const sarif = JSON.parse(fs.readFileSync(sarifPath, 'utf8'));
    const rules = getNestedValue(sarif, ['runs', 0, 'tool', 'driver', 'rules'], false);
    const results = getNestedValue(sarif, ['runs', 0, 'results'], false);
    const alerts = results.map(result => {
        const rule = rules.find(rule => rule.id === result.ruleId);
        const alert = {
            id: getNestedValue(rule, ['id'], false),
            title: getNestedValue(rule, ['shortDescription', 'text'], false),
            level: getNestedValue(rule, ['defaultConfiguration', 'level'], false),
            severity: getNestedValue(rule, ['properties', 'security-severity'], false),
            precision: getNestedValue(rule, ['properties', 'precision'], false),
        };
        const uri = getNestedValue(result, ['locations', 0, 'physicalLocation', 'artifactLocation', 'uri'], false);
        const startLine = getNestedValue(result, ['locations', 0, 'physicalLocation', 'region', 'startLine'], false);
        const endLine = getNestedValue(result, ['locations', 0, 'physicalLocation', 'region', 'endLine'], false);
        alert.location = uri;
        if (startLine) alert.location += `#L${startLine}`;
        if (endLine) alert.location += `-${endLine}`;
        return alert;
    });
    return alerts;
}