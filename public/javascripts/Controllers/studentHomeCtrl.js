angular.module('biologyGraphingApp').controller('StudentHomeCtrl', ['$scope',  '$location', '$uibModal', 'documents', 'sections', 'assignments', 'auth',
function($scope, $location, $uibModal, documents, sections, assignments, auth) {
	$scope.documents = documents.documents;
	$scope.sections = sections.sections;
	$scope.isLoggedIn = auth.isLoggedIn;

  $scope.addDocument = function() {
		var newDocTitle = prompt("Enter a Title for your new Document.", "");
    if (newDocTitle === '' || newDocTitle == null) { return; }
    var graph = { nodes: [], edges: [], undoStack: [] };
    documents.addDocument(newDocTitle, graph);
  };

	$scope.editDocument = function(document) {
		$location.path("documents/" + document._id);
  };

	$scope.submitDocument = function(document) {
		var modalInstance = $uibModal.open({
      templateUrl: 'templates/submitDocumentModal.html',
      controller: function($scope, $uibModalInstance, sections) {
        $scope.selected = {assignment: null};
				$scope.sections = sections;

        $scope.returnSelectedAssignment = function() {
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

  $scope.deleteDocument = function(document) {
		if (document.status == 'unsubmitted') {
			if (confirm("Are you sure you want to delete " + document.title + "?")) {
	    	documents.deleteDocument(document);
	    }
		}
		else {
			alert("Cannot delete " + document.title + " because it has been submitted to " + document.submittedTo.title + ".");
		}
  };

}]);
