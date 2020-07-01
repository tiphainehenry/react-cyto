import os
import json
import glob

def initializeGraph(filename):
    with open(filename) as json_data:
        data = json.load(json_data)
    
    relations = data['relations']
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
            print(conditionFrom[activity_id])
            fromCondition.append(dataProj[cnt]['data']['id'])
        cnt = cnt + 1

    fromMilestone = []
    cnt = 0
    for milestoneFrom in milestones:
        if milestoneFrom[activity_id] == 1:
            print(milestoneFrom[activity_id])
            fromMilestone.append(dataProj[cnt]['data']['id'])
        cnt = cnt + 1
    
    toInclude = []
    cnt = 0
    for to_include in includes[activity_id]:
        if to_include == 1:
            toInclude.append(dataProj[cnt]['data']['id'])
        cnt = cnt + 1

    toExclude = []
    cnt = 0
    for to_exclude in excludes[activity_id]:
        if to_exclude == 1:
            toExclude.append(dataProj[cnt]['data']['id'])
        cnt = cnt + 1

    toRespond = []
    cnt = 0
    for to_resp in responses[activity_id]:
        if to_resp == 1:
            toRespond.append(dataProj[cnt]['data']['id'])
        cnt = cnt + 1

    print('Conditions:')
    print(fromCondition)
    print('Milestones:')
    print(fromMilestone)
    print('Include:')
    print(toInclude)
    print('Exclude:')
    print(toExclude)
    print('Responses:')
    print(toRespond)

    return fromCondition, fromMilestone, toInclude, toExclude, toRespond


#def executeNode(data):
    # projId = data['projId']
    # activity_name = data['idClicked']

def executeNode(projId, activity_name):
    status = 'waiting'

    # retrieve activity data
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
        ## if conditions not empty: get markings of conditions --> if not executed yet and included: error

        ## if milestones not empty: get markings --> similar behavior



            # condition?
            # for (var i = 0; i < a.condition.length; i++) 
                # if(!activities[a.condition[i]].executed && activities[a.condition[i]].included) {
                    # throw;
                    # return;
                # }
            # milestone?
            # for (i = 0; i < a.milestone.length; i++) 
                # if(activities[a.milestone[i]].pending && activities[a.milestone[i]].included) {
                    # throw;
                    # return;
                # }

        # Update markings:
        executed[activity_id] = 1
        pending[activity_id] = 0

        # post_execution evaluation  --> upd markings included, excluded, response
            # for (i = 0; i < a.include.length; i++) 
                # activities[a.include[i]].included = true;
            # for (i = 0; i < a.exclude.length; i++) 
                # activities[a.exclude[i]].included = false;
            # for (i = 0; i < a.response.length; i++) 
                # activities[a.response[i]].pending = true; 

        # rewrite dataRole.json, rewrite , send status

        return status



def main():
    projId = 'Florist'
    activity_name = 'CallShipper'

    executeNode(projId, activity_name)

if __name__ == "__main__":
    main()