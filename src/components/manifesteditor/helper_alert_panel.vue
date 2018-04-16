<template>
  <div class="alertpan">
    <div class="modal-backdrop fade in custumeFade"></div>
    <div class="panel panel-yellow alertModal">
      <div class="panel-heading">
        {{$t('panel.warning.title')}}
      </div>
      <div class="panel-body">
        <p>{{$t('panel.warning.text')}}</p>
      </div>
      <div class="panel-footer">
        <button  type="button" class="btn btn-success" @click="emit(true)">  <i class="fa fa-check"></i> {{ $t('panel.warning.buttons.accept') }}</button>
        <button type="button" class="btn btn-default pull-right"  @click="emit(false)">  <i class="fa fa-times"></i>  {{ $t('panel.warning.buttons.deny') }} </button>
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
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>

