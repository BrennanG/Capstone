angular.module('biologyGraphingApp').controller('AuthCtrl', ['$scope', '$state', 'auth',
function($scope, $state, auth) {
	$scope.user = {};
	$scope.teacherAccount = false;
	$scope.error;
	$scope.user;

	$scope.register = function() {
		if ($scope.user.password != $scope.user.confirmPassword) {
			$scope.error = {message: "Passwords must match"};
			return;
		}

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
		auth.studentLogIn($scope.user).error(function(error) {
			auth.teacherLogIn($scope.user).error(function(error) {
				$scope.error = error;
			}).then(function() {
				$state.go('teacherHome');
			});
		}).then(function() {
			$state.go('studentHome');
		});
	};

}]);
