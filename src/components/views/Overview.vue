<template>
    <div>
        <p>OverView</p>
        <div class="tile">
            <card v-for="deployment in deploymentList"
                  v-bind:key="deployment.service"
                  state="error"
                  title="mi titulo"
                  identificador="identificador"
                  service=deployment.service
                  roles="mis roles"
                  website="mi website"
                  links="mis links"
                  volumes="mis volumenes" />
        </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'

// Componentes
import Card from './../innerComponents/Card.vue'

// Dependencias
import { Deployment, getDeployments } from './../../connection'

@Component({  
    name: 'Overview',
    components:{
        'card': Card
    }
})
export default class Overview extends Vue{
    // data
    deploymentList:Deployment[]=[];

    // lifecycle hook
    beforeMount(){}
    mounted () {
        getDeployments().then(function({ deploymentList }){
            this.deploymentList = deploymentList;

            console.log('Ejecutamos el final de la promesa');
            console.log('y deploymentList contiene: ' + deploymentList);
        });
    }
}
</script>
<style lang="scss">

</style>