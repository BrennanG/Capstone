angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('register', {
		parent: 'biograph',
		url : '/register',
		templateUrl : 'templates/register.html',
		controller : 'AuthCtrl',
		onEnter : ['auth',
			function(auth) {
				if (auth.isLoggedIn()) {
					auth.logOut();
				}
			}]
	});

}]);
