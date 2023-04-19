# CodeQL Agent CLI

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-downloads-url]
[![MIT License][license-image]][license-url]

CodeQL Agent CLI is a tool that automates the process of using CodeQL, a semantic code analysis engine, to execute code scanning. It makes the process of finding security vulnerabilities in code simple and efficient.

- [CodeQL Agent CLI](#codeql-agent-cli)
  - [Features](#features)
  - [Requirements](#requirements)
  - [Install CodeQL Agent CLI](#install-codeql-agent-cli)
  - [Getting Started](#getting-started)
  - [Usage](#usage)
  - [Using CodeQL Agent on VSCode](#using-codeql-agent-on-vscode)
  - [Contributors](#contributors)
  - [License](#license)

## Features

- Automated CodeQL from detect language, create database and scan.
- Scan remote target (e.g. GitHub repository) or local target (e.g. source code folder). Support scan list of target.
- Support running on Docker which prepackaged and precompiled CodeQL for running code scanning (*under development*).
- Send results to Discord webhook.

## Requirements

- For normal use, you need to install the [CodeQL CLI](https://codeql.github.com/).
- For Docker support, you need to install [Docker](https://docs.docker.com/get-docker/) and are not required to install CodeQL CLI.

## Install CodeQL Agent CLI

Install CodeQL Agent CLI from npm:

```bash
npm install -g codeql-agent
```

## Getting Started

1. Install CodeQL Agent CLI.

```bash
npm install -g codeql-agent
```

2. Scan your codebase.

```bash
codeql-agent scan
```

## Usage

```bash
codeql-agent -h
```

or for more details about command:

```bash
codeql-agent scan -h
```

This will display help for the tool. Here are all the switches of `scan` command supports.

```console
   ____          _       ___  _          _                    _   
  / ___|___   __| | ___ / _ \| |        / \   __ _  ___ _ __ | |_ 
 | |   / _ \ / _` |/ _ \ | | | |       / _ \ / _` |/ _ \ '_ \| __|
 | |__| (_) | (_| |  __/ |_| | |___   / ___ \ (_| |  __/ | | | |_ 
  \____\___/ \__,_|\___|\__\_\_____| /_/   \_\__, |\___|_| |_|\__|
                                             |___/                
        Author: doublevkay - Version: 0.3.3

Usage: codeql-agent scan [options] <target>

scan a target. Target could be source code folder, remote repository (e.g. GitHub repository) or a list of target.

Arguments:
  target                          source code folder, remote repository or list of target.

  Examples:
        codeql-agent scan src/sammple
        codeql-agent scan targets.txt
        codeql-agent scan https://github.com/OWASP/NodeGoat

Options:
  -l, --language <language>       language of source code. Supported languages: go, java, cpp, csharp, cpp, javascript, ruby. Omitting this option to auto-detect the
                                  language.
  -o, --output <output>           output folder. Default: <target>-codeql-results
  -c, --command <command>         command to create database for compiled languages, omit if the only languages requested are Python and JavaScript. This specifies
                                  the build commands needed to invoke the compiler. If you don't set this variable, CodeQL will attempt to detect the build system
                                  automatically, using a built-in autobuilder
  -t, --threads <number>          number of threads to use. Pass 0 to use one threads per core on the machine. Default: 1 (default: 1)
  --query <query>                 CodeQL query to run. Default: <language>-security-extended.qls
  --format <format>               output format. Default: sarif-latest (default: "sarif-latest")
  --overwrite                     overwrite existing database.
  --download                      download missing queries before analyzing.
  --remove-remote-repository      remove the remote repository after cloning.
  --db-output <dbOutput>          database folder path.
  --remove-database               remove the CodeQL database after scanning.
  --create-db-only                only create CodeQL database, do not scan.
  --enable-file-logging           enable file logging.
  --discord-webhook <webhookUrl>  discord web hook to send the result to.
  --use-docker                    use docker to isolated run CodeQL.
  -v, --verbose                   verbose output
  -h, --help                      display help for command
```

## Using CodeQL Agent on VSCode

If you want to use CodeQL Agent on VSCode, you can install the [CodeQL Agent extension](https://marketplace.visualstudio.com/items?itemName=DoubleVKay.codeql-agent) from the VSCode Marketplace.

## Contributors

<a href="https://github.com/codeql-agent-project/codeql-agent-cli/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=codeql-agent-project/codeql-agent-cli" />
</a>

## License

This tool is released by CodeQL Agent Project - a  non-profit organization from community and are not the official team of CodeQL, under the MIT License. For the full text of this, please consult our [LICENSE.md](LICENSE.md) file.

Note that this license applies only to the tool in this repository, for more information on the license governing use of the CodeQL CLI that it uses, please consult the [GitHub CodeQL Terms and Conditions](https://securitylab.github.com/tools/codeql/license/). In particular, note that there are restrictions on how you may use the the CodeQL CLI on code that is not released under an OSI-approved open source software license.

[npm-url]: https://npmjs.org/package/codeql-agent
[npm-version-image]: https://img.shields.io/npm/v/codeql-agent.svg?style=flat

[npm-downloads-image]: https://img.shields.io/npm/dm/codeql-agent.svg?style=flat
[npm-downloads-url]: https://app.fossa.com/projects/git%2Bgithub.com%2Fcodeql-agent-project%2Fcodeql-agent?ref=badge_large

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
