import os
from flask import Flask, flash, request, redirect, url_for, session, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
from flask_restful import reqparse, abort, Api, Resource
import logging
# from web3 import Web3
# w3= Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
# from solc import compile_files, link_code, compile_source, compile_standard

from src.utils.graphManager import executeNode

import os
import pathlib
import argparse
import sys
import json
import glob
from datetime import datetime
from json.decoder import JSONDecodeError

from src.projalgoGlobal import projectGlobal
from src.projalgoChoreo import projectChoreo
from src.projalgoRoles import projRoles
from src.utils.formatting import removeGroups


logging.basicConfig(level=logging.INFO)

logger = logging.getLogger('HELLO WORLD')

#logging.getLogger('flask_cors').level = logging.DEBUG

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})
api = Api(app)
#app.config['CORS_HEADERS'] = 'Content-Type'
#CORS(app, resources={r"*": {"origins": "*"}})
# CORS(app, expose_headers='Authorization')
#CORS(app, support_credentials=True)


def getRoles():
    return ['Florist', 'Driver', 'Customer']

def reinitFromScratch():
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
    file = open(os.path.join(filename), 'r')
    data = file.readlines()

    print(data)
    file.close()

    target='./client/src/projections/'

    _data = removeGroups(data)

    projectGlobal(_data, target)
    projectChoreo(_data, target)

    for role in getRoles():
        projRoles(_data, target, role)

    execlogs = glob.glob(target+'exec*')
    for elem in execlogs:
        with open(elem, 'w') as outfile:
            json.dump({"execLogs":[]}, outfile, indent=2)


# Nassim
@app.route('/process', methods=['POST', 'GET'])
def processData():
    data = request.get_json(silent=True)
    status = executeNode(data)

    # update execLog
    projId = data['projId']
    activity_name = data['idClicked']

    pExec = glob.glob('./client/src/projections/exec'+projId+'*')[0]
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
        'timestamp':date_time
    })

    with open(pExec, 'w') as outfile:
        json.dump(execData, outfile, indent=2)
   
    return status, 200, {'Access-Control-Allow-Origin': '*'}

@app.route('/reinit', methods=['POST', 'GET'])
def reinitialise():
    filename = './client/inputExample.txt'
    reinit(filename)
    return 'ok', 200, {'Access-Control-Allow-Origin': '*'}

if __name__ == "__main__":
    app.secret_key = os.urandom(24)
    app.run(debug=True,host="0.0.0.0",use_reloader=False)

