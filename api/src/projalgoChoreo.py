import os
import pathlib
import argparse
import sys

from utils.formatting import cleanName, getFileName, groupItems
from utils.chunking import extractChunks
from utils.vectorization import vectorize
from utils.graphDataTranslator import generateGraph

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
    # filename = getFileName()
    #file = open(os.path.join(filename), 'r')
    #data = file.readlines()
    #file.close()

    #projectPath = pathlib.Path(filename).parent.absolute().parent.absolute()
    #projDir = os.path.join(projectPath, 'projection_'+filename.split('/')[-1]).replace(os.sep, '/')

    #if not (os.path.exists(projDir)):
    #    os.mkdir(projDir)
    #    print('[INFO] Folder Created at ' + str(projDir))
    chunks, roles = extractChunks(data)

    # generate choreography projection
    projection, externalIds = generateChoreographyProjection(chunks.copy()) 
    generateGraph(projection, externalIds, target, "choreo")

    # generate vectorization
    #file = open(projPath, 'r')    
    #projectionData = file.readlines()
    #file.close()
    #vectorize(projectionData, projPath)

    print('[INFO] Choreography Projection generated')
 
#if __name__ == "__main__":
#    main()