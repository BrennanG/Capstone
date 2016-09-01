angular.module('biologyGraphingApp').controller('DocumentsCtrl', ['$scope', 'documents', 'document',
function($scope, documents, document) {
	$scope.document = document;
  $scope.nodes = document.graph.nodes;
  $scope.edges = document.graph.edges;

  documents.loadCytoScape(document);

}]);
