angular.module('biologyGraphingApp')
.config(['$stateProvider', '$urlRouterProvider',

function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('userHome', {
		url : '/user/home',
		templateUrl : '/user/home.html',
		controller : 'UserHomeCtrl',
    resolve: {
      postPromise : ['documents', function(documents) {
			  return documents.getAll();
			}]},
		onEnter : ['$state', 'auth',
			function($state, auth) {
				if (!auth.isLoggedIn() || auth.accountType() != "user") {
					$state.go('login');
				}
		}]
	});

	$urlRouterProvider.otherwise('login');
}]);
