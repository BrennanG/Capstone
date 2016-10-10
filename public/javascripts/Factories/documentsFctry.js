angular.module('biologyGraphingApp').factory('documents', ['$http', '$state', 'auth',
function($http, $state, auth) {
	var o = {
		documents: []
	};

  o.getAll = function() {
		return $http.get('/student/documents', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			  angular.copy(data, o.documents);
		});
	};
  o.getDocument = function(id) {
    return $http.get('/student/documents/' + id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(res) {
      return res.data;
    });
  };
  o.getDocumentForTeacher = function(id) {
    return $http.get('/student/documents/submissions/' + id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(res) {
      return res.data;
    });
  };
  o.deleteDocument = function(document) {
    return $http.delete('/student/documents/' + document._id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(deletedDocument) {

        o.documents.splice(o.documents.findIndex(function(doc) {
          doc._id = deletedDocument._id;
        }), 1);

        $http.delete('/student/graphs/' + document.graph, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				});

				var dataToSend = {student: auth.currentUserName(), documentId: document._id};
				$http.put('/student/documents/remove', dataToSend, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				});

				$state.go($state.current, {}, {reload: true}); // reload the page
        return deletedDocument;
      });
  };
  o.addDocument = function(newDocTitle, graphData) {
		var dataToSend = { graph: graphData };
    return $http.post('/student/graphs', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(graph) {
        var dataToSend = { title: newDocTitle, graph: graph._id };
        return $http.post('/student/documents', dataToSend, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(document) {
            o.documents.push(document);

						$state.go($state.current, {}, {reload: true}); // reload the page
            return document;
          });
      });
  };
  o.updateNetworkData = function(document, data) {
    return $http.put('/student/graphs/' + document.graph._id + '/network', data, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(returnedData) {
        document.graph.nodes = returnedData.nodes;
        document.graph.edges = returnedData.edges;
        document.graph.undoStack = returnedData.undoStack;
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
                    width: 9,//default: 7
                    opacity: 0.7,
                    labelFontSize: 12,
                    labelFontWeight: "bold",
                    selectionGlowOpacity: 0,
                    selectionColor: "ff0000"
                 }
            }
        };


		/****** TEST DRAW FUNCTION ******/
		function draw() {
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
                nodes: [],
                edges: []
              }
            };

            options.layout = { name: "CompoundSpringEmbedder" };
            options.network = networ_json;
            options.visualStyle.nodes.width = { defaultValue: 120, customMapper: { functionName: "customNodeWidth" } };

            vis.draw(options);
        }


        /*
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
        }*/
        

        $("input").attr("disabled", true);

        // init and draw
        vis = new org.cytoscapeweb.Visualization(div_id, { swfPath: "CytoscapeWeb", flashInstallerPath: "playerProductInstall" });

        
        /***************************/
        /***** ID Book-keeping *****/
        /***************************/
        var globalNode = 'n';
        var globalNodeID;
        var globalEdge = 'e';
        var globalEdgeID;
        
        function incrementNodeID() {
            var num = parseInt(globalNodeID.substring(1));
            num++;
            globalNodeID = "n" + num.toString();
        }
        
        function incrementEdgeID() {
            var num = parseInt(globalEdgeID.substring(1));
            num++;
            globalEdgeID = "e" + num.toString();
        }
        
        

	    var undoStack = new Array();
        
        var loadGraph = function(graph) {
            var nodes = graph.nodes;
            for (var j = 0; j < nodes.length; j++) {
              var node = JSON.parse(nodes[j]);
              var newNode = vis.addNode(node.x, node.y, { id: node.data.id, label: node.data.label, edgesFrom: node.data.edgesFrom, edgesTo: node.data.edgesTo }, true);
            }

            var edges = graph.edges;
            for (var k = 0; k < edges.length; k++) {
              var edge = JSON.parse(edges[k]);
              var newEdge = vis.addEdge({ id: edge.data.id, label: edge.data.label, source: edge.data.source, target: edge.data.target, directed: true });
            }
            
            var undoItems = graph.undoStack;
            for (var i = 0; i < undoItems.length; i++) {
                var undoItem = JSON.parse(undoItems[i]);
                undoStack.push(undoItem);
            }
            
            globalNodeID = globalNode.concat(vis.nodes().length.toString());
            globalEdgeID = globalEdge.concat(vis.edges().length.toString());
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
            
            var undoStackJSON = [];
            for (var i = 0; i < undoStack.length; i++) {
                undoStackJSON[i] = JSON.stringify(undoStack[i]);
            }

            o.updateNetworkData(docArg, {nodes: newNodes, edges: newEdges, undoStack: undoStackJSON});
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
        
		function addEdgeHelper(src, targ, id, lab = "") {
            if (id == "") {
                var e = vis.addEdge({ source: src, target: targ, directed: true, label: lab}, true);
            }
            else {
                var e = vis.addEdge({ source: src, target: targ, directed: true, label: lab, id: id}, true);
            }

			// Update nodes' edgesTo and edgesFrom data fields if the ID doesn't already exist
			var srcNode = vis.node(src);
            if (srcNode.data.edgesFrom.indexOf(e.data.id) == -1) {
                srcNode.data.edgesFrom.push(e.data.id);
                vis.updateData([srcNode], { edgesFrom: srcNode.data.edgesFrom });
            }

			var targNode = vis.node(targ);
            if (targNode.data.edgesTo.indexOf(e.data.id) == -1) {
                targNode.data.edgesTo.push(e.data.id);
                vis.updateData([targNode], { edgesTo: targNode.data.edgesTo });
            }
            
            // UNDO INFO
            lastEvent = { type: "addEdge", target: JSON.stringify(e) };
            undoStack.push(lastEvent);
            
            // Clearing redo stack
            redoStack = [];

			return e;
		}

		function clickNodeToAddEdge(evt) {
			if (_srcId != null) {
				_targId = evt.target.data.id;
				vis.removeListener("click", "nodes", clickNodeToAddEdge);

                incrementEdgeID();
				var newEdge = addEdgeHelper(_srcId, _targId, globalEdgeID);

                _srcId = null;
				_targId = null;

				/*// UNDO INFO
				lastEvent = { type: "addEdge", target: JSON.stringify(newEdge) };
				undoStack.push(lastEvent);
                
                // Clearing redo stack
                redoStack = [];*/
			}
		}

        /**********************/
        /***** EDIT LABEL *****/
        /**********************/
        var elem = document.getElementById("content");
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
                else { undoStack.push(lastEvent); }
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
                else { undoStack.push(lastEvent); }
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
                    undoStack.push(lastEvent);
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
        
        
        /******************************/
        /***** EDIT LABEL HANDLER *****/
        /******************************/
        function editLabelHandler(evt,group) {
            // UNDO INFO
            lastEvent = { type: "editLabel", target: JSON.stringify(evt.target) };
               
            // Clearing redo stack
            redoStack = [];

            editLabel(evt.target,group,lastEvent);
        }
        
          
        /*******************/
        /***** TOOLBAR *****/
        /*******************/
        $('#toolbar').w2toolbar({
            name: 'toolbar',
            items: [
                { type: 'check',  id: 'item1', caption: 'Add Node'},//, img: 'icon-page', checked: false },
                { type: 'check',  id: 'item2', caption: 'Add Edge'},//, img: 'icon-page', checked: false },
                { type: 'check',  id: 'item3', caption: 'Edit Label'},//, img: 'icon-page', checked: false },
                { type: 'check',  id: 'item4', caption: 'Delete Target'},//, img: 'icon-page', checked: false },
                { type: 'button',  id: 'item5', caption: 'Delete Selected'},//, img: 'icon-page', checked: false },
                { type: 'button',  id: 'item6', caption: 'Undo'},//, img: 'icon-page', checked: false },
                { type: 'button',  id: 'item7', caption: 'Redo'},//, img: 'icon-page', checked: false },
                { type: 'button',  id: 'item8', caption: 'Save'},//, img: 'icon-page', checked: false }
            ]
        });
        
        var tb = w2ui['toolbar'];
        var items = tb['items'];
        
        function addNodeListener(event) {
            var btn = tb.get('item1');
            if (btn.checked == true) {
                addNode(event);
                tb.uncheck(btn.id);
            }
            vis.removeListener("click",addNodeListener);  
        }
        
        function deleteTargetListener(event) {
            var btn = tb.get('item4');
            if (btn.checked == true) {
                if (event.group == "nodes") { deleteNode(event); }
                else if (event.group == "edges") { deleteEdge(event); }
                tb.uncheck(btn.id);
            }
            vis.removeListener("click","nodes",deleteTargetListener);
            vis.removeListener("click","edges",deleteTargetListener);  
        }
        
        function editLabelListener(event) {
            var btn = tb.get('item3');
            if (btn.checked == true) {
                if (event.group == "nodes") { editLabelHandler(event,'n'); }
                else if (event.group == "edges") { editLabelHandler(event,'e'); }
                tb.uncheck(btn.id);
            }
            vis.removeListener("click","nodes",editLabelListener);
            vis.removeListener("click","edges",editLabelListener);
        }
        
        w2ui.toolbar.on('click', function(event) {
            targ = tb.get(event.target);
            
            for (var i = 0; i < items.length; i++) {
                if (items[i].id != event.target) { tb.uncheck(items[i].id); }
            }
            
            if (targ.checked != true) {
                switch (event.target) {
                    case ("item1"): // Add Node
                        vis.addListener("click",addNodeListener);
                        break;
                    case ("item2"): // Add Edge
                        // do something to get src and targ, then call addEdgeHelper()
                        // incrementGlobalEdgeID (i think need to inc before call to addEdgeHelper)
                    
                        break;
                    case ("item3"): // Edit Label
                        vis.addListener("click","nodes",editLabelListener);
                        vis.addListener("click","edges",editLabelListener);
                        break;
                    case ("item4"): // Delete Target
                        vis.addListener("click","nodes",deleteTargetListener);
                        vis.addListener("click","edges",deleteTargetListener);
                        break;
                    case ("item5"): // Delete Selected
                        deleteSelected();
                        break;
                    case ("item6"): // Undo
                        undo();
                        break;
                    case ("item7"): // Redo
                        redo();
                        break;
                    case ("item8"): // Save
                        saveGraph();
                        break;
                }
            }
        });


	    /****************/
	    /***** UNDO *****/
	    /****************/
        var lastEvent;

        function undo() {
            var event = undoStack.pop();
            var targ = JSON.parse(event.target);
            
            // Get current label for redo before undoing
            if (event.type == "editLabel") {
                var node = vis.node(targ.data.id);
                event.label = node.data.label;
            }            
            
            // Push to redo stack
            redoStack.push(event);

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
                        data = edges[i].data;
                        addEdgeHelper(data.source, data.target, data.id, data.label);
                    }
                    
                    event.edges = [];
                    break;
                case ("deleteEdge"):
                    var data = targ.data;
                    addEdgeHelper(data.source, data.target, data.id, data.label);
                    break;
                case ("editLabel"):
                    vis.updateData([targ], { label: targ.data.label });
                    break;
            }
        }
        
        /****************/
        /***** REDO *****/
        /****************/
        var redoStack = new Array();
        
        function redo() {
            event = redoStack.pop();
            targ = JSON.parse(event.target);
            
            // Push to undo stack
            undoStack.push(event);
            
            switch (event.type) {
                case ("addNode"):
                    vis.addElements([targ],true);
                    break;
                case ("addEdge"):
                    vis.addElements([targ],true);
                    break;
                case ("deleteSelected"):
                    vis.removeElements(targ,true);
                    break;
                case ("deleteNode"):
                    vis.removeElements([targ],true);
                    break;
                case ("deleteEdge"):
                    vis.removeElements([targ],true);
                    breal;
                case ("editLabel"):
                    vis.updateData([targ], { label: event.label });
                    break;
            }
            
        }


		/********************************************/
        /***** Double click to edit nodes/edges *****/
        /********************************************/
        vis.addListener("dblclick", "nodes", function(evt) {
            editLabelHandler(evt,'n');
        })
        vis.addListener("dblclick", "edges", function(evt) {
            editLabelHandler(evt,'e');
        })
        
        
        /***** ADD NODE *****/
        function addNode(evt) {
            var x = evt.mouseX;
            var y = evt.mouseY;
            var parentId;
            
            // Handle compound nodes
            if (evt.target != null && evt.target.group == "nodes") {
                parentId = evt.target.data.id;
                x = evt.target.x;
                y = evt.target.y;
                x += Math.random() * (evt.target.width/3) * (Math.round(Math.random()*100)%2==0 ? 1 : -1);
                y += Math.random() * (evt.target.height/3) * (Math.round(Math.random()*100)%2==0 ? 1 : -1);
            }
            
            incrementNodeID();
            var n = vis.addNode(x, y, { parent: parentId, id: globalNodeID }, true);
            vis.updateData([n]);

            // UNDO INFO
            lastEvent = { type: "addNode", target: JSON.stringify(n) };
            undoStack.push(lastEvent);
            
            // Clearing redo stack
            redoStack = [];
        }
        
        /***** DELETE NODE *****/
        // Update edge information
        function deleteNode(evt) {
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
                edge = vis.edge(edgesF[i]);
                node = vis.node(edge.data.target);

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
            undoStack.push(lastEvent);
            
            // Clearing redo stack
            redoStack = [];

            vis.removeNode(evt.target.data.id, true);
        }
        
        function deleteEdge(evt) {
            vis.removeEdge(evt.target.data.id, true);

            // UNDO INFO
            lastEvent = { type: "deleteEdge", target: JSON.stringify(evt.target) };
            undoStack.push(lastEvent);
                
            // Clearing redo stack
            redoStack = [];
        }
        
        function deleteSelected(evt) {
            var items = vis.selected();
                
            if (items.length > 0) {                    
                    
                // Loop through items and get all attached edges
                var attachedEdges = [];
                var selectedEdgesIDs = [];
                var len = items.length;
                
                // Populate array of selected edges
                for (var i = 0; i < len; i++) {
                    if (items[i].group == "edges") {
                        selectedEdgesIDs.push(items[i].data.id);
                    }
                }
                
                // Loop through the selected items
                for (var i = 0; i < len; i++) {
                
                     // Only look at the nodes
                    if (items[i].group == "nodes") {
                    
                        // Populate array of all the node's edges
                        var edgesF = items[i].data.edgesFrom;
                        var edgesAll = edgesF.concat(items[i].data.edgesTo);
                        
                         // Loop through node's edges
                        for (var j = 0; j < edgesAll.length; j++) {
                    
                            // Ensure the edge isn't already in the selected items array
                            if (selectedEdgesIDs.indexOf(edgesAll[j]) == -1) {
                            
                                // Pushing edge onto the items array
                                items.push(vis.edge(edgesAll[j]));
                            }
                            
                        }
                    }
                }

                vis.removeElements(items, true);
                
                // UNDO INFO
                lastEvent = { type: "deleteSelected", target: JSON.stringify(items) };
                undoStack.push(lastEvent);
                
                // Clearing redo stack
                redoStack = [];
            }
        }

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
                editLabelHandler(evt,'n');
            })

            // NODE: DELETE NODE
            vis.addContextMenuItem("Delete node", "nodes", function(evt) {
                deleteNode(evt);
            })

            // EDGE: EDIT LABEL
            vis.addContextMenuItem("Edit Label", "edges", function(evt) {
                editLabelHandler(evt,'e');
            })

            // EDGE: DELETE EDGE
            vis.addContextMenuItem("Delete edge", "edges", function(evt) {
                deleteEdge(evt);
            })

            // CANVAS: ADD NODE
            vis.addContextMenuItem("Add new node", function(evt) {
                addNode(evt);
            })

            // CANVAS: UNDO
            vis.addContextMenuItem("Undo event", function(evt) {
                undo();
            });
            
            // CANVAS: REDO
            vis.addContextMenuItem("Redo event", function(evt) {
                redo();
            });


            // CANVAS: DELETE SELECTED
            vis.addContextMenuItem("Delete selected", function(evt) {
                deleteSelected(evt);
            });

            // TEST FUNCTION: PRINT UNDO STACK
            vis.addContextMenuItem("Print undo stack", function(evt) {
                var evts = "";
                for (var i = 0; i < undoStack.length; i++) {
                    evts += JSON.stringify(undoStack[i]);
                    evts += "\n\n";
                }
                alert(evts);
            });
            
            
            // TEST FUNCTION: PRINT GLOBAL ID's
            vis.addContextMenuItem("Print Global IDs", function(evt) {
                alert("NODE: " + globalNodeID + "\nEDGE: " + globalEdgeID);
                
                var d = new Date(Date.now());
                //alert((d.getMonth()+1) + "-" + d.getDate() + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
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

        // Register control listeners:
        $("#reapplyLayout").click(function(evt) {
            var layout = vis.layout();
            vis.layout(layout);
        });

        draw();
  };

	return o;
}]);
