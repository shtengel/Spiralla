angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$rootScope) {
	var ref = new Firebase("https://scorching-fire-7327.firebaseio.com");
	var auth = new FirebaseSimpleLogin(ref,function(error,user){
		if(user){
			$rootScope.user = user
			getUserColor(user);
		}
	});
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    //$scope.modal.show();
	auth.login('facebook',{
		rememberMe : false		
	});
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
  
  //Check to see if the user has already got a color
  isUserColorExists = function(user,callback){
			new Firebase('https://scorching-fire-7327.firebaseio.com/usersColor/'+user.uid).once('value', function(snap) {
			callback(snap.val())
		});
	}
  
  var getUserColor = function(user){
	isUserColorExists(user,function(info){
		if(info == null)
		{
			//Colour does not exists
			var objectToPush = { color : getRandomColor()}
			ref.child('usersColor/'+$rootScope.user.uid).set(objectToPush);
			$rootScope.user.color = objectToPush.color;
		}
		else
		{
			//Colour exists
			$rootScope.user.color = info.color;
		}
	});
  }
  
  //Generate a Random Colour
  var getRandomColor = function() {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
			color += letters[Math.floor(Math.random() * 16)];
			}
		return color;
	}
})

.controller('loginCtrl',function($scope,$rootScope,$firebase,$firebaseSimpleLogin){
	
})

.controller('PlaylistsCtrl', function($scope,$firebase,$rootScope,$ionicModal,dateServices) {
		//Loading Firebase DB
		var ref = new Firebase("https://scorching-fire-7327.firebaseio.com/events");
		
		var sync = $firebase(ref);
		
		var syncEventsArray = sync.$asArray();
		$scope.events = syncEventsArray;

	//Calendar Config
	$scope.uiConfig = {
		calendar:{
			editable : true,
			header:{
				left :'month agendaWeek',
				center : 'title',
				right : 'today prev,next'
				},
				dayClick: function(date,jsEvent,view) {
								$scope.addEvent(date)
							},
				eventClick: function(date,jsEvent,view){
					//syncEventsArray.$remove(date);
					$scope.openModal();
				}
			}
		};
	
	//Add Event to calendar function
	$scope.addEvent = function(date) {
		//A Check that the given date is not too far ( date < today + 1 month )
		if(dateServices.isDateExceedDatesLimits(date))
			return;
		
		var endDate = new Date(date.toString())
		endDate.addHours(1)
		var user = { 'displayName' : $rootScope.user.displayName,
					 'profileUrl' : $rootScope.user.thirdPartyUserData.picture.data.url,
					 'uid' : $rootScope.user.uid };
		event = {
			title:  $rootScope.user.displayName,
			start: date.toString(),
			end :  endDate.toString(),
			allDay:false,
			unixStartTime:date.getTime(),
			unixEndTime:endDate.getTime(),
			backgroundColor : $rootScope.user.color,
			borderColor : $rootScope.user.color,
			user: user
		}
		
		//A Check that there are no overlapping dates
		if(dateServices.isTimeAvailable($scope.events,event)){
			syncEventsArray.$add(event);
		}
		
	}
	
	$scope.eventSources = [$scope.events]
	
	$ionicModal.fromTemplateUrl('templates/eventDetails.html',{
		scope : $scope,
		animation :'slide-in-up'}).then(function(modal){
			$scope.modal = modal
		});
		
	$scope.openModal = function(){
		$scope.modal.show();
	}
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
})

.controller('EventManagerCtrl', function($scope, $stateParams,$firebase,$rootScope,masterServices) {
		//Loading Firebase DB	
		var ref = new Firebase("https://scorching-fire-7327.firebaseio.com/events");
		
		var sync = $firebase(ref);
			
		var syncEventsArray = sync.$asArray();

		$scope.events = syncEventsArray;
		
		
		//Remove event from calendar function
		$scope.removeEvent = function(event){
				//A Check that the event were about to delete is ours
				if(isMyEvent(event))
					syncEventsArray.$remove(event);
				else
					//if not , master user can do anything
					masterServices.isMasterUser($rootScope.user,function(userobj){
						if(userobj != null)
							syncEventsArray.$remove(event);
					});
			}
			
		//A Function that returns true is the event given is mine ( according to the fbId )
		isMyEvent = function(event){
			if(event.user.uid == $rootScope.user.uid)
				return true;
			return false;
		}
})

.controller('AddDetailedEventCtrl',function($scope,$firebase,$rootScope,dateServices){
	var ref = new Firebase("https://scorching-fire-7327.firebaseio.com/events");
		
	var sync = $firebase(ref);
			
	var syncEventsArray = sync.$asArray();
	
	$scope.addEvent = function(startTime,endTime,note){
		//A Check that the given date is not too far ( date < today + 1 month )
		if(dateServices.isDateExceedDatesLimits(startTime))
			return;
		
		var user = { 'displayName' : $rootScope.user.displayName,
					 'profileUrl' : $rootScope.user.thirdPartyUserData.picture.data.url,
					 'uid' : $rootScope.user.uid };
		event = {
			title:  $rootScope.user.displayName,
			start: startTime.toString(),
			end :  endTime.toString(),
			allDay:false,
			unixStartTime:startTime.getTime(),
			unixEndTime:endTime.getTime(),
			backgroundColor : $rootScope.user.color,
			borderColor : $rootScope.user.color,
			user: user,
			color : $rootScope.user.color,
			note : note
		}
		
		//A Check that there are no overlapping dates
		if(dateServices.isTimeAvailable(syncEventsArray,event)){
			syncEventsArray.$add(event);
		}
	}
})

.factory('masterServices',function($firebase){
	var master = {};

	//Loading Firebase DB
	var ref = new Firebase("https://scorching-fire-7327.firebaseio.com/masterUsers");
	var sync = $firebase(ref);
	
	var syncMasterUsersArray = sync.$asArray();
	
	master.masterUsers = syncMasterUsersArray;
	
	master.isMasterUser = function(user,callback){
			new Firebase('https://scorching-fire-7327.firebaseio.com/masterUsers/'+user.uid).once('value', function(snap) {
			callback(snap.val())
		});
	}
	
	return master;
})

.factory('dateServices',function($firebase){
	var services = {}
	
	services.isTimeAvailable = function(events,newEvent){
		for(i=0;i<events.length;i++)
		{
			StartA = new Date(newEvent.unixStartTime)
			EndA = new Date(newEvent.unixEndTime)
			EndB = new Date(events[i].unixEndTime)
			StartB = new Date(events[i].unixStartTime)
			
			condition = ( StartA < EndB) && ( EndA > StartB);
			if(condition == true)
				return false;
		}
		return true;
	}
	
	services.isDateExceedDatesLimits = function(date){
		var dateNow = new Date()
		var dateLimit = dateNow.setMonth(dateNow.getMonth()+1)
		if( date > dateLimit){			
			return true;
		}
		return false;
	}
	
	return services
})

Date.prototype.addHours = function (n) {this.setHours (this.getHours () + n)}