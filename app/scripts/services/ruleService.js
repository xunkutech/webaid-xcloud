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
 * @name adblockApp.factory:RuleService
 * @description
 * # RuleService
 * Factory of the adblockApp
 */
angular.module('adblockApp')
  .factory('RuleService', function ($q, base64, xCloudComCmdRpc) {

    var ruleService = {};

    ruleService.rules = [];

    ruleService.list = function () {
      xCloudComCmdRpc.invoke('rulectrl.sh -l')
        .then(function (result) {
          // Clear the array.
          this.rules.length = 0;
          Array.prototype.push.apply(this.rules, result.rules);
        }.bind(this), function (err) {
          window.alert(err);
        });
    };

    ruleService.add = function (data) {
      xCloudComCmdRpc.fileUpload(data[1])
        .then(function (tempFile) {
          return xCloudComCmdRpc.invoke('rulectrl.sh -a', [data[0], tempFile.path]);
        })
        .then(function (result) {
          this.rules.push(result);
        }.bind(this), function (err) {
          window.alert(err);
        });
    };

    ruleService.update = function (data) {
      xCloudComCmdRpc.fileUpload(data[1])
        .then(function (tempFile) {
          return xCloudComCmdRpc.invoke('rulectrl.sh -a', [data[0], tempFile.path]);
        })
        .then(function (result) {
          for (var k = 0; k < this.rules.length; k++) {
            if (this.rules[k].id === result.id) {
              angular.extend(this.rules[k], result);
              break;
            }
          }
        }.bind(this), function (err) {
          window.alert(err);
        });
    };

    ruleService.flip = function (rule) {
      xCloudComCmdRpc.invoke('rulectrl.sh -f', {id: rule.id})
        .then(null, function (err) {
          window.alert(err);
        });
    };

    ruleService.remove = function (rule) {
      xCloudComCmdRpc.invoke('rulectrl.sh -d', {id: rule.id})
        .then(function (result) {
          for (var k = 0; k < this.rules.length; k++) {
            if (this.rules[k].id === result.id) {
              this.rules.splice(k, 1);
              break;
            }
          }
        }.bind(this), function (err) {
          window.alert(err);
        });
    };

    ruleService.getText = function (rule, ruleScope) {
      xCloudComCmdRpc.invoke('rulectrl.sh -t', {id: rule.id})
        .then(function (result) {
          if (result.offset === result.size) {
            ruleScope.text = base64.decode(result.text);
          } else {
            var largeText = [];
            largeText.push(result.text);

            var loop = Math.floor(result.size / result.bs);


            var promises = [];
            var errs = [];

            for (var k = 0; k < loop; k++) {
              promises.push(xCloudComCmdRpc.invoke('rulectrl.sh -t', {id: rule.id, skip: (k + 1)}));
            }

            $q.all(promises).then(function (results) {
              if (errs.length > 0) {
                window.alert(errs);
              } else {
                angular.forEach(results, function (result) {
                  largeText.push(result.text);
                });
                ruleScope.text = largeText.map(base64.decode).join('');
              }
            }, function (err) {
              console.log(err);
              window.alert(errs);
            });

          }
        }, function (err) {
          window.alert(err);
        });
    };

    ruleService.list();

    return ruleService;
  });
