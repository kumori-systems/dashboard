<template>
    <div class="card">
        <div class="card-header title"
             v-bind:class="state">
            <span class="card-header-left">{{nombre}}</span>
            <span class="card-header-right">{{numInstancias}}</span>
            <!-- Faltan botones para añadir y quitar instancias -->
            <!-- Falta círculo de estado -->
        </div>
        <div class="card-body">
            <p>Id: {{id}}</p>
            <p>Runtime: {{runtime}}</p>

            <span>
                <!-- Cuadraditos para memoria, cpu y red-->
            </span>
            <p>Connected to: RepChan -> Worker ReqChan</p>
             <collapse class="tile" title="View instances">
                <collapse-item>
                    <p>Instancia 1</p>
                    <p>Instancia 2</p>
                    <p>Instancia 3</p>
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

@Component({
    name:'rol-card',
    props: {
        state: String,
        nombre: String,
        numInstancias: Number,
        id: String,
        runtime: String
    },
    components:{
        'collapse':Collapse,
        'collapse-item':CollapseItem
    }
})
export default class Card extends Vue {
    mounted(){}
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