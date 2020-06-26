import os
import pathlib
import argparse
import sys

from projalgoGlobal import projectGlobal
from projalgoChoreo import projectChoreo
from projalgoRoles import projRoles
from utils.formatting import getFileName, removeGroups

def getRoles():
    return ['Florist', 'Driver', 'Customer']

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
