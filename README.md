#  Towards Trusted DCR Choreographies
This code implements the proof-of-concept presented in the paper <em>Towards Trusted DCR Choreographies</em> submitted for the Coopis'20 conference. 
This portal projects an input global DCR choreography over each tenant view. 
- The shared public tasks are gathered together in a public DCR graph. The later is compiled and updated in the blokchain for trust purposes. 
- The tenant projections are updated locally for privacy concerns. Each one of the incorporated public tasks communicates with the blockchain-based DCR graph. 


## Input DCRs
Examples of global DCR graphs are accessible in the folder ./dcrInputs/.

## The DCR portal

### Algorithms
The projection and bitvector algorithms can be found in the folder ./api/src/
The generated data is stored under ./src/projections/

### Running the code
The Dapp runs on http://90.84.244.33:3000/. Make sure you have Metamask installed on your favorite browser. The smartcontract is deployed on the Ropsten network. 

To install the app locally,
The required environment is python, node, and npm.
After cloning the repo, in the folder ./client, launch 'pip install -r requirements.txt' and 'npm install'

To run the app locally, launch the frontend with the command 'cd ./client & npm start'. Launch the backend with the command python api/api.py.
