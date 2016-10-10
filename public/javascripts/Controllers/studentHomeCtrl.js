angular.module('biologyGraphingApp').controller('StudentHomeCtrl', ['$scope', 'documents', 'sections', 'assignments', 'auth',
function($scope, documents, sections, assignments, auth) {
	$scope.documents = documents.documents;
	$scope.sections = sections.sections;
	$scope.selections = {assignment: null, document: null};
	$scope.isLoggedIn = auth.isLoggedIn;

  $scope.addDocument = function() {
    if ($scope.newDocTitle === '') { return; }
    var graph = { nodes: [], edges: [], undoStack: [] };
    documents.addDocument($scope.newDocTitle, graph);
    $scope.newDocTitle = '';
  };

  $scope.deleteDocument = function(document) {
    documents.deleteDocument(document);
  };

	$scope.addSubmission = function() {
    assignments.addSubmission($scope.selections.document, $scope.selections.assignment._id);
  };

	$scope.logout = function() {
		if ($scope.isLoggedIn) {
			auth.logOut();
		}
	};

}]);
