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
 * @name adblockApp.factory:SpinnerService
 * @description
 * # SpinnerService
 * Factory of the adblockApp
 */
angular.module('adblockApp')
  .factory('SpinnerService', function ($rootScope) {
    var service = {};

    service.count = 0;
    service.options = {radius: 15, width: 4, length: 8};

    service.push = function () {
      if (!this.count) {
        $rootScope.$broadcast('activeSpinner');
      }
      this.count++;

    };

    service.pop = function () {

      this.count--;
      if (!this.count) {
        $rootScope.$broadcast('deactiveSpinner');
      }
    };

    return service;
  }
);
