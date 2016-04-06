var app = angular.module('flapperNews', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('home', {
		url : '/home',
		templateUrl : '/home.html',
		controller : 'MainCtrl',
		resolve : {
			postPromise : ['posts', function(posts) {
				return posts.getAll();
			}]
		}
	}).state('posts', {
		url : '/posts/{id}',
		templateUrl : '/posts.html',
		controller : 'PostsCtrl',
    resolve: {
      post: ['$stateParams', 'posts', function($stateParams, posts) {
        return posts.getPost($stateParams.id);
      }]
    }
	});

	$urlRouterProvider.otherwise('home');
}]);

app.factory('posts', ['$http',
function($http) {
	var o = {
		posts: []
	};

  o.getPost = function(id) {
    return $http.get('/posts/' + id).then(function(res) {
      return res.data;
    });
  };
	o.getAll = function() {
		return $http.get('/posts')
      .success(function(data) {
			  angular.copy(data, o.posts);
		});
	};
  o.addPost = function(post) {
    return $http.post('/posts', post)
      .success(function(data) {
        o.posts.push(data);
    });
  };
  o.upvotePost = function(post) {
    return $http.put('/posts/' + post._id + '/upvote')
      .success(function(data) {
        post.upvotes += 1;
    });
  };
  o.addComment = function(post, comment) {
    return $http.post('/posts/' + post._id + '/comments', comment)
      .success(function(comment) {
        post.comments.push(comment);
    });
  };
  o.upvoteComment = function(post, comment) {
    return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
      .success(function(data) {
        comment.upvotes += 1;
    });
  };

	return o;
}]);

app.controller('MainCtrl', ['$scope', 'posts',
function($scope, posts) {
	$scope.posts = posts.posts;

	$scope.title = '';

  // Add a new post to posts in PostFactory
  $scope.addPost = function() {
    if($scope.title === '') { return; }
    posts.addPost({
      title: $scope.title,
      link: $scope.link,
      upvotes: 0,
      comments: []
    });
    $scope.title = '';
    $scope.link = '';
  };

  // Increment the upvotes of a post in PostFactory
  $scope.upvotePost = function(post) {
    posts.upvotePost(post);
  };

}]);

app.controller('PostsCtrl', ['$scope', 'posts', 'post',
function($scope, posts, post) {
	$scope.post = post;

  // Add a comment to a post in PostsFactory
  $scope.addComment = function() {
    if ($scope.body === '') { return; }
    posts.addComment(post, { body: $scope.body, author: 'user', upvotes: 0 });
    $scope.body = '';
  };

  // Increment the upvotes of a comment in PostFactory
  $scope.upvoteComment = function(comment) {
    posts.upvoteComment(post, comment);
  };

}]);
