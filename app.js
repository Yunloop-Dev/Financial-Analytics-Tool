var time = performance.now();
const xlsx = require("node-xlsx");
const mam = require("moment");
mam.locale("ru-ru");
const fs = require("fs");
const longLogs = new console.Console(fs.createWriteStream("./logs/long.log"));
const shortLogs = new console.Console(fs.createWriteStream("./logs/short.log"));

const stats = new console.Console(fs.createWriteStream("./logs/stats.log"));

const converterFunctions = require("@aternus/csv-to-xlsx");
const path = require("path");

let parse;

// convert csv to XLSX

fs.readdirSync(`${__dirname}/Converter`).forEach(async function (folderPath) {
  if (folderPath.endsWith(".xlsx")) {
    parse = xlsx.parse(`${__dirname}/Converter/${folderPath}`);
  } else {
    try {
      converterFunctions(
        `${__dirname}/Converter/${folderPath}`,
        `${__dirname}/Converter/${path.parse(folderPath).name}_Converted.xlsx`
      );
      parse = xlsx.parse(
        `${__dirname}/Converter/${path.parse(folderPath).name}_Converted.xlsx`
      );
    } catch (e) {
      console.error(e.toString());
    }
  }
});

//
let data = parse[0].data;
let endDocument = data.length;

let longCount = 0;
let shortCount = 0;
let ErrorSignalLong = 0;
let ErrorSignalShort = 0;
let interval = 0;

let CountAll = 0;
let CountGood = 0;
let CountBad = 0;

let GoodPercent = 0;

let closeStopCount = 0;

let resultTp1Long = 0,
  resultTp2Long = 0,
  resultTp3Long = 0,
  resultTp4Long = 0,
  resultTp1Short = 0,
  resultTp2Short = 0,
  resultTp3Short = 0,
  resultTp4Short = 0;

let tpPlus = 0;
let HandleTpPlus;

let idinaxyuElmir; // global variable

let arrayBuy = [];
let arraySell = [];

let debug = [];

let arrayTp1 = [],
  arrayTp2 = [],
  arrayTp3 = [],
  arrayTp4 = [],
  arrayTp5 = [],
  arrayTp6 = [],
  arrayTp7 = [],
  arrayTp8 = [];
let arrayAvgBuy = [],
  arrayStopBuy = [],
  arrayAvgSell = [],
  arrayStopSell = [];

let isCloseConstructor = false;

let getInterval = () => {
  return stats.log(
    (interval = `\nСрез данных\nС ${mam(data[1][0] * 1000).format(
      "LLLL"
    )} по ${mam(data[data.length - 1][0] * 1000).format("LLLL")}`)
  );
};

// get max number index

var arrayMaxIndex = function (array, bool) {
  if (bool) {
    return array.indexOf(Math.max.apply(null, array));
  } else {
    return array.indexOf(Math.min.apply(null, array));
  }
};

//

let constructor = (datas, index) => {
  let obj = {
    time: datas[0],
    open: datas[1],
    high: datas[2],
    low: datas[3],
    close: datas[4],
    buyAlert: datas[5],
    sellAlert: datas[6],
    tp1: datas[7],
    tp2: datas[8],
    tp3: datas[9],
    tp4: datas[10],
    avg: datas[11],
    stop: datas[12],
  };

  if (obj.buyAlert == 1) {
    // search startNow buy alert
    if (obj.close > data[index + 2][7]) {
      ErrorSignalLong++;
    }
    longCount++;
    lastBuy = index;
    arrayBuy.push(index + 2);
  }

  if (obj.sellAlert == 1) {
    // search startNow sellAlert
    if (obj.close < data[index + 2][7]) {
      ErrorSignalShort++;
    }
    shortCount++;
    lastSell = index;
    arraySell.push(index + 2);
  }

  if (index + 1 == data.length) {
    arraySell[arraySell.length - 1] > arrayBuy[arrayBuy.length - 1]
      ? arrayBuy.push(endDocument)
      : arraySell.push(endDocument);
    isCloseConstructor = true;
  }
};

const getAverage = (numbers) => {
  const sum = numbers.reduce((acc, number) => acc + number, 0).toFixed(0);
  const length = numbers.length;
  const result = (sum / length).toFixed(2);
  return result;
};

data.forEach((mf, index) => {
  if (index == 0) return;
  constructor(mf, index);
});

let getObj = (index) => {
  return {
    time: data[index][0],
    open: data[index][1],
    high: data[index][2],
    low: data[index][3],
    close: data[index][4],
    tp1: data[index][7],
    tp2: data[index][8],
    tp3: data[index][9],
    tp4: data[index][10],
    avg: data[index][11],
    stop: data[index][12],
  };
};

stats.log("Long tp4+");
for (let index = 0; index < longCount; index++) {
  let start = arrayBuy[index];
  let end = arraySell[index] - 2;

  let tp1Plus = false;
  let tp2Plus = false;
  let tp3Plus = false;
  let tp4Plus = false;

  let isStop = false;

  let intervalTotalResult1 = true;
  let intervalTotalResult2 = true;
  let intervalTotalResult3 = true;
  let intervalTotalResult4 = true;

  for (let i = start - 1; i <= end; i++) {
    let StartStop = getObj(start).stop;
    let AVG = getObj(start).avg;

    if (getObj(i).low > StartStop) {
      let istp1 = false;
      let istp2 = false;
      let istp3 = false;
      let istp4 = false;

      let takeProfit1 = getObj(start).tp1;
      let takeProfit2 = getObj(start).tp2;
      let takeProfit3 = getObj(start).tp3;
      let takeProfit4 = getObj(start).tp4;

      if (getObj(i).high > takeProfit1) {
        istp1 = true;
      }
      if (getObj(i).high > takeProfit2) {
        istp2 = true;
      }
      if (getObj(i).high > takeProfit3) {
        istp3 = true;
      }
      if (getObj(i).high > takeProfit4) {
        istp4 = true;
      }

      let s = getObj(i);

      s.tp1 = takeProfit1;
      s.tp2 = takeProfit2;
      s.tp3 = takeProfit3;
      s.tp4 = takeProfit4;
      s.avg = AVG;
      s.stop = StartStop;

      let formulaTp1 = Math.abs(
        ((getObj(start).tp1 - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);
      let formulaTp2 = Math.abs(
        ((getObj(start).tp2 - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);
      let formulaTp3 = Math.abs(
        ((getObj(start).tp3 - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);
      let formulaTp4 = Math.abs(
        ((getObj(start).tp4 - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);

      let formulaTpStop = Math.abs(
        ((getObj(start).stop - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);

      let formulaTpAvg = Math.abs(
        ((getObj(start).avg - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);

      if (formulaTp2 < formulaTp1) {
        formulaTp1 = `-${formulaTp1}`;
      }

      if (formulaTp3 < formulaTp2) {
        formulaTp2 = `-${formulaTp2}`;
      }

      if (formulaTp4 < formulaTp3) {
        formulaTp3 = `-${formulaTp3}`;
      }

      if (istp4 && tp4Plus == false) {
        arrayAvgBuy.push(formulaTpAvg);
        arrayStopBuy.push(formulaTpStop);

        if (formulaTp1 > 0) {
          arrayTp1.push(formulaTp1);
        }
        if (formulaTp2 > 0) {
          arrayTp2.push(formulaTp2);
        }
        if (formulaTp3 > 0) {
          arrayTp3.push(formulaTp3);
        }
        if (formulaTp4 > 0) {
          arrayTp4.push(formulaTp4);
        }

        if (intervalTotalResult1) {
          resultTp1Long++;
          intervalTotalResult1 = false;
        }
        if (intervalTotalResult2) {
          resultTp2Long++;
          intervalTotalResult2 = false;
        }
        if (intervalTotalResult3) {
          resultTp3Long++;
          intervalTotalResult3 = false;
        }
        if (intervalTotalResult4) {
          resultTp4Long++;
          intervalTotalResult4 = false;
        }

        longLogs.log(`\n\nОтчёт по свече №${i + 1}`);
        longLogs.log(s);
        longLogs.log(`Задела ТП1 ${formulaTp1}`);
        longLogs.log(`Задела ТП2 ${formulaTp2}`);
        longLogs.log(`Задела ТП3 ${formulaTp3}`);
        longLogs.log(`Задела ТП4 ${formulaTp4}`);

        tp4Plus = true;
        tp3Plus = true;
        tp2Plus = true;
        tp1Plus = true;

        HandleTpPlus = i;

        let array = [];

        for (let id = HandleTpPlus; id < end; id++) {
          array.push(getObj(id).high);
        }

        let maxArray = Math.max.apply(null, array);
        let minArray = getObj(HandleTpPlus).high;

        let formula = Math.abs(
          ((maxArray - minArray) / minArray) * 100
        ).toFixed(1);

        stats.log(
          `Интервал (${HandleTpPlus + 1}-${end}) — ${maxArray} (${
            formula > 1 ? formula : "Незначительные изменения"
          })`
        );
      }

      if (istp3 && tp3Plus == false) {
        arrayAvgBuy.push(formulaTpAvg);
        arrayStopBuy.push(formulaTpStop);

        if (formulaTp1 > 0) {
          arrayTp1.push(formulaTp1);
        }
        if (formulaTp2 > 0) {
          arrayTp2.push(formulaTp2);
        }
        if (formulaTp3 > 0) {
          arrayTp3.push(formulaTp3);
        }

        if (intervalTotalResult1) {
          resultTp1Long++;
          intervalTotalResult1 = false;
        }
        if (intervalTotalResult2) {
          resultTp2Long++;
          intervalTotalResult2 = false;
        }
        if (intervalTotalResult3) {
          resultTp3Long++;
          intervalTotalResult3 = false;
        }

        longLogs.log(`\n\nОтчёт по свече №${i + 1}`);
        longLogs.log(s);
        longLogs.log(`Задела ТП1 ${formulaTp1}`);
        longLogs.log(`Задела ТП2 ${formulaTp2}`);
        longLogs.log(`Задела ТП3 ${formulaTp3}`);
        tp3Plus = true;
        tp2Plus = true;
      }

      if (istp2 && tp2Plus == false) {
        arrayAvgBuy.push(formulaTpAvg);
        arrayStopBuy.push(formulaTpStop);
        if (formulaTp1 > 0) {
          arrayTp1.push(formulaTp1);
        }
        if (formulaTp2 > 0) {
          arrayTp2.push(formulaTp2);
        }

        if (intervalTotalResult1) {
          resultTp1Long++;
          intervalTotalResult1 = false;
        }
        if (intervalTotalResult2) {
          resultTp2Long++;
          intervalTotalResult2 = false;
        }
        longLogs.log(`\n\nОтчёт по свече №${i + 1}`);
        longLogs.log(s);
        longLogs.log(`Задела ТП1 ${formulaTp1}`);
        longLogs.log(`Задела ТП2 ${formulaTp2}`);
        tp2Plus = true;
        tp1Plus = true;
      }

      if (istp1 && tp1Plus == false) {
        arrayAvgBuy.push(formulaTpAvg);
        arrayStopBuy.push(formulaTpStop);
        if (formulaTp1 > 0) {
          arrayTp1.push(formulaTp1);
        }

        if (intervalTotalResult1) {
          resultTp1Long++;
          intervalTotalResult1 = false;
        }

        longLogs.log(`\n\nОтчёт по свече №${i + 1}`);
        longLogs.log(s);
        longLogs.log(`Задела ТП1 ${formulaTp1}`);
        tp1Plus = true;
      }
    } else {
      if (!isStop) {
        longLogs.log(`Закрытo по стопу! Номер свечи №${i + 1}`);
        closeStopCount++;
        isStop = true;
      }
    }
  }
  index++;
}
stats.log("Short tp4+");
for (let index = 0; index < shortCount; index++) {
  let start = arraySell[index];
  let end = arrayBuy[index + 1] - 3;
  let tp1Plus = false;
  let tp2Plus = false;
  let tp3Plus = false;
  let tp4Plus = false;
  let isStop = false;

  let intervalTotalResult1 = true;
  let intervalTotalResult2 = true;
  let intervalTotalResult3 = true;
  let intervalTotalResult4 = true;

  for (let i = start - 1; i <= end; i++) {
    let StartStop = getObj(start).stop;
    let AVG = getObj(start).avg;

    if (getObj(i).high < StartStop) {
      let istp1 = false;
      let istp2 = false;
      let istp3 = false;
      let istp4 = false;

      let takeProfit1 = getObj(start).tp1;
      let takeProfit2 = getObj(start).tp2;
      let takeProfit3 = getObj(start).tp3;
      let takeProfit4 = getObj(start).tp4;

      if (getObj(i).low < takeProfit1) {
        istp1 = true;
      }
      if (getObj(i).low < takeProfit2) {
        istp2 = true;
      }
      if (getObj(i).low < takeProfit3) {
        istp3 = true;
      }
      if (getObj(i).low < takeProfit4) {
        istp4 = true;
      }

      let s = getObj(i);

      s.tp1 = takeProfit1;
      s.tp2 = takeProfit2;
      s.tp3 = takeProfit3;
      s.tp4 = takeProfit4;
      s.avg = AVG;
      s.stop = StartStop;

      let formulaTp1 = Math.abs(
        ((getObj(start).tp1 - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);
      let formulaTp2 = Math.abs(
        ((getObj(start).tp2 - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);
      let formulaTp3 = Math.abs(
        ((getObj(start).tp3 - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);
      let formulaTp4 = Math.abs(
        ((getObj(start).tp4 - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);

      let formulaTpStop = Math.abs(
        ((getObj(start).stop - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);

      let formulaTpAvg = Math.abs(
        ((getObj(start).avg - getObj(start - 1).open) /
          getObj(start - 1).open) *
          100
      ).toFixed(2);

      if (formulaTp2 < formulaTp1) {
        formulaTp1 = `-${formulaTp1}`;
      }

      if (formulaTp3 < formulaTp2) {
        formulaTp2 = `-${formulaTp2}`;
      }

      if (formulaTp4 < formulaTp3) {
        formulaTp3 = `-${formulaTp3}`;
      }

      if (istp4 && tp4Plus == false) {
        arrayAvgSell.push(formulaTpAvg);
        arrayStopSell.push(formulaTpStop);

        if (formulaTp1 > 0) {
          arrayTp5.push(formulaTp1);
        }
        if (formulaTp2 > 0) {
          arrayTp6.push(formulaTp2);
        }
        if (formulaTp3 > 0) {
          arrayTp7.push(formulaTp3);
        }
        if (formulaTp4 > 0) {
          arrayTp8.push(formulaTp4);
        }

        if (intervalTotalResult1) {
          resultTp1Short++;
          intervalTotalResult1 = false;
        }
        if (intervalTotalResult2) {
          resultTp2Short++;
          intervalTotalResult2 = false;
        }
        if (intervalTotalResult3) {
          resultTp3Short++;
          intervalTotalResult3 = false;
        }
        if (intervalTotalResult4) {
          resultTp4Short++;
          intervalTotalResult4 = false;
        }

        shortLogs.log(`\n\nОтчёт по свече №${i + 1}`);
        shortLogs.log(s);
        shortLogs.log(`Задела ТП1`);
        shortLogs.log(`Задела ТП2`);
        shortLogs.log(`Задела ТП3`);
        shortLogs.log(`Задела ТП4`);
        tp4Plus = true;
        tp3Plus = true;
        tp2Plus = true;
        tp1Plus = true;

        HandleTpPlus = i;

        let array = [];

        for (let id = HandleTpPlus; id < end; id++) {
          array.push(getObj(id).low);
        }

        let maxArray = Math.min.apply(null, array);
        let minArray = getObj(HandleTpPlus).low;

        let formula = Math.abs(
          ((maxArray - minArray) / minArray) * 100
        ).toFixed(1);

        stats.log(
          `Интервал (${HandleTpPlus + 1}-${end}) — ${maxArray} (${
            formula > 1 ? formula : "Незначительные изменения"
          })`
        );
      }

      if (istp3 && tp3Plus == false) {
        arrayAvgSell.push(formulaTpAvg);
        arrayStopSell.push(formulaTpStop);

        if (formulaTp1 > 0) {
          arrayTp5.push(formulaTp1);
        }
        if (formulaTp2 > 0) {
          arrayTp6.push(formulaTp2);
        }
        if (formulaTp3 > 0) {
          arrayTp7.push(formulaTp3);
        }

        if (intervalTotalResult1) {
          resultTp1Short++;
          intervalTotalResult1 = false;
        }
        if (intervalTotalResult2) {
          resultTp2Short++;
          intervalTotalResult2 = false;
        }
        if (intervalTotalResult3) {
          resultTp3Short++;
          intervalTotalResult3 = false;
        }

        shortLogs.log(`\n\nОтчёт по свече №${i + 1}`);
        shortLogs.log(s);
        shortLogs.log(`Задела ТП1`);
        shortLogs.log(`Задела ТП2`);
        shortLogs.log(`Задела ТП3`);
        tp3Plus = true;
        tp2Plus = true;
        tp1Plus = true;

        shortLogs.log();
      }

      if (istp2 && tp2Plus == false) {
        arrayAvgSell.push(formulaTpAvg);
        arrayStopSell.push(formulaTpStop);

        if (formulaTp1 > 0) {
          arrayTp5.push(formulaTp1);
        }
        if (formulaTp2 > 0) {
          arrayTp6.push(formulaTp2);
        }

        if (intervalTotalResult1) {
          resultTp1Short++;
          intervalTotalResult1 = false;
        }
        if (intervalTotalResult2) {
          resultTp2Short++;
          intervalTotalResult2 = false;
        }

        shortLogs.log(`\n\nОтчёт по свече №${i + 1}`);
        shortLogs.log(s);
        shortLogs.log(`Задела ТП1`);
        shortLogs.log(`Задела ТП2`);
        tp2Plus = true;
        tp1Plus = true;
      }

      if (istp1 && tp1Plus == false) {
        arrayAvgSell.push(formulaTpAvg);
        arrayStopSell.push(formulaTpStop);

        if (intervalTotalResult1) {
          resultTp1Short++;
          intervalTotalResult1 = false;
        }

        if (formulaTp1 > 0) {
          arrayTp5.push(formulaTp1);
        }

        shortLogs.log(`\n\nОтчёт по свече №${i + 1}`);
        shortLogs.log(s);
        shortLogs.log(`Задела ТП1`);
        tp1Plus = true;
      }
    } else {
      if (!isStop) {
        shortLogs.log(`Закрытo по стопу! Номер свечи №${i + 1}`);
        closeStopCount++;
        isStop = true;
      }
    }
  }
}

const result = () => {
  CountAll = longCount + shortCount;
  CountGood =
    longCount +
    shortCount -
    (ErrorSignalShort - ErrorSignalLong) -
    closeStopCount;
  GoodPercent = ((CountGood / CountAll) * 100).toFixed(1);
  CountGood = `${CountGood} (${GoodPercent}%)`;

  CountBad = closeStopCount + ErrorSignalShort + ErrorSignalLong;

  arrayAvgBuy = JSON.stringify(arrayAvgBuy);
  arrayAvgSell = JSON.stringify(arrayAvgSell);
  arrayStopBuy = JSON.stringify(arrayStopBuy);
  arrayStopSell = JSON.stringify(arrayStopSell);
  arrayTp1 = JSON.stringify(arrayTp1);
  arrayTp2 = JSON.stringify(arrayTp2);
  arrayTp3 = JSON.stringify(arrayTp3);
  arrayTp4 = JSON.stringify(arrayTp4);
  arrayTp5 = JSON.stringify(arrayTp5);
  arrayTp6 = JSON.stringify(arrayTp6);
  arrayTp7 = JSON.stringify(arrayTp7);
  arrayTp8 = JSON.stringify(arrayTp8);

  try {
    arrayTp1 = arrayTp1.match(/\d+(?:\.\d+)?/g).map(Number);
    arrayTp2 = arrayTp2.match(/\d+(?:\.\d+)?/g).map(Number);
    arrayTp3 = arrayTp3.match(/\d+(?:\.\d+)?/g).map(Number);
    arrayTp4 = arrayTp4.match(/\d+(?:\.\d+)?/g).map(Number);
    arrayStopBuy = arrayStopBuy.match(/\d+(?:\.\d+)?/g).map(Number);
    arrayAvgBuy = arrayAvgBuy.match(/\d+(?:\.\d+)?/g).map(Number);

    let AddingPricent = 22;

    stats.log(
      `Среднее STOP : ${(
        (parseFloat(getAverage(arrayStopBuy)) / 100) * AddingPricent +
        parseFloat(getAverage(arrayStopBuy))
      ).toFixed(2)}`
    );
    stats.log(
      `Среднее AVG : ${(
        (parseFloat(getAverage(arrayAvgBuy)) / 100) * AddingPricent +
        parseFloat(getAverage(arrayAvgBuy))
      ).toFixed(2)}`
    );
    stats.log(
      `Среднее ТП 1 : ${(
        (parseFloat(getAverage(arrayTp1)) / 100) * AddingPricent +
        parseFloat(getAverage(arrayTp1))
      ).toFixed(2)}`
    );
    stats.log(
      `Среднее ТП 2 : ${(
        (parseFloat(getAverage(arrayTp2)) / 100) * AddingPricent +
        parseFloat(getAverage(arrayTp2))
      ).toFixed(2)}`
    );
    stats.log(
      `Среднее ТП 3 : ${(
        (parseFloat(getAverage(arrayTp3)) / 100) * AddingPricent +
        parseFloat(getAverage(arrayTp3))
      ).toFixed(2)}`
    );
    stats.log(
      `Среднее ТП 4 : ${(
        (parseFloat(getAverage(arrayTp4)) / 100) * AddingPricent +
        parseFloat(getAverage(arrayTp4))
      ).toFixed(2)}`
    );
  } catch (error) {
    stats.log(error);
  }

  return {
    longCount,
    shortCount,
    closeStopCount,
    ErrorSignalLong,
    ErrorSignalShort,
    CountAll,
    CountGood,
    CountBad,
    resultTp1Long,
    resultTp2Long,
    resultTp3Long,
    resultTp4Long,
    resultTp1Short,
    resultTp2Short,
    resultTp3Short,
    resultTp4Short,
    endDocument,
  };
};

getInterval();
stats.log(result());

time = performance.now() - time;
stats.log(`Время получения результатов: ${(time / 1000).toFixed(4)} сек`);
console.log(`Перейдите в папку ${__dirname}\\logs\\`);

// TODO: Точка отсчёта 700.