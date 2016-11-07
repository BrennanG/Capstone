angular.module('biologyGraphingApp').controller('SectionsCtrl', ['$scope', 'section', 'auth', 'assignments', 'sections',
function($scope, section, auth, assignments, sections) {
	$scope.section = section;
  $scope.title = section.title;
  $scope.teachers = section.teachers;
  $scope.students = section.students;
  $scope.assignments = section.assignments;
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.newTitle = "";
	$scope.newDescription = "";
	$scope.studentEmail = "";

	$scope.addAssignment = function() {
    if ($scope.newTitle === '' || $scope.newDescription === '') { return; }
    assignments.addAssignment($scope.newTitle, $scope.newDescription, $scope.section);
    $scope.newTitle = '';
    $scope.newDescription = '';
  };

	$scope.addStudentToSection = function() {
    if ($scope.studentEmail === '') { return; }
    sections.addStudentToSection($scope.studentEmail, $scope.section);
    $scope.studentEmail = '';
  };
}]);
