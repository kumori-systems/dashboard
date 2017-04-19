<template>
    <div>
        <p>OverView</p>
        <div class="tile">
            <card state="error"
                  title="mi segundo! titulo"
                  identificador="identificador"
                  service="mi servicio"
                  roles="mis roles"
                  website="mi website"
                  links="mis links"
                  volumes="mis volumenes" />
    
            <card state="normal"
                  title="mi titulo"
                  identificador="identificador"
                  service="mi servicio"
                  roles="mis roles"
                  website="mi website"
                  links="mis links"
                  volumes="mis volumenes" />
    
            <card state="warning"
                  title="mi segundo! titulo"
                  identificador="identificador"
                  service="mi servicio"
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

import Card from './../innerComponents/Card.vue'

@Component({  
    name: 'Overview',
    components:{
        'card': Card
    }
})
export default class Overview extends Vue{

}
</script>
<style lang="scss">

</style>