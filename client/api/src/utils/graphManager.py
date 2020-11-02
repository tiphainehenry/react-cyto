import os
import json
import glob
from datetime import datetime
from src.utils.chunking import getRoleMapping

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

    toCondition =[]
    cnt = 0
    for elem in conditions[activity_id]:
        if elem == 1:
            toCondition.append({
                'vectid':cnt,
                'projid':dataProj[cnt]['data']['id']})

        cnt=cnt+1

    fromCondition = []
    cnt = 0
    for conditionFrom in conditions:
        print(conditionFrom)
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
                'projid':dataProj[cnt]['data']['id'].replace("u'","").replace("'","")})
        cnt = cnt + 1

    toRespond = []
    cnt = 0
    for to_resp in responses[activity_id]:
        if to_resp == 1:
            toRespond.append({
                'vectid':cnt,
                'projid':dataProj[cnt]['data']['id']})
        cnt = cnt + 1

    """
    print('From Conditions:')
    print(fromCondition)
    print('To Conditions:')
    print(toCondition)
    print('Milestones:')
    print(fromMilestone)
    print('Include:')
    print(toInclude)
    print('Exclude:')
    print(toExclude)
    print('Responses:')
    print(toRespond)
    """
    return toCondition, fromCondition, fromMilestone, toInclude, toExclude, toRespond

def preExecCheck(fromCondition, fromMilestone, markings):
    ## if conditions not empty: get markings of conditions --> if not executed yet and included: error
    if (len(fromCondition)!=0):
        for elem in fromCondition:
            print(fromCondition)
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

def postExecManager(toCondition, toInclude, toExclude, toRespond, markings):

    if(len(toInclude)!=0):
        for elem in toInclude:
            retrieveMarkingOnName(markings, elem['projid'])['include'] = 1

    if(len(toCondition)!=0):
        for elem in toCondition:
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
                    classes.append('included  executable')
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

    roleMapping=getRoleMapping(projId)
    pData = glob.glob('./client/src/projections/data'+roleMapping['id']+'.json')[0]
    #pData = glob.glob('./src/projections/data'+projId+'*')[0]

    pVect = glob.glob('./client/src/projections/vect'+roleMapping['id']+'.json')[0]
    #pVect = glob.glob('./src/projections/vect'+projId+'*')[0]

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


    else:
        print('[INFO] success - elem included')
        # retrieve activity relations (conditions, milestones, included, excluded, response)
        relations = dataVect['relations'][0]
        toCondition, fromCondition, fromMilestone, toInclude, toExclude, toRespond = retrieveActivityRelations(relations, 
        activity_id, dataProj)

        # pre_execution evaluation
        status = preExecCheck(fromCondition, fromMilestone, markings)
        if not status : 
            return 'throw error - prexec conditions not executed'

        # retrieve semiinternal events
        with open('./client/src/projections/vectPublic.json') as json_data:
            publicInfos = json.load(json_data)
        publicEvents=publicInfos['activityNames']['default'] +publicInfos['activityNames']['send']+publicInfos['activityNames']['receive']


        # execution
        #semiInterEvents = [elem['event'] for elem in externalEvents]

        #if (activity_name[0] == 'e') and (activity_name[1].isdigit()) and (activity_name[-1]=='s'):
            ### execute choreography onChain
        #    return 'BC choreography'
        if activity_name in publicEvents:
            ### execute event onChain
            return 'BC exec'

        else: ### local update
            # Update markings:
            activity_marking['executed'] = 1
            activity_marking['pending'] = 0

            # post_execution evaluation  --> upd markings included, excluded, response
            markings = postExecManager(toCondition, toInclude, toExclude, toRespond, markings)

            ## rewrite vectData
            with open(pVect, 'w') as outfile:
                json.dump(dataVect, outfile, indent=2)

            ## update projData classes and rewrite
            updProj = updCytoData(dataProj, markings)
            with open(pData, 'w') as outfile:
                json.dump(updProj, outfile, indent=2)

            return 'executed' ## append status to execlog (?)

def executeApprovedNode(pathname, activity_name):
    ### 1.1 update marking to true
    ### 1.2 apply post exec function

    # retrieve activity data
    pData = pathname
    pVect = pathname.replace('data','vect')

    with open(pData) as json_data:
        dataProj = json.load(json_data)
    with open(pVect) as json_data:
        dataVect = json.load(json_data)

    # retrieve markings activity_name:
    markings= dataVect['markings']
    activity_marking = retrieveMarkingOnName(markings, activity_name)

    # retrieve activity relations (conditions, milestones, included, excluded, response)
    activity_id = 0
    while((dataProj[activity_id]['data']['id'] != activity_name) and (activity_id<len(dataProj))):
        activity_id = activity_id+1
        if activity_id == len(dataProj):
            return 'activity not found' ## append status to execlog (?)

    relations = dataVect['relations'][0]
    toCondition, fromCondition, fromMilestone, toInclude, toExclude, toRespond = retrieveActivityRelations(relations, 
        activity_id, dataProj)

    # execution
    # Update markings:
    activity_marking['executed'] = 1
    activity_marking['pending'] = 0

    # post_execution evaluation  --> upd markings included, excluded, response
    markings = postExecManager(toCondition, toInclude, toExclude, toRespond, markings)

    ## rewrite vectData
    with open(pVect, 'w') as outfile:
        json.dump(dataVect, outfile, indent=2)

    ## update projData classes and rewrite
    updProj = updCytoData(dataProj, markings)
    with open(pData, 'w') as outfile:
        json.dump(updProj, outfile, indent=2)

    return 'executed' ## append status to execlog (?)


def execLogg(pExec, activity_name, status, start_timestamp, data):
    with open(pExec) as json_file:
        try:
            execData = json.load(json_file)
        except JSONDecodeError:
            execData = {'execLogs':[]}

    now = datetime.now()
    date_time = now.strftime("%m/%d/%Y, %H:%M:%S")    

    id = len(execData['execLogs'])
    execData['execLogs'].append({
            'id':id,
            'task':activity_name,
            'status':status,
            'timestamp_startTask':start_timestamp,
            'timestamp_endTask':date_time,
            'data':data
        })

    with open(pExec, 'w') as outfile:
        json.dump(execData, outfile, indent=2)



