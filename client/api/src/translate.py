

import os
import pathlib
import argparse
import sys
import json


def getRoles():
    return ['Florist', 'Driver', 'Customer']

def reinitBis(filename):
    srcFolder = 'src/resources/'
    target='src/projections/'

    # reinit choreo
    choreoFile = open(os.path.join(srcFolder,'dataChoreo_init.json'), 'r')
    dataChoreo = choreoFile.readlines()
    choreoFile.close()

    with open(os.path.join(target, 'dataChoreo.json'), 'w') as outfile:
        json.dump(dataChoreo, outfile, indent=2)

    # reinit roles
    for role in getRoles():
        # reinit choreo
        file = open(os.path.join(srcFolder,'data'+role+'_init.json'), 'r')
        dataRole = file.readlines()
        file.close()
        with open(os.path.join(target, 'data'+role+'.json'), 'w') as outfile:
            json.dump(dataRole, outfile, indent=2)



def reinit(filename):
    from api.src.projalgoGlobal import projectGlobal
    from api.src.projalgoChoreo import projectChoreo
    from api.src.projalgoRoles import projRoles
    from api.src.utils.formatting import getFileName, removeGroups

    file = open(os.path.join(filename), 'r')
    data = file.readlines()
    file.close()

    target='src/projections/'

    _data = removeGroups(data)

    projectGlobal(_data, target)
    projectChoreo(_data, target)

    for role in getRoles():
        projRoles(_data, target, role)


def main():
    filename = getFileName()
    file = open(os.path.join(filename), 'r')
    data = file.readlines()
    file.close()

    target='src/projections/'

    _data = removeGroups(data)

    projectGlobal(_data, target)
    projectChoreo(_data, target)

    for role in getRoles():
        projRoles(_data, target, role)

if __name__ == "__main__":
    main()
