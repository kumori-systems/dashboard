export default {
    legend: {
        display: true,
        position: 'right'
    },

    scales: {
        xAxes: [{
            type: "time",
            time: {
                displayFormats: {
                    quarter: 'MMM YYYY'
                }
            }
        }],
        yAxes: [{
            ticks: {
                suggestedMin: 0,
                suggestedMax: 100
            }
        }, {
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
        ]
    }
};