import argparse
import os 


from utils.logger import Logger
from utils.CodeQLDocker import CodeQLDocker
from utils.Reports import Report

# Python3.10.5
# Modules:  
#   + codeqlcli: Main module
#   + CodeQLDocker: Interact with docker
#   + Parser: Parse report log


clog = Logger()
cwd = os.getcwd()
clog.debug("Current working directory: {}".format(cwd))
os.chdir(cwd)

def banner():
    clog.info("")
    clog.debug("░█▀▀█ █▀▀█ █▀▀▄ █▀▀ ░█▀▀█ ░█─── 　 ─█▀▀█ █▀▀▀ █▀▀ █▀▀▄ ▀▀█▀▀ 　 ░█▀▀█ ░█─── ▀█▀ ")
    clog.warning("░█─── █──█ █──█ █▀▀ ░█─░█ ░█─── 　 ░█▄▄█ █─▀█ █▀▀ █──█ ──█── 　 ░█─── ░█─── ░█─ ")
    clog.critical("░█▄▄█ ▀▀▀▀ ▀▀▀─ ▀▀▀ ─▀▀█▄ ░█▄▄█ 　 ░█─░█ ▀▀▀▀ ▀▀▀ ▀──▀ ──▀── 　 ░█▄▄█ ░█▄▄█ ▄█▄    ")
    clog.debug("\n==================================== *&* =====================================\n\n")


def cparser():
    parser = argparse.ArgumentParser()
    parser.add_argument("--commands", help="The variable used when you create a CodeQL database for one or more compiled languages, omit if the only languages requested are Python and JavaScript. This specifies the build commands needed to invoke the compiler. If you don't set this variable, CodeQL will attempt to detect the build system automatically, using a built-in autobuilder. Ex: --commands \"mvn clean install\"")
    parser.add_argument("--sourcecode", help="Path to target source-code directory")
    parser.add_argument("--action", help="Creating CodeQL database only without executing CodeQL analysis. Ex: --action create-database-only")
    parser.add_argument("--language", help="Set project language to build database or execute SAST. The <language> must be: python, javascript, cpp, csharp, java, go, typescript, c. Ex: --language python")
    parser.add_argument("--qs", help="Specify a list of queries to run over your database. The default value is <language>-security-extended.qls. For more details, please see Analyzing databases with the CodeQL CLI. Ex: --qs <full path to .qls file>")
    parser.add_argument("--userid", help="Set the owner of the results folder to <id>.")
    parser.add_argument("--groupid", help="Set the group owner of the results folder to <group_id>.")
    parser.add_argument("--threads", help="Use this many threads to build database and evaluate queries. Defaults to 1. You can pass 0 to use one thread per core on the machine.")
    parser.add_argument("--overwrite_flag", nargs='?', type=str, const="--overwrite", help="Value is --overwrite. Enable/disable overwrite database when database path exists and not an empty directory. This flag is useful for forcibly rebuilding the database.")
    parser.add_argument("--save_cache_flag", nargs='?', type=str, const="--save-cache", help="Value is --save-cache. Aggressively save intermediate results to the disk cache. This may speed up subsequent queries if they are similar. Be aware that using this option will greatly increase disk usage and initial evaluation time.")
    parser.add_argument("--java_version", help="Set the Java version. The default Java version is Java 11. It must be 8 or 11. Ex: --java_version 8.")
  
    return parser.parse_args()

def main(cparser):
    if(cparser.sourcecode == None):
        clog.critical("--sourcecode parameter is reqiured!")
        exit(0)

    handler = CodeQLDocker(clog=clog, cparser=cparser)
    handler.run()
    rp = Report(clog, cparser.sourcecode)
    rs = rp.parser()

if __name__ == '__main__':
    banner()
    cp = cparser()
    main(cp)

