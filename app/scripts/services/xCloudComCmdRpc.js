/**
 * This file is part of webaid.  webaid is free software: you can
 * redistribute it and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, version 2.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Copyright (C) Jason Han han_min(at)hotmail.com
 *
 */

'use strict';

/**
 * @ngdoc service
 * @name adblockApp.factory:xCloudComCmdRpc
 * @description
 * # xCloudComCmdRpc
 * Factory of the adblockApp
 */
angular.module('adblockApp')
  .factory('xCloudComCmdRpc', function ($http, $q, SpinnerService, base64) {

    var _transformRequest = function (reqData) {

      if (!reqData || !reqData.cmd || typeof(reqData.cmd) !== 'string') {
        console.log('Wrong command data: ' + angular.toJson(reqData));
        return '';
      }

      if (!reqData.cmdData) {
        return 'cmd=' + encodeURIComponent(reqData.cmd);
      }

      if (!angular.isArray(reqData.cmdData) && angular.isObject(reqData.cmdData) && String(reqData.cmdData) !== '[object File]') {
        return 'cmd=' + encodeURIComponent(reqData.cmd + ' ' + base64.encode(angular.toJson(reqData.cmdData)));
      }

      if (!angular.isArray(reqData.cmdData)) {
        console.log('Wrong command data: ' + angular.toJson(reqData));
        return '';
      }

      if (!reqData.cmdData[0] || !angular.isObject(reqData.cmdData[0]) || String(reqData.cmdData[0]) === '[object File]') {
        console.log('Wrong command data: ' + angular.toJson(reqData));
        return '';
      }

      reqData.cmdData.splice(0, 1, angular.toJson(reqData.cmdData[0]));

      //console.log('cmd=' + encodeURIComponent(reqData.cmd + ' ' + reqData.cmdData.map(base64.encode).join(' ')));
      return 'cmd=' + encodeURIComponent(reqData.cmd + ' ' + reqData.cmdData.map(base64.encode).join(' '));
    };

    var _transformResponse = function (jsonData) {
      var data = angular.fromJson(jsonData);
      if (data.result) {
        var resData = data.resdata || '';

        try {
          return angular.fromJson(base64.decode(resData.replace(/(\r\n|\n|\r)/gm, '')));
        } catch (err) {
          console.log(err);
          console.log(resData);
          //throw '_data_error';
          return '_data_error';
        }
      } else {
        return '_data_error';
      }
    };

    var comcmd = {};

    comcmd.invoke = function (cmd, cmdData, callback, error) {
      SpinnerService.push();

      var cb = callback || angular.noop;
      var er = error || angular.noop;
      var deferred = $q.defer();

      cmd = '/home/jason/WebstormProjects/adblock/server/script/' + cmd;

      $http.post('comcmd', {cmd: cmd, cmdData: cmdData}, {
          // simulate as jQuery ajax post for xCloud comcmd interface
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
          transformRequest: _transformRequest,
          transformResponse: _transformResponse
        }
      ).success(function (resData) {
          SpinnerService.pop();
          if (resData === '_data_error') {
            deferred.reject('服务返回数据格式异常！');
            return er(resData);
          } else {
            deferred.resolve(resData);
            return cb(resData);
          }
        }
      ).error(function (err) {
          SpinnerService.pop();
          console.log(err);
          deferred.reject('服务调用异常！');
          return er(err);
        });

      return deferred.promise;
    };

    comcmd.fileUpload = function (data) {
      var deferred = $q.defer();

      if (!data) {
        deferred.resolve({path: '/dev/null'});
        return deferred.promise;
      }

      SpinnerService.push();

      var errs = [];

      var chunked = base64.encode(data).match(/.{1,2048}/g);

      var key = Math.ceil(Math.random() * (99999999 - 10000000) + 10000000);

      var chain = chunked.reduce(function (previous, current) {
        return previous.then(function () {
            var chunkData = [
              {key: key},
              current
            ];
            return $http.post('comcmd', {cmd: '/home/jason/WebstormProjects/adblock/server/script/fileupload.sh', cmdData: chunkData}, {
                // simulate as jQuery ajax post for xCloud comcmd interface
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: _transformRequest,
                transformResponse: _transformResponse
              }
            ).success(function (resData) {
                if (resData === '_data_error') {
                  errs.push(resData);
                }
              }
            ).error(function (err) {
                console.log(err);
                errs.push(err);
              }
            );
          }
        );

      }, (function () {
        var _def = $q.defer();
        _def.resolve();
        return _def.promise;
      })());

      chain.then(function (lastResult) {
        SpinnerService.pop();
        if (errs.length > 0) {
          deferred.reject(errs);
        } else {
          deferred.resolve(lastResult.data);
        }
      }, function (err) {
        SpinnerService.pop();
        console.log(err);
      });

      return  deferred.promise;
      /*
       for (var k in chunked) {
       var chunkData = [
       {key: key + '-' + k},
       chunked[k]
       ];

       promises.push($http.post('comcmd', {cmd: '/home/jason/WebstormProjects/adblock/server/script/fileupload.sh -u', cmdData: chunkData}, {
       // simulate as jQuery ajax post for xCloud comcmd interface
       headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
       transformRequest: _transformRequest,
       transformResponse: _transformResponse
       }
       ).success(function (resData) {
       if (resData === '_data_error') {
       errs.push(resData);
       }
       }
       ).error(function (err) {
       console.log(err);
       errs.push(err);
       }
       )
       );
       }

       $q.all(promises).then(function (results) {
       SpinnerService.pop();
       if (errs.length > 0) {
       deferred.reject('文件上传错误！');
       } else {
       deferred.resolve(results.map(function (result) {
       return result.data.path;
       }));
       }
       }, function (err) {
       SpinnerService.pop();
       console.log(err);
       deferred.reject('文件上传错误！');
       });

       return deferred.promise;
       */
    };

    return comcmd;
  });
