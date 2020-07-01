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

