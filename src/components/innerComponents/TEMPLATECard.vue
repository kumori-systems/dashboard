<template>
    <div class="card">
        <div class="card-header title"
             v-bind:class="state">
            <span class="card-header-left">{{title}}</span>
            <span class="card-header-right">{{identificador}}</span>
        </div>
        <div class="card-body">
            <p>Service: {{service}}</p>
            <div class="roles"
                 v-if="roles && roles.lenght">
                <p>Roles:</p>
                {{roles}}
            </div>
            <p>Website: {{website}}</p>
            <p>Links: {{links}}</p>
            <p>Volumes: {{volumes}}</p>
        </div>
        <div class="card-footer"
             v-if="false"></div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    name:'card',
    props: {
        state: String,
        title: String,
        identificador: String,
        service: String,
        roles: Object,
        website: String,
        links: String,
        volumes: String
    }
})
export default class Card extends Vue {
    mounted(){}
}
</script>

<style lang="scss">
$padding: 10px;

.card {
    padding: $padding;
    margin: $padding;
}

.title {
    padding: $padding;
}

.card-header-right {
    color: grey;
    padding-left:10px;
}

.normal {
    background: green;
}

.warning {
    background: yellow;
}

.error {
    background: red;
}
</style>