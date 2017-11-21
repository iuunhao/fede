# fede

node 版本要求7.6以上如果版本过低可升级[Nodejs下载地址](https://nodejs.org/en/download/)

```bash
# 安装三选一

# 国内cnpm镜像
npm install -g cnpm --registry=https://registry.npm.taobao.org

# npm安装
npm i -g fede

#cnpm安装
cnpm i -g fede

# npm link 安装
https://github.com/iuunhao/fede ~/Desktop
cd fede
npm link
```

### postcss编译内部使用gulp

```bash
# 初始化
fede init [name]

# 开发编译
fede dev

# 打包编译
fede build
```

* 1. postcss目录层级类如：
   `postcss/product/product_list.css`
  `images/product/bg.png`
   `images/product/icon-btns/btn1.png`
* 2. 图片目录层级需与postcss层级保持一致
   `postcss/product/*`
   `images/product/*`
* 3. 合成图需要放在以`icon-`开头的文件夹内
* 4. 合成图不需要写背景定位，但需写宽高
* 5. 禁止手动修改css目录下文件
* 6. `html|css`以下划线(`_`)开头文件不会被单独输出，但可引用(`html`除外)
* 7. 页面内应用的`css`及生产环境的css以**css目录为主**，postcss只是源文件

为了不在不在项目内放置`node_modules`文件，将gulp配置文件放置在别的位置，通过使用`--gulpfile`及其`--cwd`指定配置位置及工作目录位置，使用npm插件的原因是因为单独指向`--gulpfile`及其`--cwd`命令太长不便于输入，mac可以指定`alias`但win不可以，折中选择了npm。

帮助`fede -h`
