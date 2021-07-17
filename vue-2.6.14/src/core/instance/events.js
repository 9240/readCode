/* @flow */

import {
  tip,
  toArray,
  hyphenate,
  formatComponentName,
  invokeWithErrorHandling,
} from "../util/index";
import { updateListeners } from "../vdom/helpers/index";

export function initEvents(vm: Component) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  const listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

let target: any;

function add(event, fn) {
  target.$on(event, fn);
}

function remove(event, fn) {
  target.$off(event, fn);
}

function createOnceHandler(event, fn) {
  const _target = target;
  return function onceHandler() {
    const res = fn.apply(null, arguments);
    if (res !== null) {
      _target.$off(event, onceHandler);
    }
  };
}

export function updateComponentListeners(
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm;
  updateListeners(
    listeners,
    oldListeners || {},
    add,
    remove,
    createOnceHandler,
    vm
  );
  target = undefined;
}

export function eventsMixin(Vue: Class<Component>) {
  const hookRE = /^hook:/;
  // 将所有的事件和对应的回调放到vm._events对象上，{event1:[cb1,cb2],event2:[cb3]}
  Vue.prototype.$on = function (
    event: string | Array<string>,
    fn: Function
  ): Component {
    // this.$on('custom-event',function(){})
    const vm: Component = this;
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn);
      }
    } else {
      // 一个custom-event监听多个事件
      // vm._events['custom-event'] = [cb1,cb2]
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      // <comp @hook:mounted = "handle" />
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm;
  };

  /**
   * $once通过$on和$off组合实现
   * 触发时先取消监听再执行回调函数
   * @param {*} event
   * @param {*} fn
   * @returns
   */
  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this;
    // 包装回调函数
    function on() {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm;
  };
  /**
   * 通过vm._event对象上指定event（key）的指定回调fn
   * 1.没有提供参数：将vm._events对象置空
   * 2.一个参数：移除该event对应的所有fn
   * 3.两个参数：移除指定event的指定回调fn
   * @param {*} event
   * @param {*} fn
   * @returns
   */
  Vue.prototype.$off = function (
    event?: string | Array<string>,
    fn?: Function
  ): Component {
    const vm: Component = this;
    // 置空vm._events
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm;
    }
    // array of events
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn);
      }
      return vm;
    }
    // 获取指定事件的回调函数
    const cbs = vm._events[event];
    if (!cbs) {
      return vm;
    }
    // 移除该event对应的所有事件
    if (!fn) {
      vm._events[event] = null;
      return vm;
    }
    // 移除指定事件的指定回调函数
    let cb;
    let i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break;
      }
    }
    return vm;
  };
  /**
   * 在vm._events上拿到event对应的回调函数数组
   * 获取第一个以外的参数，依次调用
   * @param {*} event
   * @returns
   */
  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this;
    if (process.env.NODE_ENV !== "production") {
      const lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
            `${formatComponentName(
              vm
            )} but the handler is registered for "${event}". ` +
            `Note that HTML attributes are case-insensitive and you cannot use ` +
            `v-on to listen to camelCase events when using in-DOM templates. ` +
            `You should probably use "${hyphenate(
              event
            )}" instead of "${event}".`
        );
      }
    }
    let cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      // 获取$emit第一个以外的参数
      const args = toArray(arguments, 1);
      const info = `event handler for "${event}"`;
      for (let i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info);
      }
    }
    return vm;
  };
}
