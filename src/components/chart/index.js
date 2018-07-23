import Vue from 'vue';
import { Line, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;

/**
 * This is a vue wrapper for a line chart.
 * More info can be found here: http://vue-chartjs.org/#/home?id=reactive-data
 */
export default Vue.component('chart-component',
{
  name:'chartComponent',
  extends: Line,
  mixins: [reactiveProp],
  props: ['options'],
  mounted() {
    this.renderChart(this.chartData, this.options);
  }
});
