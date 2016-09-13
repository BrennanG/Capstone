angular.module('biologyGraphingApp')
.config(['$stateProvider', '$urlRouterProvider',

function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('home', {
		url : '/home',
		templateUrl : '/home.html',
		controller : 'HomeCtrl',
    resolve: {
      postPromise : ['documents', function(documents) {
			  return documents.getAll();
			}]},
		onEnter : ['$state', 'auth',
			function($state, auth) {
				console.log('Ctrl-Shift-J');
				if (!auth.isLoggedIn()) {
					$state.go('login');
				}
		}]
	});

	$urlRouterProvider.otherwise('home');
}]);
