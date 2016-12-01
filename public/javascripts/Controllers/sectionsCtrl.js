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

	$scope.addAssignment = function() {
    if ($scope.newTitle === '' || $scope.newDescription === '') { return; }
    assignments.addAssignment($scope.newTitle, $scope.newDescription, $scope.section);
    $scope.newTitle = '';
    $scope.newDescription = '';
  };

	$scope.createAssignment = function(document) {
		var modalInstance = $uibModal.open({
      templateUrl: 'templates/createAssignmentModal.html',
      controller: function($scope, $uibModalInstance) {
				$scope.newTitle = "";
				$scope.newDescription = "";

        $scope.createAssignment = function() {
					var assignmentData = { newTitle: $scope.newTitle, newDescription: $scope.newDescription };
          $uibModalInstance.close(assignmentData);
        }

        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };

      }
    });

		modalInstance.result.then(function (assignmentData) {
			assignments.addAssignment(assignmentData.newTitle, assignmentData.newDescription, $scope.section);
		});
  };

	$scope.submitDocument = function(document) {
		var modalInstance = $uibModal.open({
      templateUrl: 'templates/submitDocumentModal.html',
      controller: function($scope, $uibModalInstance, sections) {
        $scope.selected = {assignment: null};
				$scope.sections = sections;

        $scope.submitSelectedAssignment = function() {
          $uibModalInstance.close($scope.selected.assignment);
        }

        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };

      },
      resolve: {
        sections: function () {
          return $scope.sections;
      	}
			}
    });

		modalInstance.result.then(function (selectedAssignment) {
			assignments.addSubmission(document, selectedAssignment._id);
		});
  };

	$scope.addStudentToSection = function() {
    var studentEmail = prompt("Enter the emails of students you want to add (separate with commas).", "");
    if (studentEmail === '' || studentEmail == null) { return; }
		var students = studentEmail.split(",");
		students.forEach(function(student) {
	    sections.addStudentToSection(student.trim(), $scope.section);
		});
  };

}]);
