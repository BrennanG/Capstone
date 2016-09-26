angular.module('biologyGraphingApp').controller('TeacherHomeCtrl', ['$scope', 'auth',
function($scope, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.logout = function() {
		if ($scope.isLoggedIn) {
			auth.logOut();
		}
	};

}]);
