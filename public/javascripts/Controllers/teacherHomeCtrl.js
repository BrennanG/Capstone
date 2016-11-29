angular.module('biologyGraphingApp').controller('TeacherHomeCtrl', ['$scope', 'auth', 'sections',
function($scope, auth, sections) {
	$scope.sections = sections.sections;
	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.addSection = function() {
    var newSectionTitle = prompt("Enter a Title for your Section.", "");
    if (newSectionTitle === '' || newSectionTitle == null) { return; }
    sections.addSection(newSectionTitle);
  };

  $scope.deleteSection = function(section) {
    sections.deleteSection(section);
  };

}]);
