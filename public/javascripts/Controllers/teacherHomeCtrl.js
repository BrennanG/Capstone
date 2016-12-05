// Controller for the teacher's home page
angular.module('biologyGraphingApp').controller('TeacherHomeCtrl', ['$scope', 'auth', 'sections',
function($scope, auth, sections) {
	$scope.sections = sections.sections;
	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.addSection = function() {
    var newSectionTitle = prompt("Enter a Title for your Section.", "");
    if (newSectionTitle === '' || newSectionTitle == null) { return; }
		// Pass the data to the factory, which interfaces with the backend
    sections.addSection(newSectionTitle);
  };

  $scope.deleteSection = function(section) {
    if (confirm("Are you sure you want to delete " + section.title + "?")) {
			// Pass the data to the factory, which interfaces with the backend
			sections.deleteSection(section);
		}
  };

}]);
