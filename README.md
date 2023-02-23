# CodeQL Agent CLI

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
- Scan remote target (e.g. GitHub repository) or local target (e.g. source code folder).
- Support running on Docker which prepackaged and precompiled CodeQL for running code scanning.

## Requirements

- For normal use, you need to install the [CodeQL CLI](https://codeql.github.com/).
- For Docker support, you need to install [Docker](https://docs.docker.com/get-docker/) and are not required to install CodeQL CLI.

## Install CodeQL Agent CLI

Install CodeQL Agent CLI from npm:

```bash
npm install -g codeql-agent-cli
```

## Getting Started

1. Install CodeQL Agent CLI.

```bash
npm install -g codeql-agent-cli
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
Usage: codeql-agent scan [options] <target>

scan a source code folder or remote repository (e.g. GitHub repository)

Arguments:
  target                      source code folder or remote repository.
  
  Examples:
        codeql-agent-cli src/sammple 
        codeql-agent-cli scan src/sammple --use-docker
        codeql-agent-cli scan https://github.com/OWASP/NodeGoat

Options:
  -l, --language <language>   language of source code. Supported languages: go, java, cpp, csharp, cpp, javascript, ruby. Omitting this option to auto-detect the language.
  -o, --output <output>       output folder. Default: <target>-codeql-results
  -c, --command <command>     command to create database for compiled languages, omit if the only languages requested are Python and JavaScript. This specifies the build commands
                              needed to invoke the compiler. If you don't set this variable, CodeQL will attempt to detect the build system automatically, using a built-in autobuilder
  -t, --threads <number>      number of threads to use. Pass 0 to use one threads per core on the machine. Default: 1 (default: 1)
  --query <query>             CodeQL query to run. Default: <language>-security-extended.qls
  --format <format>           output format. Default: sarif-latest (default: "sarif-latest")
  --overwrite                 overwrite existing database.
  --no-download               do not download missing queries before analyzing.
  --remove-remote-repository  remove the remote repository after cloning.
  --db-output <dbOutput>      database folder path.
  --remove-database           remove the CodeQL database after scanning.
  --create-db-only            only create CodeQL database, do not scan.
  --use-docker                use docker to isolated run CodeQL.
  -v, --verbose               verbose output
  -h, --help                  display help for command
```

## Using CodeQL Agent on VSCode

If you want to use CodeQL Agent on VSCode, you can install the [CodeQL Agent extension](https://marketplace.visualstudio.com/items?itemName=DoubleVKay.codeql-agent) from the VSCode Marketplace.

## Contributors

## License

CodeQL Agent uses CodeQL CLI as the core engine. Please follow the [GitHub CodeQL Terms and Conditions](https://github.com/github/codeql-cli-binaries/blob/main/LICENSE.md) and take it as your own responsibility.