'use strict';

angular.module('lrswebApp')
  .factory('TestFactory', function ($rootScope) {
    var dataHolder = [1];
    return {
      'getDataHolder' : function(){ return dataHolder;},
      'addDataAsync' : function(){
        dataHolder.push((new Date()).getTime() / 1000);
        $rootScope.$emit('changeEvent', dataHolder);
      }
    };
  })
  .factory('LogStore', function ($http, $rootScope, $timeout) {
    var connectStatus = {
      httpUrl : '',
      socketUrl : '',
      httpStatus : 'disconnected',
      socketStatus : 'disconnected'
    };
    var store = [];
    var users = {};
    var usersCache = {};
    var applyPending = false;
    console.log('Init Logstore');
    return {
      'getUsers' : function() { return users;},
      'getStore': function() { console.log('Store',store);return store;},
      'getConnectStatus' : function() { return connectStatus; },
      'connect' : function(httpurl, socketurl){
        connectStatus.httpUrl = httpurl;
        connectStatus.socketUrl = socketurl;
        // Connect to rest
        $http.get(connectStatus.httpUrl+'/msgs').success(function (data){
          connectStatus.httpStatus = 'connected';
          $rootScope.$emit('LogStore:statusChanged', connectStatus);
          for (var i = 0;  i < data.length;  i++) {
            if(!(data[i].profile in users)){
              users[data[i].profile] = true;
            }
          }
          store = data;
          $rootScope.$emit('LogStore:storeChanged', store);
          $rootScope.$emit('LogStore:usersChanged', users);
          var socket = io.connect(socketurl);

          socket.on('connect', function(){
            connectStatus.socketStatus = 'connected';
            $rootScope.$apply(function(){
              $rootScope.$emit('LogStore:statusChanged', connectStatus);
            });
          });
          socket.on('connecting', function(){
            connectStatus.socketStatus = 'connecting';
            $rootScope.$apply(function(){
              $rootScope.$emit('LogStore:statusChanged', connectStatus);
            });
          });
          socket.on('connect_failed', function(){
            connectStatus.socketStatus = 'connect_failed';
            $rootScope.$apply(function(){
              $rootScope.$emit('LogStore:statusChanged', connectStatus);
            });
          });
          socket.on('reconnect', function(){
            connectStatus.socketStatus = 'reconnected';
            $rootScope.$apply(function(){
              $rootScope.$emit('LogStore:statusChanged', connectStatus);
            });
          });
          socket.on('reconnecting', function(){
            connectStatus.socketStatus = 'reconnecting';
            $rootScope.$apply(function(){
              $rootScope.$emit('LogStore:statusChanged', connectStatus);
            });
          });
          socket.on('logevent', function (eventdata) {
            var data = JSON.parse(eventdata);
            console.log('socket.io LogEvent', eventdata);
            //store.push(data);
            if(!(data.profile in usersCache)){
              users[data.profile] = true;
              $rootScope.$emit('LogStore:usersChanged', users);
            }
            $rootScope.$emit('LogStore:storeAdded', data);

            // update only once per second, otherwise frontend freezes
            if(!applyPending){
              applyPending = true;
              //$timeout: $scope.$apply implied
              $timeout(function(){applyPending = false;console.log('Apply');}, 1000, true);
            }
          });
        }).error(function(data, status, headers, config) {
          console.log('error', data, status, headers, config);
          connectStatus.httpStatus = 'error';
          $rootScope.$apply(function(){
            $rootScope.$emit('LogStore:statusChanged', connectStatus);
          });
        });
      }
    };
  });