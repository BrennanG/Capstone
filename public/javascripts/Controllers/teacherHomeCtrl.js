angular.module('biologyGraphingApp').controller('TeacherHomeCtrl', ['$scope', 'auth', 'sections',
function($scope, auth, sections) {
	$scope.sections = sections.sections;
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.newSectionTitle = "";

	$scope.addSection = function() {
    if ($scope.newSectionTitle === '') { return; }
    sections.addSection($scope.newSectionTitle);
    $scope.newSectionTitle = '';
  };

  $scope.deleteSection = function(section) {
    sections.deleteSection(section);
  };

	$scope.logout = function() {
		if ($scope.isLoggedIn) {
			auth.logOut();
		}
	};

}]);
