import os
import pathlib
import argparse
import sys
import json

from src.utils.formatting import cleanName, getFileName, groupItems
from src.utils.chunking import extractChunks
from src.utils.vectorization import vectorize
from src.utils.graphDataTranslator import generateGraph


def generateGlobalProjection(data, filename):
    chunks, roles = extractChunks(data)

    # Extract events

    globalEvents = []
    globEv = []
    ind=0
    for event in chunks['events'] + chunks['internalEvents']: #events refer here to choreography events
        globalEvents.append(event.strip())
        globEv.append({
            'id':ind,
            'event':event.strip()
        })
        ind=ind+1

    # Extract linkages
    linkages = ["\n## Linkages ##"] + chunks['linkages'] 
    globRelations = []
    ind=0
    for rel in chunks['linkages']:
        globRelations.append({
            'id':ind,
            'relation':rel
        })
        ind=ind+1
    
    # Merge projection items
    projection = ["##### Global DCR #######"] + globalEvents + linkages

    # create role mapping
    roleMapping=[]
    ind=1
    for role in roles:
        roleMapping.append({
            'id':'r'+str(ind),
            'role':role
        })
        ind=ind+1    
    # update dcrTexts file
    with open(filename) as json_file:
        data = json.load(json_file)
    
    data['global']={
        'events':globEv,
        'relations':globRelations
    }
    data['roleMapping']=roleMapping
        
    with open(filename, 'w') as outfile:
        json.dump(data, outfile)
    return projection, []

def projectGlobal(data, target):
    print('[INFO] Starting Global Projection')
    # generate choreography projection
    projection, externalIds = generateGlobalProjection(data, os.path.join(target,"dcrTexts.json")) 
    generateGraph(projection, externalIds, target, "Global")
    vectorize(projection, os.path.join(target,"vectGlobal"))
    print('[INFO] Global Projection generated')

 
#if __name__ == "__main__":
#    main()