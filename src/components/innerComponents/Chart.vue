<template>
    <chartjs class ="box" v-bind:data="chartData" v-bind:type="'line'" v-bind:options="options">
    </chartjs>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import VueCharts from 'vue-bulma-chartjs/src/Chartjs.vue';
import moment from 'moment';

const CPU_COLOR = '#f44141';
const MEM_COLOR = '#3b80ef';
const NET_COLOR = '#d7e516';
const RPM_COLOR = '#47f75f';
const RES_COLOR = '#e87e14';

@Component({
    name: 'chart',
    props: { // Lo mejor es obtener los datos del componente al que representa
        deploymentId: { required: true, type: String },
        rolId: { required: false, type: String },
        instanceId: { required: false, type: String }
    },
    components: {
        'chartjs': VueCharts
    }
})
export default class Card extends Vue {
    deploymentId: string = this.deploymentId; // SIEMPRE tendremos este valor
    rolId: string = this.rolId; // No tendremos este valor si es un deployment
    instanceId: string = this.instanceId; // No tendremos este valor si es un rol o un deployment

    options = {
        responsive: true,
        maintainAspectRatio: true,
        legend: {
            display: true,
            position: 'right',
            labels: {
                boxWidth: 15,
                padding: 10
            }
        },
        scales: {
            xAxes: [{
                type: "time",
                time: {
                    /*
                    displayFormats: { // COnfiguramos todos porque no sabemos el rango de tiempo que vamos a recibir
                        'millisecond': 'MMM DD',
                        'second': 'MMM DD',
                        'minute': 'MMM DD',
                        'hour': 'MMM DD',
                        'day': 'MMM DD',
                        'week': 'MMM DD',
                        'month': 'MMM DD',
                        'quarter': 'MMM DD',
                        'year': 'MMM DD',
                    }
                    */
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true
                },
                ticks: {
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }]
        }
    }

    get chartData() {
        let res = {
            'labels': [],
            'datasets': [
                {
                    label: "CPU",
                    fill: false,
                    backgroundColor: CPU_COLOR,
                    borderColor: CPU_COLOR,
                    data: []
                },
                {
                    label: "MEM",
                    fill: false,
                    backgroundColor: MEM_COLOR,
                    borderColor: MEM_COLOR,
                    data: []
                },
                {
                    label: "NET",
                    fill: false,
                    backgroundColor: NET_COLOR,
                    borderColor: NET_COLOR,
                    data: []
                },
                {
                    label: "RPM",
                    fill: false,
                    backgroundColor: RPM_COLOR,
                    borderColor: RPM_COLOR,
                    data: []
                },
                {
                    label: "RES",
                    fill: false,
                    backgroundColor: RES_COLOR,
                    borderColor: RES_COLOR,
                    data: []
                }
            ]
        };

        let metrics: Array<{
            'time': Date,
            'cpu': number,
            'mem': number,
            'net_in': number,
            'net_out': number,
            'rpm': number,
            'res': number
        }> = this.$store.getters.getChartData(this.deploymentId, this.rolId, this.instanceId);

        for (let metricsIndex in metrics) {
            // Esto es lo que está dando error
            res.labels.push(metrics[metricsIndex].time);
            res.datasets[0].data.push(metrics[metricsIndex].cpu);
            res.datasets[1].data.push(metrics[metricsIndex].mem);
            res.datasets[2].data.push(metrics[metricsIndex].net_in + metrics[metricsIndex].net_out);
            res.datasets[3].data.push(metrics[metricsIndex].rpm);
            res.datasets[4].data.push(metrics[metricsIndex].res);
        }

        return res;
    }
}
</script>