angular.module('biologyGraphingApp').factory('documents', ['$http', '$state', 'auth',
function($http, $state, auth) {
	var o = {
		documents: []
	};

  o.getAll = function() {
		return $http.get('/users/documents', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			  angular.copy(data, o.documents);
		});
	};
  o.getDocument = function(id) {
    return $http.get('/users/documents/' + id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(res) {
      return res.data;
    });
  };
  o.deleteDocument = function(document) {
    return $http.delete('/users/documents/' + document._id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(deletedDocument) {

        o.documents.splice(o.documents.findIndex(function(doc) {
          doc._id = deletedDocument._id;
        }), 1);

        $http.delete('/users/graphs/' + document.graph, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				});

				var dataToSend = {user: auth.currentUserName(), documentId: document._id};
				$http.put('/users/documents/remove', dataToSend, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				});

				$state.go($state.current, {}, {reload: true}); // reload the page
        return deletedDocument;
      });
  };
  o.addDocument = function(newDocTitle, graphData) {
		var dataToSend = { graph: graphData };
    return $http.post('/users/graphs', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(graph) {
        var doc = { title: newDocTitle, graph: graph._id };
				var dataToSend = { document: doc };
        return $http.post('/users/documents', dataToSend, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(document) {
            o.documents.push(document);

						$state.go($state.current, {}, {reload: true}); // reload the page
            return document;
          });
      });
  };
  o.updateNetworkData = function(document, data) {
    return $http.put('/users/graphs/' + document.graph._id + '/network', data, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(returnedData) {
        document.graph.nodes = returnedData.nodes;
        document.graph.edges = returnedData.edges;
        return returnedData;
      });
  };
  o.loadCytoScape = function(docArg) {
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


				/****** TEST DRAW FUNCTION ******/
				/*function draw() {
        	$("input, select").attr("disabled", true);
                var networ_json = {
                  dataSchema: {
                    nodes: [ { name: "label",     type: "string" },
                             { name: "edgesFrom", type: "object", defValue: [] },
                             { name: "edgesTo",   type: "object", defValue: [] }
                           ],
                    edges: [ { name: "label", type: "string" } ]
                  },
                  data: {
                    nodes: [
                             { id: "n1", label: "1234567890", edgesFrom: [], edgesTo: [] },
                             { id: "n2", label: "T", edgesFrom: [], edgesTo: ["e3"] },
                             { id: "n3", label: "Here's a test", edgesFrom: [], edgesTo: ["e1","e2"] },
                             { id: "n4", label: "Other Biology Term", edgesFrom: [], edgesTo: [] },
                             { id: "n5", label: "AND ANOTHER.", edgesFrom: ["e1"], edgesTo: [] },
                             { id: "n6", label: "WWWWWWWWWWWW", edgesFrom: [], edgesTo: [] },
                             { id: "n7", label: "Chromosome", edgesFrom: ["e3"], edgesTo: [] },
                             { id: "n8", label: "WWWWWWWWW", edgesFrom: ["e2"], edgesTo: [] },
                             { id: "n9", label: "Hey, what's up", edgesFrom: [], edgesTo: [] }
                           ],
                    edges: [
                             { source: "n5", target: "n3", directed: true, label: "TESTING123" },
                             { source: "n8", target: "n3", directed: true },
                             { source: "n7", target: "n2", directed: true }
                           ]
                  }
                };

			    options.layout = { name: "CompoundSpringEmbedder" };
            	options.network = networ_json;
                options.visualStyle.nodes.width = { defaultValue: 120, customMapper: { functionName: "customNodeWidth" } };

            	vis.draw(options);
        }*/



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



        $("input").attr("disabled", true);

        // init and draw
        vis = new org.cytoscapeweb.Visualization(div_id, { swfPath: "CytoscapeWeb", flashInstallerPath: "playerProductInstall" });


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

            o.updateNetworkData(docArg, {nodes: newNodes, edges: newEdges});
        };

				/*****************************************/
				/***** Node Re-sizing based on label *****/
				/*****************************************/
				vis["customNodeWidth"] = function (data) {
					var labelLength = data['label'].length;
					var extraWidth = ( labelLength > 12 ? (labelLength-12) * 7 : 0)
					return 120 + extraWidth;
				};

				/***************************/
				/***** Add Edge Helper *****/
				/***************************/
				var _srcId;
				var _targId;

				function addEdgeHelper(src,targ, lab = "") {
						var e = vis.addEdge({ source: src, target: targ, directed: true, label: lab}, true);

						// Update nodes' edgesTo and edgesFrom data fields
						var srcNode = vis.node(src);
						srcNode.data.edgesFrom.push(e.data.id);
						vis.updateData([srcNode], { edgesFrom: srcNode.data.edgesFrom });

						var targNode = vis.node(targ);
						targNode.data.edgesTo.push(e.data.id);
						vis.updateData([targNode], { edgesTo: targNode.data.edgesTo });

						return e;
				}

				function clickNodeToAddEdge(evt) {
						if (_srcId != null) {
								_targId = evt.target.data.id;
							vis.removeListener("click", "nodes", clickNodeToAddEdge);

								var newEdge = addEdgeHelper(_srcId, _targId);

							_srcId = null;
								_targId = null;

								// UNDO INFO
								lastEvent = { type: "addEdge", target: JSON.stringify(newEdge) };
								eventStack.push(lastEvent);
						}
				}

				/**********************/
				/***** EDIT LABEL *****/
				/**********************/
				var elem = document.getElementById("content");///////////////////
				var oldLabel;
				var currString;

				function editLabel(object,type,lastEvent) {
						vis.deselect("nodes");
						vis.deselect("edges");
						vis.select([object]);

						oldLabel = object.data.label; // save old label

						currString = "";
						update(currString,object);

						// update current string to be displayed
						function update(str,object) { vis.updateData([object], { label: str }); }

						// left click: save label and add to event stack if not blank
						function mouseListener(event) {
								if (currString == "") { update(oldLabel,object); }
								else { eventStack.push(lastEvent); }
								elem.removeEventListener("keydown",returnKeyListener);
								elem.removeEventListener("keydown",escKeyListener);
								elem.removeEventListener("keydown",labelKeyListener);
								elem.removeEventListener("mouseup",mouseListener);
								elem.removeEventListener("contextmenu",contextMenuListener);
								vis.deselect([object]);
						}

						 // right click: save label and add to event stack if not blank
						function contextMenuListener(event) {
								if (currString == "") { update(oldLabel,object); }
								else { eventStack.push(lastEvent); }
								elem.removeEventListener("keydown",returnKeyListener);
								elem.removeEventListener("keydown",escKeyListener);
								elem.removeEventListener("keydown",labelKeyListener);
								elem.removeEventListener("mouseup",mouseListener);
								elem.removeEventListener("contextmenu",contextMenuListener);
								vis.deselect([object]);
						}

						// enter: save label
						function returnKeyListener(event) {
								if (event.keyCode == 13) {
										eventStack.push(lastEvent);
										elem.removeEventListener("keydown",returnKeyListener);
										elem.removeEventListener("keydown",escKeyListener);
										elem.removeEventListener("keydown",labelKeyListener);
										elem.removeEventListener("mouseup",mouseListener);
										elem.removeEventListener("contextmenu",contextMenuListener);
										vis.deselect([object]);
								}
						}

						// escape: cancel label edit and assign old label
						function escKeyListener(event) {
								if (event.keyCode == 27) {
										update(oldLabel,object);
										elem.removeEventListener("keydown",returnKeyListener);
										elem.removeEventListener("keydown",escKeyListener);
										elem.removeEventListener("keydown",labelKeyListener);
										elem.removeEventListener("mouseup",mouseListener);
										elem.removeEventListener("contextmenu",contextMenuListener);
										vis.deselect([object]);
								}
						}

						// add character to label
						function labelKeyListener(event) {
								var currChar;
								var code = event.keyCode;
								switch (true) {
										case ( ( code > 47 && code < 58 ) || ( code > 64 && code < 91 ) || ( code == 32 ) ):
												newChar = String.fromCharCode(code);
												currString += newChar;
												update(currString,object);
												break;
										case ( code == 8 ):
												currString = currString.substring(0,currString.length-1);
												break;
										case ( code == 186 ): currString += ';'; break;
										case ( code == 187 ): currString += '='; break;
										case ( code == 188 ): currString += ','; break;
										case ( code == 189 ): currString += '-'; break;
										case ( code == 190 ): currString += '.'; break;
										case ( code == 191 ): currString += '/'; break;
										case ( code == 222 ): currString += "'"; break;
								}
								update(currString,object);
						}

						elem.addEventListener("keydown",returnKeyListener);
						elem.addEventListener("keydown",escKeyListener);
						elem.addEventListener("keydown",labelKeyListener);
						elem.addEventListener("mouseup",mouseListener);
						elem.addEventListener("contextmenu",contextMenuListener);
				}


	      /****************/
	      /***** UNDO *****/
	      /****************/
	      var eventStack = new Array();
	      var targ;
	      var event;
	      var lastEvent;

        function undo() {
            event = eventStack.pop();
            targ = JSON.parse(event.target);

            switch (event.type) {
                case ("addNode"):
                    vis.removeElements([targ],true);
                    break;
                case ("addEdge"):
                    vis.removeElements([targ],true);
                    break;
                case ("deleteSelected"):
                    vis.addElements(targ,true);
                    break;
                case ("deleteNode"):
                    vis.addNode(targ.x, targ.y, targ.data, true);  // node

                    var edges = JSON.parse(event.edges);
                    for (var i = 0; i < event.edges.length; i++) {
                        addEdgeHelper(edges[i].data.source, edges[i].data.target);
                    }
                    //vis.addElements(JSON.parse(event.edges),true); // attached edges
                    event.edges = [];
                    break;
                case ("deleteEdge"):
                    //vis.addEdge(targ,true);
                    addEdgeHelper(targ.data.source, targ.data.target, targ.data.label);
                    break;
                case ("editLabel"):
                    vis.updateData([targ], { label: targ.data.label });
                    break;
            }
        }


				/********************************************/
        /***** Double click to edit nodes/edges *****/
        /********************************************/
        vis.addListener("dblclick", "nodes", function(evt) {
            // UNDO INFO
            lastEvent = { type: "editLabel", target: JSON.stringify(evt.target) };

            editLabel(evt.target,'n',lastEvent);
        })
        vis.addListener("dblclick", "edges", function(evt) {
            // UNDO INFO
            lastEvent = { type: "editLabel", target: JSON.stringify(evt.target) };

            editLabel(evt.target,'e',lastEvent);
        })


		    /********************************/
		    /****** CONTEXT MENU ITEMS ******/
		    /********************************/
				vis.ready(function() {
            var layout = vis.layout();
            $("input, select").attr("disabled", false);

            // NODE: ADD EDGE
            vis.addContextMenuItem("Add new edge", "nodes", function(evt) {
            	_srcId = evt.target.data.id;
                vis.removeListener("click", "nodes", clickNodeToAddEdge);
                vis.addListener("click", "nodes", clickNodeToAddEdge);
            })

            // NODE: EDIT LABEL
            vis.addContextMenuItem("Edit Label", "nodes", function(evt) {
                // UNDO INFO
                lastEvent = { type: "editLabel", target: JSON.stringify(evt.target) };

                editLabel(evt.target,'n',lastEvent);
            })

            // NODE: DELETE NODE
            vis.addContextMenuItem("Delete node", "nodes", function(evt) {
                // Update edge information
                var edgesF = evt.target.data.edgesFrom;
                var edgesT = evt.target.data.edgesTo;
                var edgeIDs = edgesF.concat(edgesT);

                var allEdges = [];
                var edge;
                for (var i = 0; i < edgeIDs.length; i++) {
                    edge = vis.edge(edgeIDs[i]);
                    allEdges.push(edge);
                }

                // For each edge update connected nodes' edge data
                var node;
                var index;
                for (var i = 0; i < edgesF.length; i++) {
                    //alert(edgesF[i]);
                    edge = vis.edge(edgesF[i]);///
                    node = vis.node(edge.data.target);///

                    index = node.data.edgesTo.indexOf(edgesF[i]);
                    node.data.edgesTo.splice(index,1);
                    vis.updateData([node], { edgesTo: node.data.edgesTo });
                }

                for (var i = 0; i < edgesT.length; i++) {
                    edge = vis.edge(edgesT[i]);
                    node = vis.node(edge.data.source);
                    index = node.data.edgesFrom.indexOf(edgesT[i]);
                    node.data.edgesFrom.splice(index,1);
                    vis.updateData([node], { edgesFrom: node.data.edgesFrom });
                }

                // UNDO INFO
                lastEvent = { type: "deleteNode", target: JSON.stringify(evt.target), edges: JSON.stringify(allEdges) };
                eventStack.push(lastEvent);

                vis.removeNode(evt.target.data.id, true);
            })

            // EDGE: EDIT LABEL
            vis.addContextMenuItem("Edit Label", "edges", function(evt) {
                // UNDO INFO
                lastEvent = { type: "editLabel", target: JSON.stringify(evt.target) };

                editLabel(evt.target,'e',lastEvent);
            })

            // EDGE: DELETE EDGE
            vis.addContextMenuItem("Delete edge", "edges", function(evt) {
                vis.removeEdge(evt.target.data.id, true);

                // UNDO INFO
                lastEvent = { type: "deleteEdge", target: JSON.stringify(evt.target) };
                eventStack.push(lastEvent);
            })

            // CANVAS: ADD NODE
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
                vis.updateData([n]);

                // UNDO INFO
                lastEvent = { type: "addNode", target: JSON.stringify(n) };
                eventStack.push(lastEvent);
            })

            // CANVAS: UNDO
            vis.addContextMenuItem("Undo event", function(evt) {
                undo();
            });


            // CANVAS: DELETE SELECTED
            vis.addContextMenuItem("Delete selected", function(evt) {
                var items = vis.selected();
                if (items.length > 0) {
                    vis.removeElements(items, true);
                    //alert(JSON.stringify(items));

                    // UNDO INFO
                    lastEvent = { type: "deleteSelected", target: JSON.stringify(items) };
                    eventStack.push(lastEvent);
                }
            });

            // TEST FUNCTION: PRINT UNDO STACK
            vis.addContextMenuItem("Print undo stack", function(evt) {
                var evts = "";
                for (var i = 0; i < eventStack.length; i++) {
                    evts += JSON.stringify(eventStack[i]);
                    evts += "\n\n";
                }
                alert(evts);
            });

            // TEST FUNCTION: Print the JSON information of an object
            vis.addContextMenuItem("Print info", function(evt) { alert(JSON.stringify(evt.target)); });

            vis.addContextMenuItem("Save Graph", function(evt) {
              saveGraph();
            });

            loadGraph(docArg.graph);
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
