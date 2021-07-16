import { initMixin } from "./init";
import { stateMixin } from "./state";
import { renderMixin } from "./render";
import { eventsMixin } from "./events";
import { lifecycleMixin } from "./lifecycle";
import { warn } from "../util/index";

function Vue(options) {
  if (process.env.NODE_ENV !== "production" && !(this instanceof Vue)) {
    warn("Vue is a constructor and should be called with the `new` keyword");
  }
  this._init(options);
}
// Vue原型上挂载_init方法
initMixin(Vue);
// Vue原型上挂载$set、$delete、$watch
stateMixin(Vue);
// Vue原型上挂载$on、$once、$off、$emit
eventsMixin(Vue);
// Vue原型上挂载_update、$forceUpdate、$destroy
lifecycleMixin(Vue);
// Vue原型上挂载$nextTick、_render
renderMixin(Vue);

export default Vue;
