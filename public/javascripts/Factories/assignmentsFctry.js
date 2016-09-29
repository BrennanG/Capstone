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
  o.getAssignment = function(id) {
    return $http.get('/teacher/assignments/' + id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(res) {
      return res.data;
    });
  };
  // o.addSubmission = function(assignmentId, student, graph) {
  //   var dataToSend = {student: student, graph: graph};
  //   return $http.put('/teacher/assignments/' + assignmentId + '/submission', dataToSend, {
	// 		headers: {Authorization: 'Bearer '+auth.getToken()}
	// 	}).success(function(returnedData) {
  //       $state.go($state.current, {}, {reload: true}); // reload the page
  //       return returnedData;
  //   });
  // };

	return o;
}]);
