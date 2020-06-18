//import edges from './relations'
//import events from './tasks'

var tasks = require('./tasks.json')
var edges = require('./edges.json')

console.log(tasks)
console.log(edges)
/////////////////////////// CONFIG //////////////////////////////
const node_style = [
  {
    selector: "node",
    style: {
      "shape": "rectangle",
      "height": 35,
      "width": 65,
      "background-color": "#ccc",
      "border-style": "dashed",
      "border-width": 1,
      "border-color": "#777",
      "color": "#777",
      "font-size": 6,
      "font-weight": "bold",
      "text-halign": "center",
      "text-valign": "center",
      //"text-wrap": "ellipsis",
      "text-wrap": "wrap",
      "text-max-width": 60, 
      "line-height": 2,
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

const config = {
    elements: tasks.concat(edges),
    style: node_style.concat(edge_style),
    layout: { 
      name: "grid",
      fit: true, // whether to fit the viewport to the graph 
      rows:5, 
      columns:12, 
      padding: 10, // the padding on fit 
    }
  };
  
export default config;