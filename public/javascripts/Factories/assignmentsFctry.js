angular.module('biologyGraphingApp').factory('assignments', ['$http', '$state', 'auth',
function($http, $state, auth) {
	var o = {	};

	// All $http requests are accessing the routes that are set up in the "routes" folder

	// Adds an new assignment to the section's list of assignments
  o.addAssignment = function(title, description, section) {
		var dataToSend = { title: title, description: description, section: section };
    return $http.post('/teacher/assignments', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(assignment) {
			$state.go($state.current, {}, {reload: true}); // reload the page
      return assignment;
    });
  };

	// Gets a single assignment
  o.getAssignment = function(id) {
    return $http.get('/teacher/assignments/' + id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(res) {
      return res.data;
    });
  };
	
	// Adds a submission to an assignment
  o.addSubmission = function(document, assignmentId) {
    var dataToSend = {document: document};
    return $http.put('/teacher/assignments/' + assignmentId + '/submission', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(returnedData) {
        $state.go($state.current, {}, {reload: true}); // reload the page
        return returnedData;
    });
  };

	return o;
}]);
