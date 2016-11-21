angular.module('biologyGraphingApp').controller('HeaderCtrl', ['$scope', '$state', 'auth',
function($scope, $state, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;

  $scope.logout = function() {
		if ($scope.isLoggedIn()) {
			auth.logOut();
		}
	};

	$scope.goToHome = function() {
		var accountType = auth.accountType();
		if (accountType == "student") {
			$state.go('studentHome');
		}
		else if (accountType == "teacher") {
			$state.go('teacherHome');
		}
		else {
			auth.logOut();
		}
	};

}]);
