<template>
    <div style="width:800px;height:400px;">
        <vuebulmachartjs v-bind:type="'line'" v-bind:data="chartData" v-bind:options="options" />
    </div>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import VueBulmaChartjs from 'vue-bulma-chartjs/src/Chartjs.vue';
import Moment from 'moment';


let timeFormat = 'MMMM Do YYYY, h:mm:ss a';

@Component({
    name: 'chart',
    props: { // Lo mejor es obtener los datos del componente al que representa
        deploymentId: { required: true, type: String },
        rolId: { required: false, type: String },
        instanceId: { required: false, type: String }
    },
    components: {
        'vuebulmachartjs': VueBulmaChartjs
    }
})
export default class Card extends Vue {
    deploymentId: string = this.deploymentId; // SIEMPRE tendremos este valor
    rolId: string = this.rolId; // No tendremos este valor si es un deployment
    instanceId: string = this.instanceId; // No tendremos este valor si es un rol o un deployment

    options: any = {
        title: {
            text: "Chart.js Time Scale"
        },
        scales: {
            xAxes: [{
                type: "time",
                time: {
                    format: timeFormat
                    //,
                    // round: 'day'
                    // tooltipFormat: 'll HH:mm'
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Date'
                }
            },],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'value'
                }
            }]
        }

    }; // Las opciones son fijas y comunes para todos los charts

    get chartData() {

        console.log('Cuando inetntamos crear una nueva fecha obtenemos: ' + JSON.stringify(Moment("20170525T000056+02:00").format(timeFormat)));

        let data = {
            /*
            labels: [
                Moment("20170525T000056+02:00").toDate(),
                Moment("20170525T000056+02:00").add(1, 'd').toDate(),
                Moment("20170525T000056+02:00").add(2, 'd').toDate(),
                Moment("20170525T000056+02:00").add(3, 'd').toDate(),
                Moment("20170525T000056+02:00").add(4, 'd').toDate(),
                Moment("20170525T000056+02:00").add(5, 'd').toDate(),
                Moment("20170525T000056+02:00").add(6, 'd').toDate()
            ]
            */
            /*
            labels: [
                "20170525T000056+02:00",
                "20170526T000056+02:00",
                "20170527T000056+02:00",
                "20170528T000056+02:00",
                "20170529T000056+02:00",
                "20170530T000056+02:00",
                "20170531T000056+02:00"
            ]
            */
            
            labels: [
                Moment("20170525T000056+02:00").format(timeFormat),
                Moment("20170525T000056+02:00").add(1, 'd').format(timeFormat),
                Moment("20170525T000056+02:00").add(2, 'd').format(timeFormat),
                Moment("20170525T000056+02:00").add(3, 'd').format(timeFormat),
                Moment("20170525T000056+02:00").add(4, 'd').format(timeFormat),
                Moment("20170525T000056+02:00").add(5, 'd').format(timeFormat),
                Moment("20170525T000056+02:00").add(6, 'd').format(timeFormat)
            ]


        }

        let data_3 = [
            [65, 59, 90, 81, 56, 55, 55],
            [28, 48, 40, 19, 88, 26, 55]
        ];

        let series = ['Product A', 'Product B'];

        let backgroundColor_3 = [
            'rgba(31, 200, 219, 1)',
            'rgba(151, 205, 118, 1)'
        ];

        data['datasets'] = series.map((e, i) => {
            return {
                data: data_3[i],
                label: series[i],
                borderColor: backgroundColor_3[i].replace(/1\)$/, '0.5)'),
                pointBackgroundColor: backgroundColor_3[i],
                backgroundColor: backgroundColor_3[i].replace(/1\)$/, '0.5)')
            }
        });


        console.log('data contiene: ' + JSON.stringify(data));
        return data;
    }
}







/*

data: {
    "labels":[
        "05/25/2017 00:00",
        "05/26/2017 00:00",
        "05/27/2017 00:00",
        "05/28/2017 00:00",
        "05/29/2017 00:00",
        "05/30/2017 00:00",
        "05/31/2017 00:00"
    ],
    "datasets":[
        {
            "data":[65,59,90,81,56,55,55],
            "label":"Product A",
            "borderColor":"rgba(31, 200, 219, 0.5)",
            "pointBackgroundColor":"rgba(31, 200, 219, 1)",
            "backgroundColor":"rgba(31, 200, 219, 0.5)"
        },
        {
            "data":[28,48,40,19,88,26,55],
            "label":"Product B",
            "borderColor":"rgba(151, 205, 118, 0.5)",
            "pointBackgroundColor":"rgba(151, 205, 118, 1)",
            "backgroundColor":"rgba(151, 205, 118, 0.5)"
        }
    ]
}
*/



</script>