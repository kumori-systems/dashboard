<template>
    <div style="width:800px;height:200px;">
        <vuebulmachartjs v-bind:type="'line'" v-bind:data="chartData" v-bind:options="options" />
    </div>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import VueBulmaChartjs from 'vue-bulma-chartjs/src/Chartjs.vue';
import Moment from 'moment';

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
        legend: {
            position: 'right'
        }

    }; // Las opciones son fijas y comunes para todos los charts

    get chartData() {

        console.log('Cuando inetntamos crear una nueva fecha obtenemos: ' + JSON.stringify(Moment("20170525T000056+02:00").toDate()));

        let data = {
            labels: [Moment("20170525T000056+02:00").toDate(), Moment("20170525T000056+02:00").add(1, 'd').toDate(), Moment("20170525T000056+02:00").add(2, 'd').toDate(), Moment("20170525T000056+02:00").add(3, 'd').toDate(), Moment("20170525T000056+02:00").add(4, 'd').toDate(), Moment("20170525T000056+02:00").add(5, 'd').toDate(), Moment("20170525T000056+02:00").add(6, 'd').toDate()]
        }
        let data_3 = [
            [65, 59, 90, 81, 56, 55, 40],
            [28, 48, 40, 19, 88, 27, 45]
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
                borderColor: backgroundColor_3[i].replace(/1\)$/, '.5)'),
                pointBackgroundColor: backgroundColor_3[i],
                backgroundColor: backgroundColor_3[i].replace(/1\)$/, '.5)')
            }
        })
        return data
    }
}
</script>