angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$rootScope) {
	var ref = new Firebase("https://scorching-fire-7327.firebaseio.com/events");
	var auth = new FirebaseSimpleLogin(ref,function(error,user){
		if(user){
			$rootScope.user = user
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
})

.controller('loginCtrl',function($scope,$rootScope,$firebase,$firebaseSimpleLogin){
	var ref = new Firebase("https://scorching-fire-7327.firebaseio.com");
	$scope.auth = $firebaseSimpleLogin(ref);
	$rootScope = null;
	
	// Open the login modal
	$scope.login = function() {
    //$scope.modal.show();
		$scope.auth.$login('facebook',{
			rememberMe : false		
	})};
	
	$scope.logout = function(){
		$scope.auth.$logout()
	}
})

.controller('PlaylistsCtrl', function($scope,$firebase,$rootScope,$ionicModal,roomServices) {
	$scope.events = roomServices.getRoomEventArray(0);

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
		roomServices.addEventToRoom(0,date);
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

.controller('EventManagerCtrl', function($scope,roomServices) {
		$scope.events = roomServices.getRoomEventArray(0);
	
		//Remove event from calendar function
		$scope.removeEvent = function(event){
				roomServices.removeEventFromRoom(0,event);
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
			title: 'Booked',
			start: startTime.toString(),
			end :  endTime.toString(),
			allDay:false,
			unixStartTime:startTime.getTime(),
			unixEndTime:endTime.getTime(),
			user: user,
			note : note
		}
		
		//A Check that there are no overlapping dates
		if(dateServices.isTimeAvailable(syncEventsArray,event)){
			syncEventsArray.$add(event);
		}
	}
})

.factory('roomServices',function(dateServices,$rootScope,$firebase){
	var service = {};
	service.ROOM_COUNT = 3;
	var rooms = {};
	var ref = new Firebase("https://scorching-fire-7327.firebaseio.com");
	for(i=0;i<service.ROOM_COUNT;i++)
	{
		var sync = $firebase(ref.child('events'+i));
		rooms[i] = sync.$asArray();
	}
	
	service.getRoomEventArray = function(index){
		return rooms[index];
	}
	
	service.addEventToRoom = function(index,date){
	
		//A Check that the given date is not too far ( date < today + 1 month )
		if(dateServices.isDateExceedDatesLimits(date))
			return;
		
		var endDate = new Date(date.toString())
		endDate.addHours(1)
		var user = { 'displayName' : $rootScope.user.displayName,
					 'profileUrl' : $rootScope.user.thirdPartyUserData.picture.data.url,
					 'uid' : $rootScope.user.uid };
		event = {
			title: 'Booked',
			start: date.toString(),
			end :  endDate.toString(),
			allDay:false,
			unixStartTime:date.getTime(),
			unixEndTime:endDate.getTime(),
			user: user
		}
		
		//A Check that there are no overlapping dates
		if(dateServices.isTimeAvailable(rooms[index],event)){
			rooms[index].$add(event);
		}

	}
	
	//Remove event from calendar function
	service.removeEventFromRoom = function(index,event){
			//A Check that the event were about to delete is ours
			if(isMyEvent(event))
				rooms[index].$remove(event);
			else
				//if not , master user can do anything
				masterServices.isMasterUser($rootScope.user,function(userobj){
					if(userobj != null)
						rooms[index].$remove(event);
				});
		}
		
	//A Function that returns true is the event given is mine ( according to the fbId )
	isMyEvent = function(event){
		if(event.user.uid == $rootScope.user.uid)
			return true;
		return false;
	}
	
	return service;
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