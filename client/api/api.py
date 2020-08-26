import os
import pathlib
import argparse
import sys
import json
import glob
import logging

from json.decoder import JSONDecodeError
from flask import Flask, flash, request, redirect, url_for, session, jsonify
from flask_cors import CORS, cross_origin
from flask_restful import reqparse, abort, Api, Resource
from werkzeug.utils import secure_filename
from src.projalgoGlobal import projectGlobal
from src.projalgoChoreo import projectChoreo
from src.projalgoRoles import projRoles
from src.utils.formatting import removeGroups
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

def getRoles():
    return ['Florist', 'Driver', 'Customer']

# Nassim
@app.route('/process', methods=['POST', 'GET'])
def processData():
    data = request.get_json(silent=True)
    status = executeNode(data)

    # update execLog
    if 'BC' not in status:
        projId = data['projId']
        activity_name = data['idClicked']
        activity_name_details = data['activityName']
        start_timestamp = data['start_timestamp']

        pExec = glob.glob('./client/src/projections/exec'+projId+'*')[0]
        execLogg(pExec, activity_name_details, status, start_timestamp)
    
    return status, 200, {'Access-Control-Allow-Origin': '*'}


@app.route('/BCupdate', methods=['POST', 'GET'])
def processBCData():
    data = request.get_json(silent=True)
    status = data['execStatus'] 
    activity_name = data['idClicked']
    activity_name_details = data['activityName']
    start_timestamp = data['start_timestamp']

    if ('rejected' in status):
        # update execLog
        projId = data['projId']
        pExec = glob.glob('./client/src/projections/exec'+projId+'*')[0]
        execLogg(pExec, activity_name_details, status, start_timestamp)
   
    else:
        roleProjs=glob.glob('./client/src/projections/data*')
        roleProjections=[]
        for elem in roleProjs:
            for projR in ['Florist', 'Driver', 'Customer','Choreography']:
                if projR in elem: 
                    roleProjections.append(elem)

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
            execLogg(pExec, activity_name_details, 'public node - ' + status, start_timestamp)


    return status, 200, {'Access-Control-Allow-Origin': '*'}


@app.route('/reinit', methods=['POST', 'GET'])
def reinitialise():
    filename = './client/inputExample.txt'
    file = open(os.path.join(filename), 'r')
    data = file.readlines()
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

    return 'ok', 200, {'Access-Control-Allow-Origin': '*'}

if __name__ == "__main__":
    app.secret_key = os.urandom(24)
    app.run(debug=True,host="0.0.0.0",use_reloader=False)

