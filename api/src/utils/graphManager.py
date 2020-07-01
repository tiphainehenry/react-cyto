import os
import json

def initializeGraph(filename):
    with open(filename) as json_data:
        data = json.load(json_data)
    
    relations = data['relations']
    included = data['markings'][0]['included']   

    dataFilename = filename.replace('vect','data')
    with open(dataFilename) as json_data:
        dataProj = json.load(json_data)

    # pending = data['markings']['pending']
    # executed = data['markings']['executed']

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




def executeNode(activity_id):
    # retrieve activity data

    # retrieve activity relations (conditions, milestones, included, excluded, response)
    # pre_execution evaluation
        # included? if activity not included (look into classes or markings, equivalent): throw

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

    # upd marking
        # a.executed = true;
        # a.pending = false;


    # post_execution evaluation  --> upd markings included, excluded, response

        # for (i = 0; i < a.include.length; i++) 
            # activities[a.include[i]].included = true;
        # for (i = 0; i < a.exclude.length; i++) 
            # activities[a.exclude[i]].included = false;
        # for (i = 0; i < a.response.length; i++) 
            # activities[a.response[i]].pending = true; 

    # rewrite dataRole.json, rewrite , send status

    print('hello there '+activity_id)
