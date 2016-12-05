// Controller for logging in and registering
angular.module('biologyGraphingApp').controller('AuthCtrl', ['$scope', '$state', 'auth',
function($scope, $state, auth) {
	$scope.user = {};
	$scope.teacherAccount = false;
	$scope.error;
	$scope.user;

	$scope.register = function() {
		// If the passwords don't match, print an error
		if ($scope.user.password != $scope.user.confirmPassword) {
			$scope.error = {message: "Passwords must match"};
			return;
		}

		if ($scope.teacherAccount) {
			// Create a teacher account and redirect to the new teacher's home directory
			auth.teacherRegister($scope.user).error(function(error) {
				$scope.error = error;
			}).then(function() {
				$state.go('teacherHome');
			});
		}
		else {
			// Create a student account and redirect to the new student's home directory
			auth.studentRegister($scope.user).error(function(error) {
				$scope.error = error;
			}).then(function() {
				$state.go('studentHome');
			});
		}
	};

	$scope.logIn = function() {
		// Attempt to log in as a student
		// If the account doesn't exist, then attempt to log in as a teacherLogIn
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
