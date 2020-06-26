import sys
import argparse
import json
import numpy as np
import copy

def getFileName(args=sys.argv[1:]):
    ap = argparse.ArgumentParser()
    ap.add_argument("-f", "--file", required=True, help="DCR file to project")
    args = vars(ap.parse_args())    
    return args["file"]

def cleanName(nameChunked): 
    cleanedTsk = ""
    if nameChunked != []:
        for tsk in nameChunked: 
            eventName = ""
            if ("[" in tsk):
                tskbis = tsk.split("[")
                eventName = tskbis[0]
                cleanedTsk += tskbis[1]
            else:
                eventName = tsk
                cleanedTsk += tsk
        return eventName, cleanedTsk
    else: 
        return "", cleanedTsk


def groupItems(role, refs):
    no_duplicates=[]
    for ref in refs:
        if ref not in no_duplicates:
            no_duplicates.append(ref)
    return [
        "\n## Proj Grouping ##", 
        'Group "' + role+ '" {'+' '.join(no_duplicates)+'}'
        ]

def removeGroups(data):
    #extract group elems
    groupElems=[]

    cnt = 0
    for line in data: 
        if "Group" in line:
            gName = line.split("Group")[1].split('{')[0].replace('"','').strip()
            events=line.split('{')[1].split('}')[0].split(' ')
            groupElems.append({'gName':gName,
                            'events':events})
            
    #for each elem, scan relations and replace adequatly

    ##extract relations:

    relations = []
    bla=0
    for line in data: 
        if (line[0] !='#') and ('-' in line) and ('>' in line):
            relations.append(line.strip())
  
    
    newRelations=[]
    cnt=0

    grpNames = [elem['gName'] for elem in groupElems]

    #update src
    updatedSrc=[]
    for relation in relations:
        src=relation.split(' ')[0].strip()
        if src in grpNames:
            newR = []
            for elem in groupElems:
                if elem['gName'] == src:
                    newR = elem['events']
            for elem in newR:
                toAdd = elem + ' ' + ' '.join(relation.split(' ')[1:])
                updatedSrc.append(toAdd)
        else:
            updatedSrc.append(relation)

    updatev2 = []
    for relation in updatedSrc:
        tgt = relation.split(' ')[-1].strip()

        if tgt in grpNames:
            newR = []
            for elem in groupElems:
                if elem['gName'] == tgt:
                    newR = elem['events']
            for elem in newR:
                toAdd = ' '.join(relation.split(' ')[:-1])+ ' '+elem
                updatev2.append(toAdd)

        else:
            updatev2.append(relation)            

    events = []
    for line in data:
        if ('[' in line) and ('-' not in line) and ('>' not in line) :
            events.append(line.strip())

    newData= events + updatev2

    return newData


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)