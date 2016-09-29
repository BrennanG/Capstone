angular.module('biologyGraphingApp').factory('assignments', ['$http', '$state', 'auth',
function($http, $state, auth) {
	var o = {	};

  o.addAssignment = function(title, description, section) {
		var dataToSend = { title: title, description: description, section: section };
    return $http.post('/teacher/assignments', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(assignment) {

			$state.go($state.current, {}, {reload: true}); // reload the page
      return assignment;
    });
  };

	return o;
}]);
