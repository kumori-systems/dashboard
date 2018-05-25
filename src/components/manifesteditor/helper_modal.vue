<template>
  <div
    :class="'modal fade modal'+modalSize"
    :id="modalProp.id"
    role="dialog">
    <div class="modal-dialog modal-lg">
      <slot name="body"/>
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
<style scoped src="__static__/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="__static__/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="__static__/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="__static__/css/sb-admin-2/sb-admin-2.css"></style>
<style scoped src="__static__/css/graph-creator.css"></style>
