'use strict';

var appRoutes = angular.module('appRoutes', [ 'ngRoute' ]);

// Routing
appRoutes.config([ '$routeProvider', function($routeProvider) {
	var authorize = {
		authorize : function(status) {
			return status.perform();
		}
	};
	$routeProvider.when('/file-upload/', {
		templateUrl : 'app/assets/app/partials/file-upload.html',
		controller : 'FileUploadCtrl'
	}).when('/payment-canceled', {
		templateUrl : 'app/assets/app/partials/payment-canceled.html'
	}).when('/payment-approved', {
		templateUrl : 'app/assets/app/partials/payment-approved.html'
	}).when('/order-create/:key', {
		templateUrl : 'app/assets/app/partials/order-create.html',
		controller : 'OrderCreateCtrl'
	}).when('/booking-list', {
		templateUrl : 'app/assets/app/partials/booking-list.html',
		controller : 'BookingListCtrl',
		resolve : authorize
	}).when('/booking-create/:key', {
		templateUrl : 'app/assets/app/partials/booking-create.html',
		controller : 'BookingCreateCtrl'
	}).when('/booking-details/:key', {
		templateUrl : 'app/assets/app/partials/booking-details.html',
		controller : 'BookingDetailsCtrl',
		resolve : authorize
	}).when('/login', {
		templateUrl : 'app/assets/app/partials/login.html',
		controller : 'LoginCtrl'
	}).when('/registration', {
		templateUrl : 'app/assets/app/partials/registration.html',
		controller : 'RegistrationCtrl'
	}).when('/registration/:id', {
		templateUrl : 'app/assets/app/partials/registration-confirm.html',
		controller : 'RegistrationConfirmCtrl'
	}).otherwise({
		redirectTo : 'login'
	});
} ]);