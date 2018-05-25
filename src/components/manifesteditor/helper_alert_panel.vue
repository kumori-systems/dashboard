<template>
  <div class="alertpan">
    <div class="modal-backdrop fade in custumeFade"></div>
    <div class="panel panel-yellow alertModal">
      <div class="panel-heading">
        {{$t('panel.warning.title')}}
      </div>
      <div class="panel-body black--text">
        <p>
          {{$t('panel.warning.text')}}
        </p>
      </div>
      <div class="panel-footer">
        <button
          type="button"
          class="btn btn-success"
          @click="emit(true)"> 
          <i class="fa fa-check"/> {{ $t('panel.warning.buttons.accept') }}
        </button>
        <button
          type="button"
          class="btn btn-default pull-right white--text"
          @click="emit(false)">
          <i class="fa fa-times"/> {{ $t('panel.warning.buttons.deny') }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: [],
  data() {
    return {};
  },
  methods: {
    alertResult(payload) {
      this.$store.dispatch("alertResult", payload);
    },
    emit(param) {
      this.alertResult(param);
    }
  }
};
</script>
<style scoped src="__static__/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="__static__/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="__static__/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="__static__/css/sb-admin-2/sb-admin-2.css"></style>
<style scoped src="__static__/css/graph-creator.css"></style>

