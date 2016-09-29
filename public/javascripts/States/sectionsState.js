angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('sections', {
		url : '/sections/{id}',
		templateUrl : '/sections.html',
		controller : 'SectionsCtrl',
    resolve: {
      section: ['$stateParams', 'sections', function($stateParams, sections) {
        return sections.getSection($stateParams.id);
      }]},
		onEnter : ['$state', 'auth',
			function($state, auth) {
				if (!auth.isLoggedIn() || auth.accountType() != "teacher") {
					$state.go('login');
				}
		}]
  });

}]);