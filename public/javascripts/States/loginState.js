angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('login', {
		url : '/login',
		templateUrl : '/login.html',
		controller : 'AuthCtrl'/*,
		onEnter : ['$state', 'auth',
			function($state, auth) {
				if (auth.isLoggedIn()) {
					$state.go('home');
				}
		}]*/
	});

}]);
