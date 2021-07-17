/* @flow */

import { toArray } from "../util/index";
// 插件本质:执行插件install方法
export function initUse(Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 所有插件集合
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = []);
    // 避免重复安装同一个插件
    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    }

    // additional parameters
    // 删除插件第一个参数
    const args = toArray(arguments, 1);
    // 将Vue放到插件参数第一个,方便外面使用
    args.unshift(this);
    if (typeof plugin.install === "function") {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === "function") {
      plugin.apply(null, args);
    }
    // 将plugin放入已安装插件数组
    installedPlugins.push(plugin);
    return this;
  };
}
