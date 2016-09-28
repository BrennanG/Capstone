angular.module('biologyGraphingApp').factory('sections', ['$http', '$state', 'auth',
function($http, $state, auth) {
	var o = {
		sections: []
	};

  o.getAll = function() {
		return $http.get('/teacher/sections', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			  angular.copy(data, o.sections);
		});
	};
  o.addSection = function(title) {
		var dataToSend = { title: title };
    return $http.post('/teacher/sections', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(section) {
      o.sections.push(section);

			$state.go($state.current, {}, {reload: true}); // reload the page
      return section;
    });
  };

	return o;
}]);
