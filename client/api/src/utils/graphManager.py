import os
import json
import glob


def retrieveMarkingOnId(markings, elem):
    id = elem['data']['id']
    for item in markings:
        if item['id'] == id:
            return item
    else:
        return []

def retrieveMarkingOnName(markings, activity_name):
    for elem in markings:
        if elem['id'] == activity_name:
            return elem
    return False

def initializeGraph(filename):
    with open(filename) as json_data:
        data = json.load(json_data)    
    markings = data['markings'] 

    dataFilename = filename.replace('vect','data')
    with open(dataFilename) as json_data:
        dataProj = json.load(json_data)

    updProj = []
    for elem in dataProj:
        if elem['group'] == 'nodes':
            #filter out external events
            if (('classes' not in elem.keys()) or ('external' not in elem['classes'])):
                elemMarking =retrieveMarkingOnId(markings, elem)

                if elemMarking['include'] == 1:
                    elem.update({'classes': 'included executable'})
                
        updProj.append(elem)

    with open(os.path.join(dataFilename), 'w') as outfile:
        json.dump(updProj, outfile, indent=2)

def retrieveActivityRelations(relations, activity_id, dataProj):
    conditions = relations['condition']
    milestones = relations['milestone']
    responses = relations['response']
    excludes = relations['exclude']
    includes = relations['include']

    fromCondition = []
    cnt = 0
    for conditionFrom in conditions:
        if conditionFrom[activity_id] == 1:
            fromCondition.append({
                'vectid':cnt,
                'projid':dataProj[cnt]['data']['id']})
        cnt = cnt + 1

    fromMilestone = []
    cnt = 0
    for milestoneFrom in milestones:
        if milestoneFrom[activity_id] == 1:
            fromMilestone.append({
                'vectid':cnt,
                'projid':dataProj[cnt]['data']['id']})
        cnt = cnt + 1
    
    toInclude = []
    cnt = 0
    for to_include in includes[activity_id]:
        if to_include == 1:
            toInclude.append({
                'vectid':cnt,
                'projid':dataProj[cnt]['data']['id']})
        cnt = cnt + 1

    toExclude = []
    cnt = 0
    for to_exclude in excludes[activity_id]:
        if to_exclude == 1:
            toExclude.append({
                'vectid':cnt,
                'projid':dataProj[cnt]['data']['id']})
        cnt = cnt + 1

    toRespond = []
    cnt = 0
    for to_resp in responses[activity_id]:
        if to_resp == 1:
            toRespond.append({
                'vectid':cnt,
                'projid':dataProj[cnt]['data']['id']})
        cnt = cnt + 1

    """print('Conditions:')
    print(fromCondition)
    print('Milestones:')
    print(fromMilestone)
    print('Include:')
    print(toInclude)
    print('Exclude:')
    print(toExclude)
    print('Responses:')
    print(toRespond)"""

    return fromCondition, fromMilestone, toInclude, toExclude, toRespond

def preExecCheck(fromCondition, fromMilestone, markings):
    ## if conditions not empty: get markings of conditions --> if not executed yet and included: error
    if (len(fromCondition)!=0):
        for elem in fromCondition:
            if (retrieveMarkingOnName(markings, elem['projid'])['executed'] == 0) and (retrieveMarkingOnName(markings, elem)['include'] == 1):
                print('[INFO] error - elem condition not executed')
                return False

    ## if milestones not empty --> similar behavior
    if (len(fromMilestone)!=0):
        for elem in fromMilestone:
            if (retrieveMarkingOnName(markings, elem['projid'])['executed'] == 0) and (retrieveMarkingOnName(markings, elem)['include'] == 1):
                print('[INFO] error - elem milestone not executed')
                return False

    return True

def postExecManager(toInclude, toExclude, toRespond, markings):

    if(len(toInclude)!=0):
        for elem in toInclude:
            retrieveMarkingOnName(markings, elem['projid'])['include'] = 1

    if(len(toExclude)!=0):
        for elem in toExclude:
            retrieveMarkingOnName(markings, elem['projid'])['include'] = 0

    if(len(toRespond)!=0):
        for elem in toRespond:
            retrieveMarkingOnName(markings, elem['projid'])['pending'] = 1
            retrieveMarkingOnName(markings, elem['projid'])['include'] = 1    
    return markings

def updCytoData(dataProj, markings):
    for elem in dataProj: 
        if(elem['group']=='nodes'):
            if ('classes' in elem.keys()) and ('external' in elem['classes']):
                pass
            else:
                classes = []
                if retrieveMarkingOnId(markings, elem)['include'] == 1:
                    classes.append('included')
                if retrieveMarkingOnId(markings, elem)['executed'] == 1:
                    classes.append('executed')
                if retrieveMarkingOnId(markings, elem)['pending'] == 1:
                    classes.append('pending executable')

                elem.update({'classes': ' '.join(classes)})

    return dataProj

def executeNode(data):
    projId = data['projId']
    activity_name = data['idClicked']

    # check if not a receive choreography event:
    if (activity_name[0] == 'e') and (activity_name[1].isdigit()) and (activity_name[-1]=='r'):
        return 'rejected - receive choreography event'

    status = 'waiting'
    # retrieve activity data
    
    pData = glob.glob('./src/projections/data'+projId+'*')[0]
    pVect = glob.glob('./src/projections/vect'+projId+'*')[0]
    with open(pData) as json_data:
        dataProj = json.load(json_data)
    with open(pVect) as json_data:
        dataVect = json.load(json_data)

    # check if not external event
    activity_id = 0
    while(dataProj[activity_id]['data']['id'] != activity_name):
        activity_id = activity_id+1
    if 'external' in dataProj[activity_id]['classes']:
        return 'rejected - external event'

    # retrieve markings activity_name and check inclusion:
    markings= dataVect['markings']
    activity_marking = retrieveMarkingOnName(markings, activity_name)
    if activity_marking['include'] != 1:
        print('[INFO] error - elem not included')
        return 'rejected - not included'

    # if ('classes' not in dataProj[activity_id]) or ('included' not in dataProj[activity_id]['classes']):
        # print('[INFO] error - elem not included')
        # return 'throw error - not included'

    else:
        print('[INFO] success - elem included')
        # retrieve activity relations (conditions, milestones, included, excluded, response)
        relations = dataVect['relations'][0]
        fromCondition, fromMilestone, toInclude, toExclude, toRespond = retrieveActivityRelations(relations, 
        activity_id, dataProj)

        # pre_execution evaluation
        status = preExecCheck(fromCondition, fromMilestone, markings)
        if not status : 
            return 'throw error - prexec conditions not executed'

        # retrieve semiinternal events
        with open('./src/resources/externalEvents.json') as json_data:
            externalEvents = json.load(json_data)

        # execution
        semiInterEvents = [elem['name'] for elem in externalEvents]

        if (activity_name[0] == 'e') and (activity_name[1].isdigit()) and (activity_name[-1]=='s'):
            ### execute choreography onChain
            return 'BC choreography - not implemented yet'

        elif activity_name in semiInterEvents:
            ### execute event onChain
            return 'BC semi internal - not implemented yet'

        else: ### local update
            # Update markings:
            activity_marking['executed'] = 1
            activity_marking['pending'] = 0

            # post_execution evaluation  --> upd markings included, excluded, response
            markings = postExecManager(toInclude, toExclude, toRespond, markings)

            ## rewrite vectData
            with open(pVect, 'w') as outfile:
                json.dump(dataVect, outfile, indent=2)

            ## update projData classes and rewrite
            updProj = updCytoData(dataProj, markings)
            with open(pData, 'w') as outfile:
                json.dump(updProj, outfile, indent=2)

            return 'executed' ## append status to execlog (?)

