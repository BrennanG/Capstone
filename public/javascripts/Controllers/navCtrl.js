angular.module('biologyGraphingApp').controller('NavCtrl', ['$scope', 'auth',
function($scope, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentEmail = auth.currentEmail;
	$scope.logOut = auth.logOut;
}]);
