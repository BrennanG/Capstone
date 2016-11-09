angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('register', {
		url : '/register',
		templateUrl : '/register.html',
		controller : 'AuthCtrl'
	});

}]);
