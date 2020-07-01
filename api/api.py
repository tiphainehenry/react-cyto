import os
from flask import Flask, flash, request, redirect, url_for, session
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
from flask import jsonify
import logging

from src.utils.graphManager import executeNode

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger('HELLO WORLD')


app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app, expose_headers='Authorization')

# Nassim
@app.route('/process', methods=['POST', 'GET'])
def processData():
   data = request.get_json(silent=True)
   status = executeNode(data)
   
   return status, 200, {'Access-Control-Allow-Origin': '*'}


if __name__ == "__main__":
    app.secret_key = os.urandom(24)
    app.run(debug=True,host="0.0.0.0",use_reloader=False)

