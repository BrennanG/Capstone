angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	var confirmFunc = function (e) {
		var confirmationMessage = "All unsaved changes will be lost.";

		(e || window.event).returnValue = confirmationMessage; //Gecko + IE
		return confirmationMessage;                            //Webkit, Safari, Chrome
	};
	$stateProvider.state('documents', {
		parent: 'page',
		url : '/documents/{id}',
		templateUrl : 'templates/documents.html',
		controller : 'DocumentsCtrl',
    resolve: {
      document: ['$stateParams', 'documents', 'auth', function($stateParams, documents, auth) {
				var type = auth.accountType();
				if (type == "student") {
        	return documents.getDocument($stateParams.id);
				}
				else if (type == "teacher"){ // teacher
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
