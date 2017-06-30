import { Line, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;

export default Line.extend({
  props: ['options'],
  mixins: [reactiveProp],
  mounted() {
    this.renderChart(this.chartData, this.options);
  }
});
