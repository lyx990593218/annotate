package com.example.annotate.utils;

import com.example.annotate.kit.PathKit;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;

import java.io.File;
import java.io.IOException;
import java.util.Calendar;

/**
 * TODO
 *
 * @author Lenovo
 * @created 2020/1/30 20:24
 * @return
 */
public class FileUtil {

    /**
     * @param type     类型
     * @param flagYear 是否已年份分
     * @param flagMon  是否按月份分
     * @return 目录的路径，以/开头
     * @author Galen Guo
     * @created 2016-6-30 下午7:12:25
     * 返回目录的路径
     */
    public static String getRealPath(String type, boolean flagYear, boolean flagMon) {
        StringBuilder sb = new StringBuilder();
        sb.append(File.separator).append("files").append(File.separator);
        sb.append("upload");
        // 按类型分目录
        if (type != null && type.length() != 0) {
            sb.append(File.separator).append(type);
        }
        // 按年份分目录
        if (flagYear) {
            Calendar cal = Calendar.getInstance();
            int year = cal.get(Calendar.YEAR);
            sb.append(File.separator).append(year);
        }

        // 按月份分目录
        if (flagMon) {
            Calendar cal = Calendar.getInstance();
            int month = cal.get(Calendar.MONTH) + 1;
            int day = cal.get(Calendar.DAY_OF_MONTH);
            sb.append(File.separator).append(month < 10 ? "0" + month : month).append(day < 10 ? "0" + day : day);
        }
        sb.append(File.separator);
        String filePath = sb.toString();

        return filePath;
    }

    public static String copyFilesFromThumsDir(String path, String files) {
        String[] strs = files.split(" ");
        String descPath = PathKit.getWebRootPath() + path;
        File desc = new File(descPath);
        for (String str : strs) {
            if (StringUtils.isNotBlank(str)) {
                String filePathName = PathKit.getWebRootPath() + str;
                File source = new File(filePathName);
                if (source.exists()) {
                    try {
                        FileUtils.copyFileToDirectory(source, desc);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
        return path;
    }
}
