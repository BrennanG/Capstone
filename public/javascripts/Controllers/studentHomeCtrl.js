angular.module('biologyGraphingApp').controller('StudentHomeCtrl', ['$scope', 'documents', 'sections', 'assignments', 'auth',
function($scope, documents, sections, assignments, auth) {
	$scope.documents = documents.documents;
	$scope.sections = sections.sections;
	$scope.selections = {assignment: null, document: null};
	$scope.isLoggedIn = auth.isLoggedIn;

  $scope.addDocument = function() {
		var newDocTitle = prompt("Enter a Title for your new Document.", "");
    if (newDocTitle === '' || newDocTitle == null) { return; }
    var graph = { nodes: [], edges: [], undoStack: [] };
    documents.addDocument(newDocTitle, graph);
  };

  $scope.deleteDocument = function(document) {
		if (document.status == 'unsubmitted') {
			if (confirm("Are you sure you want to delete " + document.title + "?")) {
	    	documents.deleteDocument(document);
	    }
		}
		else {
			alert("Cannot delete " + document.title + " because it has been submitted to " + document.submittedTo.title + ".");
		}
  };

	$scope.addSubmission = function() {
    assignments.addSubmission($scope.selections.document, $scope.selections.assignment._id);
  };

}]);
