'use strict';

var appControllers = angular.module('appControllers', [ 'angularFileUpload',
		'ui.bootstrap', 'ngResource' ]);

appControllers.controller('ModalController', [ '$scope', function($scope) {
} ]);

appControllers.controller('OrderCreateCtrl', [
		'$scope',
		'$location',
		'$routeParams',
		'authentication',
		'orders',
		'products',
		function($scope, $location, $routeParams, authentication, orders,
				products) {
			$scope.wasSuccessful = false;
			$scope.wasSubmitted = false;
			$scope.order = {
				quantity : 1
			};
			$scope.config = {
				returnUrl : "http://" + $location.host() + ":"
						+ $location.port() + "/paypal_receipt.html"
			};

			var key = $routeParams.key;
			console.log(key);
			products.details(key, function(data) {
				$scope.product = data;
			});

			$scope.create = function(order) {
				$scope.wasSubmitted = true;

				var user = {
					username : order.email
				};
				order.products = [ $scope.product ];

				if (authentication.currentUserId() === undefined) {

					registrations.create(user, function(returnedUser) {
						var profile = {
							user : returnedUser
						};
						profiles.save(returnedUser, profile, function(
								returnedProfile) {
							order.profile = returnedProfile;
							order.product = $scope.product;
							order.site = {
								id : $globals.siteId()
							};
							orders.create(returnedProfile.id, order, function(
									result) {
								if (result.key !== "") {
									$scope.$broadcast('paymentEvent');
									$scope.wasSuccessful = true;
								}
							});
						});

					});
				} else {

					orders.create(authentication.currentProfileId(), order,
							function(result) {
								if (result.key !== "") {
									$scope.$broadcast('paymentEvent');
									$scope.wasSuccessful = true;
								}
							});

				}
			};

		} ]);

appControllers.controller('BookingListCtrl', [ '$scope', 'bookings',
		function($scope, bookings) {
			bookings.loadAll(function(data) {
				$scope.bookings = data;
			});
		} ]);

appControllers.controller('BookingDetailsCtrl', [ '$scope', '$routeParams',
		'bookings', function($scope, $routeParams, bookings) {
			var key = $routeParams.key;
			console.log(key);
			bookings.details(key, function(data) {
				$scope.booking = data;
			});
		} ]);

appControllers
		.controller(
				'BookingCreateCtrl',
				[
						'$rootScope',
						'$scope',
						'$routeParams',
						'$location',
						'$modal',
						'$globals',
						'products',
						'registrations',
						'profiles',
						'authentication',
						'bookings',
						function($rootScope, $scope, $routeParams, $location,
								$modal, $globals, products, registrations,
								profiles, authentication, bookings) {

							var oneDay = 24 * 60 * 60 * 1000;
							var key = $routeParams.key;
							var from = new Date(new Date().getTime() + oneDay);
							if ($routeParams.from !== undefined) {

								from = new Date($routeParams.from);
							}

							var to = new Date(new Date().getTime() + oneDay);
							if ($routeParams.to !== undefined) {
								to = new Date($routeParams.to);
							}

							var numOfPersons = 1;
							if ($routeParams.persons !== undefined) {
								numOfPersons = parseInt($routeParams.persons);
							}

							$scope.$watch('booking.from', function() {
								if ($scope.booking.from !== undefined) {
									$scope.booking.to = new Date(
											$scope.booking.from.getTime() + 2
													* oneDay);
								}
							});

							$scope.booking = {
								from : from,
								to : to,
								numOfPersons : numOfPersons
							};

							products.details(key, function(data) {
								$scope.product = data;
							});
							$scope.config = {
								returnUrl : "http://" + $location.host() + ":"
										+ $location.port()
										+ "/paypal_receipt.html"
							};

							$scope.wasSubmitted = false;
							$scope.wasSucessful = false;
							$scope.isAccountActivated = true;

							// Disable weekend selection
							$scope.disabled = function(date, mode) {
								var today = new Date();
								today.setHours(0);
								today.setMinutes(0);
								today.setSeconds(0);

								return (today.getTime() >= date.getTime());
							};

							$scope.openFrom = function($event) {
								$event.preventDefault();
								$event.stopPropagation();
								$scope.openedFrom = true;
							};

							$scope.openTo = function($event) {
								$event.preventDefault();
								$event.stopPropagation();
								$scope.openedTo = true;
							};

							$scope.dateOptions = {
								'starting-day' : 1
							};

							$scope.create = function(booking) {
								$scope.wasSubmitted = true;
								var from = booking.from;
								from.setHours(15);
								from.setMinutes(0);
								from.setSeconds(0);
								booking.from = from;
								booking.product = {
									key : key
								};

								var to = booking.to;
								to.setHours(11);
								to.setMinutes(0);
								to.setSeconds(0);
								booking.to = to;
								var user = {
									username : booking.email
								};

								if (authentication.currentUserId() === null) {
									$modal.open({
										templateUrl : 'spinner.html',
										controller : 'ModalController',
										size : ''
									});
									registrations
											.create(
													user,
													function(returnedUser) {
														var profile = {
															user : returnedUser
														};
														profiles
																.save(
																		returnedUser,
																		profile,
																		function(
																				returnedProfile) {
																			booking.profile = returnedProfile;
																			booking.product = $scope.product;
																			booking.site = {
																				id : $globals
																						.siteId()
																			};
																			bookings
																					.create(
																							returnedProfile.id,
																							booking,
																							function(
																									result) {
																								$scope.booking = result;
																								if (result.payment.approvalUrl
																										.indexOf("http") > -1) {
																									window.location
																											.replace(result.payment.approvalUrl);
																								} else {
																									$location
																											.path(result.payment.approvalUrl);
																								}
																							});
																		});

													});
								} else {
									$modal.open({
										templateUrl : 'spinner.html',
										controller : 'ModalController',
										size : ''
									});
									booking.product = $scope.product;
									booking.profile = {
										id : authentication.currentProfileId()
									};

									bookings
											.create(
													authentication
															.currentProfileId(),
													booking,
													function(result) {
														$scope.booking = result;
														if (result.payment.approvalUrl
																.indexOf("http") > -1) {
															window.location
																	.replace(result.payment.approvalUrl);
														} else {
															$location
																	.path(result.payment.approvalUrl);
														}
													});

								}
							};

						} ]);
