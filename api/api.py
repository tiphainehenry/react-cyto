import os
from flask import Flask, flash, request, redirect, url_for, session
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
from flask import jsonify
import logging

from 'src/utils/chunking' import extractChunks

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger('HELLO WORLD')



UPLOAD_FOLDER = '../../globalDCRs'
ALLOWED_EXTENSIONS = set(['txt'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app, expose_headers='Authorization')

# Nassim
@app.route('/process', methods=['POST', 'GET'])
def processData():
   data = request.args.values
   
   #apply graphDataTranslator
   #process data here
   
   return str(data) + 'ho ho', 200, {'Access-Control-Allow-Origin': '*'}
   #return jsonify(request.form.to_dict()), 200, {'Access-Control-Allow-Origin': '*'}


if __name__ == "__main__":
    app.secret_key = os.urandom(24)
    app.run(debug=True,host="0.0.0.0",use_reloader=False)

