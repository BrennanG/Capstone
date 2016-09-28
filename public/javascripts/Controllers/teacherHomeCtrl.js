angular.module('biologyGraphingApp').controller('TeacherHomeCtrl', ['$scope', 'auth', 'sections',
function($scope, auth, sections) {
	$scope.sections = sections.sections;
	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.addSection = function() {
    if ($scope.newSectionTitle === '') { return; }
    sections.addSection($scope.newSectionTitle);
    $scope.newSectionTitle = '';
  };

	$scope.logout = function() {
		console.log("IN");
		if ($scope.isLoggedIn) {
			auth.logOut();
		}
	};

}]);
