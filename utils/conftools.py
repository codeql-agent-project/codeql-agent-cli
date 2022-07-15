import json 
import os

CONF_PATH = os.path.join(".", "configuration.json")

def read_conf():
    with open(CONF_PATH, "r") as f:
        return json.loads(f.read().strip())