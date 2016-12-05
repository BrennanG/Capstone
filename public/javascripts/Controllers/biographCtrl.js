// Parent controller for the entire angular app
angular.module('biologyGraphingApp').controller('BiographCtrl', ['$scope',
function($scope) {
	// Used by graphing page
	$scope.biographObj = {dirty: false};
}]);
