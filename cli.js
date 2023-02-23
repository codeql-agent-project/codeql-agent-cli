#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const path = require('path');
const program = require('commander');
const config = require('./config.json');
config.version = require('./package.json').version;
const { scan } = require('./index.js');

clear();
console.log(
    chalk.red(
        figlet.textSync('CodeQL Agent')
    )
);
console.log(
    chalk.italic.green(
        `\tAuthor: doublevkay - Version: ${config.version}\n`
    )
);
program
    .name('codeql-agent')
    .description('Automate the process of using CodeQL, a semantic code analysis engine, to execute code scanning in source.\n\nExamples:\n\tcodeql-agent src/sammple \n\tcodeql-agent scan src/sammple --use-docker\n\tcodeql-agent scan https://github.com/OWASP/NodeGoat')
    .version(config.version);

program.command('scan')
    .description('scan a source code folder or remote repository (e.g. GitHub repository)')
    .argument('<target>', 'source code folder or remote repository.\n\nExamples:\n\tcodeql-agent scan src/sammple\n\tcodeql-agent scan src/sammple --use-docker\n\tcodeql-agent scan https://github.com/OWASP/NodeGoat')
    .option('-l, --language <language>', 'language of source code. Supported languages: go, java, cpp, csharp, cpp, javascript, ruby. Omitting this option to auto-detect the language.',)
    .option('-o, --output <output>', 'output folder. Default: <target>-codeql-results')
    .option('-c, --command <command>', 'command to create database for compiled languages, omit if the only languages requested are Python and JavaScript. This specifies the build commands needed to invoke the compiler. If you don\'t set this variable, CodeQL will attempt to detect the build system automatically, using a built-in autobuilder')
    .option('-t, --threads <number>', 'number of threads to use. Pass 0 to use one threads per core on the machine. Default: 1', 1)
    .option('--query <query>', 'CodeQL query to run. Default: <language>-security-extended.qls')
    .option('--format <format>', 'output format. Default: sarif-latest', 'sarif-latest')
    .option('--overwrite', 'overwrite existing database.')
    .option('--no-download', 'do not download missing queries before analyzing.')
    .option('--remove-remote-repository', 'remove the remote repository after cloning.')
    .option('--db-output <dbOutput>', 'database folder path. ')
    .option('--remove-database', 'remove the CodeQL database after scanning.')
    .option('--create-db-only', 'only create CodeQL database, do not scan.')
    .option('--use-docker', 'use docker to isolated run CodeQL.')
    .option('-v, --verbose', 'verbose output')
    .action(scan);

program.parse();