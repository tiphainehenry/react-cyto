import os
import pathlib
import argparse
import sys
import json
import glob
import logging

from datetime import datetime
from json.decoder import JSONDecodeError
from flask import Flask, flash, request, redirect, url_for, session, jsonify
from flask_cors import CORS, cross_origin
from flask_restful import reqparse, abort, Api, Resource
from werkzeug.utils import secure_filename
from src.projalgoGlobal import projectGlobal
from src.projalgoChoreo import projectChoreo
from src.projalgoRoles import projRoles
from src.utils.formatting import removeGroups
from src.utils.graphManager import executeNode, executeApprovedNode

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('HELLO WORLD')
app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})
api = Api(app)
#app.config['CORS_HEADERS'] = 'Content-Type'
#CORS(app, resources={r"*": {"origins": "*"}})
# CORS(app, expose_headers='Authorization')
#CORS(app, support_credentials=True)

# from web3 import Web3
# w3= Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
# from solc import compile_files, link_code, compile_source, compile_standard
#logging.getLogger('flask_cors').level = logging.DEBUG

def getRoles():
    return ['Florist', 'Driver', 'Customer']


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
    if 'BC' not in status:
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


@app.route('/BCupdate', methods=['POST', 'GET'])
def processBCData():
    data = request.get_json(silent=True)
    status = data['bcRes'] 
    activity_name = data['idClicked']
    
    if ('rejected' in status):
        # update execLog
        projId = data['projId']

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
   
    else:
        roleProjections=glob.glob('./client/src/projections/data*')
        roles = [pathName.replace('./client/src/projections/data','').replace('.json','') for pathName in roleProjections]

        for role in roles:
            if activity_name in projection:
                ### update markings
                executeApprovedNode(role, activity_name)
        
                ### update exec log
                pExec = glob.glob('./client/src/projections/exec'+role+'*')[0]
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
                    'status': 'public node - '+status,
                    'timestamp':date_time
                })

                with open(pExec, 'w') as outfile:
                    json.dump(execData, outfile, indent=2)

        ### update public projection (?)

    return status, 200, {'Access-Control-Allow-Origin': '*'}


@app.route('/reinit', methods=['POST', 'GET'])
def reinitialise():
    filename = './client/inputExample.txt'
    reinit(filename)
    return 'ok', 200, {'Access-Control-Allow-Origin': '*'}

if __name__ == "__main__":
    app.secret_key = os.urandom(24)
    app.run(debug=True,host="0.0.0.0",use_reloader=False)

