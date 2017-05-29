<template>
    <chartjs v-bind:data="chartData" v-bind:type="'line'" v-bind:options="options">
    </chartjs>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import VueCharts from 'vue-bulma-chartjs/src/Chartjs.vue';

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
    labels = ['Sleeping', 'Designing', 'Coding', 'Cycling'];
    data = this.data;
    backgroundColor = [
        '#1fc8db',
        '#fce473',
        '#42afe3',
        '#ed6c63',
        '#97cd76'
    ]
    options = {
        segmentShowStroke: false
    };

    get chartData() {
        return {
            'labels': this.labels,
            'datasets': this.data,
            'backgroundColor': this.backgroundColor
        };
    }
}
</script>