import json

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
            hasFirst = False
            hasLast = False

            for link in linkages:
                if elem in link.split()[0]:
                    hasLast = True
                elif elem in link.split()[-1]:
                    hasFirst = True

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
                    duplicatedRelation = firstRelation + ' ' + ' '.join(chunks[1:])
                else: # groupName == chunks[-1].strip():
                    duplicatedRelation = ' '.join(chunks[:-1]) + ' ' + lastRelation
                linkages.append(duplicatedRelation)
            else:
                pass
            
    return linkages


def extractChunks(data):
    events, internalEvents = [], []
    groupings, linkages = [], []
    roles = []
    #misc = []

    for line in data:
        if (line[0] == 'e') and ((line[2] == '[') or (line[3]== '[')): 
            lineclean = line.replace('= ', '=').replace(' =', '=').replace(' = ', '=')
            events.append(lineclean)
            for elem in line.split(' '):
                if ('src' in elem) or ('tgt' in elem):
                    elemclean = elem.strip().replace('tgt=', '').replace('src=', '').replace(']', '')
                    if elemclean != '' and (elemclean not in roles):
                        roles.append(elemclean)
        elif 'Group' in line and line[0] != '#':
            groupings.append(line)
        elif '->' in line:
            linkages.append(line.strip())
        elif ('role=' in line) and ('#' not in elem):
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


def body(eventElems, num_task):
    body = {
                'data': { 
                            'id': eventElems['id'], 
                            'name':eventElems['from']+'\n'+
                                   eventElems['task']+'\n'+
                                   eventElems['to']
                        },
                'position': { "x": num_task*100, "y": 100},
                'group': "nodes"
    }
    return body


def getEventElems(event):

    if 'src' in event:  ## to deal with
        src= event.split('[')[0].strip()
        tgt= event.split('[')[1]
        tsk= event

    elif ('!' in event) or ('?' in event):
        # done for -&gt;
        _id = event.split('[')[0]
        src= event.split(',')[1].split('-')[0].strip()
        tgt= event.split(';')[1].split(')')[0].strip()
        tsk= event.split('[')[1].split('(')[1].split(',')[0].strip()

        elems = {
            'id':  _id,
            'from':src,
            'to':  tgt,
            'task':tsk
        }
    else: ## internal tasks, to deal with !
        pass
    return elems

def cytoTasks(events):
    cTasks = []

    num_task=0
    for event in events:
        eventElems = getEventElems(event)
        if ('src' in event) or ('!' in event) or ('?' in event): #choreo
            cTasks.append(body(eventElems, num_task))

        else: ## internal task -- to do
            pass
        num_task = num_task+1
#    print(cTasks)
    return cTasks

def cytoEdges(edges):
    cEdges = []
    for relation in edges:
        elems = getRelationElems(relation)

        cEdges.append(
            {
                'data': { 
                    'id': elems['r_from'] + '_' + elems['r_to'] + '_' + elems['r_type'], 
                    'source': elems['r_from'], 
                    'target': elems['r_to'],
                },
                'group': "edges",
                'classes': elems['r_type']
          }  
        ) 

    return cEdges

def main():
    # load choreography file 

    # filename = getFileName()
    file = open('projection_toyExample/projectionCustomer.txt', 'r')
    data = file.readlines()
    file.close()

    # chunk events
    chunks, roles = extractChunks(data)

    # generate tasks and relations
    cTasks = cytoTasks(chunks['events'])
    cEdges = cytoEdges(chunks['linkages'])

    cData = cTasks + cEdges

    #with open('src/components/tasks.json', 'w') as outfile:
    #    json.dump(cTasks, outfile, indent=2)

    #with open('src/components/edges.json', 'w') as outfile:
    #    json.dump(cEdges, outfile, indent=2)

    # json dumps
    with open('src/cytograph/data.json', 'w') as outfile:
        json.dump(cData, outfile, indent=2)

    # open template
    # replace ** tasks ** by cTasks
    # replace ** edges ** by cEdges
    # clean file (replace 'data' by data, 'id' by id, 'classes' by classes, 'group' by group, target, source, parent, type)

if __name__ == "__main__":
    main()

