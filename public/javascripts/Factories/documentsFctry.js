angular.module('biologyGraphingApp').factory('documents', ['$http', '$state', 'auth',
function($http, $state, auth) {
	var o = {
		documents: []
	};

	// Gets all of the logged in student's documents
  o.getAll = function() {
		return $http.get('/student/documents', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			  angular.copy(data, o.documents);
		});
	};
	// Gets a single one of the logged in student's documents
  o.getDocument = function(id) {
    return $http.get('/student/documents/' + id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(res) {
      return res.data;
    });
  };
	// Gets a single submitted document to the logged in teacher's assignment
  o.getDocumentForTeacher = function(id) {
    return $http.get('/student/documents/submissions/' + id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(res) {
      return res.data;
    });
  };
	// Deletes a specific one of the logged in student's documents
  o.deleteDocument = function(document) {
    return $http.delete('/student/documents/' + document._id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(deletedDocument) {

        o.documents.splice(o.documents.findIndex(function(doc) {
          doc._id = deletedDocument._id;
        }), 1);

				var dataToSend = {student: auth.currentEmail(), documentId: document._id};
				$http.put('/student/documents/remove', dataToSend, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				});

				$state.go($state.current, {}, {reload: true}); // reload the page
        return deletedDocument;
      });
  };
	// Adds a new document to the logged in student's document list
  o.addDocument = function(newDocTitle, graphData) {
    var dataToSend = { title: newDocTitle, graph: graphData };
    return $http.post('/student/documents', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(document) {
        o.documents.push(document);

				$state.go($state.current, {}, {reload: true}); // reload the page
        return document;
    });
  };
	// Renames a document
  o.renameDocument = function(document, newTitle) {
    var dataToSend = { title: newTitle };
		return $http.put('/student/documents/' + document._id + '/title', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(returnedData) {
      $state.go($state.current, {}, {reload: true}); // reload the page
    });
  };
	// Updates the grade of single submitted document to the logged in teacher's assignment
	o.updateGrade = function(document, grade) {
		var dataToSend = { document: document._id, grade: grade };
		return $http.put('/teacher/assignments/' + document.submittedTo + '/submission/grade', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(returnedData) {
        $state.go($state.current, {}, {reload: true}); // reload the page
        return returnedData;
    });
  };
	// Saves changes to a specific graph
  o.updateGraph = function(document, data) {
    return $http.put('/student/documents/' + document._id + '/graph', data, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(returnedData) {
        document.graph.elements = returnedData.elements;
        document.graph.undoStack = returnedData.undoStack;
        return returnedData;
      });
  };
	// Loads the graphing page
  o.loadCytoScape = function(docArg, readOnly, setDirtyBit) {
        var cy = cytoscape({
        container: document.getElementById('cy'),
        wheelSensitivity: .2,
        zoom: 1.5,
        maxZoom: 1.5,
        minZoom: 0.7,

        style: [
            {		// styling for nodes
                selector: 'node',
                style: {
                    shape: 'rectangle',
                    "text-valign" : "center",
                    "text-halign" : "center",
                    label: 'data(label)',
                    width: 'data(width)'
                }
            },
            {		// styling for edges
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    label: 'data(label)',
										'text-outline-width': 2.5,
										"text-outline-color": "#f4f8ff"
                }
            }
        ],

        elements: []
    });

    var graph = document.getElementById("cy");
		var cy = $('#cy').cytoscape('get');

    var undoStack = new Array();


    /***************************/
    /***** ID Book-keeping *****/
    /***************************/
		// used to ensure no ID collision occurs when using undoStack/redoStack

		// increment functions are called whenever a node/edge is created, so
		// there is never a collision between a deleted item on the undo stack
		// and an item created later on (e.g. whenever you create a node it is
		// always a higher ID than any other node that has been created so far)

    var globalNodeID = "";
    var globalEdgeID = "";

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


    /**************************/
    /***** GET TIME STAMP *****/
    /**************************/
    function getTimeStamp() {
        var d = new Date(Date.now());
        var t = (d.getMonth()+1) + "-" + d.getDate() + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        return t;
    }


		/**************************/
		/***** GET TEXT WIDTH *****/
		/**************************/
		// returns the width of inputted text
		function getTextWidth(text, font) {
		    // re-use canvas object for better performance
		    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
		    var context = canvas.getContext("2d");
		    context.font = font;
		    var metrics = context.measureText(text);
		    return metrics.width;
		}

		// uses getTextWidth() to set a node's width based on its label
		function handleWidth(target, label) {
				var width = getTextWidth(label, 'normal 16px helvetica');
				if ((width + 20) < 50) {
						target.data('width', 60);
				}
				else {
						target.data('width', width + 20);
				}
		}

		/*******************/
		/***** TOOLBAR *****/
		/*******************/
		// w2ui toolbar used to handle graph functionality

		// destroy the toolbar before recreating it
		// prevents w2ui error that occurs if you try to create toolbar twice
		if (w2ui.hasOwnProperty('toolbar')) {
			w2ui['toolbar'].destroy();
		}

		// create the toolbar and its items (buttons)
		$('#toolbar').w2toolbar({
				name: 'toolbar',
				items: [
						{ type: 'check',  id: 'item1', caption: 'Add Node', disabled: readOnly},
						{ type: 'check',  id: 'item2', caption: 'Add Edge', disabled: readOnly},
						{ type: 'button',  id: 'item3', caption: 'Edit Label', disabled: true},
						{ type: 'button',  id: 'item4', caption: 'Delete', disabled: true},
						{ type: 'button',  id: 'item5', caption: 'Undo', disabled: readOnly},
						{ type: 'button',  id: 'item6', caption: 'Redo', disabled: true},
						{ type: 'button',  id: 'item7', caption: 'Save', disabled: readOnly},
						{ type: 'button',  id: 'item8', caption: 'Fit'},
						//{ type: 'button',  id: 'item9', caption: 'Print Undo Stack'},
				]
		});

		var tb = w2ui['toolbar'];
		var items = tb['items'];


		/**********************/
		/***** LOAD GRAPH *****/
		/**********************/
		loadGraph(docArg.graph);
    function loadGraph(graph) {
				// HANDLE NODES AND EDGES //
				if (graph.elements != "") {
					cy.add(JSON.parse(graph.elements));
				}

				// HANDLE UNDO STACK //
        var undoItems = graph.undoStack;
				var deletedElems = [];

				// loop backwards so deleted elements are re-created before other undo
				// events use them as their target
				for (var i = undoItems.length-1; i >= 0; i--) {
            var undoItemTemp = JSON.parse(undoItems[i]);

						var undoItem = {
								type: undoItemTemp.type,
								time: undoItemTemp.time,
						}

						// handling oldlabel for "editLabel"
						if (undoItem.type == "editLabel") {
								undoItem.oldLabel = undoItemTemp.oldLabel;
						}

						// handling "deleteSelected" case
						if (undoItemTemp.type == "deleteSelected") {
								targStrings = [];
								targElems = [];

								// split target string into array of deleteSelected target strings
								targStrings = undoItemTemp.target.split("<newelem>");

								// loop through deleteSelected target strings
								for (var j = 0; j < targStrings.length; j++) {
										// parse deleteSelected target string into JSON
										var targJSON = JSON.parse(targStrings[j]);

										// add the JSON object
										cy.add(targJSON);

										// get the element by its ID
										var elem = cy.getElementById(targJSON.data.id);

										targElems.push(elem);
										deletedElems.push(elem);
								}
								undoItem.target = targElems;
						}
						else {
								targJSON = JSON.parse(undoItemTemp.target);
								undoItem.target = cy.getElementById(targJSON.data.id);
						}

						undoStack[i] = undoItem;
        }

				// setting global ID's
        globalNodeID = "n".concat(cy.nodes().length.toString());
        globalEdgeID = "e".concat(cy.edges().length.toString());

				// removing deletedElems after undo stack is completely loaded
				for (var i = 0; i < deletedElems.length; i++) {
						cy.remove(deletedElems[i]);
				}

				// disable undo toolbar item if undoStack is empty
				if (undoStack.length == 0) {
						tb.disable("item5");
				}
    };

		cy.fit(cy.$('node'), 100); // set intial fit
		if (readOnly) { cy.nodes().ungrabify(); } // disable grabbing in read only


		/**********************/
		/***** SAVE GRAPH *****/
		/**********************/
    var saveGraph = function() {
				// unselect all elements before saving
				var selectedElements = cy.$('node:selected, edge:selected');
				selectedElements.unselect();

        var undoStackJSON = [];
				// make JSON object out of every undoStack item
        for (var i = 0; i < undoStack.length; i++) {
						undoStackJSON[i] = {};
						undoStackJSON[i].type = undoStack[i].type;
						undoStackJSON[i].time = undoStack[i].time;

						// handle case where delete has multiple targets
						if (undoStackJSON[i].type == "deleteSelected") {
								undoStackJSON[i].target = "";
								for (var j = 0; j < undoStack[i].target.length; j++) {
										undoStackJSON[i].target += JSON.stringify(undoStack[i].target[j].json());
										if (j != undoStack[i].target.length-1) {
												undoStackJSON[i].target += "<newelem>";
										}
								}
						}
						else {
								undoStackJSON[i].target = JSON.stringify(undoStack[i].target.json());
						}

						// save old label in JSON object for editLabel undoStack item
						if (undoStack[i].type == 'editLabel') {
								undoStackJSON[i].oldLabel = undoStack[i].oldLabel;
						}

						undoStackJSON[i] = JSON.stringify(undoStackJSON[i]); // stringify JSON
        }

        o.updateGraph(docArg, { elements: JSON.stringify(cy.elements().jsons()), undoStack: undoStackJSON });

				// HANDLE DIRTY BIT
				setClean();
    };


		/****************************************************/
		/***** HANDLE GRAY-OUT OF EDIT LABEL AND DELETE *****/
		/****************************************************/
		cy.on("select", toolbarSelectHandler);
		cy.on("unselect", toolbarUnselectHandler)

		function toolbarSelectHandler(event) {
				tb.enable("item3");
				tb.enable("item4");
		}

		function toolbarUnselectHandler(event) {
				tb.disable("item3");
				tb.disable("item4");
		}


    /*********************************/
    /***** DOUBLE CLICK LISTENER *****/
    /*********************************/
		// used for editLabel
    var tappedBefore;
    var tappedTimeout;
    cy.on('click', function(event) {
        var tappedNow = event.cyTarget;
        if (tappedTimeout && tappedBefore) {
            clearTimeout(tappedTimeout);
        }
        if(tappedBefore === tappedNow) {
            tappedNow.trigger('doubleTap');
            tappedBefore = null;
        }
        else {
            tappedTimeout = setTimeout(function(){ tappedBefore = null; }, 300);
            tappedBefore = tappedNow;
        }
    });

		if (!readOnly) {
	    	cy.on('doubleTap', 'node', editLabel_ListenerDBL);
	    	cy.on('doubleTap', 'edge', editLabel_ListenerDBL);
		}


		/**********************************/
		/***** TOOLBAR EVENT HANDLERS *****/
		/**********************************/
    function addNode_Listener(event) {
        addNode(event.cyRenderedPosition.x, event.cyRenderedPosition.y);
    }

		var source;
    var dest;
		function addEdge_Listener(event) {
				if (source == "") { // if there isn't a source node yet
						source = this.id();
				}
				else { // else there is already a source node
						dest = this.id();
						addEdge(source, dest);

						source = "";
						dest = "";
				}
		}

		function editLabel_Handler() {
				// ensuring only one element is selected
				var selectedElems = cy.$(':selected');
				if (selectedElems.length == 1) {
						editLabel(selectedElems[0]);
				}
				else if (selectedElems.length > 1) { alert("You can only edit one label at a time!"); }
		}

		// used for editing labels with double click
    function editLabel_ListenerDBL(event) {
        var targ = event.cyTarget;
				editLabel(targ);
    }


    /***************************/
    /***** TOOLBAR ONCLICK *****/
    /***************************/
		// Handles clicking buttons on the toolbar
    w2ui.toolbar.on('click', function(event) {
        var targ = tb.get(event.target); // get the clicked button

				// Any time a button is clicked, turn off any listeners that may have
				// previously been created
				cy.off('click', addNode_Listener);
				cy.off('click', 'node', addEdge_Listener);

				// making sure only one button can be checked at a time
        for (var i = 0; i < items.length; i++) {
            if (items[i].id != event.target) { tb.uncheck(items[i].id); }
        }

        if (targ.checked != true) {
            switch (event.target) {
                case ("item1"): // Add Node
										var selectedElements = cy.$('node:selected, edge:selected');
										selectedElements.unselect();

										cy.on('click', addNode_Listener);
                    break;
                case ("item2"): // Add Edge
										var selectedElements = cy.$('node:selected, edge:selected');
										selectedElements.unselect();

										source = "";
										dest = "";

                    cy.on('click', 'node', addEdge_Listener);
                    break;
                case ("item3"): // Edit Label
										editLabel_Handler();
                    break;
                case ("item4"): // Delete Selected
                    deleteSelected();
                    break;
                case ("item5"): // Undo
                    undo();
                    break;
                case ("item6"): // Redo
                    redo();
                    break;
                case ("item7"): // Save
                    saveGraph();
                    break;
                case ("item8"): // Fit
                    cy.fit(cy.$('node'), 100);
                    break;
								case ("item9"): // Print Undo stack
										for (var i = 0; i < undoStack.length; i++) {
												console.log(undoStack[i]);
										}
										break;
            }
        }
				else { // if unchecking an item
					switch (event.target) {
							case ("item1"): // Add Node
									cy.off('click', addNode_Listener);
									break;
							case ("item2"): // Add Edge
									cy.off('click', 'node', addEdge_Listener);
									break;
					}
				}
    });


		/*************************/
		/***** HANDLE DIRTY ******/
		/*************************/
		// used to check if any changes have been made for the purpose of graying-out
		// the "save" button and giving warnings when leaving the page
		var dirty;
		setClean();

		function setDirty() {
			if (!dirty) {
				dirty = true;
				setDirtyBit(true);
			}
			tb.enable("item7");
		}

		function setClean() {
			dirty = false;
			setDirtyBit(false);
			tb.disable("item7");
		}

		cy.on('drag', 'node', setDirty); // set dirty bit if node is dragged


    /****************/
    /***** UNDO *****/
    /****************/
    var lastEvent;
    function undo() {

        var event = undoStack.pop();
        var targ = event.target;

				targ.unselect(); // unselect the target before undoing

				// disable the undo button if undoStack is empty
				if (undoStack.length == 0) {
						tb.disable("item5");
				}

        // Get current label for redo before undoing
        if (event.type == "editLabel") {
            var lab = event.oldLabel;
            event.oldLabel = targ.data('label');
        }

				// HANDLE DIRTY BIT
				setDirty();

        // Push to redo stack and enable "redo" button on toolbar
        redoStack.push(event);
				tb.enable("item6");

        switch (event.type) {
            case ("addNode"):
                cy.remove(targ);
                break;
            case ("addEdge"):
                cy.remove(targ);
                break;
            case ("editLabel"):
								handleWidth(targ, lab);
                targ.json({ data: { label: lab } });
                break;
            case ("deleteSelected"):
								for (var i = 0; i < targ.length; i++) {
										targ[i].restore();
								}
                break;
        }
    }


    /****************/
    /***** REDO *****/
    /****************/
    var redoStack = new Array();

    function redo() {

        event = redoStack.pop();
        targ = event.target;

				targ.unselect(); // unselect the target before redoing

				// disable the redo button if redoStack is empty
				if (redoStack.length == 0) {
						tb.disable("item6");
				}

        // Get current label for redo before undoing
        if (event.type == "editLabel") {
            var lab = event.oldLabel;
            event.oldLabel = targ.data('label');
        }

				// HANDLE DIRTY BIT
				setDirty();

        // Push to undo stack and enable "undo" button on toolbar
        undoStack.push(event);
				tb.enable("item5");

        switch (event.type) {
            case ("addNode"):
                cy.add(targ);
                break;
            case ("addEdge"):
                cy.add(targ);
                break;
            case ("editLabel"):
								handleWidth(targ, lab);
                targ.json({ data: { label: lab } });
                break;
            case ("deleteSelected"):
								for (var i = 0; i < targ.length; i++) {
										cy.remove(targ[i]);
								}
                break;
						case ("moveNode"):
								break;
        }

    }


    /***** ADD NODE *****/
    function addNode(posX, posY) {
        incrementNodeID();

				cy.add({
					group: "nodes",
					data: { id: globalNodeID, label: "", width: 60 },
					renderedPosition: { x: posX, y: posY }
				});
				var node = cy.getElementById(globalNodeID);

        // UNDO INFO
        lastEvent = { type: "addNode", target: node, time: getTimeStamp() };
        undoStack.push(lastEvent);
				tb.enable("item5"); // enable "undo" button on toolbar

				// EMPTY REDO STACK
				redoStack = [];
				tb.disable("item6"); // disable "redo" button on toolbar

				// HANDLE DIRTY BIT
				setDirty();
    }

    /***** ADD EDGE *****/
    function addEdge(src, dst) {
				incrementEdgeID();

				cy.add({
					group: "edges",
					data: { id: globalEdgeID, source: src, target: dst, label: "" }
				});
				var edge = cy.getElementById(globalEdgeID);

        // UNDO INFO
        lastEvent = { type: "addEdge", target : edge, time: getTimeStamp() };
        undoStack.push(lastEvent);
				tb.enable("item5"); // enable "undo" button on toolbar

				// EMPTY REDO STACK
				redoStack = [];
				tb.disable("item6"); // disable "redo" button on toolbar

				// HANDLE DIRTY BIT
				setDirty();
    }

		/***** EDIT LABEL *****/
		function editLabel(target) {
		    oldLabel = target.data('label');
		    var newLabel = prompt("Enter new label", target.data('label'));

				// Checking if prompt was cancelled or new label is same as old label
				if (newLabel === null || newLabel === false || newLabel == oldLabel) { // If cancelled
						return;
				}
				else { // If not cancelled
						handleWidth(target, newLabel);
						target.json({ data: { label: newLabel } });

						// UNDO INFO
						lastEvent = { type: "editLabel", target: target, time: getTimeStamp(), oldLabel: oldLabel };
						undoStack.push(lastEvent);
						tb.enable("item5"); // enable "undo" button on toolbar

						// EMPTY REDO STACK
						redoStack = [];
						tb.disable("item6"); // disable "redo" button on toolbar

						// HANDLE DIRTY BIT
						setDirty();
				}
		}

    /***** DELETE SELECTED *****/
    function deleteSelected() {
        // Get selected nodes and select their connected edges
        var selectedNodes = cy.$('node:selected');
        var connectedEdges = selectedNodes.connectedEdges();
        connectedEdges.select();

        // Get and remove all selected elements
        var selectedElements = cy.$('node:selected, edge:selected');
				selectedElements.unselect();
        cy.remove(selectedElements);

        // UNDO INFO
        lastEvent = { type: "deleteSelected", target: selectedElements, time: getTimeStamp() };
        undoStack.push(lastEvent);
				tb.enable("item5"); // enable "undo" button on toolbar

				// EMPTY REDO STACK
				redoStack = [];
				tb.disable("item6"); // disable "redo" button on toolbar

				// HANDLE DIRTY BIT
				setDirty();
    }
  };

	return o;
}]);
