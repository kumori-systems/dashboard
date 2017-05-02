<template>
    <div>
        <p class="title">{{deploymentId}}</p>
        <p>Service: {{serviceName}}</p>
        <p>Connected to: {{connectedTo}}</p>
        <rol-card v-for="rol in rols" v-bind:key="rol.name" state="normal" v-bind:nombre="rol.name" v-bind:numInstancias="rol.numInstances" v-bind:id="rol.id" v-bind:runtime="rol.runtime" />
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
        deploymentId: String
    }
})
export default class DeploymentItem extends Vue {
    deploymentId: string = this.deploymentId;

    get rols() {
        return this.$store.getters.getRols(this.deploymentId);
    }

    get serviceName() {
        return 'serviceName';
    }
    get connectedTo() {
        return 'ServChan1 -> "otherdeployment-2"';
    }
}
</script>
<style lang="scss">

</style>