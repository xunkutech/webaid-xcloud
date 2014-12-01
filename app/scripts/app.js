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
 * @ngdoc overview
 * @name adblockApp
 * @description
 * # adblockApp
 *
 * Main module of the application.
 */
angular
  .module('adblockApp', ['ngAnimate', 'ui.bootstrap', 'ui.bootstrap.showErrors', 'smart-table', 'angularSpinner', 'dialogs.main', 'ab-base64'])
  .config(function (dialogsProvider) {
    dialogsProvider.useBackdrop('static');
    dialogsProvider.useEscClose(false);
    dialogsProvider.useCopy(true);
    dialogsProvider.useFontAwesome(true);
    dialogsProvider.setSize('md');
  })
  .filter('base64Decode', function (base64) {
    return function (b64Str) {
      return base64.decode(b64Str);
    };
  })
  .controller('removeDialogCtrl', function ($scope, $modalInstance, data) {

    $scope.name = data.name;
    $scope.id = data.id;

    $scope.yes = function () {
      $modalInstance.close({id: $scope.id });
    };

    $scope.no = function () {
      $modalInstance.dismiss('cancel');
    };
  });
