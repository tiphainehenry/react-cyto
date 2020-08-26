import os 
import argparse
import sys
import pathlib
import json
import numpy as np
import json

from src.utils.formatting import getFileName, NumpyEncoder
from src.utils.chunking import extractChunks, extractRoleChunks
from src.utils.graphManager import initializeGraph

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

    fullMatrix = []
    listRelation = relationMatrix.tolist()

    for elem in listRelation:
        newLine = []
        for item in elem:
            newLine.append(str(item).replace('.0',''))
        fullMatrix.append(newLine)

    return relationMatrix, fullMatrix


def generateRelationMatrices(chunks):
    #print('[INFO] Generating Relation Matrices')

    relations = chunks['linkages']
    events = chunks['events'] + chunks['internalEvents'] 

    if relations == []:
        return []

    # get list of events
    eventsList = []
    for event in events:
        e_id = getEventId(event)
        if (e_id not in eventsList):
            eventsList.append(getEventId(event))
    
    rc, rfc = generateRelationMatrix('condition', eventsList, events, relations)
    rm, rfm = generateRelationMatrix('milestone', eventsList, events, relations)
    rr, rfr = generateRelationMatrix('response', eventsList, events, relations)
    ri, rfi = generateRelationMatrix('include', eventsList, events, relations)
    re, rfe = generateRelationMatrix('exclude', eventsList, events, relations)

    relationMatrices= [
                    {
                        'condition':rc,
                        'milestone':rm,
                        'response': rr,
                        'include':  ri,
                        'exclude':  re,
                    }
        ]

    fullRelations= [rfi,rfe,rfr,rfc,rfm]
    return relationMatrices, fullRelations

def generateInitialMarking(eventsList, events, relations):
    #m_Matrix = np.zeros(len(eventsList))
    m2 = []
    # get list of events without from activities
    
    #step1: extract to events 
    to_events = [] 
    for r in relations:
        elem = getRelationElems(r)['r_to']
        if elem not in to_events:            
            to_events.append(elem)

    #step2: filter on events without to elem
    for event in eventsList:
        include = 0
        if event not in to_events:
            include = 1
            #m_Matrix[eventsList.index(event)] = 1  # update their id to 1

        m2.append({'id':event, 'include':include, 'executed':0, 'pending':0})

    return m2 #m_Matrix

def generateInitialMarkings(chunks):
    #print('[INFO] Generating Initial Markings')

    relations = chunks['linkages']
    events = chunks['events'] + chunks['internalEvents'] 
    
    # get list of events
    eventsList = []
    for event in events:
        eventsList.append(getEventId(event))

    # generate markings
    markingMatrices =  generateInitialMarking(eventsList, events, relations)

    return markingMatrices
 

def addFullMarkings(markings):

    ## add activitynames
    activitynames = []
    included = []
    executed = []
    pending = []
    for elem in markings:
        if(elem['id'] not in activitynames):
            activitynames.append(elem['id'])
            included.append(str(elem['include']))
            executed.append(str(elem['executed']))
            pending.append(str(elem['pending']))
    
    # fullMarkings = [''.join(included),''.join(executed),''.join(pending)]
    fullMarkings = [included,executed,pending]

    print(fullMarkings)

    return activitynames, fullMarkings

def vectorize(data, filename):

    chunks, roles = extractChunks(data)

    relations, fullRelations = generateRelationMatrices(chunks)

    markings = generateInitialMarkings(chunks)
    activitynames,fullMarkings = addFullMarkings(markings)
 
    bitvectors = {
        'relations':relations,
        'markings': markings,
        'activityNames':activitynames,
        'fullMarkings': {
            'included': fullMarkings[0],
            'executed': fullMarkings[1],
            'pending':  fullMarkings[2]
            },
        'fullRelations': {
            'include':   fullRelations[0],
            'exclude':   fullRelations[1],
            'response':  fullRelations[2],
            'condition': fullRelations[3],
            'milestone': fullRelations[4]
            }            
    }

    path = filename+'.json'
    with open(path, 'w') as outfile:
        json.dump(bitvectors, outfile, indent=2, cls=NumpyEncoder)

    initializeGraph(path)


def vectorizeRole(data, filename):

    chunks = extractRoleChunks(data)

    rel, fullrel = generateRelationMatrices(chunks)
    bitvectors = {
        'relations':rel,
        'markings': generateInitialMarkings(chunks)

    }
    path = filename+'.json'
    with open(path, 'w') as outfile:
        json.dump(bitvectors, outfile, indent=2, cls=NumpyEncoder)

    initializeGraph(path)
