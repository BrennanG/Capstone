// Controller for the page for viewing a specific assignment
angular.module('biologyGraphingApp').controller('AssignmentCtrl', ['$scope', '$uibModal', 'assignment', 'auth', 'assignments',
function($scope, $uibModal, assignment, auth, assignments) {
	$scope.assignment = assignment;
  $scope.title = assignment.title;
  $scope.description = assignment.description;
  $scope.submissions = assignment.submissions;
	$scope.isLoggedIn = auth.isLoggedIn;

	// Updates the title of the assignment
	$scope.updateTitle = function() {
    var newTitle = prompt("Enter a new Title", $scope.title);
    if (newTitle === '') {
			alert("Invalid title.");
			return;
		}
		else if (newTitle == null) { return; }
		// Pass the data to the factory, which interfaces with the backend
    assignments.updateTitle($scope.assignment._id, newTitle);
  };

	$scope.updateDescription = function() {
		// Create a modal (popup) for updating the description
		var modalInstance = $uibModal.open({
      templateUrl: 'templates/updateDescriptionModal.html',
      controller: function($scope, $uibModalInstance, currentDescription) {
				$scope.newDescription = currentDescription;

        $scope.updateDescription = function() {
          $uibModalInstance.close({ newDescription: $scope.newDescription }); // Gives newDescription to modalInstance.result
        }

        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };

      },
      resolve: {
        currentDescription: function () {
          return $scope.description;
      	}
			}
    });

		modalInstance.result.then(function (data) {
			// Pass the data to the factory, which interfaces with the backend
			assignments.updateDescription($scope.assignment._id, data.newDescription);
		});
  };

}]);
