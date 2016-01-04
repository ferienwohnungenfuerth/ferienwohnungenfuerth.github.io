'use strict';

var appServices = angular.module('appServices', [ 'ngResource' ]);

appServices.factory('status', [ '$http', function($http) {
	return {
		perform : function() {
			return $http.get("/api/session/status");
		}
	};
} ]);

appServices.factory('profiles', [
		'$resource',
		'$globals',
		function($resource, $globals) {
			var profilesResource = $resource(
					'/api/sites/:siteId/users/:userId/profiles/:id', {}, {});

			return {
				save : function(user, profile, callback) {
					var data = {
						userId : user.id,
						siteId : $globals.siteId()
					};
					profilesResource.save(data, profile, function(result) {
						callback(result);
					});

				},
				getProfileForUser : function(id, callback) {
					var data = {
						userId : id,
						siteId : $globals.siteId()
					};
					profilesResource.get(data, function(result) {
						callback(result);
					});

				}
			};
		} ]);

appServices.factory('sites', [ '$resource', function($resource) {
	var filesResource = $resource('/api/sites/:id', {}, {});

	return {
		save : function(data, callback) {
			filesResource.save(data, function(result) {
				callback(result);
			});

		},
		siteId : function() {
			return $window.siteId;
		}
	};
} ]);

appServices.factory('$globals', [ '$window', '$location',
		function($window, $location) {
			return {
				siteId : function() {
					if ($location.search().siteId !== undefined) {
						return $location.search().siteId;
					} else {
						return $window.siteId;
					}
				}
			}

		} ]);


appServices.factory('orders', [
		'$resource',
		'$globals',
		'authentication',
		function($resource, $globals, authentication) {

			var ordersResource = $resource(
					'/api/sites/:siteId/profiles/:profileId/orders/:id', {}, {
						loadAll : {
							method : 'GET',
							isArray : false
						},
						create : {
							method : 'POST'
						}
					});

			return {
				loadAll : function(callback) {
					var data = {
						siteId : $globals.siteId(),
						profileId : authentication.currentProfileId()
					};
					ordersResource.loadAll(data, function(result) {
						callback(result);
					});
				},
				create : function(id, order, callback) {
					var data = {
						siteId : $globals.siteId(),
						profileId : id
					};
					ordersResource.create(data, order, function(result) {
						callback(result);
					});

				},
				details : function(id, callback) {
					var data = {
						siteId : $globals.siteId(),
						profileId : authentication.currentProfileId(),
						id : id
					};
					console.log("data=" + JSON.stringify(data));
					ordersResource.get(data, function(result) {
						callback(result);
					});
				}
			};
		} ]);

appServices.factory('bookings', [
		'$resource',
		'$globals',
		'authentication',
		function($resource, $globals, authentication) {

			var bookingsResource = $resource(
					'/api/sites/:siteId/profiles/:profileId/bookings/:key', {},
					{
						loadAll : {
							method : 'GET',
							isArray : true
						},
						create : {
							method : 'POST'
						}
					});
			var rangesResource = $resource(
					'/api/sites/:siteId/products/:productId/bookings/ranges',
					{}, {
						load : {
							method : 'GET',
							isArray : true
						}
					});

			return {
				loadAll : function(callback) {
					var data = {
						siteId : $globals.siteId(),
						profileId : authentication.currentProfileId()
					};
					bookingsResource.loadAll(data, function(result) {
						callback(result);
					});
				},
				create : function(id, booking, callback) {
					var data = {
						siteId : $globals.siteId(),
						profileId : id
					};
					bookingsResource.create(data, booking, function(result) {
						callback(result);
					});

				},
				ranges : function(product, date, callback) {
					var data = {
						productId : product.id,
						from : date,
						siteId : $globals.siteId()
					};
					rangesResource.load(data, function(result) {
						callback(result);
					});

				},
				details : function(key, callback) {
					var data = {
						siteId : $globals.siteId(),
						profileId : authentication.currentProfileId(),
						key : key
					};
					console.log("data=" + JSON.stringify(data));
					bookingsResource.get(data, function(result) {
						callback(result);
					});
				}
			};
		} ]);

appServices.factory('products', [
		'$resource',
		'$globals',
		function($resource, $globals) {
			var productResource = $resource('/api/sites/:siteId/products/:key',
					{}, {});

			return {
				details : function(key, callback) {
					var data = {
						key : key,
						siteId : $globals.siteId()
					};
					console.log("data=" + JSON.stringify(data));
					productResource.get(data, function(result) {
						callback(result);
					});
				}
			};
		} ]);

appServices.factory('sessions', [ '$resource', function($resource) {
	return $resource('/api/session', {}, {
		login : {
			method : 'POST'
		},
		logout : {
			method : 'DELETE'
		}
	});
} ]);

appServices
		.factory(
				'registrations',
				[
						'$resource',
						'$globals',
						'authentication',
						function($resource, $globals, authentication) {
							var registrationResource = $resource(
									'/api/sites/:siteId/registrations', {}, {});
							var registrationConfirmationResource = $resource(
									'/api/sites/:siteId/registrations/:tickedId/status/confirmed',
									{}, {
										confirm : {
											method : 'PUT'
										}
									});

							return {
								create : function(registration, callback) {
									var site = {
										siteId : $globals.siteId()
									};
									registrationResource.save(site,
											registration, function(result) {
												authentication
														.login(registration);
												callback(result);
											});
								},
								confirm : function(tickedId, callback) {
									var ticket = {
										tickedId : tickedId,
										siteId : $globals.siteId()
									};
									registrationConfirmationResource.confirm(
											ticket, {}, function(result) {
												callback(result);
											});
								}
							};
						} ]);

appServices
		.factory(
				'authentication',
				[
						'$rootScope',
						'$globals',
						'$window',
						'sessions',
						'profiles',
						function($rootScope, $globals, $window, sessions,
								profiles) {

							return {
								login : function(data) {
									data.site = {
										id : $globals.siteId()
									};
									sessions
											.login(
													data,
													function(result) {
														if (result.authenticationStatus === 'IS_AUTHENTICATED') {
															$rootScope.loginFailed = false;

															profiles
																	.getProfileForUser(
																			result.userId,
																			function(
																					profile) {
																				$window.localStorage
																						.setItem(
																								"profileId",
																								profile.id);
																				$window.localStorage
																						.setItem(
																								"userId",
																								result.userId);
																				$rootScope
																						.$broadcast("authenticatedEvent");
																			});

														} else {
															$rootScope.loginFailed = true;
														}
													});
								},
								logout : function() {
									sessions
											.logout(function(data) {
												$window.localStorage
														.removeItem("profileId");
												$window.localStorage
														.removeItem("userId");
												$rootScope
														.$broadcast("notAuthenticatedEvent");
											});
								},
								currentProfileId : function() {
									return $window.localStorage
											.getItem("profileId");
								},
								currentUserId : function() {
									return $window.localStorage
											.getItem("userId");
								}

							};
						} ]);
