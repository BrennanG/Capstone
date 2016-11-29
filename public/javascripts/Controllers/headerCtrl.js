angular.module('biologyGraphingApp').controller('HeaderCtrl', ['$scope', '$state', 'auth',
function($scope, $state, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.email = auth.currentEmail;

  $scope.logout = function() {
		if ($state.current.name == "documents" && $scope.biographObj.dirty) {
			if (!confirm("Are you sure you want to leave? All unsaved changes will be lost.")) {
	    	return;
	    }
		}

		if ($scope.isLoggedIn()) {
			auth.logOut();
		}
	};

	$scope.goToHome = function() {
		if ($state.current.name == "documents" && $scope.biographObj.dirty) {
			if (!confirm("Are you sure you want to leave? All unsaved changes will be lost.")) {
	    	return;
	    }
		}

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
