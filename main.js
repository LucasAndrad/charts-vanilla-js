const chartSize = 300 * 1000;
const colors = [
  'rgb(255, 0, 0)',
  'rgb(128, 0, 0)',
  'rgb(255, 195, 0)',
  'rgb(128, 128, 0)',
  'rgb(0, 255, 0)',
  'rgb(0, 128, 0)',
  'rgb(0, 128, 128)',
  'rgb(0, 0, 128)',
  'rgb(255, 0, 255)',
  'rgb(128, 0, 128)',
];

function getRandomColor() {
  return colors[Math.floor((Math.random()*colors.length))];
}

function getMockMarkers() {
  // return [];

  // const xRange = 500;
  const xRange = 2 * 1000;
  // const xRange = 10 * 1000;

  const markers = [];
  let i = 1;
  for(i = 1; i < (chartSize - xRange); i = i + 2 * xRange) {
    const id = (Math.random() + 1).toString(36).substring(3);
    const color = getRandomColor();

    markers.push(
      {
        name: "marker",
        type: "xrange",
        markerId: id,
        id: id,
        pointWidth: 20,
        pointPlacement: "between",
        allowPointSelect: true,
        showInLegend: false,
        states: {
          select: {
            color: color,
            borderColor: "transparent",
            borderWidth: 0
          }
        },
        data: [
          {
            x: i,
            x2: i + xRange,
            y: -2,
            name: "marker",
            pointWidth: 20,
            id: id,
            markerName: "CentralApnea_3 (A)",
            color: color,
            dataLabels: {
              align: "center",
              inside: false,
              style: {
                fontSize: "11px",
                fontWeight: "normal",
                textOutline: "1px contrast",
                cursor: "move"
              },
              borderWidth: 0,
              color: "#000",
              x: 2
            }
          }
        ],
        events: {},
        point: {
          events: {}
        },
        customEvents: {
          series: {},
          point: {}
        }
      }
    )
  }

  console.log('markers len', markers.length)
  return markers;
}

function getData(n, scale = 0) {
  let arr = [];
  let i = 0
  let x = 0
  let a = 0
  let b = 0
  let c = 0
  let spike = 0;

  for (
    // i = 0, x = Date.UTC(new Date().getUTCFullYear(), 0, 1) - n * 36e5;
    i = 0;
    i < n;
    i = i + 1, x = x + 1
  ) {
    if (i % 100 === 0) {
      a = 2 * Math.random();
    }
    if (i % 1000 === 0) {
      b = 2 * Math.random();
    }
    if (i % 10000 === 0) {
      c = 2 * Math.random();
    }
    if (i % 50000 === 0) {
      spike = 10;
    } else {
      spike = 0;
    }
    arr.push([
      x,
      2 * Math.sin(i / 100) + a + b + c + spike + Math.random() + scale,
    ]);
  }
  return arr;
}

function buildChart(divName, showXaxis = false, providedData) {
  let seriesList = getMockMarkers();
  seriesList[0] = {
    data: providedData,
    lineWidth: 1,
    showInLegend: true,
  };
  // Highcharts.chart(divName, {
  Highcharts.stockChart(divName, {
      scrollbar: {
        enabled: false,
      },
      chart: {
          zoomType: 'x',
          // panning: true,
          // panKey: 'shift',
          height: 100,
      },

      boost: {
          useGPUTranslations: true
      },
      navigator: {
        enabled: false
      },
      // legend:{ enabled:false },

      title: {
          text: ''
      },

      // subtitle: {
      //     text: 'Using the Boost module'
      // },

      tooltip: {
          valueDecimals: 2
      },

      series: seriesList,
      plotOptions: {
        line: {
          dataGrouping: {
            enabled: true,
            groupPixelWidth: 2,
          },
        },
      },
      rangeSelector:{
        enabled:false
      },
      xAxis: {
        type: 'datetime',
        animation: false,
        visible: showXaxis,
        scrollbar: {
          enabled: false,
          // buttonsEnabled: true,
          // height: 25,
        },
      }
  });
}

// console.log(Highcharts.charts[0].xAxis);
// dataMin 499.999
// dataMax
const scrollStep = 5 * 1000
const zoomRange = 5 * 1000
let initialMin = 0;

function scrollRight() {
  let newExtremeMin = initialMin;
  let newExtremeMax = initialMin + zoomRange;
  Highcharts.charts.forEach((chart) => {
    if (!chart) return;

    if (newExtremeMax > chartSize) return;
    chart.xAxis[0].setExtremes(
      dataMin=newExtremeMin,
      dataMax=newExtremeMax,
      trigger='scrollbar',
    );
  });
  initialMin = initialMin + scrollStep;
}

function scrollToLeft() {
  initialMin = initialMin - (2 *scrollStep);

  let newExtremeMin = initialMin
  let newExtremeMax = initialMin + zoomRange;
  if (initialMin < zoomRange) {
    newExtremeMin = 0
    newExtremeMax = zoomRange;
  }

  Highcharts.charts.forEach((chart) => {
    if (!chart) return;

    if (newExtremeMax > chartSize) return;
    chart.xAxis[0].setExtremes(
      dataMin=newExtremeMin,
      dataMax=newExtremeMax,
      trigger='scrollbar',
    );
  });
  initialMin = initialMin - scrollStep;
}

function buildGraphs(csvContent) {
  const chartNames = [
    'Position',
    'ABD',
    'THX',
    'SUM_Flow',
    'SUM_Pressure',
    'SpO2',
    'Pulse',
  ];

  const chartsDataIndex = {};
  const csvHeader = csvContent.split('\n')[0].split(',');
  csvHeader.forEach((item, index) => {
    if (chartNames.includes(item)) {
      chartsDataIndex[item] = index
    }
  });

  let chartsData = {};
  chartNames.forEach((item) => {
    chartsData[item] = {
      name: item,
      data: []
    };
  });

  csvContent.split('\n').forEach((row, index) => {
    if (index === 0) {return;}
    let data = row.split(',');
    Object.entries(chartsDataIndex).forEach((item) => {
      let currentData = chartsData[item[0]].data;
      let x = currentData.length;
      let y = parseFloat(data[item[1]]);
      currentData.push([x, y]);
      chartsData[item[0]].data = currentData;
    });
  });

  let chartsDivContainer = document.getElementById('charts-container');
  Object.values(chartsData).forEach((item, index) => {
    let chartDiv = document.createElement('div');
    chartDiv.id = item.name;

    chartsDivContainer.appendChild(chartDiv);
    let showXaxis = (index + 1) === Object.keys(chartsData).length;
    buildChart(item.name, showXaxis, item.data);
  });
}

function handleFile(event) {
  console.log("==== Event file input", event);
  let file = event.target.files[0];
  var reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = function (evt) {
      buildGraphs(evt.target.result);
  }
  reader.onerror = function (evt) {
      console.log("Error:", evt);
  }
}
