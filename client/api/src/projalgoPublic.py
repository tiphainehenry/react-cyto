import os
import pathlib
import argparse
import sys
import json 

from src.utils.formatting import cleanName, getFileName, groupItems, generateDictEvent, generateDictRelation, getRole, getRoleList, getSender, getReceiver
from src.utils.chunking import extractChunks, applyComposition, reagregateGraph, getEventDeclarationFromName
from src.utils.vectorization import vectorize
from src.utils.graphDataTranslator import generateGraph

def filterOnChoreo(cNames, linkages):   
    choreoLinkages = []
    for line in linkages:
        event1 = line.split()[0].strip()
        event2 = line.split()[2].strip()

        if (event1 in cNames) and (event2 in cNames):
            choreoLinkages.append(line)
        else:
            pass

    if len(choreoLinkages)==0:
        choreoLinkages = ["#--> No choreography relation retrieved"]

    return ["\n## Linkages ##"] + choreoLinkages #+ ["\n## WrongLinks ##"] + wrongLinks

def addRoleExternals(events, filename):
    with open(filename) as json_file:
        data = json.load(json_file)

    extEvents = [str(elem['event'].strip()) for elem in data['externalEvents']]
    publicEvents=getRoleList(events)
    newExtEvents = []
    for elem in extEvents:
        if elem not in publicEvents:
            newExtEvents.append(elem)

    return newExtEvents

def addExternalEvents(cNames, chunks, filename):    
    externalIds = []
    externalLinkages = []
    for line in chunks['linkages']:
        event1 = line.split()[0].strip()
        event2 = line.split()[2].strip()

        #if (event1 in cNames) and (event2 not in cNames):
        #    externalIds.append(event2)
        #    externalLinkages.append(line)
        if (event2 in cNames) and (event1 not in cNames):  #direct relation
            externalIds.append(event1)
            externalLinkages.append(line)

    externalEvents = []
    for _id in externalIds:
        for elem in chunks['internalEvents']:
            if elem not in externalEvents:
                if _id == elem.split('[')[0].replace(' ', '').strip():
                    externalEvents.append(elem)

    externalEvents=[getEventDeclarationFromName(elem) for elem in externalEvents]

    return externalIds, externalEvents, externalLinkages

def retrieveRelations(events, relations):
    missingRelations=[]
    events=getRoleList(events)
    for relation in relations:
        if ((getSender(relation) in events) and (getReceiver(relation) in events)):
            missingRelations.append(relation)

    return missingRelations

def generatePublicProjection(chunks, filename):
    # Extract choreography events and relations
    cNames = getRoleList(chunks['events'])
    choreoLinkages = filterOnChoreo(cNames, chunks['linkages'])
    # Add role external events to the public projection
    roleExternals = addRoleExternals(cNames, filename) 
    public_events = roleExternals+cNames


    for elem in public_events:
        if('[' not in elem):
            for cEvent in chunks['events']:
                if (getRole(cEvent) == elem):
                    public_events[public_events.index(elem)]=cEvent

    public_relations = retrieveRelations(public_events, chunks['linkages'])
    
    # Look for external events
    externalIds, externalEvents, externalLinkages = addExternalEvents(public_events, chunks, filename)

    # Merge projection items
    tasks = getRoleList(public_events) + externalIds
    events = public_events + externalEvents

    linkages = public_relations + externalLinkages

    projGrouping = groupItems('Public', tasks)
    projection = ["##### Public Projection #######"] + events + projGrouping + linkages

    #generate dict
    privateEvents=generateDictEvent(public_events)
    externalEvents=generateDictEvent(externalEvents)
    relations=generateDictRelation(linkages)

    with open(filename) as json_file:
        data = json.load(json_file)    
    data['public']={
        'privateEvents':privateEvents,
        'externalEvents':externalEvents,
        'relations':relations
    }
        
    with open(filename, 'w') as outfile:
        json.dump(data, outfile)

    return projection, externalIds


def projectPublic(data, target):
    print('[INFO] Starting Public Projection')

    chunks, roles = extractChunks(data)

    # generate choreography projection
    projection, externalIds = generatePublicProjection(chunks.copy(), os.path.join(target,"dcrTexts.json")) 
    generateGraph(projection, externalIds, target, "Public")
    vectorize(projection, os.path.join(target,"vectPublic"))

    # addFullMarkings(os.path.join(target,"vectChoreo"))

    print('[INFO] Public Projection generated')
 
#if __name__ == "__main__":
#    main()