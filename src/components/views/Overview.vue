<template>
    <div>
        <p>OverView</p>
        <div class="tile">
            <card v-for="deployment in deploymentList"
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
import Card from './../innerComponents/Card.vue'

@Component({  
    name: 'Overview',
    components:{
        'card': Card
    }
})
export default class Overview extends Vue{
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

</style>