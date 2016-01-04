'use strict';

var app = angular.module('app', [ 'ui.bootstrap', 'autofill-directive',
		'appRoutes', 'appControllers', 'appServices', 'appFilters',
		'appDirectives', 'angulartics', 'angulartics.google.analytics' ]);

// listeners
app.run(function($rootScope, $location, authentication) {
	$rootScope.logout = function() {
		authentication.logout();
	};

	$rootScope.login = function(session) {
		authentication.login(session);
	};

	$rootScope.$on('notAuthenticatedEvent', function() {
		console.log("$rootScope.toRegister=" + $rootScope.toRegister);
		if ($rootScope.toRegister) {
			$location.path('/registration');
		} else {
			$location.path("/login");
		}
		$rootScope.toRegister = false;
	});

	$rootScope.$on('authenticatedEvent', function() {
		console.log('authenticatedEvent');
		if ($rootScope.nextRoute) {
			var path = $rootScope.nextRoute.originalPath;
			var keys = $rootScope.nextRoute.keys;
			var pathParams = $rootScope.nextRoute.pathParams;
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				var keyName = key["name"];
				var keyValue = pathParams[keyName];
				path = path.replace(":" + keyName, keyValue);
				console.log("keyname=" + keyName + " keyValue=" + keyValue
						+ " path=" + path);
			}
			$location.path(path);
		} else {
			$location.path("/booking-list");
		}
		$rootScope.nextRoute = null;
	});

	$rootScope.$on("$routeChangeError",
			function(event, nextRoute, currentRoute) {
				console.log("$routeChangeError=" + JSON.stringify(nextRoute));
				$rootScope.nextRoute = nextRoute;
			});

	$rootScope.$on("$routeChangeStart",
			function(event, nextRoute, currentRoute) {
				if (nextRoute.params.toRegister) {
					$rootScope.toRegister = true;
				} else {
					$rootScope.toRegister = false;
				}
			});

});

// security
app.config(function($httpProvider) {
	var securityInterceptor = [ '$rootScope', '$q', '$location',
			function($rootScope, $q, $location) {
				var success = function(response) {
					return response;
				};

				var error = function(response) {
					if (response.status === 403) {
						$rootScope.$broadcast("notAuthenticatedEvent");
						return $q.reject(response);
					} else {
						return $q.reject(response);
					}
				};

				return function(promise) {
					return promise.then(success, error);
				};
			} ];

	$httpProvider.responseInterceptors.push(securityInterceptor);
});
