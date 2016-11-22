angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('login', {
		parent: 'biograph',
		url : '/login',
		templateUrl : 'templates/login.html',
		controller : 'AuthCtrl',
		onEnter : ['auth',
			function(auth) {
				if (auth.isLoggedIn()) {
					auth.logOut();
				}
			}]
	});

}]);
