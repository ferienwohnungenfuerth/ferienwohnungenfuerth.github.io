'use strict';

angular
		.module('autofill-directive', [])
		.directive('autofill', function() {
			return {
				require : 'ngModel',
				link : function(scope, element, attrs, ngModel) {
					scope.$on('autofill-submit', function(e) {
						ngModel.$setViewValue(element.val());
					});
				}
			}
		})

		.directive('autofillSubmit', [ '$parse', function($parse) {
			return {
				link : function(scope, element) {
					var fn = $parse(element.attr('autofill-submit'));
					element.on('submit', function(event) {
						scope.$broadcast('autofill-submit');
						scope.$apply(function() {
							fn(scope, {
								$event : event
							});
						});
					});
				}
			}
		} ])
		.config(
				[
						"$provide",
						function($provide) {
							var inputDecoration = [
									"$delegate",
									"inputsWatcher",
									function($delegate, inputsWatcher) {
										var directive = $delegate[0];
										var link = directive.link;

										function linkDecoration(scope, element,
												attrs, ngModel) {
											var handler;
											// By default model.$viewValue is
											if (attrs.id === 'input-username'
													|| attrs.id === 'input-password') {
												inputsWatcher
														.registerInput(handler = function() {
															var value = element
																	.val();
															// By default value
															// is an empty
															// string
															if ((ngModel.$viewValue !== undefined || value !== "")
																	&& ngModel.$viewValue !== value) {
																ngModel
																		.$setViewValue(value);
															}
														});
											}

											scope
													.$on(
															"$destroy",
															function() {
																inputsWatcher
																		.unregisterInput(handler);
															});

											// Exec original `link()`
											link.apply(this, [].slice.call(
													arguments, 0));
										}

										// Decorate `link()` don't work for
										// `inputDirective` (why?)
										/*
										 * directive.link = linkDecoration;
										 */
										// So use `compile()` instead
										directive.compile = function compile(
												element, attrs, transclude) {
											return linkDecoration;
										};
										delete directive.link;

										return $delegate;
									} ];

							$provide.decorator("inputDirective",
									inputDecoration);
							$provide.decorator("textareaDirective",
									inputDecoration);
							// TODO decorate selectDirective (see binding
							// "change" for `Single()` and `Multiple()`)
						} ]).factory("inputsWatcher",
				[ "$interval", "$rootScope", function($interval, $rootScope) {
					var INTERVAL_MS = 200;
					var promise;
					var handlers = [];

					function execHandlers() {
						for (var i = 0, l = handlers.length; i < l; i++) {
							handlers[i]();
						}
					}

					return {
						registerInput : function registerInput(handler) {
							if (handlers.push(handler) == 1) {
								promise = $interval(execHandlers, INTERVAL_MS);
							}
						},
						unregisterInput : function unregisterInput(handler) {
							handlers.splice(handlers.indexOf(handler), 1);
							if (handlers.length == 0) {
								$interval.cancel(promise);
							}
						}
					}
				} ]);
;