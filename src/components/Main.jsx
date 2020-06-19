import React from 'react';
import '../App.css'
import axios from 'axios'

//var text=require('../resources/toyExample.txt')


class Main extends React.Component {

  constructor(props) {
        super(props);
        this.state = { text: 'hello bob',
                       roles: 'None yet, please enter DCR description' };
      }

      mySubmitHandler = (event) => {
        event.preventDefault();
        alert("You are submitting: \n\n------------------\n" + this.state.text + "\n------------------");

        const text=this.state.text
        axios.post('http://localhost:5000/process', { text },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .then((res) => {
          console.log(res);
          console.log(res.config.data);
        });
        axios.get(`http://localhost:5000/process`)
        .then(res => {
          console.log(res.data);
          const roles = res.data;
          this.setState({ roles });
        })

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


      myChangeHandler = (event) => {
        this.setState({text: event.target.value});
      }

      render() {
        return (
            <div>
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
                    </form>
                </div>
                <div class='textDispv2' id="demo">
                  <p>Roles to project</p>
                </div>
                <div class='textDispv2' id="demo">
                    <p id='roles'>{this.state.roles}</p>
                </div>
                </div>
        );
      }  
}
      

export default Main;
