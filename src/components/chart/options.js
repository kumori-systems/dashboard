export default {
  /*
  legend: {
      display: true,
      position: 'right'
  },
  */
  scales: {
    xAxes: [{
      type: "time",
      /*
      ticks:{
          maxRotation: 0
      },*/
      time: {
        /**
         * Defining the same format for all, the size won't change
         */
        displayFormats: {
          millisecond: 'hh:mm:ss a',
          second: 'hh:mm:ss a',
          minute: 'hh:mm:ss a',
          hour: 'hh:mm:ss a',
          day: 'hh:mm:ss a',
          week: 'hh:mm:ss a',
          month: 'hh:mm:ss a',
          quarter: 'hh:mm:ss a',
          year: 'hh:mm:ss a'
        }
      }
    }],
    yAxes: [{
      ticks: {
        suggestedMin: 0,
        suggestedMax: 100
      }
    }

      /*
      , {
          position: 'right',
          ticks: {
              fontColor: '#97cd76',
              suggestedMin: 0,
              suggestedMax: 1
          }
      },
      {
          position: 'right',
          ticks: {
              fontColor: '#ed6c63',
              suggestedMin: 0,
              suggestedMax: 1000
          }
      }
      */
    ]
  }
};