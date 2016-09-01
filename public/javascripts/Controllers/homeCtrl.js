angular.module('biologyGraphingApp').controller('HomeCtrl', ['$scope', 'documents',
function($scope, documents) {
	$scope.documents = documents.documents;
  
  $scope.addDocument = function() {
    if ($scope.newDocTitle === '') { return; }
    var graph = { nodes: [], edges: [] };
    documents.addDocument($scope.newDocTitle, graph);
    $scope.newDocTitle = '';
  };

  $scope.deleteDocument = function(document) {
    documents.deleteDocument(document);
  };

}]);
