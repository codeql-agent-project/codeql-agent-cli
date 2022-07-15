import docker
import os
from utils.conftools import read_conf

class CodeQLDocker:
    def __init__(self, clog=None, scpath=None, action=None, language=None, qs=None, userid=None, groupid=None, threads=None, overwrite_flag=None, save_cache_flag=None, java_version=None):
        if(clog != None): self.clog = clog
        if(action != None): self.action = action
        if(language != None): self.language = language
        if(qs != None): self.qs = qs
        if(userid != None): self.userid = userid
        if(groupid != None): self.groupid = groupid
        if(threads != None): self.threads = threads
        if(overwrite_flag != None): self.overwrite_flag = overwrite_flag
        if(save_cache_flag != None): self.save_cache_flag = save_cache_flag
        if(java_version != None): self.java_version = java_version
        if(scpath != None): self.scpath = scpath

        self.conf = read_conf()

    def run(self):
        client = docker.from_env()
        try:
            _volumes = []
            _volumes.append("{}:{}".format(self.scpath, self.conf.get("docker_working_dir")))
            _volumes.append("{}:{}".format(os.path.join(self.scpath, "codeql-agent-results"), self.conf.get("docker_results_dir")))
            
            # print(_volumes)
            # container_id = client.images.get(self.conf.get("container_name"))
            # print(container_id)
            container_id = client.containers.run(image=self.conf.get("container_name"), \
                                                name=self.conf.get("name"), \
                                                volumes=_volumes, \
                                                remove=True)
            self.clog.debug("[CodeQLDocker]:run - Container id: {}". format(container_id))
        except Exception as ex:
            self.clog.critical("[CodeQLDocker]:run - {}".format(ex))
        
        # Streaming log
        # for line in container_id.logs(stream=True):
        #     clog.debug("[Docker log] - {}".format(line.strip()))
