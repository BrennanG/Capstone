angular.module('biologyGraphingApp')
.config(['$stateProvider', '$urlRouterProvider',

function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('teacherHome', {
		url : '/teacher/home',
		templateUrl : '/teacher/home.html',
		controller : 'TeacherHomeCtrl',
    resolve: {
      postPromise : ['sections', function(sections) {
			  return sections.getAll();
			}]},
		onEnter : ['$state', 'auth',
			function($state, auth) {
				if (!auth.isLoggedIn() || auth.accountType() != "teacher") {
					$state.go('login');
				}
		}]
	});

	$urlRouterProvider.otherwise('login');
}]);
