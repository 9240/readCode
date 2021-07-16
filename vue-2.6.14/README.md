# 初始化阶段
1. 源码注释
# 挂载阶段
1. 确定模板，编译得到render函数
2. 申明updateComponent函数，即vm._update(vm._render(), hydrating);
3. new Watcher并传入updateComponent，Watcher构造函数中执行updateComponent，从而执行了vm._render()生成VNode（VNode中的变量表达式等已被替换为最终渲染的值），从而访问模板中的变量，触发响应式的getter，触发依赖收集,如果有childob一起收集。接着执行vm._update(VNode)