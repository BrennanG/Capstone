angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('documents', {
		parent: 'biograph',
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
      }]},
		onEnter : ['$state', 'auth',
			function($state, auth) {
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
			}]
  });

}]);
