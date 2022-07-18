import json 
import os 


class Report:
    def __init__(self, clog, scpath):
        if(scpath != None): self.scpath = scpath
        if(clog != None): self.clog = clog
        self.report_file_path = os.path.join(scpath, "codeql-agent-results", "gl-sast-report.json")
        self.grey = "\x1b[38;20m"
        self.yellow = "\x1b[33;20m"
        self.red = "\x1b[31;20m"
        self.green = "\x1b[32;20m"
        self.bold_red = "\x1b[31;1m"
        self.bold = "\033[1m"
        self.reset = "\x1b[0m"

    def parser(self):
        try:
            with open(self.report_file_path, "r") as f:
                raw = json.loads(f.read().strip())
        except Exception as e:
            self.clog.critical("[Reports]:parser - {}".format(e))
            exit(0)

        vulnerabilities = raw.get("vulnerabilities")
        vuls = list()
        for vul in vulnerabilities:
            vulnerability = "\t\t{}{}{}\n".format(self.bold, vul.get("message"), self.reset)
            vulnerability += "[*] Message: {}\n".format(vul.get("message"))
            vulnerability += "[*] Description: {}\n".format(vul.get("description"))
            if(vul.get("severity") == "High" or vul.get("severity") == "Critical"):
                vulnerability += "[*] Severity: {}{}{}\n".format(self.red, vul.get("severity"), self.reset)
            elif(vul.get("severity") == "Medium"):
                vulnerability += "[*] Severity: {}{}{}\n".format(self.yellow, vul.get("severity"), self.reset)
            else:
                vulnerability += "[*] Severity: {}\n".format(vul.get("severity"))

            if (vul.get("confidence") == "High" or vul.get("confidence") == "Critical"):    
                vulnerability += "[*] Confidence: {}{}{}\n".format(self.red, vul.get("confidence"), self.reset)
            elif(vul.get("confidence") == "Medium"):
                vulnerability += "[*] Confidence: {}{}{}\n".format(self.yellow, vul.get("confidence"), self.reset)
            else:
                vulnerability += "[*] Confidence: {}\n".format(vul.get("confidence"))

            target = vul.get("location")
            vulnerability += "[*] Location (file:startline:endline): {}:{}:{}\n".format(target.get("file"), target.get("start_line"), target.get("end_line"))
            ident = vul.get("identifiers")[0]
            vulnerability += "[*] Identifiers: {}\n".format(ident.get("name"))
            vuls.append(vulnerability)
            print(vulnerability)

        return vuls