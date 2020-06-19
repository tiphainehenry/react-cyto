import sys
import argparse
import json
import numpy as np

def getFileName(args=sys.argv[1:]):
    ap = argparse.ArgumentParser()
    ap.add_argument("-f", "--file", required=True, help="DCR file to project")
    args = vars(ap.parse_args())    
    return args["file"]

def cleanName(nameChunked): 
    cleanedTsk = ""
    for tsk in nameChunked: 
        if ("[" in tsk):
            tskbis = tsk.split("[")
            eventName = tskbis[0]
            cleanedTsk += tskbis[1]
        else:
            cleanedTsk += tsk
    return eventName, cleanedTsk

def groupItems(role, refs):
    return [
        "\n## Proj Grouping ##", 
        'Group "' + role+ '" {'+' '.join(refs)+'}'
        ]

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)