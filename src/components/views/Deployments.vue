<template>
    <div>
        <p>Service: ServiceName</p>
        <p>Connected to: ServChan1 -> "otherdeployment-2"</p>
        <rol-card
            state="normal"
            nombre="miRol1"
            numInstancias=1
            id="idDeMiRol1"
            runtime="Runtime1"/>
        <rol-card
            state="warning"
            nombre="miRol2"
            numInstancias=2
            id="idDeMiRol21"
            runtime="Runtime1"/>
        <rol-card
            state="error"
            nombre="miRol3"
            numInstancias=4
            id="idDeMiRol31"
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
export default class Deployments extends Vue{



}
</script>
<style lang="scss">

</style>