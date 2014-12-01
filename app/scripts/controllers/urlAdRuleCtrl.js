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
 * @name adblockApp.controller:UrlAdRuleCtrl
 * @description
 * # UrlAdRuleCtrl
 * Controller of the adblockApp
 */
angular.module('adblockApp')
  .controller('UrlAdRuleCtrl', function ($scope, $modal, dialogs, $filter, SettingService, DictService, RuleService) {

    $scope.globalSetting = SettingService.globalSetting;

    $scope.$watch(function () {
      return $scope.globalSetting;
    }, function () {
      $scope.globalSetting.urlad = Number($scope.globalSetting.urlad);
    }, true);


    $scope.openEditorDialog = function (rule) {
      var editorDialog;
      if (typeof(rule) === 'undefined') {
        editorDialog = dialogs.create('urlAdRuleEditor.html', 'UrlAdRuleEditorModalInstanceCtrl');
      } else {
        editorDialog = dialogs.create('urlAdRuleEditor.html', 'UrlAdRuleEditorModalInstanceCtrl', rule);
      }
      editorDialog.result.then(function (result) {
        if (typeof(result[0].id) === 'undefined') {
          RuleService.add(result);
        } else {
          RuleService.update(result);
        }
      }, function () {
      });
    };

    $scope.deleteRuleDialog = function (rule) {
      var dlg = dialogs.create('removeConfirm.html', 'removeDialogCtrl', rule, {size: 'sm'});
      dlg.result.then(function (result) {
        RuleService.remove(result);
      }, function () {
      });
    };

    $scope.flip = function (rule) {
      RuleService.flip(rule);
    };

    $scope.refresh =function (rule) {
      RuleService.update([rule]);
    };

    $scope.tbHeaders = ['enabled', 'name', 'type', 'online', 'count', 'date'];

    $scope.helper = {
      getTypeString: function (type) {
        return DictService.getLabel(type, 'ruleTypes');
      },
      getOnlineFlagString: function (flag) {
        return DictService.getLabel(flag, 'onlineFlags');
      },
      getColumnString: function (colKey) {
        return DictService.getLabel(colKey, 'urlAdColumns');
      },
      getColumnHint: function (colKey) {
        return DictService.getHint(colKey, 'urlAdColumns');
      }
    };

    $scope.typesFilter = DictService.filters.urlAdFilter;

    $scope.rules = RuleService.rules;

    $scope.displayedRules = [].concat(RuleService.rules);

  })
  .controller('UrlAdRuleEditorModalInstanceCtrl', function ($scope, $modalInstance, RuleService, DictService, base64, data) {

    $scope.rule = data || {};
    $scope.rule.name = $scope.rule.name || '';

    if (!$scope.rule.id) {
      $scope.rule.online = false;
      $scope.rule.type = 'adp';
    }

    $scope._name =base64.decode($scope.rule.name);

    $scope.helper = {
      getTypeString: function (type) {
        return DictService.getLabel(type, 'ruleTypes');
      },
      getOnlineFlagString: function (flag) {
        return DictService.getLabel(flag, 'onlineFlags');
      },
      getColumnString: function (colKey) {
        return DictService.getLabel(colKey, 'urlAdColumns');
      },
      getColumnHint: function (colKey) {
        return DictService.getHint(colKey, 'urlAdColumns');
      }
    };


    $scope.ruleTypes = DictService.ruleTypes;

    $scope.onlineFlags = DictService.onlineFlags;

    $scope.text = '';

    if (!!$scope.rule.id && !$scope.rule.online) {
      RuleService.getText($scope.rule, $scope);
    }

    $scope.typesFilter = DictService.filters.urlAdFilter;

    $scope.yes = function () {
      $scope.rule.name = base64.encode($scope._name);
      $modalInstance.close([$scope.rule, $scope.text]);
    };

    $scope.no = function () {
      $modalInstance.dismiss('cancel');
    };
  });