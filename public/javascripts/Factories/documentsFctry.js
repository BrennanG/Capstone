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

				var dataToSend = {student: auth.currentEmail(), documentId: document._id};
				$http.put('/student/documents/remove', dataToSend, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				});

				$state.go($state.current, {}, {reload: true}); // reload the page
        return deletedDocument;
      });
  };
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
  o.renameDocument = function(document, newTitle) {
    var dataToSend = { title: newTitle };
		return $http.put('/student/documents/' + document._id + '/title', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(returnedData) {
      $state.go($state.current, {}, {reload: true}); // reload the page
    });
  };
	o.updateGrade = function(document, grade) {
		var dataToSend = { document: document._id, grade: grade };
		return $http.put('/teacher/assignments/' + document.submittedTo + '/submission/grade', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(returnedData) {
        $state.go($state.current, {}, {reload: true}); // reload the page
        return returnedData;
    });
  };
  o.updateGraph = function(document, data) {
    return $http.put('/student/documents/' + document._id + '/graph', data, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(returnedData) {
        document.graph.elements = returnedData.elements;
        document.graph.undoStack = returnedData.undoStack;
        return returnedData;
      });
  };
  o.loadCytoScape = function(docArg, readOnly, setDirtyBit) {
        var cy = cytoscape({
        container: document.getElementById('cy'),
        wheelSensitivity: .2,
        zoom: 1.5,
        maxZoom: 1.5,
        minZoom: 0.7,

        style: [
            {
                selector: 'node',
                style: {
                    shape: 'rectangle',
                    //"background-color": "#ffffb3",
                    "text-valign" : "center",
                    "text-halign" : "center",
                    label: 'data(label)',
                    width: 'data(width)'
                }
            },
            {
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    label: 'data(label)',
										//'text-background-color': "#f4f8ff",
										//'text-background-opacity': 1,
										//'text-background-shape': 'rectangle'
										'text-outline-width': 2.5,
										"text-outline-color": "#f4f8ff"
                }
            }
        ],

        elements: []
    });

    var graph = document.getElementById("cy");
    var undoStack = new Array();
		var cy = $('#cy').cytoscape('get');


    /***************************/
    /***** ID Book-keeping *****/
    /***************************/
    var globalNode = 'n';
    var globalNodeID = "";
    var globalEdge = 'e';
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
		function getTextWidth(text, font) {
		    // re-use canvas object for better performance
		    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
		    var context = canvas.getContext("2d");
		    context.font = font;
		    var metrics = context.measureText(text);
		    return metrics.width;
		}


		function handleWidth(target, label) {
				var width = getTextWidth(label, 'normal 16px helvetica');
				if ((width + 20) < 50) {
						target.data('width', 60);
				}
				else {
						target.data('width', width + 20);
				}
		}


		/**********************/
		/***** LOAD GRAPH *****/
		/**********************/
		loadGraph(docArg.graph);
    function loadGraph(graph) {
				if (graph.elements != "") {
					cy.add(JSON.parse(graph.elements));
				}

        /*var undoItems = graph.undoStack;
        for (var i = 0; i < undoItems.length; i++) {
            var undoItem = JSON.parse(undoItems[i]);
						undoItem.target = cy.json(JSON.parse(undoItem.target));
            undoStack.push(undoItem);
        }*/

        globalNodeID = globalNode.concat(cy.nodes().length.toString());
        globalEdgeID = globalEdge.concat(cy.edges().length.toString());
    };

		cy.fit(cy.$('node'), 100);
		if (readOnly) { cy.nodes().ungrabify(); }


		/**********************/
		/***** SAVE GRAPH *****/
		/**********************/
    var saveGraph = function() {
        var undoStackJSON = [];
        /*for (var i = 0; i < undoStack.length; i++) {
						undoStackJSON[i] = {};
						undoStackJSON[i].type = undoStack[i].type;
						undoStackJSON[i].time = undoStack[i].time;
						undoStackJSON[i].target = JSON.stringify(undoStack[i].target.json());
						undoStackJSON[i] = JSON.stringify(undoStackJSON[i]);
        }*/
				//alert(JSON.stringify(cy.elements().jsons()));
        o.updateGraph(docArg, { elements: JSON.stringify(cy.elements().jsons()) });

				// HANDLE DIRTY BIT
				setClean();

				alert("Saved");
    };


    /*********************************/
    /***** DOUBLE CLICK LISTENER *****/
    /*********************************/
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
	    cy.on('doubleTap', 'node', editLabelListenerDBL);
	    cy.on('doubleTap', 'edge', editLabelListenerDBL);
		}


    /*******************/
    /***** TOOLBAR *****/
    /*******************/
		if (w2ui.hasOwnProperty('toolbar')) {
			w2ui['toolbar'].destroy();
		}
	    $('#toolbar').w2toolbar({
	        name: 'toolbar',
	        items: [
	            { type: 'check',  id: 'item1', caption: 'Add Node', disabled: readOnly},
	            { type: 'check',  id: 'item2', caption: 'Add Edge', disabled: readOnly},
	            { type: 'button',  id: 'item3', caption: 'Edit Label', disabled: readOnly},
	            { type: 'button',  id: 'item4', caption: 'Delete', disabled: readOnly},
	            { type: 'button',  id: 'item5', caption: 'Undo', disabled: readOnly},
	            { type: 'button',  id: 'item6', caption: 'Redo', disabled: readOnly},
	            { type: 'button',  id: 'item7', caption: 'Save', disabled: readOnly},
	            { type: 'button',  id: 'item8', caption: 'Fit'}
	        ]
	    });

    var tb = w2ui['toolbar'];
    var items = tb['items'];


		/***********************************/
		/***** TOOLBAR EVENT LISTENERS *****/
		/***********************************/
    function addNodeListener(event) {
        var btn = tb.get('item1');
        if (btn.checked == true) {
            var n = addNode(event.cyRenderedPosition.x, event.cyRenderedPosition.y);
        }
				else { cy.off('click', addNodeListener); }
    }

		var source;
    var dest;
    function addEdgeListenerSrc(event) {
        cy.off('click', 'node', addEdgeListenerSrc);

        var btn = tb.get('item2');
        if (btn.checked == true) {
            source = this.id();

            cy.on('click', 'node', addEdgeListenerTarg);
        }
    }

    function addEdgeListenerTarg(event) {
        cy.off('click', 'node', addEdgeListenerTarg);

        var btn = tb.get('item2');
        if (btn.checked == true) {
            dest = this.id();

            addEdge(source,dest);
            tb.uncheck(btn.id);
        }
        source = "";
        dest = "";
    }

		function editLabelHandler() {
				var selectedElems = cy.$(':selected');
				if (selectedElems.length == 1) {
						editLabel(selectedElems[0]);
				}
				else if (selectedElems.length > 1) { alert("You can only edit one label at a time!"); }
		}

    function editLabelListenerDBL(event) {
        var targ = event.cyTarget;
				editLabel(targ);
    }


    /***************************/
    /***** TOOLBAR ONCLICK *****/
    /***************************/
    w2ui.toolbar.on('click', function(event) {
        var targ = tb.get(event.target);

        for (var i = 0; i < items.length; i++) {
            if (items[i].id != event.target) { tb.uncheck(items[i].id); }
        }

        if (targ.checked != true) {
            switch (event.target) {
                case ("item1"): // Add Node
										cy.on('click', addNodeListener);
                    break;
                case ("item2"): // Add Edge
										source = "";
										dest = "";
                    cy.on('click', 'node', addEdgeListenerSrc);
                    break;
                case ("item3"): // Edit Label
										editLabelHandler();
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
            }
        }
    });


		/*************************/
		/***** HANDLE DIRTY ******/
		/*************************/
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
		function getDirtyBit() { return dirty;  }

		cy.on('drag', 'node', setDirty);


    /****************/
    /***** UNDO *****/
    /****************/
    var lastEvent;
    function undo() {
				if (undoStack == 0) { return; }

        var event = undoStack.pop();
        var targ = event.target;

        // Get current label for redo before undoing
        if (event.type == "editLabel") {
            var lab = event.oldLabel;
            event.oldLabel = targ.data('label');
        }

				// HANDLE DIRTY BIT
				setDirty();

        // Push to redo stack
        redoStack.push(event);

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
                targ.restore();
                break;
        }
    }


    /****************/
    /***** REDO *****/
    /****************/
    var redoStack = new Array();

    function redo() {
				if (redoStack == 0) { return; }

        event = redoStack.pop();
        targ = event.target;

        // Get current label for redo before undoing
        if (event.type == "editLabel") {
            var lab = event.oldLabel;
            event.oldLabel = targ.data('label');
        }

				// HANDLE DIRTY BIT
				setDirty();

        // Push to undo stack
        undoStack.push(event);

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
                cy.remove(targ);
                break;
        }

    }


    /***** ADD NODE *****/
    function addNode(posX,posY) {
        incrementNodeID();
        var node = cy.add({
					group: "nodes",
					data: { id: globalNodeID, label: "", width: 60 },
					renderedPosition: { x: posX, y: posY }
				});

        // UNDO INFO
        lastEvent = { type: "addNode", target: node, time: getTimeStamp() };
        undoStack.push(lastEvent);

				// EMPTY REDO STACK
				redoStack = [];

				// HANDLE DIRTY BIT
				setDirty();

        return node;
    }

    /***** ADD EDGE *****/
    function addEdge(src, dst) {
				incrementEdgeID();
        var edge = cy.add({
					group: "edges",
					data: { id: globalEdgeID, source: src, target: dst, label: "" }
				});

        // UNDO INFO
        lastEvent = { type: "addEdge", target : edge, time: getTimeStamp() };
        undoStack.push(lastEvent);

				// EMPTY REDO STACK
				redoStack = [];

				// HANDLE DIRTY BIT
				setDirty();
    }

		/***** EDIT LABEL *****/
		function editLabel(target) {
		    oldLabel = target.data('label');
		    var newLabel = prompt("Enter new label", target.data('label'));

				// Checking if prompt was cancelled or new label is same as old label
				if (newLabel === null || newLabel === false || newLabel == oldLabel) { // If cancelled
						alert("same");
						return;
				}
				else { // If not cancelled
						handleWidth(target, newLabel);
						target.json({ data: { label: newLabel } });

						// UNDO INFO
						lastEvent = { type: "editLabel", target: target, time: getTimeStamp(), oldLabel: oldLabel };
						undoStack.push(lastEvent);

						// EMPTY REDO STACK
						redoStack = [];

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
        cy.remove(selectedElements);

        // UNDO INFO
        lastEvent = { type: "deleteSelected", target: selectedElements, time: getTimeStamp() };
        undoStack.push(lastEvent);

				// EMPTY REDO STACK
				redoStack = [];

				// HANDLE DIRTY BIT
				setDirty();
    }
  };

	return o;
}]);
