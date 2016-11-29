angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('studentHome', {
		parent: 'page',
		url : '/student/home',
		templateUrl : 'templates/studentHome.html',
		controller : 'StudentHomeCtrl',
    resolve: {
			sectionsPromise : ['sections', function(sections) {
				return sections.getAllForStudent();
			}],
      documentsPromise : ['documents', function(documents) {
			  return documents.getAll();
			}]
		},
		onEnter : ['$state', 'auth',
			function($state, auth) {
				if (!auth.isLoggedIn() || auth.accountType() != "student") {
					$state.go('login');
				}
		}]
	});

}]);
