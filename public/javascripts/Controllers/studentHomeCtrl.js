angular.module('biologyGraphingApp').controller('StudentHomeCtrl', ['$scope', 'documents', 'sections', 'auth',
function($scope, documents, sections, auth) {
	$scope.documents = documents.documents;
	$scope.sections = sections.sections;
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

	$scope.logout = function() {
		if ($scope.isLoggedIn) {
			auth.logOut();
		}
	};

}]);
