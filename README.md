#  Towards Trusted DCR Choreographies
This code implements the proof-of-concept presented in the paper <em>Towards Trusted DCR Choreographies</em> submitted for the Coopis'20 conference. 
This portal projects an input global DCR choreography over each tenant view. 
- The shared public tasks are gathered together in a public DCR graph. The later is compiled and updated in the blokchain for trust purposes. 
- The tenant projections are updated locally for privacy concerns. Each one of the incorporated public tasks communicates with the blockchain-based DCR graph. 


## Input DCR
The global DCR textual description can be found under inputExample.tex

## The DCR portal

### Algorithms
The projection and bitvector algorithms can be found in the folder ./api/src/
The generated data is stored under ./src/resources/data/

### Running the code
To run the code locally, 

Launch the front-end by opening a first bash terminal and running 
<code>npm start</code>

Launch the backend by opening a second bash terminal and running 
<code>python api/api.py</code>
    
The script runs on http://localhost:3000




This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
