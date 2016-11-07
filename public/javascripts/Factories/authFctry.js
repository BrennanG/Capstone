angular.module('biologyGraphingApp').factory('auth', ['$http', '$window', '$state',
function($http, $window, $state) {
	var auth = {};
	var type = "";

	auth.saveToken = function(token) {
		$window.localStorage['biograph-token'] = token;
	};

	auth.getToken = function() {
		return $window.localStorage['biograph-token'];
	};

	auth.isLoggedIn = function() {
		var token = auth.getToken();

		if (token) {
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentEmail = function() {
		if (auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.email;
		}
	};

	auth.studentRegister = function(student) {
		return $http.post('/student/register', student).success(function(data) {
			auth.saveToken(data.token);
			type = "student";
		});
	};

	auth.studentLogIn = function(student) {
		return $http.post('/student/login', student).success(function(data) {
			auth.saveToken(data.token);
			type = "student";
		});
	};

	auth.teacherRegister = function(teacher) {
		return $http.post('/teacher/register', teacher).success(function(data) {
			auth.saveToken(data.token);
			type = "teacher";
		});
	};

	auth.teacherLogIn = function(teacher) {
		return $http.post('/teacher/login', teacher).success(function(data) {
			auth.saveToken(data.token);
			type = "teacher";
		});
	};

	auth.logOut = function() {
		$window.localStorage.removeItem('biograph-token');
		$state.go('login');
	};

	auth.accountType = function() {
		return type;
	};

	$http.get('/teacher/email', {
		headers: {Authorization: 'Bearer '+auth.getToken()}
	}).success(function(data) {
		if (data.found == "true") { type = "teacher" };
	});
	$http.get('/student/email', {
		headers: {Authorization: 'Bearer '+auth.getToken()}
	}).success(function(data) {
		if (data.found == "true") { type = "student" };
	});

	return auth;
}]);
