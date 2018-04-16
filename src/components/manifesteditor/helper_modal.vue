<template>
    <div :class="'modal fade modal'+modalSize"  v-bind:id="modalProp.id" role="dialog">
      <div class="modal-dialog modal-lg">
          <slot name="body"  ></slot>
      </div> 
    </div>
</template>

<script>
export default {
  props: ["modalProp", "modalSize"],
  data() {
    return {};
  }
};
</script>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>
