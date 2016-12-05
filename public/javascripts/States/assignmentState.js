angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('assignment', {
		parent: 'page',
		url : '/assignment/{id}',
		templateUrl : 'templates/assignment.html',
		controller : 'AssignmentCtrl',
    resolve: {
      assignment: ['$stateParams', 'assignments', function($stateParams, assignments) {
				// requests data from the factory, which pulls the data from the Database
        return assignments.getAssignment($stateParams.id);
      }]},
		onEnter : ['$state', 'auth',
			function($state, auth) {
				if (!auth.isLoggedIn() || auth.accountType() != "teacher") {
					$state.go('login');
				}
		}]
  });

}]);
