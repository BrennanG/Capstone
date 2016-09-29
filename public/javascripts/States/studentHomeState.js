angular.module('biologyGraphingApp')
.config(['$stateProvider', '$urlRouterProvider',

function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('studentHome', {
		url : '/student/home',
		templateUrl : '/student/home.html',
		controller : 'StudentHomeCtrl',
    resolve: {
      postPromise : ['documents', function(documents) {
			  return documents.getAll();
			}]},
		onEnter : ['$state', 'auth',
			function($state, auth) {
				if (!auth.isLoggedIn() || auth.accountType() != "student") {
					$state.go('login');
				}
		}]
	});

	$urlRouterProvider.otherwise('login');
}]);
