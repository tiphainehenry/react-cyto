

import os
import pathlib
import argparse
import sys


def getRoles():
    return ['Florist', 'Driver', 'Customer']

def reinit(filename):
    from api.src.projalgoGlobal import projectGlobal
    from api.src.projalgoChoreo import projectChoreo
    from api.src.projalgoRoles import projRoles
    from api.src.utils.formatting import getFileName, removeGroups

    file = open(os.path.join(filename), 'r')
    data = file.readlines()
    file.close()

    target='src/resources/'

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

    target='src/resources/'

    _data = removeGroups(data)

    projectGlobal(_data, target)
    projectChoreo(_data, target)

    for role in getRoles():
        projRoles(_data, target, role)

if __name__ == "__main__":
    main()
