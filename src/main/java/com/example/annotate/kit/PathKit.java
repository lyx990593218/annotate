package com.example.annotate.kit;

import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.FileNotFoundException;

public class PathKit {
    private static String webRootPath;
    private static String rootClassPath;

    public PathKit() {
    }

    public static String getPath(Class clazz) {
        String path = clazz.getResource("").getPath();
        return (new File(path)).getAbsolutePath();
    }

    public static String getPath(Object object) {
        String path = object.getClass().getResource("").getPath();
        return (new File(path)).getAbsolutePath();
    }

    public static String getRootClassPath() {
        if (rootClassPath == null) {
            try {
                String path = PathKit.class.getClassLoader().getResource("").toURI().getPath();
                rootClassPath = (new File(path)).getAbsolutePath();
            } catch (Exception var2) {
                String path = PathKit.class.getClassLoader().getResource("").getPath();
                rootClassPath = (new File(path)).getAbsolutePath();
            }
        }

        return rootClassPath;
    }

    public static String getPackagePath(Object object) {
        Package p = object.getClass().getPackage();
        return p != null ? p.getName().replaceAll("\\.", "/") : "";
    }

    public static File getFileFromJar(String file) {
        throw new RuntimeException("Not finish. Do not use this method.");
    }

    public static String getWebRootPath() {
        if (webRootPath == null) {
            webRootPath = detectWebRootPath();
        }

        return webRootPath;
    }

    public static void setWebRootPath(String webRootPath) {
        if (webRootPath != null) {
            if (webRootPath.endsWith(File.separator)) {
                webRootPath = webRootPath.substring(0, webRootPath.length() - 1);
            }

            PathKit.webRootPath = webRootPath;
        }
    }

    private static String detectWebRootPath() {
        try {
            String path = PathKit.class.getResource("/").toURI().getPath();
            if (null == path){
                path = springBootWebRootPath();
                return path;
            }else{
//                return (new File(path)).getParentFile().getParentFile().getCanonicalPath();
                return (new File(path)).getCanonicalPath() + "/static/";
            }
        } catch (Exception var1) {
            throw new RuntimeException(var1);
        }
    }

    private static String springBootWebRootPath(){
        //获取跟目录
        File path = null;
        try {
            path = new File(ResourceUtils.getURL("classpath:").getPath());
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        if (!path.exists()) path = new File("");
//        System.out.println("path:" + path.getAbsolutePath());

        //如果上传目录为/static/images/upload/，则可以如下获取：
        File upload = new File(path.getAbsolutePath(), "static/");
        if (!upload.exists()) upload.mkdirs();
//        System.out.println("upload url:" + upload.getAbsolutePath());
        //在开发测试模式时，得到的地址为：{项目跟目录}/target/static/images/upload/
        //在打包成jar正式发布时，得到的地址为：{发布jar包目录}/static/images/upload/

        return upload.getAbsolutePath();
    }
}
