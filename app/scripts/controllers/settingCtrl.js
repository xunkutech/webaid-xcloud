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
 * @ngdoc function
 * @name adblockApp.controller:SettingCtrl
 * @description
 * # SettingCtrl
 * Controller of the adblockApp
 */
angular.module('adblockApp')
  .controller('SettingCtrl', function ($scope, $location, SettingService) {

    $scope.globalSetting = SettingService.globalSetting;

    $scope.host = $location.host();

    $scope.$watch(function () {
      return $scope.globalSetting;
    }, function () {
      $scope.globalSetting.enable = Number($scope.globalSetting.enable);
      $scope.globalSetting.port = Number($scope.globalSetting.port);
      $scope.globalSetting.trans = Number($scope.globalSetting.trans);
    }, true);

    $scope.save = function () {
      SettingService.saveChanges();
    };

    $scope.reset = function () {
      SettingService.resetChanges();
    };

    $scope.apply = function () {
      SettingService.commitChanges();
    };
  });
