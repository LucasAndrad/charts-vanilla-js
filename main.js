const chartSize = 261 * 1000;
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

  const xRange = 770;
  // const xRange = 500;
  // const xRange = 2 * 1000;
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
  };

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
  Highcharts.stockChart(divName, {
      tooltip: { enabled: false },
      scrollbar: {
        enabled: false,
      },
      chart: {
          zoomType: 'x',
          height: 100,
      },

      boost: {
          useGPUTranslations: true
      },
      navigator: {
        enabled: false
      },

      title: {
          text: ''
      },
      tooltip: {
          valueDecimals: 2
      },
      series: seriesList,
      plotOptions: {
        series: {
          enableMouseTracking: false,
          states: {
            hover: {
                enabled: false
            }
          }
        },
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
        },
      }
  });
}

const scrollStep = 5 * 1000
const zoomRange = 5 * 1000
let initialMin = 0;

function scrollRight() {
  console.log('scrollRight was called');
  console.time('scroll-chart');
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
  console.timeEnd('scroll-chart');
}

function buildChartsFromMock() {
  let chartsDivContainer = document.getElementById('charts-container');
  let totalChartsToBuild = [1,2,3,4,5,6,7];

  totalChartsToBuild.forEach((item, index) => {
    var data = getData(chartSize);
    let chartDiv = document.createElement('div');
    chartDiv.id = `chart-n${item}`;

    chartsDivContainer.appendChild(chartDiv);
    let showXaxis = (index + 1) === totalChartsToBuild.length;
    buildChart(chartDiv.id, showXaxis, data);
  });
}

buildChartsFromMock();
