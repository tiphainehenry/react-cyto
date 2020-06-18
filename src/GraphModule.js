import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';


class GraphModule extends React.Component {
  constructor(props){
    super(props);
  }

  render(){

    const elements = [
       { data: { id: 'one', label: 'Node 1' }},
       { data: { id: 'two', label: 'Node 2' }},
       { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
    ];

    const layout = {'name': 'grid'};

    const style = { width: '600px', height: '600px'}

    return <div id="cy">
      <CytoscapeComponent elements={elements} style={style} layout={layout} /></div>;
  }
}

export default GraphModule
