app
.controller('DashCtrl',function($scope,$firebase,$rootScope,dateServices,$ionicModal,$ionicPopup,roomServices){
	$scope.time = {
		hours: 15,
		minutes : 15
	}
	$scope.time2 = {
		hours: 15,
		minutes : 30
	}
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	
	$scope.datepicker = yyyy+'-'+mm+'-'+dd;
	$scope.displayRoomNumber = $rootScope.roomNumber + 1;
	$scope.addEventWrapper = function(description){
		if(description != null && $scope.time != null && $scope.datepicker != '' && $scope.time2 != null)
		{
			var year = $scope.datepicker.split('-')[0];
			var month = $scope.datepicker.split('-')[1];
			var day = $scope.datepicker.split('-')[2];
			
			startTime = new Date(year, month-1, day, $scope.time.hours, $scope.time.minutes);
			endTime = new Date(year, month-1, day, $scope.time2.hours, $scope.time2.minutes);
			if(endTime < startTime){
				alert('End Time cannot be before Start Time! ');
			}
			else{
				$scope.addEvent(startTime,endTime,description);
			}
		}
		else{
			alert('Missing either Date , Time or Description.. please enter all fields');
		}
	}
	
	$scope.addEvent = function(startTime,endTime,notes){
			event = roomServices.addEventToRoom($rootScope.roomNumber,startTime,endTime,notes);
		}
		
		$ionicModal.fromTemplateUrl('my-date-picker-modal.tpl.html', 
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
		$scope.opendatePopup = function() {
		  $scope.datemodal.show();
		};
		$scope.closedateModal = function(modal) {
		  $scope.datemodal.hide();
		  $scope.datepicker = modal;
		}; 

        $scope.slots = [
            {epochTime: 12600, step: 15, format: 12},
            {epochTime: 54900, step: 15, format: 24}
        ];
		
		$scope.slots2 = [
            {epochTime: 12600, step: 15, format: 12},
            {epochTime: 54900, step: 15, format: 24}
        ];
		
		$scope.showTime2 = function (obj, str) {

            $scope.time2 = { hours: 0, minutes: 0, meridian: "" };

            var objDate = new Date(obj.epochTime * 1000);       // Epoch time in milliseconds.

            $scope.increaseHours = function () {
                if (obj.format == 12) {
                    if ($scope.time2.hours != 12) {
                        $scope.time2.hours += 1;
                    } else {
                        $scope.time2.hours = 1;
                    }
                }
                if (obj.format == 24) {
                    if ($scope.time2.hours != 23) {
                        $scope.time2.hours += 1;
                    } else {
                        $scope.time2.hours = 0;
                    }
                }
            };

            $scope.decreaseHours = function () {
                if (obj.format == 12) {
                    if ($scope.time2.hours > 1) {
                        $scope.time2.hours -= 1;
                    } else {
                        $scope.time2.hours = 12;
                    }
                }
                if (obj.format == 24) {
                    if ($scope.time2.hours > 0) {
                        $scope.time2.hours -= 1;
                    } else {
                        $scope.time2.hours = 23;
                    }
                }
            };

            $scope.increaseMinutes = function () {
                if ($scope.time2.minutes != (60 - obj.step)) {
                    $scope.time2.minutes += obj.step;
                } else {
                    $scope.time2.minutes = 0;
                }
            };

            $scope.decreaseMinutes = function () {
                if ($scope.time2.minutes != 0) {
                    $scope.time2.minutes -= obj.step;
                } else {
                    $scope.time2.minutes = 60 - obj.step;
                }
            };

            if (obj.format == 12) {

                $scope.time2.meridian = (objDate.getUTCHours() >= 12) ? "PM" : "AM";
                $scope.time2.hours = (objDate.getUTCHours() > 12) ? ((objDate.getUTCHours() - 12)) : (objDate.getUTCHours());
                $scope.time2.minutes = (objDate.getUTCMinutes());

                if ($scope.time2.hours == 0 && $scope.time2.meridian == "AM") {
                    $scope.time2.hours = 12;
                }

                $scope.changeMeridian = function () {
                    $scope.time2.meridian = ($scope.time2.meridian === "AM") ? "PM" : "AM";
                };

                $ionicPopup.show({
                    templateUrl: 'my-time-picker-12-hour2.tpl.html',
                    title: '<strong>12-Hour Format</strong>',
                    subTitle: '',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: 'Set',
                            type: 'button-positive',
                            onTap: function (e) {

                                $scope.loadingContent = true;

                                var totalSec = 0;

                                if ($scope.time2.hours != 12) {
                                    totalSec = ($scope.time2.hours * 60 * 60) + ($scope.time2.minutes * 60);
                                } else {
                                    totalSec = $scope.time2.minutes * 60;
                                }

                                if ($scope.time2.meridian === "AM") {
                                    totalSec += 0;
                                } else if ($scope.time2.meridian === "PM") {
                                    totalSec += 43200;
                                }
                                obj.epochTime = totalSec;

                            }
                        }
                    ]
                })

            }

            if (obj.format == 24) {

                $scope.time2.hours = (objDate.getUTCHours());
                $scope.time2.minutes = (objDate.getUTCMinutes());

                $ionicPopup.show({
                    templateUrl: 'my-time-picker-24-hour2.tpl.html',
                    title: '<strong>24-Hour Format</strong>',
                    subTitle: '',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: 'Set',
                            type: 'button-dark',
                            onTap: function (e) {

                                $scope.loadingContent = true;

                                var totalSec = 0;

                                if ($scope.time2.hours != 24) {
                                    totalSec = ($scope.time2.hours * 60 * 60) + ($scope.time2.minutes * 60);
                                } else {
                                    totalSec = $scope.time2.minutes * 60;
                                }
                                obj.epochTime = totalSec;
                            }
                        }
                    ]
                })

            }

        };

        $scope.showTimePickerModal = function (obj, str) {

            $scope.time = { hours: 0, minutes: 0, meridian: "" };

            var objDate = new Date(obj.epochTime * 1000);       // Epoch time in milliseconds.

            $scope.increaseHours = function () {
                if (obj.format == 12) {
                    if ($scope.time.hours != 12) {
                        $scope.time.hours += 1;
                    } else {
                        $scope.time.hours = 1;
                    }
                }
                if (obj.format == 24) {
                    if ($scope.time.hours != 23) {
                        $scope.time.hours += 1;
                    } else {
                        $scope.time.hours = 0;
                    }
                }
            };

            $scope.decreaseHours = function () {
                if (obj.format == 12) {
                    if ($scope.time.hours > 1) {
                        $scope.time.hours -= 1;
                    } else {
                        $scope.time.hours = 12;
                    }
                }
                if (obj.format == 24) {
                    if ($scope.time.hours > 0) {
                        $scope.time.hours -= 1;
                    } else {
                        $scope.time.hours = 23;
                    }
                }
            };

            $scope.increaseMinutes = function () {
                if ($scope.time.minutes != (60 - obj.step)) {
                    $scope.time.minutes += obj.step;
                } else {
                    $scope.time.minutes = 0;
                }
            };

            $scope.decreaseMinutes = function () {
                if ($scope.time.minutes != 0) {
                    $scope.time.minutes -= obj.step;
                } else {
                    $scope.time.minutes = 60 - obj.step;
                }
            };

            if (obj.format == 12) {

                $scope.time.meridian = (objDate.getUTCHours() >= 12) ? "PM" : "AM";
                $scope.time.hours = (objDate.getUTCHours() > 12) ? ((objDate.getUTCHours() - 12)) : (objDate.getUTCHours());
                $scope.time.minutes = (objDate.getUTCMinutes());

                if ($scope.time.hours == 0 && $scope.time.meridian == "AM") {
                    $scope.time.hours = 12;
                }

                $scope.changeMeridian = function () {
                    $scope.time.meridian = ($scope.time.meridian === "AM") ? "PM" : "AM";
                };

                $ionicPopup.show({
                    templateUrl: 'my-time-picker-12-hour.tpl.html',
                    title: '<strong>12-Hour Format</strong>',
                    subTitle: '',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: 'Set',
                            type: 'button-positive',
                            onTap: function (e) {

                                $scope.loadingContent = true;

                                var totalSec = 0;

                                if ($scope.time.hours != 12) {
                                    totalSec = ($scope.time.hours * 60 * 60) + ($scope.time.minutes * 60);
                                } else {
                                    totalSec = $scope.time.minutes * 60;
                                }

                                if ($scope.time.meridian === "AM") {
                                    totalSec += 0;
                                } else if ($scope.time.meridian === "PM") {
                                    totalSec += 43200;
                                }
                                obj.epochTime = totalSec;

                            }
                        }
                    ]
                })

            }

            if (obj.format == 24) {

                $scope.time.hours = (objDate.getUTCHours());
                $scope.time.minutes = (objDate.getUTCMinutes());

                $ionicPopup.show({
                    templateUrl: 'my-time-picker-24-hour.tpl.html',
                    title: '<strong>24-Hour Format</strong>',
                    subTitle: '',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: 'Set',
                            type: 'button-dark',
                            onTap: function (e) {

                                $scope.loadingContent = true;

                                var totalSec = 0;

                                if ($scope.time.hours != 24) {
                                    totalSec = ($scope.time.hours * 60 * 60) + ($scope.time.minutes * 60);
                                } else {
                                    totalSec = $scope.time.minutes * 60;
                                }
                                obj.epochTime = totalSec;
                            }
                        }
                    ]
                })

            }

        };

    });