import os
import pathlib
import argparse
import sys

from src.utils.formatting import cleanName, getFileName, groupItems
from src.utils.chunking import extractChunks
from src.utils.vectorization import vectorize
from src.utils.graphDataTranslator import generateGraph


def generateGlobalProjection(chunks):
    # Extract events

    globalEvents = []
    for event in chunks['events'] + chunks['internalEvents']: #events refer here to choreography events
        globalEvents.append(event.strip())

    # Extract linkages
    linkages = ["\n## Linkages ##"] + chunks['linkages'] 
    
    # Merge projection items
    projection = ["##### Choreography Projection #######"] + globalEvents + linkages

    return projection, []

def projectGlobal(data, target):
    chunks, roles = extractChunks(data)

    # generate choreography projection
    projection, externalIds = generateGlobalProjection(chunks.copy()) 
    generateGraph(projection, externalIds, target, "Global")

    vectorize(projection, os.path.join(target,"vectGlobal"))
    print('[INFO] Global Projection generated')
 
#if __name__ == "__main__":
#    main()