// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','ui.calendar','ui.bootstrap','firebase','ui.router'])

.run(function($ionicPlatform,$rootScope, $location,$ionicViewService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  
    //A Function that returns True or False whether the user is authenticated or not
	var isUserLoggedIn = function()
	{
		if($rootScope.user == null)
			return false;
		return true;
	};

  // enumerate routes that don't need authentication
  var routesThatDontRequireAuth = ['/login','/','/app/'];
  
  //Return True if the route to go to (routeTo) requires user auth or not
  var isRouteRequireAuth = function(routeTo){
	for (i =0;i<routesThatDontRequireAuth.length;i++)
	{
		if(routeTo.url == routesThatDontRequireAuth[i])
			return false
	}
	return true
  }
  
  $rootScope.$on('$stateChangeStart', function (ev, to, toParams, from, fromParams) {
    // if route requires auth and user is not logged in
    if (isRouteRequireAuth(to) && !isUserLoggedIn()) {
	// using the ionicViewService to hide the back button on next view
	$ionicViewService.nextViewOptions({
	   disableBack: true
	});
      // redirect back to login
      $location.path('/app/login');
    }
  });
  
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
	.state('app.home', {
      url: "/",
      views: {
        'menuContent' :{
          templateUrl: "templates/homePage.html"
        }
      }
    })
	
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

	.state('app.login',{
		url : "/login",
		views: {
        'menuContent' :{
          templateUrl: "templates/login.html",
          controller: 'AppCtrl'
        }
      }
	})
	
    .state('app.search', {
      url: "/search",
      views: {
        'menuContent' :{
          templateUrl: "templates/search.html"
        }
      }
    })
	
	

    .state('app.addeventdetailed', {
      url: "/addeventdetailed",
      views: {
        'menuContent' :{
          templateUrl: "templates/addEventDetailed.html"
        }
      }
    })
    .state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent' :{
          templateUrl: "templates/playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })

    .state('app.eventmanage', {
      url: "/eventmanage",
      views: {
        'menuContent' :{
          templateUrl: "templates/eventManage.html",
          controller: 'EventManagerCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/');
});

