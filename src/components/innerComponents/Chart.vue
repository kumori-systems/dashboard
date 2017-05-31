<template>
    <chartjs v-bind:data="chartData" v-bind:type="'line'" v-bind:options="options">
    </chartjs>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import VueCharts from 'vue-bulma-chartjs/src/Chartjs.vue';

const CPU_COLOR = '#f44141';
const MEM_COLOR = '#3b80ef';
const NET_COLOR = '#d7e516';
const RPM_COLOR = '#47f75f';
const RES_COLOR = '#e87e14';

@Component({
    name: 'chart',
    props: {
        data: { required: true }
    },
    components: {
        'chartjs': VueCharts
    }
})
export default class Card extends Vue {
    data = this.data;
    cpuData = [80, 85, 90, 70, 75, 80, 85];
    memData = [50, 55, 60, 65, 70, 75, 80];
    netData = [20, 22, 24, 15, 17, 20, 22];
    rpmData = [100, 200, 350, 450, 200, 250, 350];
    resData = [5, 10, 5, 5, 5, 5, 5];

    options = {
        responsive: true,
        maintainAspectRatio: true,
        legend: {
            display: true,
            position: 'right',
            labels:{
                boxWidth:15,
                padding: 20
            }
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true
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
        return {
            labels: ["1/1/17", "2/1/17", "3/1/17", "4/1/17", "5/1/17", "6/1/17", "7/1/17"],
            datasets: [
                {
                    label: "CPU",
                    fill: false,
                    backgroundColor: CPU_COLOR,
                    borderColor: CPU_COLOR,
                    data: this.cpuData
                },
                {
                    label: "MEM",
                    fill: false,
                    backgroundColor: MEM_COLOR,
                    borderColor: MEM_COLOR,
                    data: this.memData
                },
                {
                    label: "NET",
                    fill: false,
                    backgroundColor: NET_COLOR,
                    borderColor: NET_COLOR,
                    data: this.netData
                },
                {
                    label: "RPM", // Request Per Minute
                    fill: false,
                    backgroundColor: RPM_COLOR,
                    borderColor: RPM_COLOR,
                    data: this.rpmData
                },
                {
                    label: "RES", // Response Time
                    fill: false,
                    backgroundColor: RES_COLOR,
                    borderColor: RES_COLOR,
                    data: this.resData
                }
            ]
        }
    }
}
</script>