import docker
import os
import time
from utils.conftools import read_conf

class CodeQLDocker:
    def __init__(self, cparser, clog=None):
        self._env = list()
        if(clog != None): self.clog = clog
        if(cparser.action != None): 
            self.action = cparser.action
            self._env.append("ACTION={}".format(self.action))
        if(cparser.language != None): 
            self.language = cparser.language
            self._env.append("LANGUAGE={}".format(self.language))
        if(cparser.qs != None): 
            self.qs = cparser.qs
            self._env.append("QS={}".format(self.qs))
        if(cparser.userid != None): 
            self.userid = cparser.userid
            self._env.append("USERID={}".format(self.userid))
        if(cparser.groupid != None): 
            self.groupid = cparser.groupid
            self._env.append("GROUPID={}".format(self.groupid))
        if(cparser.threads != None): 
            self.threads = cparser.threads
            self._env.append("THREADS={}".format(self.threads))
        if(cparser.overwrite_flag != None): 
            self.overwrite_flag = cparser.overwrite_flag
            self._env.append("OVERWRITE_FLAG={}".format(self.overwrite_flag))
        if(cparser.save_cache_flag != None): 
            self.save_cache_flag = cparser.save_cache_flag
            self._env.append("SAVE_CACHE_FLAG={}".format(self.save_cache_flag))
        if(cparser.java_version != None): 
            self.java_version = cparser.java_version
            self._env.append("JAVA_VERSION={}".format(self.java_version))
        if(cparser.sourcecode != None): self.scpath = cparser.sourcecode
        if(cparser.commands != None): 
            self.commands = cparser.commands
            self._env.append("COMMAND={}".format(self.commands))

        self.conf = read_conf()

    def run(self):
        client = docker.from_env()
        try:
            _volumes = []
            _volumes.append("{}:{}".format(self.scpath, self.conf.get("docker_working_dir")))
            _volumes.append("{}:{}".format(os.path.join(self.scpath, "codeql-agent-results"), self.conf.get("docker_results_dir")))

            # print(_volumes)
            # print(self._env)
            # container_id = client.images.get(self.conf.get("container_name"))
            # print(container_id)
            container_id = client.containers.run(image=self.conf.get("container_name"), \
                                                name="{}-{}".format(self.conf.get("name"), round(time.time())), \
                                                volumes=_volumes, \
                                                environment=self._env, \
                                                # detach=True, \
                                                remove=True)
            # self.clog.debug("[CodeQLDocker]:run - Container id: {}". format(container_id))
        except Exception as ex:
            self.clog.critical("[CodeQLDocker]:run - {}".format(ex))
            self.clog.debug(client.containers.prune())
        
        # Streaming log
        # for line in container_id.logs(stream=True):
        #     clog.debug("[Docker log] - {}".format(line.strip()))
