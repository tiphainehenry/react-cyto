import React from 'react';
import '../App.css'

//var text=require('../resources/toyExample.txt')


class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = { text: '' };
        //          description: text
// usage:               <textarea value={this.state.description} />

      }
      mySubmitHandler = (event) => {
        event.preventDefault();
        alert("You are submitting: \n\n ------------------\n" + this.state.text + "------------------");
      }
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
                        />
                        <input class='btn'
                            type='submit'
                            value='Launch Projection'
                        />
                    </form>
                </div>
                <div class='textDisp'>
                    <p>Roles to project</p>
                </div>
            </div>

        );
      }  
}
      

export default Main;
