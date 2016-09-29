angular.module('biologyGraphingApp').controller('AuthCtrl', ['$scope', '$state', 'auth',
function($scope, $state, auth) {
	$scope.user = {};
	$scope.teacherAccount = false;

	$scope.register = function() {
		if ($scope.teacherAccount) {
			auth.teacherRegister($scope.user).error(function(error) {
				$scope.error = error;
			}).then(function() {
				$state.go('teacherHome');
			});
		}
		else {
			auth.studentRegister($scope.user).error(function(error) {
				$scope.error = error;
			}).then(function() {
				$state.go('studentHome');
			});
		}
	};

	$scope.logIn = function() {
		if ($scope.teacherAccount) {
			auth.teacherLogIn($scope.user).error(function(error) {
				$scope.error = error;
			}).then(function() {
				$state.go('teacherHome');
			});
		}
		else {
			auth.studentLogIn($scope.user).error(function(error) {
				$scope.error = error;
			}).then(function() {
				$state.go('studentHome');
			});
		}
	};

}]);
