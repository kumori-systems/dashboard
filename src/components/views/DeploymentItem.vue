<template>
    <div>
        <p class="title">{{deploymentName}}</p>
        <p>Service: {{serviceName}}</p>
        <p>Connected to: {{connectedTo}}</p>
    
        <p>Aquí va la rol card</p>
        <rol-card v-for="rol in rols" v-bind:key="rol.name" state="normal" v-bind:nombre="rol.name" v-bind:numInstancias="rol.numInstances" v-bind:id="rol.id" v-bind:runtime="rol.runtime" />
        <p>Aquí acaba la rol card</p>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import RolCard from './../innerComponents/RolCard.vue';

@Component({
    name: 'DeploymentItem',
    components: {
        'rol-card': RolCard
    },
    props: {
        rols:Object
    }
})
export default class DeploymentItem extends Vue {
    rols: Object = this.rols;

    get deploymentName() {
        return this.$route.params.deploymentId;
    }
    get serviceName() {
        return 'serviceName';
    }
    get connectedTo() {
        return 'ServChan1 -> "otherdeployment-2"';
    }

    mount(){
        console.log('Tenemos roles?' +JSON.stringify(this.rols));
    }
}
</script>
<style lang="scss">

</style>