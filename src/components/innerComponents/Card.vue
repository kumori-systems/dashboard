<template>
    <base-card class="card"
               v-bind:icon="'angle-right'"
               v-bind:title="title"
               v-bind:class="color"
               v-bind:content="'Hola mundo!!'">
               <card-content-item slot="content"
                          v-bind:href="'https://github.com'">Hola cara cola
               </card-content-item>
    </base-card>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { BaseCard, CardFooterItem } from 'vue-bulma-card'

@Component({
    name: 'card',
    components: {
        'base-card':BaseCard,
        'card-footer-item':CardFooterItem
    },
    props:['title','color','service', 'website','roles']
})
export default class Card extends Vue {
    content ="<p>'Service: '{{service}}</p><div class='roles'><p>'Roles: '</p>{{roles}}</div><p>'Website: '{{website}}</p><div class='links'><p>'Links: '</p>{{links}}</div>";
}
</script>
<style lang="scss">
.yellow .card-header {
    background: yellow;
}

.red .card-header {
    background: red;
}

.card {
    padding: 10px;
    margin: 10px;
}
</style>