import Vue from 'vue';
import { Line, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;

/**
 * http://vue-chartjs.org/#/home?id=reactive-data
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
