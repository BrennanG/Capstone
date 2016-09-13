angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('documents', {
		url : '/documents/{id}',
		templateUrl : '/documents.html',
		controller : 'DocumentsCtrl',
    resolve: {
      document: ['$stateParams', 'documents', function($stateParams, documents) {
        return documents.getDocument($stateParams.id);
      }]},
		onEnter : ['$state', 'auth',
			function($state, auth) {
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
		}]
  });

}]);
