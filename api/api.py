import os
from flask import Flask, flash, request, redirect, url_for, session
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
from flask import jsonify
import logging

#from src.graphDataTranslator import generateGraphs

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
   data_dict = request.form.to_dict()
   res = [key for key in data_dict.keys()] 

   text = res[0].split(":")[1][1:-2]

   #temp_file = open("temp.txt", "w")
   #temp_file.write(text)
   #temp_file.close()

   # save temp text
   # on file name: generate choreography and roles projections. (save files in list)

   # for each generated file, generate data with graph translator

   #text = data['text'] 
   #apply graphDataTranslator
   #process data here
   
   return jsonify({'val':text}), 200, {'Access-Control-Allow-Origin': '*'}
   #return jsonify(request.form.to_dict()), 200, {'Access-Control-Allow-Origin': '*'}


if __name__ == "__main__":
    app.secret_key = os.urandom(24)
    app.run(debug=True,host="0.0.0.0",use_reloader=False)

