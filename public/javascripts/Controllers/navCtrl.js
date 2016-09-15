angular.module('biologyGraphingApp').controller('NavCtrl', ['$scope', 'auth',
function($scope, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUserName = auth.currentUserName;
	$scope.logOut = auth.logOut;
}]);
