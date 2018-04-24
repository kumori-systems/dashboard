<template>
  <div>
    <div
      v-for="(alert, index) in getAlerts"
      :key="index"
      :class="alert.type"
      class="alert alert-dismissable">
      <button
        :id="index"
        type="button"
        aria-hidden="true"
        class="close"
        @click="deleteAlert(index)">
        ×
      </button>
      {{ $t('notify.' + alert.text) + " " + alert.extra }}
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  computed: {
    getAlerts() {
      return this.$store.getters.getAlerts;
    }
  },
  methods: {
    deleteAlert(alert) {
      this.$store.dispatch("deleteAlert", alert);
    }
  }
}
</script>
<!--
  There is a bug in which relative css paths are not correctly solved
  https://github.com/vuejs-templates/webpack/issues/932
-->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>