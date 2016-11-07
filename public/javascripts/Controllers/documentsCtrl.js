angular.module('biologyGraphingApp').controller('DocumentsCtrl', ['$scope', 'documents', 'document', 'auth',
function($scope, documents, document, auth) {
	$scope.document = document;
  $scope.nodes = document.graph.nodes;
  $scope.edges = document.graph.edges;
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.isTeacher = auth.accountType() == "teacher";
	$scope.newGrade = "";

	$scope.updateGrade = function() {
    if ($scope.newGrade === '') { return; }
    documents.updateGrade(document, $scope.newGrade);
    $scope.newGrade = '';
  };

  documents.loadCytoScape(document);
}]);
