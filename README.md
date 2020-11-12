#  Towards Trusted DCR Choreographies
This code implements the proof-of-concept presented in the paper <em>Towards Trusted Declarative Business Process
Choreographies</em>. 
This portal projects an input global DCR choreography over each tenant view. 
- The shared public tasks are gathered together in a public DCR graph. The later is compiled and updated in the blokchain for trust purposes. 
- The tenant projections are updated locally for privacy concerns and communicate with the public DCR vis external events. 

We use python Flask for the backend of the application and React for the front end. We use cytoscape.js, a React package, to generate the graph visualizations. Web3.js is used to connect the decentralized application to a blockchain network. Truffle manages the compilation and migration of the DCR smart contract, and Metamask controls contract interactions. 

# Functionalities
On the design side, the platform: 
- separates the public and private projections out of a given textual representation. 
- instantiates the public DCR smart contract stored in Ethereum with the newly generated public projection

On the execution side, each user can (1) execute its local projection, (2) have access to the execution logs of its local projection (activity start and end timestamps, state of execution of the task). 


## Input DCRs
Examples of global DCR graphs are accessible in the folder ./dcrInputs/.

## Algorithms
The projection and bitvector algorithms can be found in the folder ./api/src/
The generated data is stored under ./src/projections/

## Running the code

### Online app
The Dapp runs on http://90.84.244.33:3000/. Make sure you have Metamask installed on your favorite browser. The smartcontract is deployed on the Ropsten network. 
### Local install
To install the app locally, the required environment is python, node, and npm.
After cloning the repo, in the folder ./client, launch 'pip install -r requirements.txt' and 'npm install'

To run the app locally, launch the frontend with the command 'cd ./client & npm start'. Launch the backend with the command python api/api.py.
