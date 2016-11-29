angular.module('biologyGraphingApp').controller('DocumentsCtrl', ['$scope', 'documents', 'document', 'confirmFunc', 'auth',
function($scope, documents, document, confirmFunc, auth) {
	$scope.document = document;
  $scope.elements = document.graph.elements;
  $scope.undoStack = document.graph.undoStack;
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.isTeacher = auth.accountType() == "teacher";
	$scope.isReadonly = $scope.document.status != 'unsubmitted'

	$scope.updateGrade = function() {
    var newGrade = prompt("Enter a Grade", "");
    if (newGrade === '' || newGrade == null || isNaN(newGrade)) {
			alert(newGrade + " is an invalid grade.");
			return;
		}
    documents.updateGrade(document, newGrade);
  };

	// Warn about unsaved data on back button
	$scope.$on('$locationChangeStart', function(event) {
		if (!$scope.biographObj.dirty) { return; }
		if (!confirm("Are you sure you want to leave this page? All unsaved changes will be lost.")) {
    	event.preventDefault();
		}
	});

	function setDirtyBit(dirty) {
		if (dirty) {
			window.addEventListener("beforeunload", confirmFunc);
		}
		else {
			window.removeEventListener("beforeunload", confirmFunc);
		}
		$scope.biographObj.dirty = dirty;
	}

	documents.loadCytoScape(document, $scope.isReadonly, setDirtyBit);
}]);
