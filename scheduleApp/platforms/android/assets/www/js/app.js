// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','starter.controllers','ui.calendar','ui.bootstrap','firebase','ui.router','pickadate'])

.run(function($ionicPlatform,$rootScope, $location,$ionicViewService, $firebaseSimpleLogin, $state, $window,PushProcessingService) {
	//run once for the app
	PushProcessingService.initialize();
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
  
	var dataRef = new Firebase("https://scorching-fire-7327.firebaseio.com/");
	var loginObj = $firebaseSimpleLogin(dataRef);

	loginObj.$getCurrentUser().then(function(user) {
	if(!user){ 
	  // Might already be handled by logout event below
	  $state.go('login');
	}
	}, function(err) {
		//do Nothing
	});
	
	

	$rootScope.$on('$firebaseSimpleLogin:login', function(e, user) {
		$rootScope.user = user;
		//$state.go('app.playlists');
	});

	$rootScope.$on('$firebaseSimpleLogin:logout', function(e, user) {
		$rootScope.user = null;
		console.log($state);
		$state.go('app.login');
	});
  
    //A Function that returns True or False whether the user is authenticated or not
	var isUserLoggedIn = function()
	{
		if($rootScope.user == null)
			return false;
		return true;
	};

  // enumerate routes that don't need authentication
  var routesThatDontRequireAuth = ['/login','/'];
  
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
      $state.go('app.login');
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
	
    .state('app.preferences',{
		url : "/preferences",
		views: {
        'menuContent' :{
          templateUrl: "templates/preferences.html",
          controller: 'PreferencesCtrl'
        }
      }
	})
	
	.state('app.addeventdetailed', {
      url: "/addeventdetailed",
      views: {
        'menuContent' :{
          templateUrl: "templates/addEventDetailed.html",
		  controller: 'AddDetailedEventCtrl'
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
})
.factory('PushProcessingService', function($firebase,$rootScope) {
        function onDeviceReady() {
            console.info('NOTIFY  Device is ready.  Registering with GCM server');
			$rootScope.gcmInitialize = false;
            //register with google GCM server
            var pushNotification = window.plugins.pushNotification;
            //pushNotification.register(gcmSuccessHandler, gcmErrorHandler, {&quot;senderID&quot;:gcmAppID,&quot;ecb&quot;:&quot;onNotificationGCM&quot;});
			pushNotification.register(
			gcmSuccessHandler,
			gcmErrorHandler,{
				"senderID":"692290960891",
				"ecb":"onNotificationGCM"
			});
        }
        function gcmSuccessHandler(result) {
            console.info('NOTIFY  pushNotification.register succeeded.  Result = '+result)
        }
        function gcmErrorHandler(error) {
            console.error('NOTIFY  '+error);
        }
        return {
            initialize : function () {
                console.info('NOTIFY  initializing');
                document.addEventListener('deviceready', onDeviceReady, false);
				$rootScope.$on('$firebaseSimpleLogin:login', function(e, user) {
					if($rootScope.gcmInitialize == false){
						onDeviceReady();
					}
				});
				
            },
            registerID : function (id) {
                //Insert code here to store the user's ID on your notification server. 
                //You'll probably have a web service (wrapped in an Angular service of course) set up for this.  
                //For example:
				var ref = new Firebase("https://scorching-fire-7327.firebaseio.com/usersAndroidId");
				if($rootScope.user == null)
				{
					return;
				}
				
				$rootScope.gcmInitialize = true;
				
				ref.child($rootScope.user.uid).child(device.uuid).set({
					displayName : $rootScope.user.displayName,
					model : device.model,
					version : device.version,
					gcmId : id
				})
				
                MyService.registerNotificationID(id).then(function(response){
                    if (response.data.Result) {
                        console.info('NOTIFY  Registration succeeded');
                    } else {
                        console.error('NOTIFY  Registration failed');
                    }
                });
				
            }, 
            //unregister can be called from a settings area.
            unregister : function () {
                console.info('unregister')
                var push = window.plugins.pushNotification;
                if (push) {
                    push.unregister(function () {
                        console.info('unregister success')
                    });
                }
            }
        }
    });
 
 
// ALL GCM notifications come through here. 
function onNotificationGCM(e) {
    console.log('EVENT -&gt; RECEIVED:' + e.event + '');
    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                console.log('REGISTERED with GCM Server -&gt; REGID:' + e.regid);
                //call back to web service in Angular.  
                //This works for me because in my code I have a factory called
                //      PushProcessingService with method registerID
                var elem = angular.element(document.querySelector('[ng-app]'));
                var injector = elem.injector();
                var myService = injector.get('PushProcessingService');
                myService.registerID(e.regid);
            }
            break;
 
        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
                //we're using the app when a message is received.
                console.log('--INLINE NOTIFICATION--' + '');
 
                // if the notification contains a soundname, play it.
                //var my_media = new Media(&quot;/android_asset/www/&quot;+e.soundname);
                //my_media.play();
                alert(e.payload.message);
            }
            else
            {   
                // otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart)
                    console.log('--COLDSTART NOTIFICATION--' + '');
                else
                    console.log('--BACKGROUND NOTIFICATION--' + '');
 
                // direct user here:
                window.location = "#/tab/featured";
            }
 
            console.log('MESSAGE -&gt; MSG: ' + e.payload.message + '');
            console.log('MESSAGE: '+ JSON.stringify(e.payload));
            break;
 
        case 'error':
            console.log('ERROR -&gt; MSG:' + e.msg + '');
            break;
 
        default:
            console.log('EVENT -&gt; Unknown, an event was received and we do not know what it is');
            break;
    }
}

