angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	// This function is added to an event listener to be called when attempting to leave the document graphing page
	var confirmFunc = function (e) {
		var confirmationMessage = "All unsaved changes will be lost.";

		(e || window.event).returnValue = confirmationMessage; //Gecko + IE
		return confirmationMessage;                            //Webkit, Safari, Chrome
	};

	$stateProvider.state('document', {
		parent: 'page',
		url : '/document/{id}',
		templateUrl : 'templates/document.html',
		controller : 'DocumentCtrl',
    resolve: {
      document: ['$stateParams', 'documents', 'auth', function($stateParams, documents, auth) {
				var type = auth.accountType();
				if (type == "student") {
					// requests data from the factory, which pulls the data from the Database
        	return documents.getDocument($stateParams.id);
				}
				else if (type == "teacher"){ // teacher
					// requests data from the factory, which pulls the data from the Database
					return documents.getDocumentForTeacher($stateParams.id);
				}
      }],
		  confirmFunc: [function() {
				return confirmFunc;
			}]},
		onEnter : ['$state', 'auth',
			function($state, auth) {
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
				else {
					window.addEventListener("beforeunload", confirmFunc);
				}
			}],
		onExit : [function() {
				window.removeEventListener("beforeunload", confirmFunc);
			}]
  });

}]);
