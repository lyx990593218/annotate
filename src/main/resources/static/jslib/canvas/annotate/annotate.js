/*
* 为图片添加批注后生成新的图片
* @createtime 2019/12/08 今天很冷，这个js也很冷清
* @author Watson Wang
*/

var annotate = (function (window) {
    var annotate = function () {
        return new annotate.fn.init();
    };
    // content begin
    annotate.fn = annotate.prototype = {
        // 属性
        basePath: top.dutyIndex ? top.dutyIndex.basePath : '/annotate', // 设置基准地址
        template: '/jslib/canvas/annotate/annotate.html', // 模板地址 /jslib/canvas/annotate
        templateUri: '/jslib/canvas/annotate',
        templateGroupUri: '/templateData.json',
        templateListUri: '/templateData.json',
        canvas: null,// 本组件的canvas
        canvasText: null,// 操作canvas的2DAPI
        baseImg: null,// 底图
        zBaseImg: null,// zBase底图
        zBaseImgTemp: null,// zBaseTemp底图
        // 支持生成图片的回调
        outImg: function () {
        },
        // 支持字符的批注
        annotateFontColor: '',

        zr: null,
        group: null,
        idCount: 1,
        temp: -99999,

        zrTemp: null,
        groupTemp: null,
        idCountTemp: 1,
        tempTemp: -99999,

        // layer窗口索引
        layerWindowIndex: null,
        // canvas & canvasTemp ratio
        canvasTemp: null, //
        canvasTempText: null,
        ratioWidth: 1, // 宽高比默认为1
        ratioHeight: 1,
        ratioVlaue: Math.sqrt(Math.pow(1, 2) + Math.pow(1, 2)) / 1.5,

        tempProps: {}, //配置缓存
        // 生命周期
        init: function () {
            layer = top.layer || layer;// 兼容框架内layer
        },
        reset: function () {
            this.canvas = null;// 本组件的canvas
            this.canvasText = null;// 操作canvas的2DAPI
            this.baseImg = null;// 底图
            this.zBaseImg = null;// zBase底图
            this.zBaseImgTemp = null;// zBaseTemp底图
            // 支持生成图片的回调
            this.outImg = function () {
            };
            // 支持字符的批注
            this.annotateFontColor = $('.color_btn_selected').css("background-color");

            this.zr.dispose();
            this.group = null;
            this.idCount = 1;
            this.temp = -99999;

            this.zrTemp.dispose();
            this.groupTemp = null;
            this.idCountTemp = 1;
            this.tempTemp = -99999;

            // layer窗口索引
            this.layerWindowIndex = null;
            // canvas & canvasTemp ratio
            this.canvasTemp = null; //
            this.canvasTempText = null;
            this.ratioWidth = 1; // 宽高比默认为1
            this.ratioHeight = 1;
            this.ratioVlaue = Math.sqrt(Math.pow(1, 2) + Math.pow(1, 2)) / 1.5;

            this.tempProps = {};

            // 事件解绑
            if (document.addEventListener) {
                document.addEventListener('DOMMouseScroll', function () {
                }, false);
            }//W3C
            window.onmousewheel = document.onmousewheel = function () {
            };//IE/Opera/Chrome

            window.onmousemove = null;
            window.onmouseup = null;
        },
        /**
         * 开启操作界面
         */
        show: function (props) {
            var that = this;
            return $.promiseAjax(
                this.basePath + this.template,
                {},
                {type: 'GET', dataType: 'text'}
            ).then(function (res) {
                that.layerWindowIndex = layer.open({
                    evecom: 'open',
                    type: 1,
                    title: '传真批注',
                    area: ['46.39%', '90%'],
                    content: res,
                    end: function () {//无论是确认还是取消，只要层被销毁了，end都会执行，不携带任何参数。layer.open关闭事件
                        that.reset();
                        document.querySelectorAll("#myCanvasTemp").forEach(item => {
                            item.remove()
                        });
                        zrender.dispose();
                    }
                })

                that.baseImg = new Image();
                that.baseImg.src = props.baseImgUrl;

                that.baseImg.onload = function () {
                    // 在弹窗打开后，获取canvas和2DAPI
                    that.canvas = document.getElementById('myCanvas');
                    that.canvasText = that.canvas.getContext("2d");

                    // 设置等比缩放
                    if (that.baseImg.width > that.baseImg.height) {
                        that.ratioWidth = that.ratioHeight = that.baseImg.width / $(that.canvas).parent().width();
                        $(that.canvas).attr('width', $(that.canvas).parent().width());
                        $(that.canvas).attr('height', that.baseImg.height / that.ratioHeight);

                        $(that.canvas).css('width', $(that.canvas).parent().width());
                        $(that.canvas).css('height', that.baseImg.height / that.ratioHeight);
                    } else {
                        that.ratioHeight = that.ratioWidth = that.baseImg.height / $(that.canvas).parent().height();
                        $(that.canvas).attr('width', that.baseImg.width / that.ratioWidth);
                        $(that.canvas).attr('height', $(that.canvas).parent().height());

                        $(that.canvas).css('width', that.baseImg.width / that.ratioWidth);
                        $(that.canvas).css('height', $(that.canvas).parent().height());
                    }

                    //绘画图片
                    var prop = {
                        dataType: 'zBaseImage',
                        src: props.baseImgUrl,
                    }
                    that.setProp(prop)
                }
            }).then(function () {
                that.annotateFontColor = $('.color_btn_selected').css("background-color");
                that.tempProps = props;

                // 设置生成图回调
                if (props.outImg) {
                    that.outImg = props.outImg;
                }
                // 绑定事件
                that.bindOutBtn();
            })
        },

        setProp: function (props) {
            var that = this;
            if (props.dataType == 'zBaseImage') {
                that.zr = zrender.init(that.canvas);
                that.group = new zrender.Group();

                that.zBaseImg = new zrender.Image({
                    style: {
                        image: props.src,
                        x: 0,
                        y: 0,
                        width: $(that.canvas).attr('width'),
                        height: $(that.canvas).attr('height')
                    },
                    zlevel: that.temp,
                    id: that.idCount++,
                    draggable: false
                })
                that.group.add(that.zBaseImg);
                that.zr.add(that.group);

                if (that.canvasTemp == null) {
                    // 在这里创建一个隐藏的canvas
                    $('body').append(
                        '<canvas style="visibility: hidden;" id="myCanvasTemp" width="' + that.baseImg.width + '" height="' + that.baseImg.height + '"></canvas>'
                    );
                    that.canvasTemp = document.getElementById('myCanvasTemp');
                    that.canvasTempText = that.canvasTemp.getContext('2d');

                    // that.ratioWidth = that.baseImg.width / that.canvas.width;
                    // that.ratioHeight = that.baseImg.height / that.canvas.height;
                    that.ratioVlaue = Math.sqrt(Math.pow(that.ratioWidth, 2) + Math.pow(that.ratioHeight, 2)) / 1.5;

                    that.zrTemp = zrender.init(that.canvasTemp);
                    that.groupTemp = new zrender.Group();

                    that.zBaseImgTemp = new zrender.Image({
                        style: {
                            image: props.src,
                            x: 0,
                            y: 0,
                            width: $(that.canvasTemp).attr('width'),
                            height: $(that.canvasTemp).attr('height')
                        },
                        zlevel: that.tempTemp,
                        id: that.idCountTemp++,
                        draggable: false
                    })
                    that.groupTemp.add(that.zBaseImgTemp);

                    that.zrTemp.add(that.groupTemp);
                }
            } else if (props.dataType == 'text') {
                //输入说明符合要求后 创建Text 将说明赋值Text
                var text = new zrender.Text({
                    style: {
                        x: 200,
                        y: 100,
                        text: props.text,
                        fontSize: '18',
                        fontFamily: '微软雅黑',
                        textFill: that.annotateFontColor
                    },
                    name: that.idCount,
                    id: that.idCount++,
                    onmousewheel: function (ev) {
                        var e = (ev || event).wheelDelta / 1;
                        if (this.style.fontSize > 38 && e > 0) return;
                        if (this.style.fontSize < 10 && e < 0) return;
                        this.style.fontSize = Number(this.style.fontSize) + Number(e);
                        this.attr('shape', this.style.fontSize);
                        that.zr.refresh()

                        that.groupTemp.childOfName(this.id).style.fontSize = this.style.fontSize * that.ratioVlaue;
                        that.groupTemp.childOfName(this.id).attr('shape', this.style.fontSize * that.ratioVlaue);
                        that.zrTemp.refresh()
                    },
                    onmousedown: function (ev) {
                        //记录鼠标在元素上的位置
                        var posX = Number(ev.event.clientX);
                        var posY = Number(ev.event.clientY);

                        //鼠标移动事件
                        this.onmousemove = function (e) {

                        }
                        //鼠标抬起事件
                        this.onmouseup = function (e) {
                            this.onmousemove = null
                            this.onmouseup = null

                            var tposX = Number(e.event.clientX) - Number(posX);
                            var tposY = Number(e.event.clientY) - Number(posY);

                            var tempPosX = Number(that.groupTemp.childOfName(this.id).style.x) + Number(tposX) * that.ratioWidth;
                            var tempPosY = Number(that.groupTemp.childOfName(this.id).style.y) + Number(tposY) * that.ratioHeight;
                            console.log('new x:' + tempPosX + '----y:' + tempPosY);

                            that.groupTemp.childOfName(this.id).style.x = tempPosX;
                            that.groupTemp.childOfName(this.id).style.y = tempPosY;

                            that.groupTemp.childOfName(this.id).attr({
                                shape: {
                                    x: tempPosX,
                                    y: tempPosY,
                                }
                            });
                            that.zrTemp.refresh();
                        }
                    },
                    draggable: true
                }).on('mousedown', function () {
                    this.attr('zlevel', ++that.temp);
                });
                that.group.add(text);


                var textTemp = new zrender.Text({
                    style: {
                        x: 200 * that.ratioWidth,
                        y: 100 * that.ratioHeight,
                        text: props.text,
                        fontSize: 18 * that.ratioVlaue,
                        fontFamily: '微软雅黑',
                        textFill: that.annotateFontColor
                    },
                    name: that.idCountTemp,
                    id: that.idCountTemp++,
                    draggable: true
                })

                that.groupTemp.add(textTemp);

            } else if (props.dataType == 'image') {
                //绘画图片
                var img = new zrender.Image({
                    style: {
                        image: props.src,
                        x: 0,
                        y: 0,
                        width: props.width,
                        height: props.height
                    },
                    zlevel: that.temp,
                    name: that.idCount,
                    id: that.idCount++,
                    draggable: true
                }).on('mousedown', function (ev) {
                    this.attr('zlevel', ++that.temp);

                    //记录鼠标在元素上的位置
                    var posX = Number(ev.event.clientX);
                    var posY = Number(ev.event.clientY);

                    //鼠标抬起事件
                    this.onmouseup = function (e) {
                        this.onmousemove = null
                        this.onmouseup = null

                        var tposX = Number(e.event.clientX) - Number(posX);
                        var tposY = Number(e.event.clientY) - Number(posY);

                        var tempPosX = Number(that.groupTemp.childOfName(this.id).style.x) + Number(tposX + 1) * that.ratioWidth;
                        var tempPosY = Number(that.groupTemp.childOfName(this.id).style.y) + Number(tposY + 1) * that.ratioHeight;
                        // console.log('new x:' + tempPosX + '----y:' + tempPosY);

                        that.groupTemp.childOfName(this.id).style.x = tempPosX;
                        that.groupTemp.childOfName(this.id).style.y = tempPosY;

                        that.groupTemp.childOfName(this.id).attr({
                            shape: {
                                x: tempPosX,
                                y: tempPosY,
                            }
                        });

                        //设置缩放中心
                        that.groupTemp.childOfName(this.id).attr('origin', [that.groupTemp.childOfName(this.id).style.x + that.groupTemp.childOfName(this.id).style.width / 2, that.groupTemp.childOfName(this.id).style.y + that.groupTemp.childOfName(this.id).style.height / 2]);
                        that.zrTemp.refresh();
                    }
                }).on('mousewheel', function (ev) {
                    var e = (ev || event).wheelDelta / 20;
                    //设置缩放大小
                    this.attr('scale', [this.scale[0] += e, this.scale[1] += e]);
                    //设置缩放中心
                    this.attr('origin', [this.style.x + this.style.width / 2, this.style.y + this.style.height / 2]);

                    // that.groupTemp.childOfName(this.id).scale[0] += Number(e * that.ratioVlaue / 2.5)
                    // that.groupTemp.childOfName(this.id).scale[1] += Number(e * that.ratioVlaue / 2.5)

                    // console.log('o:' + o + '=====t:' + t);
                    //设置缩放大小
                    // that.groupTemp.childOfName(this.id).attr('scale', [that.groupTemp.childOfName(this.id).scale[0] += Number(e * that.ratioVlaue / 2.5), that.groupTemp.childOfName(this.id).scale[1] += Number(e * that.ratioVlaue / 2.5)]);
                    that.groupTemp.childOfName(this.id).attr('scale', [this.scale[0] * that.ratioVlaue / 1, this.scale[1] * that.ratioVlaue / 1]);
                    //设置缩放中心
                    that.groupTemp.childOfName(this.id).attr('origin', [that.groupTemp.childOfName(this.id).style.x + that.groupTemp.childOfName(this.id).style.width / 2, that.groupTemp.childOfName(this.id).style.y + that.groupTemp.childOfName(this.id).style.height / 2]);
                    that.zrTemp.refresh();
                }).on('dblclick', function (ev) {
                    //设置旋转角度
                    // this.attr('rotation', [this.rotation - Math.PI / 12]);
                    //设置旋转中心
                    // this.attr('origin', [this.style.x + this.style.width / 2, this.style.y + this.style.height / 2]);
                });
                that.group.add(img);

                //绘画图片
                var imgTemp = new zrender.Image({
                    style: {
                        image: props.src,
                        x: 0,
                        y: 0,
                        width: props.width * that.ratioVlaue,
                        height: props.height * that.ratioVlaue
                    },
                    zlevel: that.tempTemp,
                    name: that.idCountTemp,
                    id: that.idCountTemp++,
                    draggable: true
                })

                that.groupTemp.add(imgTemp);
            }
        },
        /**
         * 生成图片
         */
        bindOutBtn: function () {
            this.bindSelectReaded();
            var that = this;
            $('div[page="annotate"] .out_annotate_img').unbind('click').click(function () {
                var curIndex = layer.confirm('确认生成批注吗？', {
                    btn: ['确定', '返回'] //按钮
                }, function () {
                    // 【重要】关闭抗锯齿
                    that.canvasTempText.mozImageSmoothingEnabled = false;
                    that.canvasTempText.webkitImageSmoothingEnabled = false;
                    that.canvasTempText.msImageSmoothingEnabled = false;
                    that.canvasTempText.imageSmoothingEnabled = false;
                    var url = that.canvasTemp.toDataURL('image/jpeg', {quality: 1});
                    that.outImg(url)
                    // that.getFile(url);
                    layer.close(curIndex);
                    layer.close(that.layerWindowIndex);
                    // that.reset(); // 重置一下组件
                }, function () {

                });
            });
            // 重置按钮
            $('div[page="annotate"] .reset_annotate_img').unbind('click').click(function () {
                that.group.removeAll();
                that.group.add(that.zBaseImg);
                that.groupTemp.removeAll();
                that.groupTemp.add(that.zBaseImgTemp);
                $('#input').val('')
            })

            // 确定按钮
            $('div[page="annotate"] .out_annotate_text').unbind('click').click(function () {
                //输入说明符合要求后 创建Text 将说明赋值Text
                var prop = {
                    dataType: 'text',
                    text: $('#input').val()
                }
                that.setProp(prop);

                $('#input').val('')
            })

            //使用jQuery对颜色按钮进行操作
            $('div[page="annotate"] .right-list .color_btn').unbind('click').click(function (e) {
                $(".color_btn").removeClass("color_btn_selected");
                $(this).addClass("color_btn_selected");
                that.annotateFontColor = $(this).css("background-color");
            })
        },
        bindSelectReaded: function () {
            var that = this;
            $.promiseAjax(that.basePath + that.templateUri + that.templateGroupUri, {}, {type: 'GET'})
                .then(function (res) {
                    var options = '';
                    if (res != null) {
                        $.each(res, function (index, item) {
                            //循环获取返回值，并组装成html代码
                            options += "<option value='" + item.groupid + "'>" + item.groupname + "</option>";
                        })
                    } else {
                        var options = '<option value="">请选择</option>';  //默认值
                    }
                    $("#group").html("");
                    $("#group").append(options);
                    // 渲染layui
                    layui.form.render();
                }).then(function (res) {
                    //绑定选中事件
                    layui.form.on('select(selectReaded)', function (data) {
                        var groupid = $("select[name=group]").val();
                        if (groupid !== undefined && groupid != null && groupid != '') {
                            $.promiseAjax(that.basePath + that.templateUri + that.templateListUri,
                                {groupid: groupid}, {type: 'GET'})
                                .then(function (res) {
                                    $.each(res, function (index, item) {
                                        if (groupid === item.groupid){
                                            res = item.data;
                                            return false;
                                        }
                                    });
                                    var lis = '';
                                    if (res != null) {
                                        $.each(res, function (index, item) {
                                            //循环获取返回值，并组装成html代码
                                            if (item.data_type === 'text') {
                                                lis += "<li data-type='" + item.data_type + "'>" + item.content + "</li>";
                                            } else if (item.data_type === 'image') {
                                                lis += "<li data-type='" + item.data_type + "'><img style='width: 50%;height: 50%;' src='" + that.basePath + item.content + "' alt=''></li>";
                                            }
                                        })
                                    } else {
                                        lis += "<li data-type='text'>已阅</li>";
                                    }
                                    $('div[page="annotate"] .right-list ul').html('');
                                    $('div[page="annotate"] .right-list ul').html(lis);
                                }).then(function (res) {
                                // 绑定选择模板按钮
                                $('div[page="annotate"] .right-list li').unbind('click').click(function () {
                                    if ($(this).attr('data-type') == 'text') {
                                        //选择文字模板后将文字放入文本框中
                                        $('#input').val($(this).html());
                                        /*var prop = {
                                            dataType: 'text',
                                            text: $(this).html()
                                        }
                                        that.setProp(prop);*/
                                    } else if ($(this).attr('data-type') == 'image') {
                                        //绘画图片
                                        var prop = {
                                            dataType: 'image',
                                            src: $(this).find('img').attr('src'),
                                            width: $(this).find('img').width(),
                                            height: $(this).find('img').height()
                                        }
                                        that.setProp(prop)
                                    }
                                })
                            })
                        }
                    });

                    var select = 'dd[class=layui-this]';
                    $('#group').siblings("div.layui-form-select").find('dl').find(select).click();
                })
        },

        //将base64转换为blob
        dataURLtoBlob: function (dataurl) {
            var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {type: mime});
        },

        getFile: function (base64Data) {
            var fileName = 'test';
            //调用
            var blob = this.dataURLtoBlob(base64Data);
            var a = document.createElement("a");
            var url = window.URL.createObjectURL(blob);
            var filename = fileName;
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }
    // content end
    annotate.fn.init.prototype = annotate.fn;
    return annotate;
})(window);
// 初始化
var annotate = new annotate();
