angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {

	$stateProvider.state('assignments', {
		url : '/assignments/{id}',
		templateUrl : '/assignments.html',
		controller : 'AssignmentsCtrl',
    resolve: {
      assignment: ['$stateParams', 'assignments', function($stateParams, assignments) {
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