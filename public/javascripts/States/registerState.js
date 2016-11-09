angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('register', {
		url : '/register',
		templateUrl : 'templates/register.html',
		controller : 'AuthCtrl'
	});

}]);
