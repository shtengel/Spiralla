angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$rootScope,$firebase, $firebaseSimpleLogin) {
	$rootScope.roomNumber = 0; 
	$rootScope.favicon = '<img class="img img-circle" src="img/favicons.png"/>';
	var ref = new Firebase("https://scorching-fire-7327.firebaseio.com");
	
	var auth = new FirebaseSimpleLogin(ref,function(error,user){
		if(user){
			$scope.$apply(function(){
				$rootScope.user = user;
				$scope.user = user;
			})
			getUserColor(user);
		}
	});

	// Open the login modal
	$scope.login = function() {
		//$scope.modal.show();
		auth.login('facebook',{
			rememberMe : false			
		});
	};

	// Logs a user out
	$scope.logout = function() {
		auth.logout();
	};
	
	var authRef = new Firebase("https://scorching-fire-7327.firebaseio.com/.info/authenticated");
	authRef.on("value", function(snap) {
	  if (snap.val() === true) {
		console.log("authenticated");
	  } else {
		$rootScope.user = null;
		$scope.user = null;
		console.log("not authenticated");
	  }
	});

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
.controller('PlaylistsCtrl', function($scope,$firebase,$rootScope,$ionicModal,roomServices) {
	

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
		roomServices.addEventToRoom($rootScope.roomNumber,date);
	}
	
	//Switch to another Room (display that room's event)
	$scope.switchRoom = function(newRoomNumber) {
		if(newRoomNumber != $rootScope.roomNumber)
		{
			angular.element('#calendar').fullCalendar('removeEventSource',roomServices.getRoomEventArray($rootScope.roomNumber));
			$rootScope.roomNumber = newRoomNumber;
			angular.element('#calendar').fullCalendar('addEventSource',roomServices.getRoomEventArray(newRoomNumber));
		}
	}
	
	$scope.eventSources = [roomServices.getRoomEventArray($rootScope.roomNumber)]
	
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

.controller('EventManagerCtrl', function($scope,$rootScope,roomServices) {
		$scope.events = roomServices.getMyRoomEventArray($rootScope.roomNumber);
		
		//Remove event from calendar function
		$scope.removeEvent = function(event){
				roomServices.removeEventFromRoom($rootScope.roomNumber,event);
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
	
	service.getMyRoomEventArray = function(index){
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
			backgroundColor : $rootScope.user.color,
			title:  $rootScope.user.displayName,
			borderColor : $rootScope.user.color,
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