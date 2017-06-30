<template>
  <div class="collapse is-fullwidth">
    <slot></slot>
  </div>
</template>

<script>
export default {
  computed: {
    $collapseItems () {
      return this.$children.filter(child => child._isCollapseItem)
    }
  }
}
</script>
<style lang="scss" scoped>
.collapse {
    margin-top: 10vh;
    margin-left: 70vw;
    position: fixed;
    z-index: 1;
}

.collapse.is-fullwidth {
  width: 100%;
}
</style>

