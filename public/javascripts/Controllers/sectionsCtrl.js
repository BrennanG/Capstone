// Controller for a teacher to view a specific section
angular.module('biologyGraphingApp').controller('SectionsCtrl', ['$scope', '$uibModal', 'section', 'auth', 'assignments', 'sections',
function($scope, $uibModal, section, auth, assignments, sections) {
	$scope.section = section;
  $scope.title = section.title;
  $scope.teachers = section.teachers;
  $scope.students = section.students;
  $scope.assignments = section.assignments;
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.newTitle = "";
	$scope.newDescription = "";
	$scope.studentEmail = "";

	$scope.createAssignment = function(document) {
		// Create a modal (popup) for creating the new assignment
		var modalInstance = $uibModal.open({
      templateUrl: 'templates/createAssignmentModal.html',
      controller: function($scope, $uibModalInstance) {
				$scope.newTitle = "";
				$scope.newDescription = "";

        $scope.createAssignment = function() {
					var assignmentData = { newTitle: $scope.newTitle, newDescription: $scope.newDescription };
          $uibModalInstance.close(assignmentData); // Gives assignmentData to modalInstance.result
        }

        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };

      }
    });

		modalInstance.result.then(function (assignmentData) {
			// Pass the data to the factory, which interfaces with the backend
			assignments.addAssignment(assignmentData.newTitle, assignmentData.newDescription, $scope.section);
		});
  };

	// Adds students to the section. Splits on commas to add multiple at once
	$scope.addStudentToSection = function() {
    var studentEmail = prompt("Enter the emails of students you want to add (separate with commas).", "");
    if (studentEmail === '' || studentEmail == null) { return; }
		var students = studentEmail.split(",");
		students.forEach(function(student) {
			// Pass the data to the factory, which interfaces with the backend
	    sections.addStudentToSection(student.trim(), $scope.section);
		});
  };

}]);
