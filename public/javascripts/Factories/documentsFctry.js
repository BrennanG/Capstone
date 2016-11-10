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
  o.loadCytoScape = function(docArg) {
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
                    width: 'label'
                }
            },
            {
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    label: 'data(label)'
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

    var saveGraph = function() {
        var undoStackJSON = [];
        /*for (var i = 0; i < undoStack.length; i++) {
						undoStackJSON[i] = {};
						undoStackJSON[i].type = undoStack[i].type;
						undoStackJSON[i].time = undoStack[i].time;
						undoStackJSON[i].target = JSON.stringify(undoStack[i].target.json());
						undoStackJSON[i] = JSON.stringify(undoStackJSON[i]);
        }*/

        o.updateGraph(docArg, { elements: JSON.stringify(cy.elements().jsons()) });
    };



    /*********************************/
    /***** DOUBLE CLICK LISTENER *****/
    /*********************************/
    //var cy = $('#cy').cytoscape('get');
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

    cy.on('doubleTap', 'node', editLabelListenerDBL);
    cy.on('doubleTap', 'edge', editLabelListenerDBL);


    /*******************/
    /***** TOOLBAR *****/
    /*******************/
		if (w2ui.hasOwnProperty('toolbar')) {
			w2ui['toolbar'].destroy();
		}
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
	            { type: 'button',  id: 'item8', caption: 'Save'},//, img: 'icon-page', checked: false },
	            { type: 'button',  id: 'item9', caption: 'Fit'},//, img: 'icon-page', checked: false }
	        ]
	    });

    var tb = w2ui['toolbar'];
    var items = tb['items'];

    function addNodeListener(event) {
        var btn = tb.get('item1');
        if (btn.checked == true) {
            var n = addNode(event);

            tb.uncheck(btn.id);
        }
        graph.removeEventListener("click",addNodeListener);
    }

    function deleteTargetListener(event) {
        var btn = tb.get('item4');
        if (btn.checked == true) {
            var targ = event.cyTarget;
            if (targ != cy) {
                deleteElem(targ);
            }

            tb.uncheck(btn.id);
        }

        cy.off('click', deleteTargetListener);
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
            incrementEdgeID();

            addEdge(source,dest);
            tb.uncheck(btn.id);
        }
        source = "";
        dest = "";
    }

    function editLabelListener(event) {
        cy.off('click', 'node', editLabelListener);
        cy.off('click', 'edge', editLabelListener);

        var btn = tb.get('item3');
        if (btn.checked == true) {
            var targ = event.cyTarget;
            oldLabel = targ.data('label');

            // UNDO INFO
            lastEvent = { type: "editLabel", target: targ, time: getTimeStamp(), oldLabel: oldLabel };
            undoStack.push(lastEvent);

            var newLabel = prompt("Enter new label", targ.data('label'));
            targ.json({ data: { label: newLabel } });

            tb.uncheck(btn.id);
        }

    }

    function editLabelListenerDBL(event) {
        var targ = event.cyTarget;
        oldLabel = targ.data('label');

        // UNDO INFO
        lastEvent = { type: "editLabel", target: targ, time: getTimeStamp(), oldLabel: oldLabel };
        undoStack.push(lastEvent);

        var newLabel = prompt("Enter new label", targ.data('label'));
        targ.json({ data: { label: newLabel } });

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
                    graph.addEventListener("click",addNodeListener);
                    break;
                case ("item2"): // Add Edge
                    cy.on('click', 'node', addEdgeListenerSrc);
                    break;
                case ("item3"): // Edit Label
                    cy.on('click', 'node', editLabelListener);
                    cy.on('click', 'edge', editLabelListener);
                    break;
                case ("item4"): // Delete Target
                    cy.on('click', deleteTargetListener);
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
                case ("item9"): // Fit
                    cy.fit(cy.$('node'), 100);
                    break;
            }
        }
    });


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

        // Push to redo stack
        redoStack.push(event);

        switch (event.type) {
            case ("addNode"):
                cy.remove(targ);
                break;
            case ("addEdge"):
                cy.remove(targ);
                break;
            case ("deleteSelected"):
                targ.restore();
                break;
            case ("deleteElem"):
                targ.restore();
                break;
            case ("deleteEdge"):
                var data = targ.data;
                addEdgeHelper(data.source, data.target, data.id, data.label);
                break;
            case ("editLabel"):
                targ.json({ data: { label: lab } });
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

        // Push to undo stack
        undoStack.push(event);

        switch (event.type) {
            case ("addNode"):
                cy.add(targ);
                break;
            case ("addEdge"):
                cy.add(targ);
                break;
            case ("deleteSelected"):
                cy.remove(targ);
                break;
            case ("deleteElem"):
                cy.remove(targ);
                break;
            case ("editLabel"):
                targ.json({ data: { label: lab } });
                break;
        }

    }



    /***** ADD NODE *****/
    function addNode(evt) {
        var parentId;

        // Handle compound nodes
        /*if (evt.target != null && evt.target.group == "nodes") {
            parentId = evt.target.data.id;
            x = evt.target.x;
            y = evt.target.y;
            x += Math.random() * (evt.target.width/3) * (Math.round(Math.random()*100)%2==0 ? 1 : -1);
            y += Math.random() * (evt.target.height/3) * (Math.round(Math.random()*100)%2==0 ? 1 : -1);
        }*/

        incrementNodeID();
        var node = cy.add({ group: "nodes", data: { id: globalNodeID, label: "node" }, renderedPosition: { x: evt.clientX, y: evt.clientY } });

        // UNDO INFO
        lastEvent = { type: "addNode", target: node, time: getTimeStamp() };
        undoStack.push(lastEvent);

        return node;
    }

    /***** ADD EDGE *****/
    function addEdge(src, dst) {
        var edge = cy.add({ group: "edges", data: { id: globalEdgeID, source: src, target: dst, label: "Edge" } });

        // UNDO INFO
        lastEvent = { type: "addEdge", target : edge, time: getTimeStamp() };
        undoStack.push(lastEvent);
    }

    /***** DELETE ELEMENT *****/
    function deleteElem(targ) {
        removedElements = cy.remove(targ.union(targ.connectedEdges()));

        // UNDO INFO
        lastEvent = { type: "deleteElem", target: removedElements, time: getTimeStamp() };
        undoStack.push(lastEvent);
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
    }
  };

	return o;
}]);
