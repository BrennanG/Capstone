angular.module('biologyGraphingApp')
.config(['$stateProvider', '$urlRouterProvider',

function($stateProvider, $urlRouterProvider) {

	// The parent state for the entire application
	$stateProvider.state('biograph', {
      controller: 'BiographCtrl',
			// The header and content views below are displayed in these divs
			template: "<div class='col-md-8 col-md-offset-2'><div ui-view='header'></div><div ui-view='content'></div></div>"
	});

	$stateProvider.state('page', {
		parent: 'biograph',
		// Splits the pages into a header and content
		views: {
			 // The header contains the logout and home buttons
			 'header': {
				 templateUrl: 'templates/header.html',
				 controller: 'HeaderCtrl'
			 },
			 // All of the content of each page is displayed in the div of this template
			 'content': {
				 template: '<div ui-view></div>'
			 }
		 }
	});

	// Redirect to the login page if the requested state does not exist
	$urlRouterProvider.otherwise('/login');

}]);
