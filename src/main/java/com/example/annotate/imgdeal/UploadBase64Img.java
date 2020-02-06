package com.example.annotate.imgdeal;

import lombok.Data;

/**
 * 上传Base64格式的图片实体类
 *
 * @author Lenovo
 * @created 2020/2/6 11:53
 * @return
 */
@Data
public class UploadBase64Img {
    private String images;
    private String filepath;
    private String name;
    private String thumbImgs;
}
