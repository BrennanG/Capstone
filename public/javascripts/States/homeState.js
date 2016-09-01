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
			}]
    }
	});

	$urlRouterProvider.otherwise('home');
}]);
