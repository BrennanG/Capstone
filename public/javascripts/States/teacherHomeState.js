angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('teacherHome', {
		parent: 'page',
		url : '/teacher/home',
		templateUrl : 'templates/teacherHome.html',
		controller : 'TeacherHomeCtrl',
    resolve: {
      sectionsPromise: ['sections', function(sections) {
				// requests data from the factory, which pulls the data from the Database
			  return sections.getAll();
			}]},
		onEnter: ['$state', 'auth',
			function($state, auth) {
				if (!auth.isLoggedIn() || auth.accountType() != "teacher") {
					$state.go('login');
				}
		}]
	});

}]);
