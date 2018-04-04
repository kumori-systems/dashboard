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

