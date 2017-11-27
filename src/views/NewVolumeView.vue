<template>
    <div>
        <p>NEW VOLUME RESERVATION</p>
        <div class="tile is-4">
            <span>Prefix:</span>
            <input class="input" v-model="prefix">
        </div>
        <div class="tile is-4">
            <span>Number of Chunks:</span>
            <number-input class="tile is-2" v-bind:value="chunkNum" v-on:input="updateInputValue"></number-input>
        </div>
        <div class="tile is-4" v-for="n in chunkNum" v-bind:key="n">
            <span>Chunk {{n}}:</span>
            <number-input class="tile is-2" v-bind:value="chunkSize(n)" v-bind:numElement="n" v-on:input="updateInputValue"></number-input>
            <span>GB</span>
        </div>
        <div>Size: {{totalGB}}GB</div>
        <button class="button is-primary" v-on:click="addDataVolume" v-bind:disabled="prefix.length<=0">ADD</button>
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

@VueClassComponent({
  name: "new-volume-view",
  components: {}
})
export default class NewVolumeView extends Vue {
  prefix: string = "";
  chunkNum: number = 1;
  size: Array<number> = [0, 1];
  totalGB: number = 1;

  get chunkSize() {
    return chunkIndex => {
      return this.size[chunkIndex];
    };
  }

  set chunkSize(chunkIndex) {
    value => {
      this.size[chunkIndex(1)] = value;
    };
  }

  addDataVolume() {
    this.size.shift(); // Eliminamos el 0 inicial
    let params = {
      prefix: this.prefix,
      chunks: this.size
    };
    this.size = [0].concat(this.size); // Restauramos el 0 inicial
    this.$store.dispatch("addDataVolume", params);
    this.$router.push("/dataVolumes");
  }

  updateInputValue(value) {
    let index, propertyType, newValue;
    [index, propertyType, newValue] = value;

    if (index == null) {
      this.chunkNum = newValue;
      this.totalGB = newValue;
    } else {
      this.size[index] = newValue;
      let res = 0;
      for (let i = 1; i < this.size.length; i++) {
        res += this.size[i];
      }
      this.totalGB = res;
    }
  }
}
</script>