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
				// requests data from the factory, which pulls the data from the Database
				return sections.getAllForStudent();
			}],
      documentsPromise : ['documents', function(documents) {
				// requests data from the factory, which pulls the data from the Database
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
