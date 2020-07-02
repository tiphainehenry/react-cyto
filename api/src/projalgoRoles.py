import os
import pathlib
import argparse
import sys

from src.utils.formatting import cleanName, getFileName, groupItems
from src.utils.chunking import extractChunks, getLinkages
from src.utils.vectorization import vectorizeRole
from src.utils.graphDataTranslator import generateGraph


def getChoreographyDetails(role, event):
    src= event.split('src=')[1].split('tgt=')[0].strip()
    tgts= ' '.join(event.split('tgt=')[1:]).replace(']','').replace('tgt=', ',').replace('  ', ',').strip()
    task=event.split('[')[1].split('src=')[0].strip()
    eventName=event.split('[')[0].strip().replace('"','').replace(' ','')

    return eventName, task, src, tgts


def getRoleEvents(role, events, internalEvents):
    projEvents = ["## Event Declaration ##"]
    projRefs = []

    for line in events:

        if role in line:
            eventName, task, src, tgts = getChoreographyDetails(role, line)
            newEvent = line        
            if src == role:
                newEvent = eventName+'s["!('+ str(task) +', '+ str(src) + '-&gt;'+str(tgts)+')"]'
                projRefs.append(eventName+'s')  

            elif role in tgts:
                newEvent = eventName+'r["?('+ str(task) +', '+ str(src) + '-&gt;'+role+')"]'
                projRefs.append(eventName+'r')  
            else:
                projRefs.append(line)

            projEvents.append(newEvent)

    for line in internalEvents:
        if role in line:
            projEvents.append(line.strip())   

            name = line.split("[")[0].strip()
            projRefs.append(name)

    #projGrouping = groupItems(role, projRefs)
    return projEvents, projRefs


def filterOnRoles(linkages, projRefs):
        # filter on events
        roleLinkages = []
        for line in linkages:
            event1 = line.split()[0].strip()
            event2 = line.split()[2].strip()
            
            if (event1 in projRefs) and (event2 in projRefs):
                roleLinkages.append(line)
            else:
                pass
                
        if len(roleLinkages)==0:
            roleLinkages = ["#--> None Matching - Manual implementation required"]

        return ["\n## Linkages ##"] + roleLinkages #+ ["\n## WrongLinks ##"] + wrongLinks

def addExternalEvents(roleIds, chunks, choreoEventsProj):    
    externalIds = []
    externalLinkages = []
    for line in chunks['linkages']:
        event1 = line.split()[0].strip()
        event2 = line.split()[2].strip()

        if (event1 in roleIds) and (event2 not in roleIds):
            if (event2 not in externalIds):
                externalIds.append(event2)
            externalLinkages.append(line)
        elif (event2 in roleIds) and (event1 not in roleIds):
            if (event2 not in externalIds):
                externalIds.append(event1)
            externalLinkages.append(line)

    _externalIds = []
    for elem in externalIds:
        if elem not in _externalIds:
            _externalIds.append(elem)
    externalIds = _externalIds

    externalEvents = []
    for elem in chunks['internalEvents'] + chunks['events']:
        toTest = elem.split('[')[0].strip() 
        for _id in externalIds:
            if toTest in _id:
                externalEvents.append(elem)

    #update externalLinkages:   ## issue here: shouldn't send back e10s
    _externalLinkages = []
    for link in externalLinkages:
        event1 = link.split()[0].strip()
        event2 = link.split()[2].strip()
        if event1 in externalIds:
            for elem in chunks['internalEvents'] + chunks['events']:
                toTest = elem.split('[')[0].strip() 
                if toTest in event1:
                    newLink = toTest + ' ' + link.split()[1] + ' ' + event2   
                    _externalLinkages.append(newLink)
        else: # event2 in externalIds:
            for elem in chunks['internalEvents'] + chunks['events']:
                toTest = elem.split('[')[0].strip() 
                if toTest in event2:
                    newLink = event1 + ' ' + link.split()[1] + ' ' + toTest    
                    _externalLinkages.append(newLink.strip())
    externalLinkages = _externalLinkages
    
    return externalIds, externalEvents, externalLinkages

def generateRoleProjection(chunks, role, choreoEventsProj):
    # get simple role projection
    projEvents, projRefs = getRoleEvents(role, chunks['events'], chunks['internalEvents']) ## 

    rawLinkages = getLinkages(projRefs, chunks['linkages']) 
    updatedLinkages = filterOnRoles(rawLinkages, projRefs) ## checked

    # apply composition algo
    externalIds, externalEvents, externalLinkages = addExternalEvents(projRefs, chunks, choreoEventsProj)

    # Merge projection items
    tasks = projRefs + externalIds
    events = projEvents + externalEvents
    linkages = updatedLinkages + externalLinkages

    #linkages = updatedLinkages 

    projGrouping = groupItems(role, tasks)
    projection = ["##### Projection over role [" + role + "] #######"] + events + projGrouping + linkages 

    return projection, externalIds


def projRoles(data, target, role):
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

    projection, externalIds = generateRoleProjection(chunks.copy(), role, choreoEventsProj.copy())            
    generateGraph(projection, externalIds, target, role)
    vectorizeRole(projection, os.path.join(target,"vect"+role))

    print('[INFO] Projection of role '+role+' generated')

