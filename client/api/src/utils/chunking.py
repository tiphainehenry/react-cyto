from src.utils.formatting import cleanName, getFileName, groupItems, getRoleTenant, getSender, getReceiver, getRole, getArrowLink, getChoreographyDetails, getType, getRoleList,generateDictEvent,generateDictRelation
import numpy as np
import json

#### RETRIEVING FUNCTIONS 


def extractGroupRelations(groupings, linkages):
    #clean list
    count = 0
    for line in linkages: 
        spl = line.split()
        if len(spl) > 3:
            if '"' in spl[0] and spl[1]:
                newLine=spl[0]+spl[1] + ' '+' '.join(spl[2:])
                linkages[count] = newLine.replace('"', '')
                
            if '"' in spl[-1] and spl[-2]:
                newLine=' '.join(spl[0:2]) + ' ' + spl[-2]+spl[-1] 
                linkages[count] = newLine.replace('"', '')
        count = count +1

    cleaned_linkages = linkages
    # verify if group expends on several lines: create grouping dict
    for group in groupings:

        # extract group name
        groupName = group.split('Group')[1].split('{')[0].strip().replace(' ', '').replace('"', '')
        # extract relations included in grouping
        groupRelations = group.split('Group')[1].split('{')[1].replace('}', '').split()        
        #clean group
        cnt=0
        for elem in groupRelations:
            if (groupRelations[cnt][0] == '"') and (groupRelations[cnt+1][-1]=='"'):
                groupRelations[cnt]=groupRelations[cnt]+groupRelations[cnt+1]
                groupRelations.remove(groupRelations[cnt+1])
            cnt = cnt+1

        # extract relations to duplicate
        toDuplicate = []
        for link in linkages:
            if (groupName in link) and ('-' in link):
                toDuplicate.append(link)
        # extract first and last relations of grouping (ie 'no from' or 'no to' task)
        firstRelation = None
        lastRelation = None
        for elem in groupRelations:
            #print('elem:'+ elem)
            hasFirst = False
            hasLast = False

            for link in linkages:
                #print(link)
                if elem in link.split()[0]:
                    hasLast = True
                    #print('has last')
                elif elem in link.split()[-1]:
                    hasFirst = True
                    #print('has first')

            if not hasFirst:
                firstRelation=elem
            elif not hasLast:
                lastRelation=elem
            else:
                pass

        # regenerate relations according to the type 
        for relation in toDuplicate:
            chunks = relation.split()
            if groupName in chunks:
                if groupName == chunks[0].strip():
                    for elem in groupRelations:
                        #duplicatedRelation = firstRelation + ' ' + ' '.join(chunks[1:])
                        duplicatedRelation =  elem + ' ' + ' '.join(chunks[1:])
                        linkages.append(duplicatedRelation) 
                else: # groupName == chunks[-1].strip():
                    for elem in groupRelations:
                        #duplicatedRelation = firstRelation + ' ' + ' '.join(chunks[1:])
                        duplicatedRelation = ' '.join(chunks[:-1]) + ' ' + elem
                        linkages.append(duplicatedRelation) 
            else:
                pass

        # remove former relations with grouping name
        cleaned_linkages = []
        for relation in linkages:
            if groupName not in relation:
                cleaned_linkages.append(relation)

    return cleaned_linkages


def extractChunks(data):
    events, internalEvents = [], []
    groupings, linkages = [], []
    roles = []
    #misc = []

    for line in data:
        if (line[0] !=  '#'):
            if ('src' in line) and ('tgt' in line):
                lineclean = line.replace('= ', '=').replace(' =', '=').replace(' = ', '=')
                events.append(lineclean)
                for elem in line.split(' '):
                    if ('src' in elem) or ('tgt' in elem):
                        elemclean = elem.strip().replace('tgt=', '').replace('src=', '').replace(']', '')
                        if elemclean != '' and (elemclean not in roles):
                            roles.append(elemclean)
            elif ('-' in line) and ('>' in line):
                linkages.append(line.strip())
            elif ('role=' in line):
                nameChunk = line.split()
                role = nameChunk.pop()
                name=''.join(nameChunk).replace('"', '')
                cleanedInternalEvent = name+' '+ role
                internalEvents.append(cleanedInternalEvent)
            else:
                pass
                #misc.append(line)
            
            for i in range(0, len(linkages)):
                if (linkages[i][0] == '#'):
                    linkages.remove(linkages[i])

    linkages = extractGroupRelations(groupings, linkages)

    chunks = {
        'events':events,
        'internalEvents':internalEvents,
        'linkages':linkages,
    }

    return chunks, roles


def extractRoleChunks(data):
    events, internalEvents = [], []
    linkages = []

    for line in data:
        if (line[0] != '#'): 
            if 'role=' in line:
                internalEvents.append(line)
            elif ('src=' in line) or ('tgt=' in line) or ('?(' in line) or ('!(' in line):
                events.append(line)
            elif ('-' in line) and ('>' in line):
                linkages.append(line)
            else:
                pass
            
    chunks = {
        'events':events,
        'internalEvents':internalEvents,
        'linkages':linkages,
    }
    return chunks



def getLinkages(projRefs, linkages):
    for ref in projRefs:
        testRef=ref.replace('s','').replace('r', '')
        count=0
        for line in linkages:
            if testRef in line:
                lineUpd=line.strip().split(' ')
                i=0
                for elem in lineUpd:
                    if (testRef == elem) and elem[0] != '#':
                        lineUpd[i]=ref
                    i = i+1   
                linkages[count] = ' '.join(lineUpd)
            count = count+1
    #print(linkages)   
    return linkages



##### COMPOSITION FUNCTIONS

def transitiveIncludeExclude(rExt, e, l, rGlob):
    if((e==getReceiver(l)) and (getType(l) in ['condition', 'milestone'])):
        for rel in rGlob:
            if((getType(rel) in ['include','exclude']) and (getReceiver(rel)==getSender(l))):
                rExt.append(rel)
    return rExt


def transitiveResponse(rExt, e, l, rGlob):
    if((e==getSender(l)) and(getType(l)=='milestone')):
        for rel in rGlob:
            if ((getType(rel)=='response') and (getSender(rel)==getReceiver(l))):
                rExt.append(rel)
    return rExt


def computeExternalRelations(externalLinkages,externalIds,eGlob):
    _externalLinkages = []
    for link in externalLinkages:
        sender = getSender(link)
        receiver = getReceiver(link)
        arrow_link = getArrowLink(link)

        if sender in externalIds:
            for elem in eGlob:
                toTest = getRole(elem) 
                if toTest in sender:
                    newLink = toTest + ' ' + arrow_link + ' ' + receiver
                    _externalLinkages.append(newLink)
        else: # receiver in externalIds:
            for elem in eGlob:
                toTest = getRole(elem)  
                if toTest in receiver:
                    newLink = sender + ' ' + arrow_link + ' ' + toTest    
                    _externalLinkages.append(newLink.strip())

    return _externalLinkages


def computeExternalEvents(rExt, eProj):
    eExt=[]
    for r in rExt:
        sender = getSender(r)
        receiver = getReceiver(r)

        if ((sender not in eExt) and (sender not in eProj)):
            eExt.append(sender)

        if ((receiver not in eExt) and (receiver not in eProj)):
            eExt.append(receiver)
    return eExt


def retrieveExternalRelations(eProj, rProj, eGlob, rGlob):
    rExt=[]
    for e in eProj:
        for l in rGlob:
            if((l not in rProj) and (e == getReceiver(l))):
                rExt.append(l) # direct relations
                rExt = transitiveIncludeExclude(rExt, e, l, rGlob)
                rExt = transitiveResponse(rExt, e, l, rGlob)

    eExt = computeExternalEvents(rExt, eProj)
    rExt = computeExternalRelations(rExt,eExt,eGlob)

    return eExt, rExt

def getEventDeclarationFromName(names,all_events):
    externalEvents = []
    for elem in all_events:
        for n in names:
            if getRole(elem) in n:
                externalEvents.append(elem)
    return externalEvents


def applyComposition(roleIds, rProj, chunks, choreoEventsProj):    
    externalLinkages = []

    eGlob=chunks['internalEvents'] + chunks['events']
    rGlob=chunks['linkages']

    # retrieve relations
    eProj=roleIds
    eExt, rExt = retrieveExternalRelations(eProj,rProj,eGlob,rGlob)

    # retrieve corresponding events
    externalEvents = getEventDeclarationFromName(eExt,eGlob)        

    return eExt, externalEvents, rExt


    
#### REAGREGATE GRAPH FUNCTION
def countChunks(e,r):
    
    events=getRoleList(e)

    #retrieve number of inputs of each elem. If no input, then elem is a chunk start.
    cntInputs=np.zeros(len(events))
    for event in events:
        for relation in r:
            if(getReceiver(relation)==event):
                cntInputs[events.index(event)]=cntInputs[events.index(event)]+1

    # retrieve chunk starts    
    chunkStarts=[]
    ind=0
    for elem in cntInputs:
        if (int(elem)==0):
            chunkStarts.append(events[ind])
        ind=ind+1

    return (cntInputs == 0).sum(), chunkStarts

def retrieveFollower(elem, r):
    for relation in r:
        if(getSender(relation))==elem:
            return(getReceiver(relation))

    return ''


def retrieveOriginalOrder(starts,rGlob):
    startA=starts[0]
    startB=starts[1]

    a_followers=[]
    # retrieve relation where A starts
    for relation in rGlob:
        if(getSender(relation))==startA:
            neighbour=getReceiver(relation)
            if neighbour==startB:
                return startA,startB
            else:
                a_followers.append(neighbour)
    
    for elem in range(len(rGlob)+1):
        neighbour=retrieveFollower(a_followers[-1],rGlob)
        if neighbour==startB:
            return startA,startB
        else:
            a_followers.append(neighbour)

    # check on the global graph who's first: 
    #whether B is one of the getReceivers of the set of relations where A starts. If not, then it is the other way around
    
    return startB, startA 


def retrieveChunkTail(first,events,relations, rGlob):

    events=getRoleList(events)
    neighbours=[]
    # retrieve relation where A starts
    for relation in relations:
        if(getSender(relation)) in first:
            neighbour=getReceiver(relation)
            if (neighbour not in neighbours):
                neighbours.append(neighbour)

    if (len(neighbours)>0):
        #retrieve following chunk elems
        for elem in range(len(relations)+1):
            neighbour=retrieveFollower(neighbours[-1],relations)
            if( (neighbour != '') and (neighbour not in neighbours)):
                neighbours.append(neighbour)
            
        #retrieve additional routes
        for elem in neighbours:
            cntNext=0
            for relation in relations:
                if (getSender(relation)==elem):
                    cntNext=cntNext+1
                    neighbour=getReceiver(relation)
                    if( (neighbour != '') and (neighbour not in neighbours)):
                        neighbours.append(neighbour)

        cntOutputs=np.zeros(len(neighbours))
        for event in neighbours:
            for relation in relations:
                if(getSender(relation)==event):
                    cntOutputs[neighbours.index(event)]=cntOutputs[neighbours.index(event)]+1

        # retrieve chunk starts    
        chunkTails=[]
        ind=0
        for elem in cntOutputs:
            if (int(elem)==0):
                chunkTails.append(neighbours[ind])
            ind=ind+1


        # remove wrong chunks (ie real outputs)
        real_outputs=[]

        outputs=[]
        for elem in rGlob:
            if (getReceiver(elem) not in outputs):
                outputs.append(getReceiver(elem))
        cntOutputsGlob=np.zeros(len(outputs))
        for event in outputs:
            for relation in rGlob:
                if(getSender(relation)==event):
                    cntOutputsGlob[outputs.index(event)]=cntOutputsGlob[outputs.index(event)]+1
        ind=0
        for elem in cntOutputsGlob:
            if (int(elem)==0):
                real_outputs.append(outputs[ind])
            ind=ind+1

        _chunkTails=[]
        for elem in chunkTails:
            if (elem not in real_outputs):
                _chunkTails.append(elem)

        return (cntOutputs == 0).sum(), _chunkTails

    else:
        return 0, [first]

def reagregateGraph(e,r, rGlob):
    cnt, starts = countChunks(e,r)

    iter=0
    while (cnt >1 and iter<5):
        # do agregation
        first,second=retrieveOriginalOrder(starts,rGlob)

        if (second != starts[0]):
            cntOutputs,tails = retrieveChunkTail(first,e,r, rGlob)
            if (len(tails)!=0):
                relation = tails[0]+' -->* '+second 
                r.append(relation)

        else:
            cntOutputs,tails = retrieveChunkTail(second,e,r, rGlob)
            if (len(tails)!=0):
                relation = tails[0]+' -->* '+first 
                r.append(relation)

        # reevaluate
        cnt,starts = countChunks(e,r)
        iter=iter+1
    return e,r

def getRoles():
    dcrPath='./client/src/projections/dcrTexts.json'
    with open(dcrPath) as json_file:
        dcrs = json.load(json_file)
    roles=[]
    for elem in dcrs['roleMapping']:
        roles.append(elem['role'])
    
    return roles


def getRoleMapping(role):
    dcrPath='./client/src/projections/dcrTexts.json'
    with open(dcrPath) as json_file:
        dcrs = json.load(json_file)
    roleId=''
    for elem in dcrs['roleMapping']:
        if (elem['role']==role):
            return elem
    
    else: 
        return 'err- role not found'

