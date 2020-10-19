document.addEventListener('DOMContentLoaded', function () {
  Highcharts.chart('myChart', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Number of One Way Trip Between Penang and Kuala Lumpur by Year'
    },
    subtitle: {
      text: 'Since May 1, 2018 (Click to Drill Down)'
    },
    xAxis: {
      type: 'category',
      title: {
        text: 'Years'
      }
    },
    yAxis: {
      title: {
        text: 'Number of One Way Trips'
      }
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.y}'
        }
      }
    },

    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> Trips<br/>'
    },

    series: processedDataByYear,
    drilldown: {
      series: processedDataByMonth,
    }
  });
});