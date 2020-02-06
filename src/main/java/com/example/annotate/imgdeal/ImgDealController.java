package com.example.annotate.imgdeal;

import com.example.annotate.kit.PathKit;
import com.example.annotate.utils.FileUtil;
import org.apache.commons.lang.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.*;
import sun.misc.BASE64Decoder;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * 图片控制类
 *
 * @author Douglas Lai
 * @created 2020/1/30 15:51
 * @return
 */
@RestController
@RequestMapping("/imgCtr")
public class ImgDealController {

    private Logger log = LogManager.getLogger();

    @PostMapping(value = "/uploadBase64Img",produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map uploadBase64Img(@RequestBody UploadBase64Img uploadBase64Img){
        Map result = new HashMap();
        String imgData = uploadBase64Img.getImages();
        String path = uploadBase64Img.getFilepath();
        String name = uploadBase64Img.getName();

        imgData = imgData.replaceAll(" ", "+").replace("data:image/jpeg;base64,", "");
        byte[] byteImgData;
        BASE64Decoder base64Decoder = new BASE64Decoder();
        try {
            if (StringUtils.isBlank(path)) {
                path = FileUtil.getRealPath("capture", true, true)
                        + new Date().getTime() + "\\";
            }else{
                path = path + UUID.randomUUID() + "/";
            }
//            FileUtil.copyFilesFromThumsDir(path, thumbImgs);

            String filePath = PathKit.getWebRootPath() + path;
            File uploadPath = new File(filePath);
            if (!uploadPath.exists()) {
                uploadPath.mkdirs();
            }
            String filePathName = filePath + name;
            File file = new File(filePathName);
            if (!file.exists()) {
                file.createNewFile();
            }else{
                file.delete();
                file.createNewFile();
            }

            byteImgData = base64Decoder.decodeBuffer(imgData);
            for (int i = 0; i < byteImgData.length; ++i) {
                if (byteImgData[i] < 0) {// 调整异常数据
                    byteImgData[i] += 256;
                }
            }
            ByteArrayInputStream bais = new ByteArrayInputStream(byteImgData);
            BufferedImage bi1 = ImageIO.read(bais);
            ImageIO.write(bi1, "jpeg", file);

            result.put("code", "0");
            result.put("path", path);
            result.put("msg", "success");
        } catch (IOException e) {
            result.put("code", "-1");
            result.put("msg", e);
            log.error(e.getMessage());
        }
        return result;
    }
}
