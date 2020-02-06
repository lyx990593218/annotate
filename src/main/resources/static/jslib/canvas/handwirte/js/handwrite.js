// JavaScript Documentvar

//为了手机端的自适应；
var canvasWidth = Math.min(800, $(window).width() - 20);

var canvasHeight = canvasWidth;
//判断是都按下鼠标
var isMouseDown = false;
//记录上一次鼠标所在位置
var lasloc = {x: 0, y: 0};
var lasTimeStamp = 0;
var laslinewidth = -1;
var strokeColor = "black";

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

canvas.width = canvasWidth;
canvas.height = canvasHeight;

//为了屏幕自适应，手机端
$("#controller").css("width", canvasWidth + "px");

Drawgrid();
//清除画布
$("#clear_btn").click(
    function (e) {
        // var w=window.open(canvas.toDataURL("image/jpeg"),"smallwin","width=400,height=350");
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        //调用线条路径
        Drawgrid();
    }
)

//使用jQuery对颜色按钮进行操作
$(".color_btn").click(
    function (e) {
        $(".color_btn").removeClass("color_btn_selected");
        $(this).addClass("color_btn_selected");
        strokeColor = $(this).css("background-color");

    }
)


function beginStock(point) {
    isMouseDown = true;

    //console.log("mousedown");
    lasloc = windowToCanvas(point.x, point.y);
    lasTimeStamp = new Date().getTime();
}

function endStock(point) {
    isMouseDown = false;
}

function moveStock(point) {

    var curloc = windowToCanvas(point.x, point.y);
    var curTimeStamp = new Date().getTime();

    var s = calDistangce(curloc, lasloc);
    var t = curTimeStamp - lasTimeStamp;

    var lineWidth = CalClientWidth(t, s);


    //具体的绘制，鼠标按下之后
    context.beginPath();
    context.moveTo(lasloc.x, lasloc.y);
    context.lineTo(curloc.x, curloc.y);
    context.strokeStyle = strokeColor;
    context.lineWidth = lineWidth;
    //设置线条的帽子，是线条平滑
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();


    lasloc = curloc;
    lasTimeStamp = curTimeStamp;
    laslinewidth = ResultLineWidth;
}


//鼠标按下
canvas.onmousedown = function (e) {
    //阻止默认事件响应
    e.preventDefault();
    beginStock({x: e.clientX, y: e.clientY});
    //当前的canvas画布上的坐标点  alert(loc.x+","+loc.y);
};

//鼠标松开
canvas.onmouseup = function (e) {
    e.preventDefault();
    endStock();

    //console.log("mouseup");
};
//鼠标移出指定对象时发生
canvas.onmouseout = function (e) {
    e.preventDefault();
    endStock();
    //console.log("mouseout");
};

//鼠标移动过程中
canvas.onmousemove = function (e) {
    e.preventDefault();
    if (isMouseDown) {
        //console.log("mousemove");
        moveStock({x: e.clientX, y: e.clientY});
    }
};
//移动端（触碰相关的事件）
canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    //触碰事件，也可能是多点触碰，就是第一个
    touch = e.touches[0];
    beginStock({x: touch.pageX, y: touch.pageY});


});
canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();

    if (isMouseDown) {
        //console.log("mousemove");
        touch = e.touches[0];
        moveStock({x: touch.pageX, y: touch.pageY});

    }
});
canvas.addEventListener('touchend', function (e) {
    e.preventDefault();
    endStock();

});

//移动端（触碰相关的事件)结束


function Drawgrid() {
    context.save();

    context.strokeStyle = "rgb(230,11,9)"

    context.beginPath()
    context.moveTo(3, 3)
    context.lineTo(canvasWidth - 3, 3)
    context.lineTo(canvasWidth - 3, canvasHeight - 3)
    context.lineTo(3, canvasHeight - 3)
    context.closePath()
    context.lineWidth = 6
    context.stroke()


    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvasWidth, canvasHeight);

    context.moveTo(canvasWidth, 0);
    context.lineTo(0, canvasHeight);

    context.moveTo(canvasWidth / 2, 0);
    context.lineTo(canvasWidth / 2, canvasHeight);


    context.moveTo(0, canvasHeight / 2);
    context.lineTo(canvasWidth, canvasHeight / 2);


    context.lineWidth = 1;

    context.stroke();
    context.restore();
}

//屏幕坐标点转化为canvas画布坐标	,定位canvas画布上的坐标
function windowToCanvas(x, y) {
    //包含canvas距离画布的上和左边距
    var bbox = canvas.getBoundingClientRect();
    return {x: Math.round(x - bbox.left), y: Math.round(y - bbox.top)}

}


//通过两点计算出两点之间距离
function calDistangce(loc1, loc2) {
    return Math.sqrt((loc1.x - loc2.x) * (loc1.x - loc2.x) + (loc1.y - loc2.y) * (loc1.y - loc2.y));
}

//笔画速度越快，笔越细，反之越粗！
var maxlinewidth = 5;
var minlinewidth = 1;
var maxlinespeed = 10;
var minlinespeed = 0.1;

function CalClientWidth(t, s) {
    var v = s / t;
    var ResultLineWidth;
    //处理速度很慢和很快的情况
    if (v <= minlinespeed)

        ResultLineWidth = maxlinewidth;
    else if (v >= maxlinespeed)

        ResultLineWidth = minlinewidth;
    else

        ResultLineWidth = maxlinewidth - (v - minlinespeed) / (maxlinespeed - minlinespeed) * (maxlinewidth - minlinewidth);
    if (laslinewidth == -1)
        return ResultLineWidth;
    return laslinewidth * 2 / 3 + ResultLineWidth * 1 / 3;

}
