import os
import pathlib
import argparse
import sys

from utils.formatting import cleanName, getFileName, groupItems
from utils.chunking import extractChunks, getLinkages
from utils.vectorization import vectorize
from utils.graphDataTranslator import generateGraph


def getChoreographyDetails(role, event):
    targets = []
    task = []
    source = ''
    for elem in event.split(' '):
        if 'src' in elem:
            source=elem.replace('src=', '')
        elif 'tgt' in elem:
            targets.append(elem.replace('tgt=', '').replace(']','').strip())
        elif '"' in elem:
            task.append(elem.replace('"', ''))
    
    eventName, task = cleanName(task)
    
#    print("eventName --> " + eventName)
#    print("src       --> "+ source)
#    print("targets   --> "+ str(targets))
#    print("task      --> "+ str(cleanedTsk))

    return eventName, task, source, targets


def getRoleEvents(role, events, internalEvents):
    projEvents = ["## Event Declaration ##"]
    projRefs = []

    for line in events:
        if role in line:
            eventName, task, src, tgts = getChoreographyDetails(role, line)         
            if src == role:
                newEvent = eventName+'s["!('+ str(task) +', '+ str(src) + '-&gt;'+str(','.join(tgts))+')"]'
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


    projGrouping = groupItems(role, projRefs)

    return projEvents + projGrouping, projRefs


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
            externalIds.append(event2)
            externalLinkages.append(line)
        elif (event2 in roleIds) and (event1 not in roleIds):
            externalIds.append(event1)
            externalLinkages.append(line)

    externalEvents = []
    for _id in externalIds:
        for elem in chunks['internalEvents']:
            if _id == elem.split('[')[0].replace(' ', '').strip():
                externalEvents.append(elem)
        for elem in chunks['events']:
            if _id == elem.split('[')[0].replace(' ', '').strip():
                externalEvents.append(elem)
        for elem in choreoEventsProj:
            if _id == elem.split('[')[0].replace(' ', '').strip():
                externalEvents.append(elem)

    return externalIds, externalEvents, externalLinkages

def generateRoleProjection(chunks, role, choreoEventsProj):
    # get role projection
    projEvents, projRefs = getRoleEvents(role, chunks['events'], chunks['internalEvents'])
    rawLinkages = getLinkages(projRefs, chunks['linkages'])
    updatedLinkages = filterOnRoles(rawLinkages, projRefs)

    # Look for external events
    externalIds, externalEvents, externalLinkages = addExternalEvents(projRefs, chunks, choreoEventsProj)

    # Merge projection items
    tasks = projRefs + externalIds
    events = projEvents + externalEvents
    linkages = updatedLinkages + externalLinkages

    projGrouping = groupItems(role, tasks)
    projection = ["##### Projection over role [" + role + "] #######"] + events + projGrouping + linkages 

    # Save Proj text
    #projPath = os.path.join(projDir, "projection"+role+".txt")
    #f= open(projPath,"w+")
    #for i in range(len(projection)):
    #    f.write(projection[i]+'\n')
    #f.close()

    return projection, externalIds


def projRoles(data, target):
    #filename = getFileName()
    #file = open(os.path.join(filename), 'r')
    #data = file.readlines()
    #file.close()

    #projectPath = pathlib.Path(filename).parent.absolute().parent.absolute()
    #projDir = os.path.join(projectPath, 'projection_'+filename.split('/')[-1]).replace(os.sep, '/')

    #if not (os.path.exists(projDir)):
    #   os.mkdir(projDir)
    #    print('[INFO] Folder Created at ' + str(projDir))
    chunks, roles = extractChunks(data)

    choreoEventsProj = []
    for role in roles:
        for line in chunks['events']:
                eventName, task, src, tgts = getChoreographyDetails(role, line)         
                if src == role:
                    newEvent = eventName+'s["!('+ str(task) +', '+ str(src) + '-&gt;'+str(','.join(tgts))+')"]'
                    choreoEventsProj.append(newEvent)
                elif role in tgts:
                    newEvent = eventName+'r["?('+ str(task) +', '+ str(src) + '-&gt;'+role+')"]'
                    choreoEventsProj.append(newEvent)
                else:
                    pass

    for role in roles:
        # generate projection
        projection, externalIds = generateRoleProjection(chunks.copy(), role, choreoEventsProj)
        
        generateGraph(projection, externalIds, target, role)

        # generate vectorization
        #file = open(projPath, 'r')    
        #projectionData = file.readlines()
        #file.close()
        #vectorize(projectionData, projPath)

        print('[INFO] Projection of role '+role+' generated')
 

#if __name__ == "__main__":
#    main()