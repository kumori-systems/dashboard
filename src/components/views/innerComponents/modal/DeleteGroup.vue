<template>
    <vue-modal v-bind:visible="visible" v-on:close="close">
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">
                    <span>Are you </span>
                    <strong>ABSOLUTELY</strong>
                    <span> sure?</span>
                </p>
                <button class="delete" @click="close"></button>
            </header>
            <section class="modal-card-body">
                <p>
                    <span>This action <strong>CAN'T BE UNDONE</strong> and will </span>
                    <strong>ERASE</strong>
                    <p v-for="element in elementList" v-bind:key="element[0]"> the version {{element[3]}} of the {{element[1]}} {{element[2]}}</p>
                </p>
            </section>
            <a class="button is-primary is-danger" v-on:click="deleteGroup">Delete group</a>
        </div>
    </vue-modal>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import vueModal from 'vue-bulma-modal/src/Modal.vue';

@Component({
    name: 'modal',
    components: {
        'vue-modal': vueModal
    },
    props: {
        visible: { required: true, type: Boolean },
        elementList: { required: true }
    }
})
export default class Modal extends Vue {
    visible: boolean = this.visible;
    // id, tipo, elemento, version
    elementList: Array<[string, string, string, string]> = this.elementList;

    close() {
        this.$emit('close');
    }
    deleteGroup() {
        // De la lista de elementos únicamente queremos el id
        let res = [];
        for (let element in this.elementList) {
            res.push(this.elementList[element][0]);
        }
        this.$store.dispatch('deleteElement', res);
        this.close();
    }
}
</script>