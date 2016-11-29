angular.module('biologyGraphingApp')
.config(['$stateProvider', '$urlRouterProvider',

function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('biograph', {
      controller: 'BiographCtrl',
			template: "<div class='col-md-8 col-md-offset-2'><div ui-view='header'></div><div ui-view='content'></div></div>"
 });

 $stateProvider.state('page', {
	   parent: 'biograph',
		 views: {
			 'header': {
				 templateUrl: 'templates/header.html',
				 controller: 'HeaderCtrl'
			 },
			 'content': {
				 template: '<div ui-view></div>'
			 }
		}
});

 $urlRouterProvider.otherwise('/login');

}]);
