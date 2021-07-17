/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from "../util/index";
// 基于数组原型对象创建一个新的对象
const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);
// 可以改变数组本身的7个方法
const methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 获取原生方法
  const original = arrayProto[method];
  // 在arrayMethods对象上定义7个方法
  def(arrayMethods, method, function mutator(...args) {
    // 先执行原生方法
    const result = original.apply(this, args);
    const ob = this.__ob__;
    let inserted; //新增处理
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }
    // 新元素的响应式处理
    if (inserted) ob.observeArray(inserted);
    // notify change
    // 通知更新
    ob.dep.notify();
    return result;
  });
});
