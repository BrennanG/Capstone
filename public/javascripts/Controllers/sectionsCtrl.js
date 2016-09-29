angular.module('biologyGraphingApp').controller('SectionsCtrl', ['$scope', 'section', 'auth',
function($scope, section, auth) {
	$scope.section = section;
  $scope.title = section.title;
  $scope.teachers = section.teachers;
  $scope.students = section.students;
  //$scope.assignments = section.assignments;
	$scope.isLoggedIn = auth.isLoggedIn;
}]);
