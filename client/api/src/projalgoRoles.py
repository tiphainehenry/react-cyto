import os
import pathlib
import argparse
import sys
import json 
import numpy as np

from src.utils.formatting import cleanName, getFileName, groupItems, getRoleTenant, getSender, getReceiver, getRole, getArrowLink, getChoreographyDetails, getType, getRoleList,generateDictEvent,generateDictRelation
from src.utils.chunking import extractChunks, getLinkages,applyComposition, reagregateGraph, getRoles, getRoleMapping
from src.utils.vectorization import vectorizeRole
from src.utils.graphDataTranslator import generateGraph



def getRoleEvents(role, choreoEvents, internalEvents):
    projEvents = ["## Event Declaration ##"]
    projRefs = []

    for elem in choreoEvents:
        eventName, task, src, tgts = getChoreographyDetails(role, elem)

        involvedTenants = [str(src)]
        if(' ' in tgts):
            tgts = tgts.split(' ')
            involvedTenants=involvedTenants+tgts
        else:
            involvedTenants.append(tgts)

        if role in involvedTenants:
                newEvent = elem        
                if src == role:
                    newEvent = eventName+'s["!('+ str(task) +', '+ str(src) + '-&gt;'+str(tgts)+')"]'
                    projRefs.append(eventName+'s')  
                elif role in tgts:
                    newEvent = eventName+'r["?('+ str(task) +', '+ str(src) + '-&gt;'+role+')"]'
                    projRefs.append(eventName+'r')  
                else:
                    projRefs.append(elem)

                projEvents.append(newEvent)

    for line in internalEvents:
        if role == getRoleTenant(line):
            projEvents.append(line.strip())   
            projRefs.append(getRole(line))

    #projGrouping = groupItems(role, projRefs)
    return projEvents, projRefs


def filterOnRoles(linkages, projRefs):
    # filter on events
    roleLinkages = []
    for line in linkages:
        if (getSender(line) in projRefs) and (getReceiver(line) in projRefs):
            roleLinkages.append(line)
                
    if len(roleLinkages)==0:
        roleLinkages = ["#--> None Matching - Manual implementation required"]

    return ["\n## Linkages ##"] + roleLinkages #+ ["\n## WrongLinks ##"] + wrongLinks


def generateRoleProjection(chunks, role, choreoEventsProj, filename):

    # get simple role projection
    projEvents, projRefs = getRoleEvents(role, chunks['events'], chunks['internalEvents']) ## 

    rawLinkages = getLinkages(projRefs, chunks['linkages']) 
    updatedLinkages = filterOnRoles(rawLinkages, projRefs) ## checked

    # apply composition algo
    externalIds, externalEvents, externalLinkages = applyComposition(projRefs, updatedLinkages, chunks, choreoEventsProj)

    # Merge projection items
    tasks = projRefs + externalIds
    events = projEvents + externalEvents
    linkages = updatedLinkages + externalLinkages

    # reagregate graph if needed
    #events, linkages = reagregateGraph(events, linkages,chunks['linkages'])

    #linkages = updatedLinkages 
    projGrouping = groupItems(role, tasks)
    projection = ["##### Projection over role [" + role + "] #######"] + events + projGrouping + linkages 

    #generate dict
    Pev=generateDictEvent(projEvents)
    Eev=generateDictEvent(externalEvents)
    relations=generateDictRelation(linkages)

       
    with open(filename) as json_file:
        data = json.load(json_file)
        
    role_id=getRoleMapping(role)['id']
    data[role_id]={
            'role':role,
            'privateEvents':Pev,
            'externalEvents':Eev,
            'relations':relations
        }


    extDict=data['externalEvents']
    extDictElems=[elem['event'] for elem in extDict]

    for elem in Eev:
        if elem['event'] not in extDictElems:
            extDict.append(elem)
    data['externalEvents']=extDict

    with open(filename, 'w') as outfile:
            json.dump(data, outfile)
    return projection, externalIds


def projRole(data, target, role):
    chunks, roles = extractChunks(data)

    choreoEventsProj = []
    for line in chunks['events']:
        eventName, task, src, tgts = getChoreographyDetails(role, line)         
        if src == role:
            newEvent = eventName+'s["!('+ str(task) +', '+ str(src) + '-&gt;'+str(tgts)+')"]'
            choreoEventsProj.append(newEvent)
        elif role in tgts:
            newEvent = eventName+'r["?('+ str(task) +', '+ str(src) + '-&gt;'+role+')"]'
            choreoEventsProj.append(newEvent)
        else:
            pass

    roleMapping=getRoleMapping(role)
    projection, externalIds = generateRoleProjection(chunks, role, choreoEventsProj, os.path.join(target,"dcrTexts.json"))            
    generateGraph(projection, externalIds, target, role)
    vectorizeRole(projection, os.path.join(target,"vect"+roleMapping['id']))

    print('[INFO] Projection of role '+role+' generated')

