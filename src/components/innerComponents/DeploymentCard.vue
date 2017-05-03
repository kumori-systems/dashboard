<template>
    <div class="card">
        <div class="card-header title" v-bind:class="state">
            <span class="card-header-left">{{title}}</span>
            <span class="card-header-right">{{identificador}}</span>
        </div>
        <div class="card-body">
            <p><u>Service:</u> {{service}}</p>
            <div class="roles" v-if="roles">
                <p><u>Roles:</u></p>
                <div v-for="rol, key in roles" class="rol">
                    <span>
                    <strong>{{key}}</strong><span class="right">{{getNumInstances(rol)}}</span>
                    </span>
                    <p>{{rol.entrypoint.domain}}</p>
                </div>
            </div>
            <p><u>Website:</u> {{website}}</p>
            <p><u>Links:</u> {{links}}</p>
            <p><u>Volumes:</u> {{volumes}}</p>
        </div>
        <div class="card-footer" v-if="false" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Rol } from '../../connection';

@Component({
    name: 'deployment-card',
    props: {
        state: { required: true, type: String },
        title: { required: true, type: String },
        identificador: { required: true, type: String },
        service: { required: true, type: String },
        roles: { required: true, type: Rol },
        website: { required: true, type: String },
        links: { required: true, type: String },
        volumes: { required: true, type: String }
    }
})
export default class Card extends Vue {
    roles: Rol = this.roles;

    /**
     * Método para obtener el número de instáncias de un rol
     * */
    getNumInstances(rol): number{
        let res = 0;
        for (let key in rol.instances)res++;
        return res;
    }
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
.rol{
    padding-left: $padding;
}

.card-header-right {
    color: grey;
    padding-left: padding;
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