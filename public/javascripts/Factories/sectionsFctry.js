angular.module('biologyGraphingApp').factory('sections', ['$http', '$state', 'auth',
function($http, $state, auth) {
	var o = {
		sections: []
	};

	// All $http requests are accessing the routes that are set up in the "routes" folder

	// Gets all of a teacher's sections
  o.getAll = function() {
		return $http.get('/teacher/sections', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			  angular.copy(data, o.sections);
		});
	};

	// Gets all of the sections that a student is enrolled in
	o.getAllForStudent = function() {
		return $http.get('/student/sections', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			  angular.copy(data, o.sections);
		});
	};

	// Adds a new section to a teacher's list of sections
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

	// Gets a single section
  o.getSection = function(id) {
    return $http.get('/teacher/sections/' + id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(res) {
      return res.data;
    });
  };

	// Deletes a single section and removes it from the teacher's list of section
  o.deleteSection = function(section) {
    return $http.delete('/teacher/sections/' + section._id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(deletedSection) {

        o.sections.splice(o.sections.findIndex(function(section) {
          section._id = deletedSection._id;
        }), 1);

				var dataToSend = {teacher: auth.currentEmail(), sectionId: section._id};
				$http.put('/teacher/sections/remove', dataToSend, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				});

				$state.go($state.current, {}, {reload: true}); // reload the page
        return deletedSection;
      });
  };

	// Adds a student to a section's list of enrolled students, and adds the section to the student's list of enrolled sections
  o.addStudentToSection = function(studentEmail, section) {
		var dataToSend = { email: studentEmail };
    return $http.put('/teacher/sections/' + section._id + '/students/add', dataToSend, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).error(function(error) {
			alert(error.message);
		}).then(function(section) {
			dataToSend = {email: studentEmail, section: section.data};
			return $http.put('/student/sections/add', dataToSend, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(student) {
				$state.go($state.current, {}, {reload: true}); // reload the page
	      return section;
			});

    });
  };

	return o;
}]);
