'use strict';

angular.module('lrswebApp')
  .controller('MainCtrl', function ($scope, $rootScope, LogStore) {
    $scope.store = [];
    $scope.connectStatus = {};
    $scope.users = [];
    $scope.unpaged = [];
    $scope.userFilter = '';
    $scope.filtered = [];
    $scope.currentPage = 0;
    $scope.pageSize = 20;
    $scope.numberOfPages=function(){
      return Math.max(1,Math.ceil($scope.filtered.length/$scope.pageSize));
    };

    $scope.setUserFilter = function(filter){
      $scope.currentPage = 0;
      $scope.userFilter = filter;
      console.log('Userfilter set to', $scope.userFilter);
    };
    $rootScope.$on('LogStore:usersChanged', function(name, data){
      $scope.users = data;
      console.log('users changed', $scope.users);
    });
    $rootScope.$on('LogStore:storeChanged', function(name, data){
      console.log('Event caught: changed', data);
      $scope.store = data;
    });
    $rootScope.$on('LogStore:storeAdded', function(name, data){
      console.log('Event caught: added', data);
      $scope.store.push(data);
    });
    $rootScope.$on('LogStore:statusChanged', function(name, data){
      console.log('Event caught: statusChanged', data);
      $scope.connectStatus = data;
    });

    console.log('LogStore', LogStore);
    $scope.connectHost = '127.0.0.1';
    $scope.connectPortHttp = '8001';
    $scope.connectPortSocket = '8002';
    $scope.userUrlSocket = 'http://127.0.0.1:8002';
    $scope.connect = function(){
      $scope.userUrlHttp = 'http://' + $scope.connectHost + ':' + $scope.connectPortHttp;
      $scope.userUrlSocket = 'http://' + $scope.connectHost + ':' + $scope.connectPortSocket;
      LogStore.connect($scope.userUrlHttp, $scope.userUrlSocket);
    };
    $scope.getFromStore = function(){
      $scope.store = LogStore.getStore();
    };
  });
