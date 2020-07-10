import os
import pathlib
import argparse
import sys
import json 

from src.utils.formatting import cleanName, getFileName, groupItems
from src.utils.chunking import extractChunks
from src.utils.vectorization import vectorize
from src.utils.graphDataTranslator import generateGraph

def filterOnChoreo(choreoIds, linkages):   
    choreoLinkages = []

    for line in linkages:
        event1 = line.split()[0].strip()
        event2 = line.split()[2].strip()

        if (event1 in choreoIds) and (event2 in choreoIds):
            choreoLinkages.append(line)
        else:
            pass

    if len(choreoLinkages)==0:
        choreoLinkages = ["#--> None Matching - Manual implementation required"]

    return ["\n## Linkages ##"] + choreoLinkages #+ ["\n## WrongLinks ##"] + wrongLinks

def addExternalEvents(choreoIds, chunks):    
    externalIds = []
    externalLinkages = []
    for line in chunks['linkages']:
        event1 = line.split()[0].strip()
        event2 = line.split()[2].strip()

        if (event1 in choreoIds) and (event2 not in choreoIds):
            externalIds.append(event2)
            externalLinkages.append(line)
        elif (event2 in choreoIds) and (event1 not in choreoIds):
            externalIds.append(event1)
            externalLinkages.append(line)

    externalEvents = []
    for _id in externalIds:
        for elem in chunks['internalEvents']:
            if _id == elem.split('[')[0].replace(' ', '').strip():
                externalEvents.append(elem)

    return externalIds, externalEvents, externalLinkages

def generateChoreographyProjection(chunks):
    # Extract choreography events
    choreographyEvents = []
    for event in chunks['events']: #events refer here to choreography events
        choreographyEvents.append(event.strip())
    choreoIds = []
    for event in choreographyEvents:
        choreoIds.append(event.split('[')[0])

    # Extract choreography linkages
    choreoLinkages = filterOnChoreo(choreoIds, chunks['linkages'])
    
    # Look for external events
    externalIds, externalEvents, externalLinkages = addExternalEvents(choreoIds, chunks)

    # Merge projection items
    tasks = choreoIds + externalIds
    events = choreographyEvents + externalEvents
    linkages = choreoLinkages + externalLinkages

    projGrouping = groupItems('Choreography', tasks)
    projection = ["##### Choreography Projection #######"] + events + projGrouping + linkages

    return projection, externalIds


def projectChoreo(data, target):
    chunks, roles = extractChunks(data)

    # generate choreography projection
    projection, externalIds = generateChoreographyProjection(chunks.copy()) 
    generateGraph(projection, externalIds, target, "Choreo")
    vectorize(projection, os.path.join(target,"vectChoreo"))

    # addFullMarkings(os.path.join(target,"vectChoreo"))

    print('[INFO] Choreography Projection generated')
 
#if __name__ == "__main__":
#    main()