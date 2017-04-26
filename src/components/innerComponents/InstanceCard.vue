<template>
    <div class="card">
        <div class="card-header title" v-bind:class="state">

            <span class="card-header-left">{{name}}</span>
            <span class="card-header-right"></span>

        </div>
        <div class="card-body">

            <span>

                <!-- resources -->
                <span>MEM</span>
                <span>CPU</span>
                <span>NET</span>

                <!-- kill instance -->
                <input type="checkbox" id="killInstance">
                <label for="killInstance">kill instance</label>


                

            </span>
            <!--chart-->     
            <chart v-bind:type="'line'" v-bind:width=100 v-bind:height=100 v-bind:data="data" v-bind:options="options"></chart>
                 
            
        </div>
        <div class="card-footer" v-if="false"/>

    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import Chart from 'vue-bulma-chartjs/src/Chartjs.vue';

@Component({
    name: 'rol-card',
    props: {
        state: String,
        name: String
    },
    components: {
        'collapse': Collapse,
        'collapse-item': CollapseItem,
        'chart': Chart
    }
})
export default class Card extends Vue {
    data ={
        datasets: [{
            label: 'mylabel',
            backgroundColor:'green',
            data:[
                { x:0, y:2 },
                { x:1, y:1 }
                ]
        },{
            label: 'mylabel2',
            backgroundColor:'yellow',
            data:[
                { x:0, y:1 },
                { x:1, y:3 }
                ]
        },
        {
            label: 'mylabel3',
            backgroundColor:'red',
            data:[
                { x:0, y:2.4 },
                { x:1, y:1.5 }
                ]
        }]
    };
    options={
        tooltips:{mode:'label'},
          title:{
              text:"Hola mundo"
          },
          showLines:true,
          spanGaps:false,
    };

    mounted() { }
}
</script>

<style lang="scss">
$padding: 10px;

.card {
    padding: $padding;
    margin: $padding;
}

.title {
    padding: $padding;
}

.card-header-right {
    color: grey;
    padding-left: 10px;
}

.normal {
    background: green;
}

.warning {
    background: yellow;
}

.error {
    background: red;
}
</style>