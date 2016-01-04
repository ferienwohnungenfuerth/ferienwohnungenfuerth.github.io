'use strict';

var appDirectives = angular.module('appDirectives', []);

appDirectives.directive('fileupload', function() {
	return {
		restrict : 'A',
		scope : {
			done : '&',
			progress : '&'
		},
		link : function(scope, element, attrs) {
			var optionsObj = {
				dataType : 'json'
			};

			if (scope.done) {
				optionsObj.done = function(e, data) {
					scope.$apply(function() {
						scope.done({
							e : e,
							data : data
						});
					});
				};
			}

			if (scope.progress) {
				optionsObj.progress = function(e, data) {
					scope.$apply(function() {
						scope.progress({
							e : e,
							data : data
						});
					});
				}
			}
			element.fileupload(optionsObj);
		}
	};
});

appDirectives.directive('submitOn', [ '$timeout', function($timeout) {
	return {
		link : function(scope, elm, attrs) {
			scope.$on(attrs.submitOn, function() {

				$timeout(function() {
					elm.trigger('submit');
				});
			});
		}
	};
} ]);

appDirectives
		.directive(
				'overlapValidation',
				[
						'bookings',
						function(bookings) {

							return {
								require : 'ngModel',
								link : function(scope, elem, attrs, ngModel) {
									var bookingModelAttrName = attrs.bookingModelName;
									var productModelAttrName = attrs.productModelName;
									var fromAttrName = attrs.bookingFrom;
									var toAttrName = attrs.bookingTo;
									var model;
									var product;

									scope
											.$watch(
													bookingModelAttrName,
													function() {
														model = scope[bookingModelAttrName];
														if (model) {
															scope
																	.$watch(
																			bookingModelAttrName
																					+ "."
																					+ fromAttrName,
																			function() {
																				validate();
																			});
															scope
																	.$watch(
																			bookingModelAttrName
																					+ "."
																					+ toAttrName,
																			function() {
																				validate();
																			});
														}
													});
									scope
											.$watch(
													productModelAttrName,
													function() {
														model = scope[productModelAttrName];
														if (model) {
															validate();
														}
													});

									function checkinTimeDay(date) {
										date.setHours(14);
										date.setMinutes(0);
										date.setSeconds(0);
										return date;
									}
									function checkoutTimeDay(date) {
										date.setHours(10);
										date.setMinutes(0);
										date.setSeconds(0);
										return date;
									}

									function validate() {
										product = scope[productModelAttrName];
										ngModel.$setValidity('overlap', true);
										var aFrom = checkinTimeDay(scope[bookingModelAttrName][fromAttrName]);
										var aTo = checkoutTimeDay(scope[bookingModelAttrName][toAttrName]);
										if (product != undefined
												&& aFrom
												&& aTo
												&& (aFrom.getTime() < aTo
														.getTime())) {
											bookings
													.ranges(
															product,
															aFrom,
															function(result) {
																for (var i = 0; i < result.length; i++) {
																	var bFrom = checkinTimeDay(new Date(
																			result[i].from));
																	var bTo = checkoutTimeDay(new Date(
																			result[i].to));
																	var isOverlapping = ((aFrom
																			.getTime() <= bTo
																			.getTime()) && (bFrom
																			.getTime() <= aTo
																			.getTime()));
																	ngModel
																			.$setValidity(
																					'overlap',
																					!isOverlapping);
																	if (isOverlapping) {
																		break;
																	}
																}
															});
										}
									}
								}
							};
						} ]);

appDirectives.directive('minStayValidation', function() {

	return {
		require : 'ngModel',
		link : function(scope, elem, attrs, ngModel) {
			var ngModelAttrName = attrs.bookingModelName;
			var fromAttrName = attrs.bookingFrom;
			var toAttrName = attrs.bookingTo;
			var minStay = attrs.minStay;
			var oneDay = 24 * 60 * 60 * 1000;
			var model;

			scope.$watch(ngModelAttrName, function() {
				model = scope[ngModelAttrName];
				if (model) {
					scope.$watch(ngModelAttrName + "." + fromAttrName,
							function() {
								validate();
							});
					scope.$watch(ngModelAttrName + "." + toAttrName,
							function() {
								validate();
							});
				}
			});

			function validate() {
				var from = model[fromAttrName];
				var to = model[toAttrName];
				if (from && to) {
					var numberOfNights = Math.round(Math
							.abs((to.getTime() - from.getTime()) / (oneDay)))

					ngModel
							.$setValidity('minStay',
									(numberOfNights >= minStay));
				}
			}
		}
	};
});

appDirectives.directive('rangeValidation', function() {

	return {
		require : 'ngModel',
		link : function(scope, elem, attrs, ngModel) {
			var ngModelAttrName = attrs.bookingModelName;
			var fromAttrName = attrs.bookingFrom;
			var toAttrName = attrs.bookingTo;
			var model;

			scope.$watch(ngModelAttrName, function() {
				model = scope[ngModelAttrName];
				if (model) {
					scope.$watch(ngModelAttrName + "." + fromAttrName,
							function() {
								validate();
							});
					scope.$watch(ngModelAttrName + "." + toAttrName,
							function() {
								validate();
							});
				}
			});

			function validate() {
				var from = model[fromAttrName];
				var to = model[toAttrName];
				if (from && to) {
					ngModel.$setValidity('range', (from.getTime() < to
							.getTime()));
				}
			}
		}
	};
});

appDirectives.directive('calculatedOrderVat', function() {
	/*
	 * <calculated-order-gross-price id="calculated-order-price" base="60"
	 * vat="0.19" ng-model="order" ></calculated-order-gross-price>
	 */
	return {
		restrict : 'E',
		require : 'ngModel',
		template : '{{calculatedOrderVat|number:2}}',
		link : function(scope, elem, attrs) {
			var ngVatAttrName = attrs.ngVat;
			var ngBaseAttrName = attrs.ngBase;
			var ngOrderModelAttrName = attrs.ngModel;
			var ngQuantityAttrName = attrs.ngQuantity;
			var ngProductAttrName = attrs.ngProductModel;

			scope.$watch(ngOrderModelAttrName, function() {
				scope.$watch(ngOrderModelAttrName + "." + ngQuantityAttrName,
						function() {
							update();
						});

			});

			scope.$watch(ngProductAttrName, function() {
				scope.$watch(ngProductAttrName + "." + ngBaseAttrName,
						function() {
							update();
						});
			});

			function update() {
				var quantity = scope[ngOrderModelAttrName][ngQuantityAttrName];
				var vat = scope[ngProductAttrName][ngVatAttrName];
				var base = scope[ngProductAttrName][ngBaseAttrName];
				if (vat !== undefined && base !== undefined
						&& base != undefined) {
					scope.calculatedOrderVat = parseFloat(base)
							* parseFloat(quantity) * parseFloat(vat) / 100;
				}
			}
		}
	};

});

appDirectives.directive('calculatedOrderGrossPrice', function() {
	/*
	 * <calculated-order-gross-price id="calculated-order-price" base="60"
	 * vat="0.19" ng-model="order" ></calculated-order-gross-price>
	 */
	return {
		restrict : 'E',
		require : 'ngModel',
		template : '{{calculatedOrderGrossPrice|number:2}}',
		link : function(scope, elem, attrs) {
			var ngVatAttrName = attrs.ngVat;
			var ngBaseAttrName = attrs.ngBase;
			var ngOrderModelAttrName = attrs.ngModel;
			var ngQuantityAttrName = attrs.ngQuantity;
			var ngProductAttrName = attrs.ngProductModel;

			scope.$watch(ngOrderModelAttrName, function() {
				scope.$watch(ngOrderModelAttrName + "." + ngQuantityAttrName,
						function() {
							update();
						});

			});

			scope.$watch(ngProductAttrName, function() {
				scope.$watch(ngProductAttrName + "." + ngBaseAttrName,
						function() {
							update();
						});
			});

			function update() {
				var quantity = scope[ngOrderModelAttrName][ngQuantityAttrName];
				var vat = scope[ngProductAttrName][ngVatAttrName];
				var base = scope[ngProductAttrName][ngBaseAttrName];

				if (vat !== undefined && base !== undefined
						&& base != undefined) {
					scope.calculatedOrderGrossPrice = parseFloat(base)
							* parseFloat(quantity)
							* (1 + parseFloat(vat) / 100);
				}
			}
		}
	};

});

appDirectives.directive('calculatedOrderNetPrice', function() {
	/*
	 * <calculated-order-net-price id="calculated-order-price" base="60"
	 * vat="0.19" ng-model="order" ></calculated-order-net-price>
	 */
	return {
		restrict : 'E',
		require : 'ngModel',
		template : '{{calculatedOrderNetPrice|number:2}}',
		link : function(scope, elem, attrs) {
			var ngBaseAttrName = attrs.ngBase;
			var ngOrderModelAttrName = attrs.ngModel;
			var ngQuantityAttrName = attrs.ngQuantity;
			var ngProductAttrName = attrs.ngProductModel;

			scope.$watch(ngOrderModelAttrName, function() {
				scope.$watch(ngOrderModelAttrName + "." + ngQuantityAttrName,
						function() {
							update();
						});

			});

			scope.$watch(ngProductAttrName, function() {
				scope.$watch(ngProductAttrName + "." + ngBaseAttrName,
						function() {
							update();
						});
			});

			function update() {
				var quantity = scope[ngOrderModelAttrName][ngQuantityAttrName];
				var base = scope[ngProductAttrName][ngBaseAttrName];
				if (base !== undefined && base != undefined) {
					scope.calculatedOrderNetPrice = parseFloat(base)
							* parseFloat(quantity);
				}
			}
		}
	};

});

appDirectives
		.directive(
				'calculatedBookingNetPrice',
				function() {

					return {
						restrict : 'E',
						require : 'ngModel',
						template : '{{calculatedBookingNetPrice|number:2}}',
						link : function(scope, elem, attrs) {
							var baseDay = attrs.baseDay;
							var baseWeek = attrs.baseWeek;
							var baseMonth = attrs.baseMonth;
							var ngModelAttrName = attrs.ngModel;
							var fromAttrName = attrs.ngFrom;
							var amountAttrName = attrs.ngAmount;
							var toAttrName = attrs.ngTo;
							var model;

							scope.$watch(ngModelAttrName, function() {
								model = scope[ngModelAttrName];
								if (model) {
									scope.$watch(ngModelAttrName + "."
											+ fromAttrName, function() {
										update();
									});
									scope.$watch(ngModelAttrName + "."
											+ toAttrName, function() {
										update();
									});
								}

							});
							function update() {
								var base = 0;
								var numberOfNights = 0;
								var oneDay = 24 * 60 * 60 * 1000;
								var from = model[fromAttrName];
								var to = model[toAttrName];
								if (from && to
										&& (from.getTime() < to.getTime())) {
									numberOfNights = Math.ceil(Math.abs((from
											.getTime() - to.getTime())
											/ (oneDay)));
									if (numberOfNights < 7) {
										base = baseDay;
									} else if (numberOfNights < 30) {
										base = baseWeek;
									} else {
										base = baseMonth;
									}
								}

								scope.calculatedBookingNetPrice = base
										* numberOfNights;
								scope[ngModelAttrName][amountAttrName] = scope.calculatedBookingNetPrice;
							}
						}
					};
				});

appDirectives.directive('numberOfNights', function() {
	return {
		restrict : 'E',
		require : 'ngModel',
		template : '{{numberOfNights}}',
		link : function(scope, elem, attrs) {
			var ngModelAttrName = attrs.ngModel;
			var fromAttrName = attrs.ngFrom;
			var toAttrName = attrs.ngTo;
			var model;

			scope.$watch(ngModelAttrName, function() {
				model = scope[ngModelAttrName];
				if (model) {
					scope.$watch(ngModelAttrName + "." + fromAttrName,
							function() {
								update();
							});
					scope.$watch(ngModelAttrName + "." + toAttrName,
							function() {
								update();
							});
				}

			});

			function update() {
				scope.numberOfNights = 0;
				var oneDay = 24 * 60 * 60 * 1000;
				var from = model[fromAttrName];
				var to = model[toAttrName];
				if (from && to && (from.getTime() < to.getTime())) {
					scope.numberOfNights = Math.ceil(Math
							.abs((from.getTime() - to.getTime()) / (oneDay)));
				}
			}
		}
	};
});

appDirectives.directive('ngUnique', [
		'$http',
		'$globals',
		function(async, $globals) {
			return {
				require : 'ngModel',
				link : function(scope, elem, attrs, ctrl) {
					elem.on('click', function(evt) {
						ctrl.$setValidity('unique', true);
					});
					elem.on('blur', function(evt) {
						scope.$apply(function() {
							var username = elem.val();

							var ajaxConfiguration = {
								method : 'GET',
								url : '/api/sites/' + $globals.siteId()
										+ '/usernames/?username=' + username
							};
							async(ajaxConfiguration).success(
									function(data, status, headers, config) {
										ctrl.$setValidity('unique',
												data === "true");
									});
						});
					});
				}
			}
		} ]);