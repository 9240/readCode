# 简版生命周期
1. 初始化阶段：初始化父子关系，初始化自定义事件，初始化插槽相关，beforeCreate，初始化injections，初始化状态，初始化provide，created
2. 挂载阶段：确认render函数（render函数>template编译>el的outhtml作为模板编译），beforeMount，接着申明updateComponent作为参数传入到渲染watcher实例，在渲染watcher的constructor里面执行updateComponent,这个函数先执行_render函数，得到VNode，并且在此时进行依赖收集，得到VNode之后执行_update函数，得到真实DOM，插入到页面，删除页面上的模板，mounted
3. 更新阶段：dep.notif()
4. 销毁阶段：beforeDestory，从父组件中移除自己，移除watcher，移除DOM，destory，移除事件监听

# 初始化阶段执行_init
1. 合并选项（根组件）
  1.1 规范化props 如：props[key] = {type:null}、props[key] = {type:Number}、props[key] = {type:xxx,...}
  1.2 规范化inject 如：inject[key] = {from:inject.key(真正provide的key)}
  1.3 规范化directives 如：dirs[key] = {bind:dirs[key],update:dirs[key]}
  1.4 合并components、directives、filters选项到用户选项
2. initLifecycle：初始化$parent、$root、$children、$refs
3. initEvents: 初始化自定义事件，子组件派发，子组件执行
4. initRenter: 初始化父子vnode及插槽相关
5. callHook(vm,'beforeCreate'): 执行beforeCreate钩子
6. initInjections: 始化inject选项，向父辈遍历，找到inject.key.from对应的字段在父辈_provide中的值，代理到vm，没有响应式
7. initState: 初始化状态
  7.1 initProps: props响应式（根组件）及代理（不在vm上的key）
  7.2 initMethods: 判重，props上已经定义的key不能在methods中重复，把methodKey定义到vm上，并绑定this为vm
  7.3 initData: 数据响应式。判重，设置代理，设置响应式
    7.3.1 遍历data，利用Object.defineProperty为每个key提供get和set方法。get时收集依赖，set时通知更新。
  7.4 initComputed: 遍历computed，new一个watcher把computed方法传入，默认lazy:true。把computed定义到vm上。判重。
  7.5 initWatch: 遍历watch，new一个watcher，传入key和handler，返回取消watch函数
8. initProvide: 把provide定义到vm._provide上，如果是函数执行之
9. callHook(vm,'created'): 执行created钩子
10. 如果选项提供了el选项，执行挂载
# 挂载阶段
1. $mount(): 利用扩展的$mount确定模板，编译得到render函数
  1.1 模板优先级：render > template > el
  1.2 compileToFunctions：获得render函数及staticRenderFns函数并挂载到选项上
    1.2.1 得到ast
    1.2.2 优化ast
    1.2.3 生成code字符串
    1.2.4 code字符串转成function
2. mountComponent: 开始挂载
  2.1 callHook(vm, "beforeMount")：执行beforeMount钩子
  2.2 申明updateComponent函数并传入实例化的渲染watcher
    2.2.1 watcher的构造函数执行this.get()调用传入的mountComponent方法从而执行
    vm._render得到VNode并在执行过程中访问响应式数据触发数据的getter从而进行依赖
    收集，如果有childob一起收集，把VNode传入_update方法
    2.2.2 _update：_update方法调用__patch__方法对新旧VNode进行diff更新
  2.3 callHook(vm, "mounted") 执行mounted钩子
# 异步更新
见统计目录picture/update.jpg

# 父子组件
1. 父组件beforeCreate、created、beforeMount
2. new Watcher()，构造函数执行updateComponent，进而执行_render函数创建VNode（保留标签和自定义组件）、执行_update=>__patch__=>createElm（真实节点，真实节点挂在VNode的elm上）
3. 子组件执行init(),子组件beforeCreate、created、beforeMount
4. new Watcher()，构造函数执行updateComponent，进而执行_render函数创建VNode（保留标签和自定义组件）、执行_update=>__patch__=>createElm（真实节点，真实节点挂在VNode的elm上）
5. 把子组件的真实节点插入父组件的真实节点，把父组件的真实节点插入页面，删除模板，执行子组件mounted
6. 执行父组件mounted