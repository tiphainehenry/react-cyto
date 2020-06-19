import os
import pathlib
import argparse
import sys

from utils.formatting import cleanName, getFileName, groupItems
from utils.chunking import extractChunks, getLinkages
from utils.vectorization import vectorize

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



def generateRoleProjection(chunks, role, projDir):
    projEvents, projRefs = getRoleEvents(role, chunks['events'], chunks['internalEvents'])

    rawLinkages = getLinkages(projRefs, chunks['linkages'])
    updatedLinkages = filterOnRoles(rawLinkages, projRefs)

    projection = ["##### Projection over role [" + role + "] #######"] + projEvents + updatedLinkages

    # Save Proj text
    projPath = os.path.join(projDir, "projection"+role+".txt")
    f= open(projPath,"w+")
    for i in range(len(projection)):
        f.write(projection[i]+'\n')
    f.close()

    return projPath


def main():
    filename = getFileName()
    file = open(os.path.join(filename), 'r')
    data = file.readlines()
    file.close()

    projectPath = pathlib.Path(filename).parent.absolute().parent.absolute()
    projDir = os.path.join(projectPath, 'projection_'+filename.split('/')[-1]).replace(os.sep, '/')

    if not (os.path.exists(projDir)):
        os.mkdir(projDir)
        print('[INFO] Folder Created at ' + str(projDir))
    chunks, roles = extractChunks(data)

    for role in roles:
        # generate projection
        projPath = generateRoleProjection(chunks.copy(), role, projDir)
        # generate vectorization
        file = open(projPath, 'r')    
        projectionData = file.readlines()
        file.close()
        vectorize(projectionData, projPath)

        print('[INFO] Projection of role '+role+' generated')
 

if __name__ == "__main__":
    main()