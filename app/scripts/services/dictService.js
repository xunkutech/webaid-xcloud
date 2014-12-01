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
 * @name adblockApp.factory:DictService
 * @description
 * # DictService
 * Factory of the adblockApp
 */
angular.module('adblockApp')
  .factory('DictService', function ($parse) {

    var dictService = {};

    dictService.urlAdColumns = [
      { key: 'id', label: '编号', hint: ''  },
      { key: 'enabled', label: '启用', hint: '' },
      { key: 'name', label: '规则名称', hint: '请输入规则名称'  },
      { key: 'type', label: '规则类型', hint: '请选择规则类型'  },
      { key: 'online', label: '规则来源', hint: '请选择规则来源'  },
      { key: 'url', label: '来源网址', hint: '请输入来源网址'  },
      { key: 'text', label: '自定义规则', hint: '请输入自定义规则'  },
      { key: 'count', label: '规则数量', hint: ''  },
      { key: 'date', label: '更新时间', hint: ''  }
    ];

    dictService.ruleTypes = [
      { key: 'adp', label: 'ABP广告' },
      { key: 'pvb', label: '黑名单' },
      { key: 'pvu', label: '白名单' },
      { key: 'fwd', label: '上网加速' },
      { key: 'mws', label: '恶意网站' },
      { key: 'gfw', label: '长城防火墙' },
      { key: 'vid', label: '视频去广告设置' },
      { key: 'sss', label: 'ShadowSocks' },
      { key: 'ssh', label: 'SSH' }
    ];

    dictService.onlineFlags = [
      { key: true, label: '在线规则'},
      { key: false, label: '自定义规则'}
    ];

    dictService.filters = {
      urlAdFilter: function (rule) {
        if (!!rule.type) {
          return (rule.type === 'adp' || rule.type === 'pvb' || rule.type === 'pvu');
        }

        if (!!rule.key) {
          return (rule.key === 'adp' || rule.key === 'pvb' || rule.key === 'pvu');
        }
        return false;
      },

      proxyFilter: function (rule) {
        if (!!rule.type) {
          return (rule.type === 'sss' || rule.type === 'ssh');
        }

        if (!!rule.key) {
          return (rule.key === 'sss' || rule.key === 'ssh');
        }
        return false;
      },

      forwardFilter: function (rule) {
        if (!!rule.type) {
          return rule.type === 'fwd';
        }

        if (!!rule.key) {
          return (rule.key === 'fwd');
        }
        return false;
      }
    };

    dictService.getLabel = function (key, type) {
      var getter = $parse(type);
      var col = getter(this);
      for (var k in col) {
        if (key === col[k].key) {
          return col[k].label;
        }
      }
      console.log('Unknown Key: ' + key);
      return 'Error: Unknown Key';
    };

    dictService.getHint = function (key, type) {
      var getter = $parse(type);
      var col = getter(this);
      for (var k in col) {
        if (key === col[k].key) {
          return col[k].hint;
        }
      }
      console.log('Unknown Key: ' + key);
      return 'Error: Unknown Key';
    };

    return dictService;
  });
