angular.module('biologyGraphingApp').controller('DocumentsCtrl', ['$scope', 'documents', 'document', 'auth',
function($scope, documents, document, auth) {
	$scope.document = document;
  $scope.nodes = document.graph.nodes;
  $scope.edges = document.graph.edges;
	$scope.isLoggedIn = auth.isLoggedIn;

  documents.loadCytoScape(document);
}]);
