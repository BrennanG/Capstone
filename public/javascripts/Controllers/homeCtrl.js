angular.module('biologyGraphingApp').controller('HomeCtrl', ['$scope', 'documents', 'auth',
function($scope, documents, auth) {
	$scope.documents = documents.documents;
	$scope.isLoggedIn = auth.isLoggedIn;

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
