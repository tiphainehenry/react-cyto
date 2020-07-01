import os
import json
import glob

def initializeGraph(filename):
    with open(filename) as json_data:
        data = json.load(json_data)
    
    included = data['markings'][0]['included']   

    dataFilename = filename.replace('vect','data')
    with open(dataFilename) as json_data:
        dataProj = json.load(json_data)

    for activity_id in included:
        print(activity_id)

    updProj = []
    id = 0
    for elem in dataProj:
        if elem['group'] == 'nodes':
            #filter out external events
            if (('classes' not in elem.keys()) or ('external' not in elem['classes'])):
                if included[id] == 1:
                        elem.update({'classes': 'included executable'})
                
        updProj.append(elem)
        id = id + 1

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

    # print('Conditions:')
    # print(fromCondition)
    # print('Milestones:')
    # print(fromMilestone)
    # print('Include:')
    # print(toInclude)
    # print('Exclude:')
    # print(toExclude)
    # print('Responses:')
    # print(toRespond)

    return fromCondition, fromMilestone, toInclude, toExclude, toRespond


def preExecCheck(fromCondition, fromMilestone, executed, included):
    ## if conditions not empty: get markings of conditions --> if not executed yet and included: error
    if (len(fromCondition)!=0):
        for elem in fromCondition:
            if (executed[elem['vectid']] == 0) and (included[elem['vectid']] == 1):
                print('[INFO] error - elem condition not executed')
                return False

    ## if milestones not empty --> similar behavior
    if (len(fromMilestone)!=0):
        for elem in fromMilestone:
            if (executed[elem['vectid']] == 0) and (included[elem['vectid']] == 1):
                print('[INFO] error - elem milestone not executed')
                return False

    return True

def postExecManager(toInclude, toExclude, toRespond, included, pending):
    if(len(toInclude)!=0):
        for elem in toInclude:
            included[elem['vectid']] = 1

    if(len(toExclude)!=0):
        for elem in toExclude:
            included[elem['vectid']] = 0

    if(len(toRespond)!=0):
        for elem in toRespond:
            pending[elem['vectid']] = 1
    
    return included, pending



def updCytoData(dataProj, included, executed, pending):
    cnt=0

    for elem in dataProj: 
        if(elem['group']=='nodes'):
            if ('classes' in elem.keys()) and ('external' in elem['classes']):
                pass
            else:
                classes = []
                if included[cnt] == 1:
                    classes.append('included')
                if executed[cnt] == 1:
                    classes.append('executed')
                if pending[cnt] ==1:
                    classes.append('pending')
                cnt = cnt+1

                elem.update({'classes': ' '.join(classes)})

    return dataProj

# def executeNode(projId, activity_name):

def executeNode(data):
    projId = data['projId']
    activity_name = data['idClicked']

    status = 'waiting'

    # retrieve activity data
    print(glob.glob('../../../src/resources/data'+projId+'*'))
    exit(-1)
    pData = glob.glob('../../../src/resources/data'+projId+'*')[0]
    pVect = glob.glob('../../../src/resources/vect'+projId+'*')[0]

    with open(pData) as json_data:
        dataProj = json.load(json_data)
    with open(pVect) as json_data:
        dataVect = json.load(json_data)

    activity_id = 0
    while (dataProj[activity_id]['data']['id']!=activity_name):
        activity_id = activity_id+1

    if ('classes' not in dataProj[activity_id]) or ('included' not in dataProj[activity_id]['classes']):
        print('[INFO] error - elem not included')
        return 'throw error - not included'

    else:
        print('[INFO] success - elem included')
        status = 'executed'

        # retrieve activity relations (conditions, milestones, included, excluded, response)
        markings= dataVect['markings'][0]
        included = markings['included'] 
        executed = markings['executed']  
        pending = markings['pending']  

        # retrieve activity relations (conditions, milestones, included, excluded, response)
        relations = dataVect['relations'][0]
        fromCondition, fromMilestone, toInclude, toExclude, toRespond = retrieveActivityRelations(relations, 
        activity_id, dataProj)

        # pre_execution evaluation
        status = preExecCheck(fromCondition, fromMilestone, executed, included)
        if not status : 
            return 'throw error - prexec conditions not executed'

        # Update markings:
        executed[activity_id] = 1
        pending[activity_id] = 0

        # post_execution evaluation  --> upd markings included, excluded, response
        included, pending = postExecManager(toInclude, toExclude, toRespond, included, pending)

        ## rewrite vectData
        with open(pVect, 'w') as outfile:
            json.dump(dataVect, outfile, indent=2)

        ## update projData classes and rewrite
        updProj = updCytoData(dataProj, included, executed, pending)
        with open(pData, 'w') as outfile:
            json.dump(updProj, outfile, indent=2)

        return status ## append status to execlog (?)

def main():
    projId = 'Florist'
    activity_name = 'PrepareCommand'

    executeNode(projId, activity_name)

if __name__ == "__main__":
    main()