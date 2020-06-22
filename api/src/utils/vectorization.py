import os 
import argparse
import sys
import pathlib
import json
import numpy as np
import json


from utils.formatting import getFileName, NumpyEncoder
from utils.chunking import extractChunks


def getRelationElems(relation):

    typeID=0
    id_from=relation.split()[0]
    id_to=relation.split()[-1]

    if '<>' in relation:
        typeID = 'milestone'
    elif '>*' in relation:
        typeID = 'condition'
    elif '*-' in relation:
        typeID = 'response'
    elif '+' in relation:
        typeID = 'include'
    elif '%' in relation:
        typeID = 'exclude'
    else:
        typeID = 0 # no relation, wrong input (error to raise) 

    relationElems = {
        'r_type': typeID,
        'r_from': id_from,
        'r_to': id_to
    }
    return  relationElems

def getEventId(event):
    return event.split('[')[0].strip()

def generateRelationMatrix(relationType, eventsList, chunkEvents, relations):
    relationMatrix = np.zeros((len(eventsList),len(eventsList)))

    # filter set of relations with relation type
    relationList = []
    for relation in relations:
        r_elems = getRelationElems(relation) 
        if relationType == r_elems['r_type']:
            relationList.append(r_elems)

    # update matrix
    for relation in relationList:
        relationMatrix[eventsList.index(relation['r_from'])][eventsList.index(relation['r_to'])] = 1

    return relationMatrix


def generateRelationMatrices(chunks):
    #print('[INFO] Generating Relation Matrices')

    relations = chunks['linkages']
    events = chunks['events'] + chunks['internalEvents'] 

    if relations == []:
        return []

        
    # get list of events
    eventsList = []
    for event in events:
        eventsList.append(getEventId(event))

    relationMatrices= [
                    {
                        'condition':generateRelationMatrix('condition', eventsList, events, relations),
                        'milestone':generateRelationMatrix('milestone', eventsList, events, relations),
                        'response':generateRelationMatrix('response', eventsList, events, relations),
                        'include':generateRelationMatrix('include', eventsList, events, relations),
                        'exclude':generateRelationMatrix('exclude', eventsList, events, relations),
                    }
        ]

    return relationMatrices

def generateIncludedMarking(eventsList, events, relations):
    m_Matrix = np.zeros(len(eventsList))

    # get list of events without from activities
    
    #step1: extract to events 
    to_events = [] 
    for r in relations:
        elem = getRelationElems(r)['r_to']
        if elem not in to_events:            
            to_events.append(elem)

    #step2: filter on events without to elem
    for event in eventsList:
        if event not in to_events:
            m_Matrix[eventsList.index(event)] = 1  # update their id to 1

    return m_Matrix

def generateInitialMarkings(chunks):
    #print('[INFO] Generating Initial Markings')

    relations = chunks['linkages']
    events = chunks['events'] + chunks['internalEvents'] 

    # get list of events
    eventsList = []
    for event in events:
        eventsList.append(getEventId(event))

    # generate markings
    markingMatrices =  [
                    {
                        'included':generateIncludedMarking(eventsList, events, relations),
                        'pending': np.zeros(len(eventsList)),
                        'executed':np.zeros(len(eventsList)),
                    }
        ]

    return markingMatrices
 
#def executeStep():
    # 1. is it executable?
    # 2. get type: 
    #       if internal / private task, execute normally (executer == role)
    #       if choreography task, whether send transaction or listen to it
    #       if BC==main_role task, generate smart contract and activate it
    # 3. update markings
    # 4. wait for next step to be executed

def vectorize(data, filename):
    chunks, roles = extractChunks(data)

    bitvectors = {
        'relations':generateRelationMatrices(chunks),
        'markings': generateInitialMarkings(chunks)

    }
    with open(filename.replace('.txt', '.json'), 'w') as outfile:
        json.dump(bitvectors, outfile, indent=2, cls=NumpyEncoder)
