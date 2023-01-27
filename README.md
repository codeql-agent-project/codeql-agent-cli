[![Actions Status](https://github.com/docker/compose-cli/workflows/Continuous%20integration/badge.svg)](https://hub.docker.com/repository/docker/doublevkay/codeql-agent-dev)[![Docker Pulls](https://badgen.net/docker/pulls/doublevkay/codeql-agent-dev?icon=docker&label=pulls)](https://hub.docker.com/repository/docker/doublevkay/codeql-agent-dev)[![Docker Image Size](https://badgen.net/docker/size/doublevkay/codeql-agent-dev?icon=docker&label=image%20size)](https://hub.docker.com/repository/docker/doublevkay/codeql-agent-dev)![Github stars](https://badgen.net/github/stars/vovikhangcdv/codeql-agent?icon=github&label=stars)![Python](https://upload.wikimedia.org/wikipedia/commons/a/a5/Blue_Python_3.8_Shield_Badge.svg)

CodeQL Agent is a project aimed at automating the use of CodeQL. The project helps create database and execute CodeQL analysis. CodeQL Agent is a Docker image. It is designed to be compatible with [SAST Gitlab CI/CD](https://docs.gitlab.com/ee/user/application_security/sast/).

CodeQL Agent for Docker is also the base image of [CodeQL Agent for Visual Studio Code](https://github.com/vovikhangcdv/codeql-agent-extension) - an extension for [Visual Studio Code](https://code.visualstudio.com/) that simplifies CodeQL usage and executes code scanning automatically.

The CodeQL Agent image is released on **Docker Hub** under the name [`doublevkay/codeql-agent-dev`](https://hub.docker.com/repository/docker/doublevkay/codeql-agent-dev). You can use it without building locally.

# codeql-agent-cli
A quick way to run software code audit

# To-do
- [x] Export report to console
- [x] Support full option like [docker](https://github.com/codeql-agent-project/codeql-agent-docker)
- [ ] Automate installation
- [ ] Support for Windows (Automation installation and run) 


# Requirement
- Docker installed
- Python3.8 or above


# Quick usage
## Linux
1. Install docker on your machine
2. Git clone this repo
3. Install python requirement: `python3 -m pip install -r requirement.txt`
4. Run quick command: `sudo python3 codeqlcli.py --sourcecode <full path to your source code>`
5. Taste a coffee and enjoy the moment!

For more information, just type:
```
python3 codeqlcli.py -h
```

### Supported options
You can set environment variables to use the following supported options:
| Variable  | Description |
| ------- | ----------- |
`LANGUAGE`| Value `<language>`. Set project language to build database or execute SAST. The `<language>` must be: `python`, `javascript`, `cpp`, `csharp`, `java`, `go`, `typescript`, `c`.
`USERID` | Value `<id>`. Set the owner of the results folder to `<id>`.
`GROUPID` | Value `<group_id>`. Set the group owner of the results folder to `<group_id>`.
`THREADS` | Value `<number_of_threads>`. Use this many threads to build database and evaluate queries. Defaults to 1. You can pass 0 to use one thread per core on the machine.
`OVERWRITE_FLAG` | Value `--overwrite`. Enable/disable overwrite database when database path exists and not an empty directory. This flag is useful for forcibly rebuilding the database.
`QS`| Value `<queries-suite>`. Specify a list of queries to run over your database. The default value is `<language>-security-extended.qls`. For more details, please see [Analyzing databases with the CodeQL CLI](https://codeql.github.com/docs/codeql-cli/analyzing-databases-with-the-codeql-cli/#running-codeql-database-analyze).
`SAVE_CACHE_FLAG` | Value `--save-cache`. Aggressively save intermediate results to the disk cache. This may speed up subsequent queries if they are similar. Be aware that using this option will greatly increase disk usage and initial evaluation time. 
`ACTION` | Value `create-database-only`. Creating CodeQL database only without executing CodeQL analysis.
`COMMAND` | Value `<command>`. The variable used when you create a CodeQL database for one or more compiled languages, omit if the only languages requested are Python and JavaScript. This specifies the build commands needed to invoke the compiler. If you don't set this variable, CodeQL will attempt to detect the build system automatically, using a built-in autobuilder. 
`JAVA_VERSION` | Value `<java_version>`. Set the Java version. The default Java version is Java 11. It must be `8` or `11`.
-----

***Disclaimer:** CodeQL Agent directly forwards these options to the command arguments while running the container. Please take it as your security responsibility.*


# Screenshot
![Demo Image](https://github.com/codeql-agent-project/codeql-agent-cli/blob/main/resources/codeql-agent-cli.PNG)

## Support

You can open an issue on the [GitHub repo](https://github.com/codeql-agent-project/codeql-agent-cli).

## Contributing

Contributions are always welcome! Just simply create a pull request.

## Contributors
<a href="https://github.com/codeql-agent-project/codeql-agent-cli/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=codeql-agent-project/codeql-agent-cli" />
</a>

## Release Notes

[See details](https://github.com/codeql-agent-project/codeql-agent-cli/releases)

## License

CodeQL Agent is use CodeQL CLI as the core engine. Please follow the [GitHub CodeQL Terms and Conditions](https://github.com/github/codeql-cli-binaries/blob/main/LICENSE.md) and take it as your own responsibility.

