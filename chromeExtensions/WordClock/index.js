function getCurrentMonthDays() {
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  currentDate.setMonth(currentMonth + 1);
  currentDate.setDate(0);
  return currentDate.getDate();
}
function deepCloneObject(object) {
  let newObj = {};
  for (let key in object) {
    newObj[key] = object[key] && object[key].toString() === "[object Object]" ? deepCloneObject(object[key]) : object[key];
  }
  return newObj;
}

function deepMergeObject(obj1, obj2) {
  let newObj = deepCloneObject(obj1);
  for (let key in obj2) {
    newObj[key] = newObj[key] && newObj[key].toString() === "[object Object]" ? deepMergeObject(newObj[key], obj2[key]) : obj2[key];
  }
  return newObj;
}
const dictionary = {
  chinese: {
    numberStr: [
      "零",
      "一",
      "二",
      "三",
      "四",
      "五",
      "六",
      "七",
      "八",
      "九",
      "十",
      "十一",
      "十二",
      "十三",
      "十四",
      "十五",
      "十六",
      "十七",
      "十八",
      "十九",
      "二十",
      "二十一",
      "二十二",
      "二十三",
      "二十四",
      "二十五",
      "二十六",
      "二十七",
      "二十八",
      "二十九",
      "三十",
      "三十一",
      "三十二",
      "三十三",
      "三十四",
      "三十五",
      "三十六",
      "三十七",
      "三十八",
      "三十九",
      "四十",
      "四十一",
      "四十二",
      "四十三",
      "四十四",
      "四十五",
      "四十六",
      "四十七",
      "四十八",
      "四十九",
      "五十",
      "五十一",
      "五十二",
      "五十三",
      "五十四",
      "五十五",
      "五十六",
      "五十七",
      "五十八",
      "五十九",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
      "星期日"
    ],
    property: {
      // 现在手动设置宽度 0.0 可以进行计算的.
      month: { unit: "月", width: 44 },
      date: { unit: "号", width: 60 },
      week: { unit: "", width: 50 },
      hour: { unit: "点", width: 60 },
      minute: { unit: "分", width: 60 },
      second: { unit: "秒", width: 60 }
    }
  }
};
const timeOriginConfig = {
  order: ["month", "date", "week", "hour", "minute", "second"],
  property: {
    month: { len: 12, start: 1 },
    date: { len: getCurrentMonthDays(), start: 1 },
    week: { len: 7, start: 60 },
    hour: { len: 24, start: 0 },
    minute: { len: 60, start: 0 },
    second: { len: 60, start: 0 }
  }
};

let initOuterRadius = 433;
let timeConfig = deepMergeObject(timeOriginConfig, dictionary["chinese"]);
let windowAnimationFrame;

function onReady(callBack) {
  var canvas = document.getElementById("wordClock");
  var bodyElement = document.getElementsByTagName("body")[0];
  function setCanvasAttribute() {
    canvas.setAttribute("width", bodyElement.clientWidth);
    canvas.setAttribute("height", bodyElement.clientHeight);
    windowAnimationFrame && window.cancelAnimationFrame(windowAnimationFrame);
    callBack(canvas);
  }
  setCanvasAttribute();
  window.addEventListener("resize", setCanvasAttribute);
}

onReady(canvas => {
  var ctx = canvas.getContext("2d");
  const scaleNumber = 2.5;
  const width = canvas.width * scaleNumber;
  const height = canvas.height * scaleNumber;
  const PI = Math.PI;

  // 初始化
  ctx.scale(0.4, 0.4);
  ctx.translate(width / 2, height / 2);
  ctx.font = "30px/1.2 SimSun";
  ctx.strokeStyle = "#aaa";
  ctx.save();

  // 返回动画时旋转角度
  function getAnimateDegree(degree, currentTime) {
    let moreDegree = 0.3;
    let totalTime = 200;
    if (currentTime < 0) {
      return;
    }
    let velocityDegree = (degree * (moreDegree * 2 + 1)) / totalTime;
    let currentDegree = currentTime * velocityDegree;
    if (currentDegree > degree * (1 + moreDegree)) {
      currentDegree = 2 * degree * (1 + moreDegree) - currentDegree;
    }
    return currentDegree;
  }

  function drawCircular(outerRadius, innerRadius) {
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, PI * 2, true);
    ctx.moveTo(innerRadius, 0);
    ctx.arc(0, 0, innerRadius, 0, PI * 2, true);
    ctx.stroke();
    ctx.restore();
  }

  // 绘画时间相应属性的圆环
  function drawTimeCircular(innerRadius, outerRadius, timePropertyLength, start, unit, currentTimeNumber, lastMs, isTimeCircularAnimating) {
    // 画圆环
    drawCircular(outerRadius * scaleNumber, innerRadius * scaleNumber);

    // 计算动画时的转动角度,默认时 0 度
    let animateDegree = 0;
    if (lastMs - 800 > 0 && isTimeCircularAnimating) {
      animateDegree = getAnimateDegree((2 * PI) / timePropertyLength, lastMs - 800);
    }
    let begainDegree = 2 * PI * (currentTimeNumber / timePropertyLength) + PI / timePropertyLength + animateDegree;
    ctx.rotate(begainDegree);
    for (let i = 0; i < timePropertyLength; i++) {
      ctx.beginPath();
      // 先画线
      ctx.moveTo(innerRadius * scaleNumber, 0);
      ctx.lineTo(outerRadius * scaleNumber, 0);
      ctx.rotate(-PI / timePropertyLength);
      // 旋转半个角度后绘制文字
      let text = unit ? `${timeConfig.numberStr[i + start]}${unit}` : `${timeConfig.numberStr[i + start]}`;
      ctx.fillStyle = currentTimeNumber == i ? "#fff" : "#aaa";
      ctx.font = currentTimeNumber == i ? "700 30px/1.2 SimSun" : "30px/1.2 SimSun";
      ctx.fillText(text, innerRadius * scaleNumber + 5 * scaleNumber, 6 * scaleNumber, 100 * scaleNumber);
      ctx.rotate(-PI / timePropertyLength);
      ctx.stroke();
      ctx.restore();
    }
    ctx.rotate(-begainDegree);
  }

  function drawBackground() {
    ctx.fillStyle = "#313639";
    ctx.fillRect(-width, -height, width * 2, height * 2);
    ctx.stroke();
  }

  function clock() {
    let outerRadius = initOuterRadius;
    let date = new Date();
    // 根据实际叫法进行时间换算
    let currentTimeProperty = {
      year: date.getFullYear(),
      month: date.getMonth(),
      date: date.getDate() - 1,
      week: date.getDay() - 1,
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds()
    };
    let lastMs = date.getTime() % 1000;

    ctx.clearRect(-width, -height, width * 2, height * 2);
    // 画背景
    drawBackground();
    // 判断圆环是否进行动画
    let isTimeCircularAnimating = true;
    for (let i = timeConfig.order.length; i > 0; i--) {
      let timeName = timeConfig.order[i - 1];
      let timeProperties = timeConfig.property[timeName];
      let start = timeProperties.start;
      let unit = timeProperties.unit;
      let innerRadius = outerRadius - timeProperties.width;
      // 画圆环
      drawTimeCircular(innerRadius, outerRadius, timeProperties.len, start, unit, currentTimeProperty[timeName], lastMs, isTimeCircularAnimating);
      // 根据当前时间属性计算下一个时间属性是否进行动画,当当前属性是 week 时,下一个节点(日期)一起动.
      isTimeCircularAnimating = timeName == "week" ? isTimeCircularAnimating : isTimeCircularAnimating && currentTimeProperty[timeName] == timeProperties.len - 1;
      ctx.restore();
      outerRadius = innerRadius - 5;
    }
    windowAnimationFrame = window.requestAnimationFrame(clock);
  }
  windowAnimationFrame = window.requestAnimationFrame(clock);
});
