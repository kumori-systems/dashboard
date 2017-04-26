<template>
    <div>
        <p>Service: ServiceName</p>
        <p>Connected to: ServChan1 -> "otherdeployment-2"</p>
        <rol-card
            state="normal"
            nombre="miRol1"
            v-bind:numInstancias=1
            id="idDeMiRol1"
            runtime="Runtime1"/>
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
    }
})
export default class Deployments extends Vue{}
</script>
<style lang="scss">
</style>