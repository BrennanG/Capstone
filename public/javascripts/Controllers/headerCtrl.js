// Controller for the header bar with the logout and home buttons
angular.module('biologyGraphingApp').controller('HeaderCtrl', ['$scope', '$state', 'auth',
function($scope, $state, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.email = auth.currentEmail;

  $scope.logout = function() {
		// Warn before logging out if in the graphing environment page with unsaved progress
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
		// Warn before leaving the page if in the graphing environment page with unsaved progress
		if ($state.current.name == "documents" && $scope.biographObj.dirty) {
			if (!confirm("Are you sure you want to leave? All unsaved changes will be lost.")) {
	    	return;
	    }
		}

		// Go to the home page of the user, depending on student or teacher
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
