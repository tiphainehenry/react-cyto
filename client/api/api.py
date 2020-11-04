import os
import pathlib
import argparse
import sys
import json
import glob
import logging

from simplejson import JSONDecodeError
from flask import Flask, flash, request, redirect, url_for, session, jsonify
from flask_cors import CORS, cross_origin
from flask_restful import reqparse, abort, Api, Resource
from werkzeug.utils import secure_filename
from src.projalgoGlobal import projectGlobal
from src.projalgoPublic import projectPublic
from src.projalgoRoles import projRole
from src.utils.formatting import removeGroups
from src.utils.chunking import getRoles, getRoleMapping
from src.utils.graphManager import executeNode, executeApprovedNode, execLogg



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

def getId(role):
    roleMapping= getRoleMapping(role)
    return roleMapping['id']


def upd(data):
    target='./client/src/projections/'
    dataPath='./client/src/projections/dcrTexts.json'

    _data = removeGroups(data)

    projectGlobal(_data, target)

    with open(dataPath) as json_file:
        dataDict = json.load(json_file)
    dataDict['externalEvents']=[]
    with open(dataPath, 'w') as outfile:
        json.dump(dataDict, outfile)
    with open(os.path.join(target,'execPublic.json'), 'w') as outfile:
        json.dump({"execLogs":[]}, outfile, indent=2)

    for role in getRoles():
        print('[INFO] Starting projection on role '+role)
        projRole(_data, target, role)
        with open(os.path.join(target,'exec'+getId(role)+'.json'), 'w') as outfile:
            json.dump({"execLogs":[]}, outfile, indent=2)

    projectPublic(_data, target)

@app.route('/process', methods=['POST', 'GET'])
def processData():
    data = request.get_json(silent=True)
    status = executeNode(data)

    # update execLog
    if 'BC' not in status:
        role = data['projId']
        activity_name = data['idClicked']
        activity_name_details = data['activityName']
        start_timestamp = data['start_timestamp']
        data = data['data']

        role_id=getId(role)

        pExec = glob.glob('./client/src/projections/exec'+role_id+'*')[0]
        execLogg(pExec, activity_name_details, status, start_timestamp,data)
    
    return status, 200, {'Access-Control-Allow-Origin': '*'}


@app.route('/BCupdate', methods=['POST', 'GET'])
def processBCData():
    data = request.get_json(silent=True)
    status = data['execStatus']
    activity_name = data['idClicked']
    activity_name_details = data['activityName']
    start_timestamp = data['start_timestamp']
    data = data['data']

    if ('rejected' in status):
        # update execLog
        role = data['projId']
        role_id = getId(role)

        pExec = glob.glob('./client/src/projections/exec'+role_id+'*')[0]
        execLogg(pExec, activity_name_details, status, start_timestamp)
   
    else:
        # roleProjs=glob.glob('./client/src/projections/data*')
        roleProjections=[]

        for role in getRoles():
            roleMapping=getRoleMapping(role)
            roleProjections.append('./client/src/projections/data'+roleMapping['id']+'.json')

        for rolepath in roleProjections:
            with open(rolepath) as json_file:
                nodes = json.load(json_file)
            isPresent=False

            namesToTest = [activity_name]
            eventName = activity_name
            if (activity_name[0]=='e') and (activity_name[-1]=='s'):
                eventName = activity_name[:-1]
                namesToTest.append(eventName+'r') # receive choreography subevent
                namesToTest.append(eventName) # choreography event
                

            for nameToTest in namesToTest:
                for elem in nodes:
                    if ((elem['group']=='nodes') and (nameToTest == elem['data']['id'])):
                        isPresent=True
                        ### update markings
                
                if isPresent:
                    executeApprovedNode(rolepath, nameToTest)

            ### update exec log
            pExec = rolepath.replace('data','exec')        
            execLogg(pExec, activity_name_details, 'public node - ' + status, start_timestamp, data)


    return status, 200, {'Access-Control-Allow-Origin': '*'}


@app.route('/reinit', methods=['POST', 'GET'])
def reinitialise():
    dataPath='./client/src/projections/dcrTexts.json'
    with open(dataPath) as json_file:
        dataDict = json.load(json_file)
    dataGlobDict = dataDict['global']
    data = []

    for elem in dataGlobDict['events']:
        data.append(elem['event'])

    for elem in dataGlobDict['relations']:
        data.append(elem['relation'])

    upd(data)

    return 'ok', 200, {'Access-Control-Allow-Origin': '*'}


@app.route('/inputFile', methods=['GET','POST'])
def inputFileLaunch():
    file = request.files['file']
    data = file.readlines()

    upd(data)

    return 'ok', 200, {'Access-Control-Allow-Origin': '*'}


if __name__ == "__main__":
    app.secret_key = os.urandom(24)
    app.run(debug=True,host="0.0.0.0",use_reloader=False)

