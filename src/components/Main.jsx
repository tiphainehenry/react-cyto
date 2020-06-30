import React from 'react';
import '../style/App.css';
import Header from './Header';

import axios from 'axios'
import { Link } from "react-router-dom";

//var text=require('../resources/toyExample.txt')


class Main extends React.Component {

  constructor(props) {
        super(props);
        this.state = { text: 'hello bob',
                       inputVal:'',
                       roles: 'None yet, please enter DCR description',
                       processedData: '' };
      }

      mySubmitHandler = (event) => {
        event.preventDefault();
        alert("You are submitting: \n\n------------------\n" + this.state.text + "\n------------------");

        const text=this.state.text
         axios.post('http://localhost:5000/process', { text },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          maxContentLength: 100000000,
          maxBodyLength: 1000000000
        })
        .then((res) => {
          console.log(res.data);
          const inputVal = 'See results';
          this.setState({ inputVal });
          const processedData = res.data['val'] 
          this.setState({processedData})
        });

      
        //alert("You are submitting: \n\n------------------\n" + this.state.text + "\n------------------");
        
        //var xmlhttp;
        //var d = this.state.text;

        //xmlhttp = new XMLHttpRequest();
        //xmlhttp.onreadystatechange=function(){
        //    if(xmlhttp.readyState==4 && xmlhttp.status==200){
        //        alert(String(d));
        //    }
        //};
        
        //xmlhttp.open("POST","http://localhost:5000/process",true);
        //xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        //xmlhttp.send(d);

        //xmlhttp.open("GET","http://localhost:5000/process",true);
        //xmlhttp.send();
        //xmlhttp.onload = function() {
        //  let responseObj = xmlhttp.response;
        //  if(xmlhttp.readyState==4 && xmlhttp.status==200){
        //    alert(d);
        //}
       //}

      };

      downloadTxtFile = () => {
        const element = document.createElement("a");
        const file = new Blob([this.state.text], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "myFile.txt";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
      }

      myChangeHandler = (event) => {
        this.setState({text: event.target.value});
      }      

      render() {
        return (
            <div>
              <Header/>
                <div class="textDisp">
                    <form onSubmit={this.mySubmitHandler}>
                        <p>Enter DCR source code and project:</p>
                        <textarea
                            rows="20" 
                            cols="60"
                            placeholder="enter source here"
                            id="textTuning"
                            type='text'
                            onChange={this.myChangeHandler}
                            value={this.state.text}
                        />

                          <input class='btn'
                            type='submit'
                            value='Launch Projection'
                        />
                        <Link to={{pathname:"/graph",
                                  textProps:'blabla'
                                }}>{this.state.inputVal}</Link>

                    </form>
                </div>
                <div>Processed data: {this.state.processedData}</div>
                
                </div>
        );
      }  
}
      

export default Main;
