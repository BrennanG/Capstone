// Controller for the student's home page
angular.module('biologyGraphingApp').controller('StudentHomeCtrl', ['$scope',  '$location', '$uibModal', 'documents', 'sections', 'assignments', 'auth',
function($scope, $location, $uibModal, documents, sections, assignments, auth) {
	$scope.documents = documents.documents;
	$scope.sections = sections.sections;
	$scope.isLoggedIn = auth.isLoggedIn;

  $scope.addDocument = function() {
		var newDocTitle = prompt("Enter a Title for your new Document.", "");
    if (newDocTitle === '' || newDocTitle == null) { return; }
    var graph = { elements: [], undoStack: [] };
		// Pass the data to the factory, which interfaces with the backend
    documents.addDocument(newDocTitle, graph);
  };

	// Go to the graphing environment to edit the document
	$scope.editDocument = function(document) {
		$location.path("document/" + document._id);
  };

	$scope.cloneDocument = function(document) {
		var newDocTitle = prompt("Enter a Title for your new Document.", "");
    if (newDocTitle === '' || newDocTitle == null) { return; }
		// Pass the data to the factory, which interfaces with the backend
    documents.addDocument(newDocTitle, document.graph);
  };

	$scope.renameDocument = function(document) {
		var newTitle = prompt("Enter a new Title for your Document.", "");
    if (newTitle === '' || newTitle == null) { return; }
		// Pass the data to the factory, which interfaces with the backend
		documents.renameDocument(document, newTitle);
  };

	// Modal for the document submission
	$scope.submitDocument = function(document) {
		var modalInstance = $uibModal.open({
      templateUrl: 'templates/submitDocumentModal.html',
      controller: function($scope, $uibModalInstance, sections) {
        $scope.selected = {assignment: null};
				$scope.sections = sections;

        $scope.submitSelectedAssignment = function() {
          $uibModalInstance.close($scope.selected.assignment); // Gives the data to modalInstance.result
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
		// Pass the data to the factory, which interfaces with the backend
			assignments.addSubmission(document, selectedAssignment._id);
		});
  };

	// Delete the document if it has not been submitted
  $scope.deleteDocument = function(document) {
		if (document.status == 'unsubmitted') {
			if (confirm("Are you sure you want to delete " + document.title + "?")) {
			// Pass the data to the factory, which interfaces with the backend
	    	documents.deleteDocument(document);
	    }
		}
		else {
			alert("Cannot delete " + document.title + " because it has been submitted to " + document.submittedTo.title + ".");
		}
  };

}]);
