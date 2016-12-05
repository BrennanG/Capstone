// Controller for the page for viewing a specific assignment
angular.module('biologyGraphingApp').controller('AssignmentsCtrl', ['$scope', 'assignment', 'auth', 'assignments',
function($scope, assignment, auth, assignments) {
	$scope.assignment = assignment;
  $scope.title = assignment.title;
  $scope.description = assignment.description;
  $scope.submissions = assignment.submissions;
	$scope.isLoggedIn = auth.isLoggedIn;
}]);
