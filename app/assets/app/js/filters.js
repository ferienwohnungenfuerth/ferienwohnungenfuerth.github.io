'use strict';

var filters = angular.module('appFilters', []);

filters.filter('truncate', function() {
	return function(text, length, end) {
		if (isNaN(length))
			length = 10;

		if (end === undefined)
			end = "...";

		if (text.length <= length || text.length - end.length <= length) {
			return text;
		} else {
			return String(text).substring(0, length - end.length) + end;
		}

	};
});

filters.filter('sex', function() {
	return function(text, length, end) {
		if (text === 'F')
			return 'weiblich';
		else if (text === 'M')
			return 'm�nnlich';
	};
});

filters.filter('richness', function() {
	return function(text, length, end) {
		var result = ""
		if (text === 'LOW')
			result = 'niedrig';
		else if (text === 'MEDIUM')
			result = 'mittel';
		else if (text === 'HIGH')
			result = 'hoch';

		console.log("text=" + text + ">>>" + result)
		return result;
	};
});