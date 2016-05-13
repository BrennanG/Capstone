var app = angular.module('biologyGraphingApp', ['ui.router']);

///////////////////// STATES /////////////////////////////
app.config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('home', {
		url : '/home',
		templateUrl : '/home.html',
		controller : 'HomeCtrl',
    resolve: {
      postPromise : ['documents', function(documents) {
			  return documents.getAll();
			}]
    }
	}).state('documents', {
		url : '/documents/{id}',
		templateUrl : '/documents.html',
		controller : 'DocumentsCtrl',
    resolve: {
      document: ['$stateParams', 'documents', function($stateParams, documents) {
        return documents.getDocument($stateParams.id);
      }]
    }
  });

	$urlRouterProvider.otherwise('home');
}]);
///////////////////// END STATES /////////////////////////////

///////////////////// FACTORIES /////////////////////////////
app.factory('documents', ['$http',
function($http) {
	var o = {
		documents: []
	};

  o.getAll = function() {
		return $http.get('/documents')
      .success(function(data) {
			  angular.copy(data, o.documents);
		});
	};
  o.getDocument = function(id) {
    return $http.get('/documents/' + id).then(function(res) {
      return res.data; // res.data is what we do for get post, not sure why
    });
  };
  o.addDocument = function(title, graphData) {
    return $http.post('/graphs', graphData)
      .success(function(graph) {
        var doc = { title: title, graph: graph._id };
        return $http.post('/documents', doc)
          .success(function(document) {
            o.documents.push(document);
            return document;
          });
      });
  };
  o.updateNetworkData = function(document, data) {
    return $http.put('/graphs/' + document.graph._id + '/network/data', data)
      .success(function(returnedData) {
        document.graph.nodes = returnedData.nodes;
        document.graph.edges = returnedData.edges;
        return returnedData;
      });
  };
  o.loadCytoScape = function(document) {
    $("#content").html('<div id="cytoscapeweb" width="*">Cytoscape Web will replace the contents of this div with your graph.</div>');

        var div_id = "cytoscapeweb";
        var vis;

        // options used for Cytoscape Web
        var options = {
            nodeTooltipsEnabled: true,
            edgeTooltipsEnabled: true,
            edgesMerged: false,
            edgeLabelsVisible: true,
            nodeLabelsVisible: true,
            visualStyle: {
                global: {
                    backgroundColor: "#fdfdfd",
                    tooltipDelay: 1000
                },
                nodes: {
                    shape: "RECTANGLE",
                    compoundShape: "RECTANGLE",
                    color: "#ffffb3",
                    opacity: 0.9,
                    height: 70,
                    borderWidth: 2,
                    borderColor: "#707070",
                    compoundBorderColor: "#abcfd6",
                    compoundBorderWidth: 2,
                    labelFontSize: 12,
                    labelFontWeight: "bold",
                    labelHorizontalAnchor: "center",
                    labelFontName: "Courier",
                    selectionGlowOpacity: 0,
                    selectionBorderColor: "ff0000",
                    hoverBorderWidth: 4
                },
                edges: {
                	  color: "#0b94b1",
                    width: 7,
                    opacity: 0.7,
                    labelFontSize: 12,
                    labelFontWeight: "bold",
                    selectionGlowOpacity: 0,
                    selectionColor: "ff0000"
                 }
            }   
        };
        
        function draw() {
        	$("input, select").attr("disabled", true);
          options.network = {
                dataSchema: {
                    nodes: [ { name: "label", type: "string" } ],
                    edges: [ { name: "label", type: "string" } ]
                },
                data: {}
          };
			    options.layout = { name: "CompoundSpringEmbedder" };
          options.visualStyle.nodes.width = { defaultValue: 120, customMapper: { functionName: "customNodeWidth" } };       

          vis.draw(options);
        }

        var _srcId;
        function clickNodeToAddEdge(evt) {
            if (_srcId != null) {
            	vis.removeListener("click", "nodes", clickNodeToAddEdge);
            	var e = vis.addEdge({ source: _srcId, target: evt.target.data.id, directed: true}, true);
            	_srcId = null;
            }
        }
        
        $("input").attr("disabled", true);

        // init and draw
        vis = new org.cytoscapeweb.Visualization(div_id, { swfPath: "CytoscapeWeb", flashInstallerPath: "playerProductInstall" });

        vis["customNodeWidth"] = function (data) {
          var labelLength = data['label'].length;
          var extraWidth = ( labelLength > 12 ? (labelLength-12) * 7 : 0)
          return 120 + extraWidth;
        };

        var loadGraph = function(graph) {
            var nodes = graph.nodes;
            for (var j = 0; j < nodes.length; j++) {
              var node = JSON.parse(nodes[j].replace(/\\/g, ""));
              var newNode = vis.addNode(node.x, node.y, { id: node.data.id, label: node.data.label }, true);
            }

            var edges = graph.edges;
            for (var k = 0; k < edges.length; k++) {
              var edge = JSON.parse(edges[k].replace(/\\/g, ""));
              var newEdge = vis.addEdge({ id: edge.data.id, label: edge.data.label, source: edge.data.source, target: edge.data.target, directed: true });
            }
        };
        
        var saveGraph = function() {
            var nodes = vis.nodes();
            var newNodes = [];
            for (var i = 0; i < nodes.length; i++) {
              newNodes[i] = JSON.stringify(nodes[i]);
            }

            var edges = vis.edges();
            var newEdges = [];
            for (var i = 0; i < edges.length; i++) {
              newEdges[i] = JSON.stringify(edges[i]);
            }

            o.updateNetworkData(document, {nodes: newNodes, edges: newEdges});
        };        

        vis.ready(function() {
            var layout = vis.layout();
            $("input, select").attr("disabled", false);
            
            // Right click on a node
            vis.addContextMenuItem("Add new edge", "nodes", function(evt) {
            	_srcId = evt.target.data.id;
                vis.removeListener("click", "nodes", clickNodeToAddEdge);
                vis.addListener("click", "nodes", clickNodeToAddEdge);
            });
            vis.addContextMenuItem("Edit Label", "nodes", function(evt) {
                vis.updateData([evt.target], { label: "1234567890"});
            });
            vis.addContextMenuItem("Delete node", "nodes", function(evt) {
                vis.removeNode(evt.target.data.id, true);
            });
            // Right click on an edge
            vis.addContextMenuItem("Edit Label", "edges", function(evt) {
                vis.updateData([evt.target], { label: "LABEL"});
            });
            vis.addContextMenuItem("Delete edge", "edges", function(evt) {
                vis.removeEdge(evt.target.data.id, true);
            });
            // Right click on open area
            vis.addContextMenuItem("Add new node", function(evt) {
                var x = evt.mouseX;
                var y = evt.mouseY;
                var parentId;
                if (evt.target != null && evt.target.group == "nodes") {
                    parentId = evt.target.data.id;
                    x = evt.target.x;
                    y = evt.target.y;
                    x += Math.random() * (evt.target.width/3) * (Math.round(Math.random()*100)%2==0 ? 1 : -1);
                    y += Math.random() * (evt.target.height/3) * (Math.round(Math.random()*100)%2==0 ? 1 : -1);
                }
                var n = vis.addNode(x, y, { parent: parentId }, true);
                n.data.label = n.data.id;
                vis.updateData([n]);
            });
            vis.addContextMenuItem("Delete selected", function(evt) {
                var items = vis.selected();
                if (items.length > 0) { vis.removeElements(items, true); }
            });
            
            vis.addContextMenuItem("Save Graph", function(evt) {
              saveGraph();
            });

            loadGraph(document.graph);
        });
        
        vis.addListener("error", function(err) {
		      alert(err.value.msg);
        });

        // Register control liteners:
        $("#reapplyLayout").click(function(evt) {
            var layout = vis.layout();
            vis.layout(layout);
        });

        draw();
  };

	return o;
}]);
///////////////////// END FACTORIES ////////////////////////////

///////////////////// CONTROLLERS /////////////////////////////
app.controller('HomeCtrl', ['$scope', 'documents',
function($scope, documents) {
	$scope.documents = documents.documents;
  
  $scope.addDocument = function() {
    // TODO: remove place-holders
    if ($scope.title === '') { return; }
    var graph = { nodes: [], edges: [] };
    documents.addDocument($scope.title, graph);
    $scope.title = '';
  };

}]);

app.controller('DocumentsCtrl', ['$scope', 'documents', 'document',
function($scope, documents, document) {
	$scope.document = document;
  $scope.nodes = document.graph.nodes;
  $scope.edges = document.graph.edges;

  documents.loadCytoScape(document);

}]);
///////////////////// END CONTROLLERS /////////////////////////////
