angular.module('biologyGraphingApp').factory('auth', ['$http', '$window', '$state',
function($http, $window, $state) {
	var auth = {};

	// All $http requests are accessing the routes that are set up in the "routes" folder

	// Saves the log-in token to the browser's local storage
	auth.saveToken = function(token) {
		$window.localStorage['biograph-token'] = token;
	};

	// Gets the log-in token from the browser's local storage
	auth.getToken = function() {
		return $window.localStorage['biograph-token'];
	};

	// Returns whether or not the user is logged in
	auth.isLoggedIn = function() {
		var token = auth.getToken();

		if (token) {
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	// Returns the email of the currently logged in user
	auth.currentEmail = function() {
		if (auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.email;
		}
	};

	// Registers a new student account
	auth.studentRegister = function(student) {
		return $http.post('/student/register', student).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	// Logs into a student account
	auth.studentLogIn = function(student) {
		return $http.post('/student/login', student).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	// Registers a new teacher account
	auth.teacherRegister = function(teacher) {
		return $http.post('/teacher/register', teacher).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	// Logs into a teacher account
	auth.teacherLogIn = function(teacher) {
		return $http.post('/teacher/login', teacher).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	// Logs the user out and redirects to the login screen
	auth.logOut = function() {
		$window.localStorage.removeItem('biograph-token');
		$state.go('login');
	};

	// Returns whether the logged in user is a student or a teacher
	auth.accountType = function() {
		if (auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.type;
		}
	};

	return auth;
}]);
