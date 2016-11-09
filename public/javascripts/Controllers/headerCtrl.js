angular.module('biologyGraphingApp').controller('HeaderCtrl', ['$scope', 'auth',
function($scope, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;

  $scope.logout = function() {
		if ($scope.isLoggedIn) {
			auth.logOut();
		}
	};

}]);
