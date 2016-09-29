angular.module('biologyGraphingApp').controller('SectionsCtrl', ['$scope', 'section', 'auth', 'assignments',
function($scope, section, auth, assignments) {
	$scope.section = section;
  $scope.title = section.title;
  $scope.teachers = section.teachers;
  $scope.students = section.students;
  $scope.assignments = section.assignments;
	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.addAssignment = function() {
    if ($scope.newTitle === '' || $scope.newDescription === '') { return; }
    assignments.addAssignment($scope.newTitle, $scope.newDescription, $scope.section);
    $scope.newTitle = '';
    $scope.newDescription = '';
  };
}]);