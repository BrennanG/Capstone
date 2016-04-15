var app = angular.module('flapperNews', ['ui.router']);

///////////////////// STATES /////////////////////////////
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
	}).state('newMain', {
		url : '/newMain',
		templateUrl : '/newMain.html',
		controller : 'NewMainCtrl',
    resolve: {
      postPromise : ['documents', function(documents) {
			  return documents.getAll();
			}]
    }
	}).state('documents', {
		url : '/documents/{id}',
		templateUrl : '/documents.html',
		controller : 'DocumentsCtrl',
    resolve: {
      document: ['$stateParams', 'documents', function($stateParams, documents) {
        return documents.getDocument($stateParams.id);
      }]
    }
  });

	$urlRouterProvider.otherwise('home');
}]);
///////////////////// END STATES /////////////////////////////

///////////////////// FACTORIES /////////////////////////////
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

app.factory('documents', ['$http',
function($http) {
	var o = {
		documents: []
	};

  o.getAll = function() {
		return $http.get('/documents')
      .success(function(data) {
			  angular.copy(data, o.documents);
		});
	};
  o.getDocument = function(id) {
    return $http.get('/documents/' + id).then(function(res) {
      return res.data; // res.data is what we do for get post, not sure why
    });
  };
  o.addDocument = function(title, graphData) {
    return $http.post('/graphs', graphData)
      .success(function(graph) {
        var doc = { title: title, graph: graph._id };
        return $http.post('/documents', doc)
          .success(function(document) {
            o.documents.push(document);
            return document;
          });
      });
  };
  o.updateNetworkData = function(document, data) {
    return $http.put('/graphs/' + document.graph._id + '/network/data', data)
      .success(function(returnedData) {
        document.graph.network.data = returnedData;
        return returnedData;
      });
  };

	return o;
}]);
///////////////////// END FACTORIES ////////////////////////////

///////////////////// CONTROLLERS /////////////////////////////
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

app.controller('NewMainCtrl', ['$scope', 'documents',
function($scope, documents) {
	$scope.documents = documents.documents;
  
  $scope.addDocument = function() {
    // TODO: remove place-holders
    if ($scope.title === '') { return; }
    var graph = { network: 
                  {
                    dataSchema:
                     {
                       nodes: [{ name: "label", type: "string" }],
                       edges: [{ name: "label", type: "string" }]
                     }, 
                    data:
                     {
                       nodes: [{ id: "1", label: "1" },{ id: "2", label: "2" }],
                       edges: [{ source: "1", target: "2", directed: true, label: "edge" }]
                     }
                  }
                };
    documents.addDocument($scope.title, graph);
    $scope.title = '';
  };

}]);

app.controller('DocumentsCtrl', ['$scope', 'documents', 'document',
function($scope, documents, document) {
	$scope.document = document;
  $scope.nodes = document.graph.network.data.nodes;
  $scope.edges = document.graph.network.data.edges;

  $scope.updateNetworkData = function(doc) {
    // TODO: remove place-holders
    var data = { nodes: [{ id: "31", label: "31" },{ id: "32", label: "32" }],
                        edges: [{ source: "31", target: "32", directed: true, label: "brennan" }] };
    documents.updateNetworkData(doc, data);
  }

}]);
///////////////////// END CONTROLLERS /////////////////////////////
