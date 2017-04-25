<template>
    <div>
        <span class="title">Active deployments</span>
            <collapse class="tile">
                <collapse-item>
                    <p><router-link v-bind:to="'/deployments'">Deploy a new HTTP Entrypoint</router-link></p>
                    <p><router-link v-bind:to="'/deployments'">Deploy a new Web Service</router-link></p>
                    <p><router-link v-bind:to="'/deployments'">Deploy a new service (advanced mode)</router-link></p>
                </collapse-item>
            </collapse>

            <input type="checkbox" id="hideEntryPoints" v-model="hideEntrypoints"/>
            <label for="hideEntryPoints" v-on:click="hideEntrypoints=!hideEntrypoints"> Hide HTTP entrypoints</label>

            <div class="tile">
                <deployment-card v-for="deployment in deploymentList"
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
            <div class="tile">
                <deployment-card v-for="deployment in deploymentList"
                    v-bind:key="deployment.service"
                    v-bind:state="'warning'"
                    v-bind:title="'mi titulo'"
                    v-bind:identificador="'mi identificador'"
                    v-bind:service="deployment.service"
                    v-bind:roles="deployment.roles"
                    v-bind:website="'mi website'"
                    v-bind:links="'mis links'"
                    v-bind:volumes="'mis volumenes'" />
            </div>
            <div class="tile">
                <deployment-card v-for="deployment in deploymentList"
                    v-bind:key="deployment.service"
                    v-bind:state="'error'"
                    v-bind:title="'mi titulo'"
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
    //data 
    hideEntrypoints = false;

    // computed
    get deploymentList(){
        let res = this.$store.getters.getDeploymentList;
        console.log('Overview deployment list contiene: ' + JSON.stringify(res));
        return res;
    }
    // lifecycle hook
    beforeMount(){
        // Enviamos una petición para obtener los deployments antes de que el componente se monte
        this.$store.dispatch('getDeployments');
    }
    mounted () {}
}
</script>
<style lang="scss">
.tile.is-child {
  width: 100%;
  height:100%;
}
</style>