<template>
    <div>
        <p>OverView</p>
        <card title="Mi titulo" content="mi contenido" color="yellow"/>
        <card title="Segunda" content="segunda carta" color="red"/>
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