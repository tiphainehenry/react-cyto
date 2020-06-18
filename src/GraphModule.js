import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

var data = require('./cytograph/data.json')

class GraphModule extends React.Component {
  constructor(props){
    super(props);
  }

  render(){

    const layout = {'name': 'grid'};

    const style = { width: '95%', 
                    height: '60%', 
                    'box-shadow': '0 2px 5px 0 rgba(0, 0, 0, 0.16)'
                  }

    const node_style = [
      {
        selector: "node",
        style: {
          "shape": "rectangle",
          "height": 80,
          "width": 120,
          "background-color": "#ccc",
          "border-style": "dashed",
          "border-width": 1,
          "border-color": "#777",
          "color": "#777",
          "font-size": 10,
          "font-weight": "bold",
          "text-halign": "center",
          "text-valign": "center",
          //"text-wrap": "ellipsis",
          "text-wrap": "wrap",
          "text-max-width": 60, 
          "line-height": 2.5,
          "label": "data(name)"
        }
      },
      {
        selector: 'node[type="sender"], node[type="receiver"]',
        style: {
          "height": 15,
        }
      },
        {
          selector: "node.executable",
          style: {
            "border-color": "#454545",
            "color": "#454545",
            "background-color": "#fafafa",
          }
        },
        {
          selector: "node.included",
          style: {
            "border-style": "solid"
          }
        },
        {
          selector: "node.executed",
          style: {
            "color": "#29A81A"
          }
        },
        {
          selector: "node.pending",
          style: {
            "border-color": "#1E90FF"
          }
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 2
          }
        }
    ]
    
    const edge_style = [
      {
        selector: "edge",
        style: {
          "width": 2,
          "curve-style": "bezier",
          "source-endpoint": "inside-to-node"
        }
      },
      {
        selector: 'edge.include, edge.exclude, edge.response]',
        style: {
          "target-arrow-shape": "triangle"
        }
      },
      {
        selector: 'edge.include',
        style: {
          "line-color": "#29A81A",
          "target-arrow-color": "#29A81A"
        }
      },
      {
        selector: "edge.exclude",
        style: {
          "line-color": "#FF0000",
          "target-arrow-color": "#FF0000"
        }
      },
      {
        selector: "edge.response",
        style: {
          "line-color": "#1E90FF",
          "target-arrow-color": "#1E90FF"
        }
      },
      {
        selector: "edge.condition",
        style: {
          "line-color": "#FFA500",
          "target-arrow-color": "#FFA500",
          "target-arrow-shape": "circle"
        }
      },
      {
        selector: "edge.milestone",
        style: {
          "line-color": "#BC1AF2",
          "target-arrow-color": "#BC1AF2",
          "target-arrow-shape": "diamond"
        }
      },
      {
        selector: "edge:selected",
        style: {
          "line-color": "#00d1b2",
          "target-arrow-color": "#00d1b2",
        }
      },
    ]
    
    const stylesheet = node_style.concat(edge_style)


    return <div id="cy">

      <CytoscapeComponent elements={data} stylesheet={stylesheet} layout={layout} style={style} />
      
      </div>;
  }
}

export default GraphModule
