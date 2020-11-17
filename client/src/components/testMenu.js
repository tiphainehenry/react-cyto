import React, { Component } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import '../style/boosted.min.css';
import Header from './Header';
import axios, { post } from 'axios';
import ViewGlobal from './ViewGlobal';
import { Button } from 'react-bootstrap';

var dcrTexts = require('../projections/dcrTexts.json');

class TestMenu extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      file:null,
      global:dcrTexts['global'],
      globEvents:'',
      globRelations:'',

      roleLength:'',
      projs:[],
      roles:[],


    };
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
  }

  componentDidMount(){

    var roleLength = dcrTexts['roleMapping'].length;
    
    var i;
    var projs=[];

    projs.push(['public','public'])

    for (i = 1; i <= roleLength; i++) {
      var role=[];
      var r = 'r'+i;
      role.push(r);
      role.push(dcrTexts[r]['role'])
      projs.push(role)
    } 

  
    var i;
    var roles=[];
    for (i = 1; i <= roleLength; i++) {
      var role=[];
      var r = 'r'+i;
      role.push('/'+r);
      role.push(dcrTexts[r]['role'])
      roles.push(role)
    } 

    this.setState({
      roleLength:roleLength,
      roles:roles,
      projs:projs
    });


    const globEvents = this.state.global['events'].map((number) =>
    <li key={number['id']}> {number['event']}</li>);
    const globRelations = this.state.global['relations'].map((number) =>
    <li key={number['id']}> {number['relation']}</li>);
    this.setState({
      'globEvents':globEvents,
      'globRelations':globRelations,
  });
  }

  onFormSubmit(e){
    e.preventDefault() // Stop form submit
    this.fileUpload(this.state.file).then((response)=>{
      console.log(response.data);
    })  
  }

  onChange(e) {
    this.setState({file:e.target.files[0]})
  }


  fileUpload(file){
    const url = `http://localhost:5000/inputFile`;
    const formData = new FormData();
    formData.append('file',file);
    const config = {
        headers: {
            'content-type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*',
        }
    };

    return post(url,formData,config)
  }

  render(){
    return  <div>
             <Header/>

             <div class="discovery-module-one-pop-out py-5 py-lg-3">
                <div class="container">
                      <h2 class="display-1">Towards trusted declarative business process choreographies</h2>
                      <p class="lead">
                      In this webapp, we propose a hybrid approach to the execution of business process choreographies, where public tasks are tracked in the blockchain for trust purposes and where tenant projections are updated locally for privacy concerns.</p>
                      <p class="lead">
                      We provide the visualization results for three DCR graphs proposed in the literature. The projection tool and the hybrid monitoring support are also made available.  
                      </p>                      
                  </div>
              </div>

              <div class="popular-services bg-light">
                <div class="container pt-5">
                  <div class="d-flex mb-3">
                    <h2 class="mb-0">Tested dataset</h2>
                  </div>
                  <div class="row">
                  <div class="col-12 col-md-4 mb-3 mb-md-0">
                      <div class="card border-light">
                        <img class="card-img-top img-fluid" src="images/popular-services-2.png" alt="" width="416" height="322" loading="lazy"/>
                        <div class="card-body">
                          <h3 class="card-title">Delivery</h3>
                          <p class="card-text">
                            3 tenants, 9 public events, 1 private events, 28 constraints.
                          </p>
                          <a href="https://github.com/tiphainehenry/react-cyto/blob/master/dcrInputs/delivery.txt" class="o-link-arrow">DCR input (github)</a>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-md-4 mb-3 mb-md-0">
                      <div class="card border-light">
                        <img class="card-img-top img-fluid" src="images/popular-services-1.png" alt="" width="416" height="322" loading="lazy"/>
                        <div class="card-body">
                          <h3 class="card-title">Invoice</h3>
                          <p class="card-text">
                            3 tenants, 8 public events, 2 private events, 15 constraints.
                          </p>
                          <a href="https://github.com/tiphainehenry/react-cyto/blob/master/dcrInputs/invoice.txt" class="o-link-arrow">DCR input (github)</a>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-md-4 mb-3 mb-md-0">
                      <div class="card border-light">
                        <img class="card-img-top img-fluid" src="images/popular-services-3.png" alt="" width="416" height="322" loading="lazy"/>
                        <div class="card-body">
                          <h3 class="card-title">Oncology</h3>
                          <p class="card-text">
                            4 tenants, 10 public events, 3 private events, 21 constraints.
                          </p>
                          <a href="https://github.com/tiphainehenry/react-cyto/blob/master/dcrInputs/oncology.txt" class="o-link-arrow">DCR input (github)</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>              
              
    
              <div class="bg-light pt-5 pb-3">
                <div class="container">
                  <h2>Results</h2>
                  <p>For each dataset, and at each stage of the process execution, we record the execution fee and the time of execution. The experiments are run on a personal
computer with an Intel i5 core CPU.</p>
                  <h5>(1) Average task transaction fees and execution time</h5>
                  <table id="news-table" class="table tablesorter mb-5 bg-light">
                    <thead class="cf">
                      <tr>
                        <th scope="col" class="header">Workflow</th>
                        <th scope="col" class="header">Instanciation tx. fees (ETH)</th>
                        <th scope="col" class="header">Task tx. fees (ETH)</th>
                        <th scope="col" class="header">Public task exec. (sec)</th>
                        <th scope="col" class="header">Private task exec. (sec)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="align-middle">Delivery</td>
                        <td class="align-middle">0,029393</td>
                        <td class="align-middle">0,0093127</td>
                        <td class="align-middle">15</td>
                        <td class="align-middle">1</td>
                      </tr>
                      <tr>
                        <td class="align-middle">Invoice</td>
                        <td class="align-middle">0,027092</td>
                        <td class="align-middle">0,0069615</td>
                        <td class="align-middle">10</td>
                        <td class="align-middle">1</td>
                      </tr>
                      <tr>
                        <td class="align-middle">Oncology</td>
                        <td class="align-middle">0,037696</td>
                        <td class="align-middle">0,0116857</td>
                        <td class="align-middle">19</td>
                        <td class="align-middle">2</td>
                      </tr>
                    </tbody>
                  </table>
<p>The average transaction fees requested for a
task execution are smaller than the process instantiation ones in the subset
of processes tested. Moreover, the average execution time for a private task is
one order of magnitude smaller than the one needed for a public task. Indeed,
we compute private activities off-chain. Thus the execution time of a private
event corresponds to the time used to check the nature of the event (private or
public), a post request, and the time needed to update the private markings.
On the opposite, the execution of public activities comprises an interaction with
the BC network. Thus the execution time of a public event corresponds to the
time needed to check the nature of the event (private or public), to interact with
the on-chain DCR smart contract, and to update the private markings.</p>
                  <h5>(2) End-to-end execution of the invoice workflow</h5>
                  <table id="news-table" class="table tablesorter mb-3 bg-light">
                    <thead class="cf">
                      <tr>
                        <th scope="col" class="header">Execution approach</th>
                        <th scope="col" class="header">Total exec. fees (ETH)</th>
                        <th scope="col" class="header">Total exec. time (sec)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="align-middle">End-to-end BC execution</td>
                        <td class="align-middle">0.1896101</td>
                        <td class="align-middle">247</td>
                      </tr>
                      <tr>
                        <td class="align-middle">Our approach</td>
                        <td class="align-middle">0.154553</td>
                        <td class="align-middle">196</td>
                      </tr>
                    </tbody>
                  </table>
                  <p> We execute one of the tested processes - the invoice workflow - following an end-to-end execution on the BC and compare it to our approach. 
                    Our approach leads to execution fees and time savings that will be more significant in the case of larger graphs.</p>
                </div>
              </div>

              <div class="bg-green pt-5 pb-3">
                <div class="container">
                  <h2>DCR projection tool - Experiment yourself </h2>
                  <h5>Step 1 </h5>

                  <p>Load a DCR file to be projected. The three input files used for our experiments are accessible in the <a href='https://github.com/tiphainehenry/react-cyto/'>dcrInputs repository</a> of our github.</p>
                      <form onSubmit={this.onFormSubmit}>
                        <input  type="file" onChange={this.onChange} />
                        <button class="btn btn-primary my-2 my-sm-0" type="submit">Upload</button>
                      </form>                   
                      <hr/>

                      <ViewGlobal/>
                      <hr/>
                      <h5>Step 3</h5>
                      <p>To execute the process, navigate between the different role projections accessible via the buttons below, or via the header. </p>
                      <p>
                        Each graph comprises four types of events. </p>
                        <ListGroup>
                              <ul>(1) Send choreography events are marked with (!)</ul>
                              <ul>(2) Receive choreography events are marked with (?)</ul>
                              <ul>(3) Internal events comprise the event name only.</ul>
                              <ul>(4) External events (choreography or internal) are filled in black.</ul>
                        </ListGroup>               
                        
                        <p>
                        The local projected excluded events are filled in grey, while the local events included and/or executed are filled in white.               
                        </p>
                        <p>
                        The five DCR relations are depicted: include in green, exclude in red, milestone in violet, condition in orange, and response in blue. 
                        </p>

                        <p>
                        Concerning the process execution, (i) the local events that do not have any interaction with other private projections 
                        are executed off-chain, (ii) choreography events and external events are executed in the Ethereum BC through REST API calls.               
                        Each projection holds a marking with both internal and external event states. These are set to one if the event is activated, and null otherwise. 
                        </p>              
                        {this.state.roles.map(item=> 
                        <Button href={item[0]}>{item[1]}</Button>
                      )}

                      <hr/>
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
            </div>

            
;
  }
}

export default TestMenu