/* @flow */

import { mergeOptions } from "../util/index";
// 利用mergeOptions合并两个选项,返回合并后的结果
export function initMixin(Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
}
