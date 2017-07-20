<template>
    <div id="footerbar">
    </div>
</template>

<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    name: 'footer-bar'
})
export default class FooterBar extends Vue{

}
</script>
<style lang="scss" scoped>
$default_padding:10px;
$default_margin_left:180px;
#footerbar{
    padding: $default_padding;
    margin-left: $default_margin_left;
    text-align:center;
}
</style>