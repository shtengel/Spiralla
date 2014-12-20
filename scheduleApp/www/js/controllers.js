angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$rootScope,$firebase, $firebaseSimpleLogin) {
	$rootScope.roomNumber = 0; 
	$rootScope.favicon = '<img class="img img-circle" src="img/Spiralla_icon_shakof.png"/>';
	$rootScope.logo = 'img/Spiralla_logo_shakof.png'
	var ref = new Firebase("https://scorching-fire-7327.firebaseio.com");
	$scope.loginObj = $firebaseSimpleLogin(ref);
	
	//Home Message Board
	var sync = $firebase(ref.child('messageBoardMessages'));
	$scope.messageBoard = sync.$asArray();
	console.log($scope.messageBoard)
	
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
	$scope.login = function(provider) {
		$scope.loginObj.$login(provider).then(function(user) {			
			$rootScope.user = user;
			$scope.user = user;
			console.log(user)
			getUserColor(user);
		}, function(error) {
		  console.error('Unable to login', error);
		});
	  };
		//$scope.modal.show();
		/*auth.login('facebook',{
			rememberMe : false,
			preferRedirect : true
		});*/

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
			var objectToPush = { color : getRandomColor(), displayName : $rootScope.user.displayName}
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
.controller('PreferencesCtrl',function($scope,$location,$rootScope,roomServices){
	
	$scope.roomsCount = []
	if($rootScope.user == null)
	{
		// redirect back to login
		$location.path('/app/login');
	}
	
	for(i=0;i<roomServices.ROOM_COUNT;i++)
	{
		if($rootScope.roomNumber !=i)
		{
			$scope.roomsCount.push(i);
		}
	}
	$scope.number = $rootScope.roomNumber;
	
	$scope.roomSwitch = function(number)
	{
		$rootScope.roomNumber = number;
	}
	
	 $scope.$watch('number', function() {
       $rootScope.roomNumber = $scope.number;
   });
})
.controller('PlaylistsCtrl', function($scope,$state,$firebase,$rootScope,$ionicModal,$ionicPopup,roomServices) {
	if($rootScope.user == null)
	{
		// redirect back to login
		$state.go('app.login');
	}
	$scope.data = {}
	
	angular.element('#room'+$rootScope.roomNumber).addClass('button-dark');
	
	//Calendar Config
	$scope.uiConfig = {
		calendar:{
			editable : false,
			businessHours: false,
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
					//$scope.openModal();
				}
			}
		};
	
	//Add Event to calendar function
	$scope.addEvent = function(date) {
		// Popup to show when entering new Appoitment to enter description
		var myPopup = $ionicPopup.show({
			template: '<input type="text" ng-model="data.description">',
			title: 'Enter Description',
			subTitle: 'תיאור עם מי יש לי פגישה',
			scope: $scope,
			buttons: [
			  { text: 'Cancel' },
			  {
				text: '<b>Save</b>',
				type: 'button-royal',
				onTap: function(e) {
				  if (!$scope.data.description) {
					//don't allow the user to close unless he enters wifi password
					e.preventDefault();
				  } else {
					return $scope.data.description;
				  }
				}
			  },
			]
		});
		myPopup.then(function(res) {
			if($scope.data.description != undefined)
			{
				//After Popup , push the newly event
				console.log('Tapped!', res);
				if(window.cordova != null){
					cordova.plugins.Keyboard.close();
				}
				var endDate = new Date(date.toString());
				endDate.addHours(1);
				
				event = roomServices.addEventToRoom($rootScope.roomNumber,date,endDate,$scope.data.description);
				//angular.element('#calendar').fullCalendar('render');
				angular.element('#calendar').fullCalendar( 'changeView', 'month' )
				$scope.data.description = null;
			}
		});
	}
	
	//Switch to another Room (display that room's event)
	$scope.switchRoom = function(newRoomNumber) {
		if(newRoomNumber != $rootScope.roomNumber)
		{
			//angular.element('#calendar').fullCalendar('removeEventSource',roomServices.getRoomEventArray($rootScope.roomNumber));
			$rootScope.roomNumber = newRoomNumber;
			//angular.element('#calendar').fullCalendar('addEventSource',roomServices.getRoomEventArray(newRoomNumber));
			angular.element('#calendar'+newRoomNumber).fullCalendar('render');
			
			setColorButtons(newRoomNumber);
		}
	}
	
	setColorButtons = function(newRoomNumber){
			
		angular.element('#room'+newRoomNumber).addClass('button-dark');
		
		for(i=0;i<4;i++){
			if(i != newRoomNumber){
			
				angular.element('#room'+i).removeClass('button-dark');
			}
		}
	}
	
	//$scope.eventSources = [roomServices.getRoomEventArray($rootScope.roomNumber)]
	$scope.eventSources1 = [roomServices.getRoomEventArray(0)]
	$scope.eventSources2 = [roomServices.getRoomEventArray(1)]
	$scope.eventSources3 = [roomServices.getRoomEventArray(2)]
	
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

.controller('EventManagerCtrl', function($scope,$rootScope,$timeout,roomServices) {
		$scope.displayRoomNumber = $rootScope.roomNumber + 1;
		
		var init = function(){
			roomServices.getMyRoomEventArray($rootScope.roomNumber,function(events){
				$timeout(function(){
					$scope.events = events;
				});
			});
		}
		
		//Remove event from calendar function
		$scope.removeEvent = function(event,index){		
				roomServices.removeEventFromRoom($rootScope.roomNumber,event);
				$scope.events.splice(index, 1);
				//init();
		};
		init();
})

.controller('AddDetailedEventCtrl',function($scope,$firebase,$rootScope,dateServices,$ionicModal){
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
	
	$ionicModal.fromTemplateUrl('templates/datemodal.html', 
        function(modal) {
            $scope.datemodal = modal;
        },
        {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope, 
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
        }
    );
    $scope.opendateModal = function() {
      $scope.datemodal.show();
    };
    $scope.closedateModal = function(modal) {
      $scope.datemodal.hide();
      $scope.datepicker = modal;
    };
})

.factory('roomServices',function(dateServices,$rootScope,$firebase){
	var service = {};
	service.ROOM_COUNT = 3;
	console.log('sdf')
	var rooms = {};
	var ref = new Firebase("https://scorching-fire-7327.firebaseio.com");
	var deletedEventsLog = $firebase(ref.child('deleted_events_log'));
	
	for(i=0;i<service.ROOM_COUNT;i++)
	{
		var sync = $firebase(ref.child('events'+i));
		rooms[i] = sync.$asArray();
	}
	
	
	service.getRoomEventArray = function(index){
		return rooms[index];
	}
	
	service.getMyRoomEventArray = function(index,callback){
		
		if($rootScope.isMaster == true)
		{
			console.log('master user , return all rooms')
			callback(rooms[index]);
		}
		else
		{
			items = []
			for(i=0;i<rooms[index].length;i++)
			{
				if(isMyEvent(rooms[index][i]))
				{
					console.log('sdf')
					items.push(rooms[index][i]);
				}
			}
			callback(items);
		}
	}
	
	service.addEventToRoom = function(index,date,endDate,eventDescription){
	
		//A Check that the given date is not too far ( date < today + 1 month )
		if(dateServices.isDateExceedDatesLimits(date))
			return;
		
		
		var profile_pic_url = $rootScope.user.thirdPartyUserData.picture;
		if($rootScope.user.thirdPartyUserData.picture.hasOwnProperty('data')){
			profile_pic_url = $rootScope.user.thirdPartyUserData.picture.data.url;
		}
		
		var user = { 'displayName' : $rootScope.user.displayName,
					 'profileUrl' :profile_pic_url,
					 'uid' : $rootScope.user.uid };
		event = {
			title: 'Booked',
			start: date.toString(),
			end :  endDate.toString(),
			backgroundColor : $rootScope.user.color,
			title:  $rootScope.user.displayName,
			borderColor : $rootScope.user.color,
			allDay:false,
			description : eventDescription,
			unixStartTime:date.getTime(),
			unixEndTime:endDate.getTime(),
			user: user
		}
		
		//A Check that there are no overlapping dates
		if(dateServices.isTimeAvailable(rooms[index],event)){
			rooms[index].$add(event);
		}
		else{
			alert('Cannot book this time .. already been taken by someone else');
		}
		
		return event;
	}
	
	//Remove event from calendar function
	service.removeEventFromRoom = function(index,event){
			//A Check that the event were about to delete is ours
			if(isMyEvent(event))
			{
				console.log('my event')
				rooms[index].$remove(event);
				event['deleting_user'] = $rootScope.user.displayName;
				deletedEventsLog.$push({
										start: event.start,
										end :  event.end,
										description : event.description,
										deletingUser:  $rootScope.user.displayName,
										unixStartTime:event.unixStartTime,
										unixEndTime:event.unixEndTime
				});
			}
			else
				{
					console.log('not my event')
					//if not , master user can do anything
					
					if($rootScope.isMaster){
						console.log('deleting..isMaster = true')
						rooms[index].$remove(event);
						event['deleting_user'] = $rootScope.user.displayName;
						deletedEventsLog.$push({
									start: event.start,
									end :  event.end,
									deletingUser:  $rootScope.user.displayName,
									description : event.description,
									unixStartTime:event.unixStartTime,
									unixEndTime:event.unixEndTime
						});
					}
					
				}
		}
		
	//A Function that returns true is the event given is mine ( according to the fbId )
	isMyEvent = function(event){
		if(event.user.uid == $rootScope.user.uid)
			return true;
		return false;
	}
	
	return service;
})

.factory('masterServices',function($firebase,$state){
	var master = {};

	//Loading Firebase DB
	//var ref = new Firebase("https://scorching-fire-7327.firebaseio.com/masterUsers");
	master.isMasterUser = function(user,callback){
			if(user == null)
			{
				// redirect back to login
				$state.go('app.login');
				callback(false)
				return;
			}
			
			new Firebase('https://scorching-fire-7327.firebaseio.com/masterUsers/'+user.uid).once('value', function(snap) {
				val = snap.val()
				if(val == null || val == false){
					callback(false)
				}
				else{
					callback(true)
				}
		});
	}
	
	return master;
})

.controller('AdminCtrl',function($firebase,$rootScope,$scope,$http){
	var ref = new Firebase("https://scorching-fire-7327.firebaseio.com");
	
	$scope.users = []
	ref.child('usersAndroidId').once('value',function(snapshot){
		users = snapshot.val();
		console.log(snapshot.val());
		for(var prop in users){
			if(users.hasOwnProperty(prop) && (prop.lastIndexOf("facebook", 0) === 0 || prop.lastIndexOf("google", 0))){
				for (var device in users[prop]){
					$scope.users.push({
										displayName :users[prop][device]["displayName"],
										model : users[prop][device]["model"],
										gcmId : users[prop][device]["gcmId"],
										checked : true
									});
				}
			}
		}
	});
	
	var sync = $firebase(ref.child('messageBoardMessages'));
	$scope.syncedMessagesBoardArray = sync.$asArray();
	
	$scope.addMessage = function(messageText){
		if(messageText != ''){
			$scope.syncedMessagesBoardArray.$add({
				text:messageText
			});
			if(window.cordova){
				cordova.plugins.Keyboard.close();
			}
		}
		
	}
	
	$scope.sendGCMNotification = function(messageText){
			url = '/gcm/sendNotification'
			ids = []
			for(i =0;i<$scope.users.length;i++) {
				if($scope.users[i]["checked"] == true) {
					ids.push($scope.users[i]["gcmId"])
				}
			}
			data = {
					 message: messageText,
					 regIds : ids
					}
			$http.post(url,data).success(function(){
			})
			.error(function(){
				
			});
			
			if(window.cordova){
				cordova.plugins.Keyboard.close();
			}	
		}
	
	$scope.removeMessage = function(message){
		$scope.syncedMessagesBoardArray.$remove(message);
	};
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