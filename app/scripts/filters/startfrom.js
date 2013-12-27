'use strict';

angular.module('lrswebApp')
.filter('startFrom', function() {
  return function(input, start) {
    start = Math.abs(start);
    return input.slice(start);
  };
});