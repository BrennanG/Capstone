angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('section', {
		parent: 'page',
		url : '/section/{id}',
		templateUrl : 'templates/section.html',
		controller : 'SectionCtrl',
    resolve: {
      section: ['$stateParams', 'sections', function($stateParams, sections) {
				// requests data from the factory, which pulls the data from the Database
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
