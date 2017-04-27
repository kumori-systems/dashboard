<template>
    <div>
        <input type="checkbox" id="hideEntryPoints" v-model="hideEntrypoints"/>
        <label for="hideEntryPoints" v-on:click="hideEntrypoints(null)"> Hide HTTP entrypoints</label>

        <div class="tile" v-for="deployment in deploymentList">
            <deployment-card 
                v-bind:key="deployment.service"
                v-bind:state="'normal'"
                v-bind:title="'HTTP Entrypoint'"
                v-bind:class="'entrypoint'"
                v-bind:identificador="'mi identificador'"
                v-bind:service="deployment.service"
                v-bind:roles="deployment.roles"
                v-bind:website="'mi website'"
                v-bind:links="'mis links'"
                v-bind:volumes="'mis volumenes'" />
        </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'

// Componentes
import DeploymentCard from './../innerComponents/DeploymentCard.vue'
import {Collapse, Item as CollapseItem}from 'vue-bulma-collapse'

@Component({  
    name: 'Overview',
    components:{
        'deployment-card': DeploymentCard,
        'collapse':Collapse,
        'collapse-item':CollapseItem
    }
})
export default class Overview extends Vue{
    // computed
    get deploymentList(){ // Obteniendo lista de deployments
        return this.$store.getters.getDeploymentList;
    }

    get hideEntrypoints(){
        return this.$store.getters.getHideEntrypoints;
    }

    set hideEntrypoints({}){
        this.$store.dispatch('hideEntrypoints', {});
    }

    // lifecycle hook
    beforeMount(){
        // Enviamos una petición para obtener los deployments antes de que el componente se monte
        this.$store.dispatch('getDeployments');
    }
}
</script>