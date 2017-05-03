<template>
    <div class="card">
        <div class="card-header title normal"
             v-bind:class="state">
            <span class="card-header-left">{{nombre}}</span>
            <span class="card-header-right">{{numInstancias}} Instances</span>

            <!-- Botones para añadir y quitar instancias -->
            <span class="tile">
                <button class="fa fa-angle-up fa-lg" v-on:click="addInstance"/>
                <button class="fa fa-angle-down fa-lg" v-on:click="removeInstance"/>
            </span>
        </div>
        <div class="card-body">
            <p>Id: {{id}}</p>
            <p>Runtime: {{runtime}}</p>

            <span>
                <button>CPU</button>
                <button>MEM</button>
                <button>RED</button>
            </span>
            <p>Connected to: RepChan -> Worker ReqChan</p>
            <div class="tile is-parent is-4">
                <chart v-bind:type="'line'" v-bind:data="data" v-bind:options="options"></chart>
        </div>
             <collapse>
                <collapse-item title="View instances">
                    <instance-card name="myInstanceName" state="normal"/>
                </collapse-item>
            </collapse>
        </div>
        <div class="card-footer"
             v-if="false"></div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Collapse, Item as CollapseItem}from 'vue-bulma-collapse';
import InstanceCard from './InstanceCard.vue';
import Chart from 'vue-bulma-chartjs/src/Chartjs.vue';

@Component({
    name:'rol-card',
    props: {
        state: {required:true, type: String},
        nombre: {required:true, type: String},
        numInstancias: {required:true, type: Number},
        id: {required:true, type: String},
        runtime: {required:true, type: String}
    },
    components:{
        'collapse':Collapse,
        'collapse-item':CollapseItem,
        'instance-card':InstanceCard,
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

    // return this.$store.getters.getDeploymentList;
    addInstance = function(){
        console.log('Entramos en addInstance');
        this.$store.dispatch('addInstance',{rol:this.nombre});
        console.log('Después de llamar a la store');
    };
    removeInstance= function(){
        console.log('Entramos en removeInstance');
        this.$store.dispatch('removeInstance',{rol:this.nombre});
    };
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
    padding-left:10px;
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