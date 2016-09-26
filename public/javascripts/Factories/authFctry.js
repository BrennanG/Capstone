angular.module('biologyGraphingApp').factory('auth', ['$http', '$window', '$state',
function($http, $window, $state) {
	var auth = {};
	var type = "";

	auth.saveToken = function(token) {
		$window.localStorage['biograph-token'] = token;
	};

	auth.getToken = function() {
		return $window.localStorage['biograph-token'];
	}

	auth.isLoggedIn = function() {
		var token = auth.getToken();

		if (token) {
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUserName = function() {
		if (auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.userRegister = function(user) {
		return $http.post('/user/register', user).success(function(data) {
			auth.saveToken(data.token);
			type = "user";
		});
	};

	auth.userLogIn = function(user) {
		return $http.post('/user/login', user).success(function(data) {
			auth.saveToken(data.token);
			type = "user";
		});
	};

	auth.teacherRegister = function(user) {
		return $http.post('/teacher/register', user).success(function(data) {
			auth.saveToken(data.token);
			type = "teacher";
		});
	};

	auth.teacherLogIn = function(user) {
		return $http.post('/teacher/login', user).success(function(data) {
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

	return auth;
}]);
