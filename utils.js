const CONFIG = require('./config.json');

// Check if a command is installed on the system, else throw error
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
// Check if a folder exists, else throw error
async function isFolderExist(folder, logger) {
    const fs = require('fs');
    if (!fs.existsSync(folder) || !fs.lstatSync(folder).isDirectory()) {
        logger.error(`Folder ${folder} is not a directory. Please provide a valid directory path and try again.`);
        process.exit(1);
    }
}
// Check if language is in supportedLanguages, else throw error
async function isSupportedLanguage(supportedLanguages, language, logger) {
    if (!supportedLanguages.includes(language)) {
        logger.error(`Language ${language} is not supported. Please provide a valid language and try again. Supported languages are: ${supportedLanguages.join(', ').trim()}.`);
        process.exit(1);
    }
}
// Create if not exist
async function createIfNotExist(folder, logger) {
    const fs = require('fs');
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
}
// // Check if javaVersion is in supported Java versions, else throw error
// async function isSupportedJavaVersion(supportedJavaVersions, javaVersion, logger) {
//     if (!supportedJavaVersions?.includes(javaVersion)) {
//         logger.error(`Java version ${javaVersion} is not supported. Please provide a valid java version and try again. Supported java versions are: ${supportedJavaVersions.join(', ').trim()}.`);
//         process.exit(1);
//     }
// }
// Execute a command
async function executeCommand(commandPath, commandArgs, description, logger) {
    const child_process = require('child_process');
    const args = commandArgs;
    const argsString = args.join(' ');
    try {
        void logger.info(`[${description}]: ${commandPath} ${argsString}...`);
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
// Setup arguments for CodeQL command. return args and databasePath
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
// Get programming languages of a folder, filter by supportedLanguages
async function getSourceLanguages(sourceFolderPath, logger) {
    const linguist = require('linguist-js');
    const languages = Object.keys((await linguist(sourceFolderPath)).languages.results);
    var validLanguages = languages.filter(language => CONFIG.supportedLanguages.includes(normolizeString(language)));
    validLanguages = validLanguages.map(language => convertLanguageIndentifier(language));
    return validLanguages;
}

async function getDatabaseLanguages(databasePath, logger) {
    const fs = require('fs');
    const path = require('path');
    const files = fs.readdirSync(path.resolve(databasePath));
    const languages = files.filter(file => CONFIG.supportedLanguages.includes(normolizeString(file)));
    return languages;
}

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
// Create CodeQL database
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

async function setupScanCommandArgs(databaseFolderPath, options, logger) {
    const fs = require('fs');
    const path = require('path');
    databaseFolderPath = fs.realpathSync(databaseFolderPath);
    var args = [];
    const outputPath = options.output ? options.output : path.resolve(process.cwd(), `${path.basename(sourceFolderPath)}-${options.language}-codeql-result.${options.format ? options.format : `sarif`}`);

    args.push('database', 'analyze');
    args.push(`--format=${options.format ? options.format : CONFIG.default.format}`);
    args.push(`--output=${outputPath}`);
    options.noDownload ? null : args.push(`--download`);
    options.threads ? args.push(`--threads=${options.threads}`) : null;
    options.verbose ? args.push(`--verbose`) : null;


    args.push('--', databaseFolderPath, options.query ? options.query : CONFIG.default.queries[options.language]);

    return { args, outputPath };
}
// async function scanDatabase(databasePath, options, logger) {

// }
function normolizeString(str) {
    return str.replace(/\s/g, '').toLowerCase();
}

function isRemoteRepository(repository) {
    const GIT_URL_PATTERN = /^((https?|ssh|git|ftps?):\/\/)?(([^\/@]+)@)?([^\/:]+)[\/:]([^\/:]+)\/(.+)(.git)?\/?$/gm;
    return GIT_URL_PATTERN.test(repository);
}

// Clone a remote repository
async function cloneRemoteRepository(target, logger) {
    await isCommandExist('git', logger);
    const GIT_URL_PATTERN = /^((https?|ssh|git|ftps?):\/\/)?(([^\/@]+)@)?([^\/:]+)[\/:]([^\/:]+)\/(.+)(.git)?\/?$/gm;
    const matches = Array.from(target.matchAll(GIT_URL_PATTERN))[0]
    const owner = matches[6];
    const repositoryName = matches[7].endsWith('.git') ? matches[7].slice(0, -4) : matches[7];
    await executeCommand('git', ['clone', target, `${owner}@${repositoryName}`], 'Clone remote repository', logger);
    return `${owner}@${repositoryName}`
}

async function removeFolder(folderPath, logger) {
    const fs = require('fs');
    try {
        await fs.rmSync(folderPath, { recursive: true, force: true });
    }
    catch (error) {
        logger.warning(`${error.message}`);
    }
}
async function createDb(sourceTarget, options) {
    var returnExitCode, returnDatabasePath, returnSourceFolderPath;
    if (options.verbose) { logger.setLevel('verbose') }
    // utils.isRemoteRepository(sourceFolder) ? sourceFolderPath = await utils.cloneRemoteRepository(sourceFolder) : sourceFolderPath = sourceFolder;

    return { returnExitCode, returnDatabasePath }
}

module.exports = {
    isCommandExist, isFolderExist, isSupportedLanguage, createIfNotExist, executeCommand, setupCreateDatabaseCommandArgs, getSourceLanguages, createCodeQLDatabase, normolizeString, isRemoteRepository, cloneRemoteRepository, removeFolder, setupScanCommandArgs, getDatabaseLanguages, createDb
}