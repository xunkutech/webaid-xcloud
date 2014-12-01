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
 * @name adblockApp.factory:SettingService
 * @description
 * # SettingService
 * Factory of the adblockApp
 */
angular.module('adblockApp')
  .factory('SettingService', function ($timeout, RuleService, xCloudComCmdRpc) {

    var settingService = {};

    settingService.globalSetting = {};

    settingService.dnsOverriding = [];

    settingService.occupiedPorts = [];

    settingService.readConf = function () {
      xCloudComCmdRpc.invoke('adblockctrl.sh read')
        .then(function (result) {
          angular.extend(settingService.globalSetting, result.config);
          Array.prototype.push.apply(this.dnsOverriding, result.hosts);
        }.bind(this), function (err) {
          window.alert(err);
        });
    };

    settingService.getOccupiedPorts = function () {
      xCloudComCmdRpc.invoke('adblockctrl.sh ports')
        .then(function (result) {
          angular.copy(result.ports, this.occupiedPorts);
        }.bind(this), function (err) {
          window.alert(err);
        });
    };

    settingService.saveChanges = function () {
      var hosts = this.dnsOverriding.map(function (host) {
        if (host.ip !== '' && host.host !== '') {
          return host.ip + '\t' + host.host;
        }
        return '';
      }).join('\n');

      xCloudComCmdRpc.invoke('adblockctrl.sh save', [this.globalSetting, hosts])
        .then(null, function (err) {
          window.alert(err);
        });
    };

    settingService.resetChanges = function () {
      xCloudComCmdRpc.invoke('adblockctrl.sh reset')
        .then(function () {
          RuleService.list();
          this.readConf();
        }.bind(this), function (err) {
          window.alert(err);
        });
    };

    settingService.commitChanges = function () {
      var hosts = this.dnsOverriding.map(function (host) {
        if (host.ip !== '' && host.host !== '') {
          return host.ip + '\t' + host.host;
        }
        return '';
      }).join('\n');

      xCloudComCmdRpc.invoke('adblockctrl.sh save', [this.globalSetting, hosts])
        .then(function() {
          return xCloudComCmdRpc.invoke('adblockctrl.sh apply');
        })
        .then(null, function (err) {
          window.alert(err);
        });
    };

    settingService.updateGfw = function () {
      xCloudComCmdRpc.invoke('adblockctrl.sh gfw')
        .then(null, function (err) {
          window.alert(err);
        });
    };

    settingService.updateMws = function () {
      xCloudComCmdRpc.invoke('adblockctrl.sh mws')
        .then(null, function (err) {
          window.alert(err);
        });
    };

    settingService.readConf();

    return settingService;

  });
