<template>
    <div id="footerbar">
        Esto es el footerbar
    </div>
</template>

<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'

@Component
   // {name: 'footer-bar'}

export default class FooterBar extends Vue{

}
</script>
<style lang="scss">
#footerbar{
     margin-left: 180px;
}
</style>