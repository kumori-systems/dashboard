<template>
    <modal v-bind:visible="visible" v-on:close="close" v-bind:primaryButtonText="primaryButtonText" v-bind:primaryButtonClass="primaryButtonClass" v-bind:primaryButtonCallback="primaryButtonCallback">
        <div slot="title">
            <span>Are you </span>
            <strong>ABSOLUTELY</strong>
            <span> sure?</span>
        </div>
        <div slot="body">
            <span>This action
                <strong>CAN'T BE UNDONE</strong> and will </span>
            <strong>ERASE</strong>
            <p v-for="element in elementList" v-bind:key="element[0]"> the version {{element[3]}} of the {{element[1]}} {{element[2]}}</p>
        </div>
    </modal>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Modal from './Modal.vue';

@Component({
    name: 'delete-group-modal',
    components: {
        'modal': Modal
    },
    props: {
        visible: { required: true, type: Boolean },
        elementList: { required: true }
    }
})
export default class DeleteGroupModal extends Vue {
    visible: boolean = this.visible;
    // id, tipo, elemento, version
    elementList: Array<[string, string, string, string]> = this.elementList;
    primaryButtonText: string = "Delete";
    primaryButtonCallback: Function = () => {
        let res = [];
        for (let element in this.elementList) {
            res.push(this.elementList[element][0]);
        }
        this.$store.dispatch('deleteElement', res);
        this.close();
    };
    primaryButtonClass: string = 'is-danger';

    close() {
        this.$emit('close');
    }
}
</script>