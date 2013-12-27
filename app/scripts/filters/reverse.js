'use strict';

angular.module('lrswebApp').
filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});