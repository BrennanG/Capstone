angular.module('biologyGraphingApp')
.config(['$stateProvider', '$urlRouterProvider',

function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('biograph', {
      views: {
        'header': {
          templateUrl: 'templates/header.html',
          controller: 'HeaderCtrl'
        },
        'content': {
          template: '<div ui-view></div>'
        }/*,
        'footer': {
          template:'<hr /> footer',
          controller:'mainController'
        }*/
     }
 });

 $urlRouterProvider.otherwise('/login');

}]);
