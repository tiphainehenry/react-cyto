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


def generateChoreographyProjection(chunks):

    # Extract choreography events
    choreographyEvents = []
    for event in chunks['events']:
        choreographyEvents.append(event.strip())

    choreoIds = []
    for event in choreographyEvents:
        choreoIds.append(event.split('[')[0])

    # Extract linkages
    choreoLinkages = filterOnChoreo(choreoIds, chunks['linkages'])
    
    # Merge projection items
    projGrouping = groupItems('Choreography', choreoIds)
    projection = ["##### Choreography Projection #######"] + choreographyEvents + projGrouping + choreoLinkages

    # Save Proj text
    #projPath = os.path.join(projDir, "projectionChoreography.txt")
    #f= open(projPath,"w+")
    #for i in range(len(projection)):
    #    f.write(projection[i]+'\n')
    #f.close()

    return projection

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
    projection = generateChoreographyProjection(chunks.copy()) 
    generateGraph(projection, target, "choreo")

    # generate vectorization
    #file = open(projPath, 'r')    
    #projectionData = file.readlines()
    #file.close()
    #vectorize(projectionData, projPath)

    print('[INFO] Choreography Projection generated')
 
#if __name__ == "__main__":
#    main()