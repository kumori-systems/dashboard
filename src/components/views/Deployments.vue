<template>
    <div>
        <p class="title">{{deploymentName}}</p>
        <p>Service: {{serviceName}}</p>
        <p>Connected to: {{connectedTo}}</p>

        <rol-card v-for="rol in rols"
            state="normal"
            v-bind:nombre="rol.name"
            v-bind:numInstancias="rol.numInstances"
            v-bind:id="rol.id"
            v-bind:runtime="rol.runtime"/>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import RolCard from './../innerComponents/RolCard.vue';

@Component({
    name: 'Deployments',
    components:{
        'rol-card': RolCard
    },
    props:{
        rol: Object
    }
})
export default class Deployments extends Vue{
    get deploymentName(){
        return 'Deployment Name';
    }
    get serviceName(){
        return 'serviceName';
    }
    get connectedTo(){
        return 'ServChan1 -> "otherdeployment-2"';
    }
}
</script>
<style lang="scss">
</style>