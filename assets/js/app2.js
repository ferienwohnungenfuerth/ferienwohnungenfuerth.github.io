'use strict';

angular.module(
		'index',
		[ 'ngRoute', 'ui.bootstrap', 'appServices', 'appControllers',
				'appDirectives' ]).config(
		[ '$routeProvider', function($routeProvider) {

			$routeProvider.when('/:key', {
				templateUrl : '/assets/partials/ukft001.html',
				controller : 'BookingCreateCtrl'
			}).otherwise({
				redirectTo : '/UKFT001'
			});
		} ]);
