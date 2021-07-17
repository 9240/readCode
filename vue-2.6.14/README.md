# 初始化阶段
1. 源码注释
# 挂载阶段
1. 确定模板，编译得到render函数
2. 申明updateComponent函数，即vm._update(vm._render(), hydrating);
3. new Watcher并传入updateComponent，Watcher构造函数中执行updateComponent，从而执行了vm._render()生成VNode（VNode中的变量表达式等已被替换为最终渲染的值），从而访问模板中的变量，触发响应式的getter，触发依赖收集,如果有childob一起收集。接着执行vm._update(VNode)
# 异步更新
1. 触发setter执行dep.notify()
2. 遍历当前dep收集的所有watcher,排序,依次执行watcher.update()
3. 执行queueWatcher,判重,把watcher放到queue数组中,执行nextTick(flushSchedulerQueue),把flushSchedulerQueue的执行结果包装成新的函数放到callbacks数组,执行timerFunc(),timerFunc中依次执行callbacks