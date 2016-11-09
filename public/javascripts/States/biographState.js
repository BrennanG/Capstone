angular.module('biologyGraphingApp')
.config(['$stateProvider',

function($stateProvider) {
  
	$stateProvider.state('biograph', {
      views: {
        'header': {
          template:'header <hr />'/*,
          controller:'mainController'*/
        },
        'content': {
          template:'<div ui-view></div>'
        },
        'footer': {
          template:'<hr /> footer'/*,
          controller:'mainController'*/
        }
     }
 });

}]);
