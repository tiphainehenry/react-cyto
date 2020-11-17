import React from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import RoleDescription from './roleDescription';

import Header from './Header';
import ExecLogger from './execLogger';
import PublicMarkings from './PublicMarkings';



import SimpleDCReum from '../contracts/SimpleDCReum.json';
import getWeb3 from '../getWeb3';

import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import COSEBilkent from 'cytoscape-cose-bilkent';
Cytoscape.use(COSEBilkent);

var node_style = require('../style/nodeStyle.json');
var edge_style = require('../style/edgeStyle.json');
var cyto_style = require('../style/cytoStyle.json');

var dataChoreo = require('../projections/dataPublic.json');
var execLogs = require('../projections/execPublic.json');
var vectChoreo = require('../projections/vectPublic.json');

class ViewPublic extends React.Component {

  constructor(props){
    super(props);
    this.state = {
                  choreo:'Public Projection', 
                  execLogs: execLogs,
                  activityNames:vectChoreo["activityNames"],
                  
                  web3: null,
                  accounts: null,
                  contract: null,
                  
                  incl:'',
                  exec:'',
                  pend:'',
                  dataHashes:'',
                  lg_activityNames:''
                };
  }

  
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {

    try {  
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleDCReum.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleDCReum.abi,
        deployedNetwork && deployedNetwork.address,
      );

      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
            // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    };

    const { accounts, contract } = this.state;

    // checking public workflow: 
    // print public vectors and debug the functions

    const inclVector = await contract.methods.getIncluded().call();
    const execVector = await contract.methods.getExecuted().call();
    const pendVector = await contract.methods.getPending().call();
    const hashesVector = await contract.methods.getHashes().call();

    this.setState({
      lg_activityNames:this.state.activityNames["default"],
      incl:inclVector,
      exec:execVector,
      pend:pendVector,
      dataHashes:hashesVector,
  });

  }

  componentDidMount = async () => {
      this.cy.fit();
    };
  

  render(){
    const layout = cyto_style['layoutCose'];
    const style = cyto_style['style'];
    const stylesheet = node_style.concat(edge_style)

    return  <div>
              <Header/>
              <div class="bg-green pt-5 pb-3">

              <div class='container'>
                <h2>Public Projection</h2>
                <p>This view represents the public DCR projection of the input workflow. Its state is managed in the blockchain. Execution logs and the markings of the public graph are displayed in the panels below. </p>
                <p>To update the public DCR, navigate to the role projections.</p>
                <Card id="choreo" style={{height:'70%','marginTop':'3vh'}}>
                  <Card.Header as="p" style= {{color:'white', 'backgroundColor': '#006588', 'borderBottom':'white'}}>
                    {this.state.choreo}</Card.Header>
                  <Card.Body>
                    <CytoscapeComponent elements={dataChoreo} 
                                          stylesheet={stylesheet} 
                                          layout={layout} 
                                          style={style} 
                                          cy={(cy) => {this.cy = cy}}
                                          boxSelectionEnabled={false}
                                          />    
                  </Card.Body>
                </Card>

                <ExecLogger  execLogs = {this.state.execLogs} activityNames={this.state.activityNames}/>
                <PublicMarkings activityNames={this.state.lg_activityNames} 
                                incl = {this.state.incl}
                                pend = {this.state.pend}
                                exec = {this.state.exec}
                                dataHashes = {this.state.dataHashes}
                                />

              </div>
              </div>
              <footer class="o-footer" id="footer" role="contentinfo">
                <div class="o-footer-bottom">
                  <div class="container">
                    <div class="row mb-0">
                      <ul class="nav">
                        <li class="nav-item"><span class="nav-link">© Caise 2020 submissions, T.Henry, A.Brahem, N. Laga, W. Gaaloul - Towards Trusted Declarative BP choreographies</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </footer>

            </div>; 
  }
}

export default ViewPublic
