# 图片批注Demo
- 基于canvas，参考其他已有方案的基础上，封装了可扩展、易修改的模块
- 集成zrender.js(echarts的渲染驱动)，如需扩展本模块需要了解zrender.js相关api
- 批注模板数据来源为templateData.json，如有需求可修改templateUri、templateGroupUri、templateListUri以及bindSelectReaded方法，使适配后端开发
- 本模块入参为图片路径以及回调函数，出参为修改后的图片的base64格式，可直接js生成图片，也可传到后端生成图片（需要开放http请求大小限制server.max-http-header-size=10240000）
- index.html引用
```js
<script src="../jslib/jquery/jquery-2.0.3.js" charset="utf-8"></script>
<script src="../jslib/layui-v2.5.4/layui.all.js" charset="utf-8"></script>
<script src='../jslib/polyfill/promise/promise-polyfill.js' type='text/javascript' charset='utf-8'></script>
<script src='../jslib/canvas/annotate/zrender.js' type='text/javascript' charset='utf-8'></script>
<script src='../jslib/canvas/annotate/annotate.js' type='text/javascript' charset='utf-8'></script>
```
- index.html调用方法
```js
annotate.show({
            baseImgUrl: src, //图片路径
            outImg: function (res) {
                //回调函数
            }
        });
```
- 基于SpingBoot开发，需要注意获取部署路径的方法，否则不能达到多次批注的效果，只能对原图修改
```java
    private static String detectWebRootPath() {
        try {
            String path = PathKit.class.getResource("/").toURI().getPath();
            if (null == path){
                path = springBootWebRootPath();
                return path;
            }else{
                //return (new File(path)).getParentFile().getParentFile().getCanonicalPath();
                return (new File(path)).getCanonicalPath() + "/static/";
            }
        } catch (Exception var1) {
            throw new RuntimeException(var1);
        }
    }

    private static String springBootWebRootPath(){
        //获取根目录
        File path = null;
        try {
            path = new File(ResourceUtils.getURL("classpath:").getPath());
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        if (!path.exists()) path = new File("");

        //如果上传目录为/static/images/upload/，则可以如下获取：
        File upload = new File(path.getAbsolutePath(), "static/");
        if (!upload.exists()) upload.mkdirs();
        //在开发测试模式时，得到的地址为：{项目跟目录}/target/static/images/upload/
        //在打包成jar正式发布时，得到的地址为：{发布jar包目录}/static/images/upload/

        return upload.getAbsolutePath();
    }
```
- 启动后示例：
![启动后示例](1.png "启动后示例")
