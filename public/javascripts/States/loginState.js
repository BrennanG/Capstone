angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('login', {
		url : '/login',
		templateUrl : 'templates/login.html',
		controller : 'AuthCtrl'
	});

}]);
