<template>
  <div class="page">
    <div>
      <label>单列picker:</label>
      <input type="text" readonly :value="val.name" placeholder="请选择年份" @click="showPicker = true" />
    </div>
    <dong-picker :visible="showPicker" v-on:hide="showPicker = false" :indexs="pickerIndex" :data="pickerContent" @change="pickChange">
      <template slot-scope="props">
        <span class="itemfz">{{props.item.name}}</span>
      </template>
    </dong-picker>
  </div>
</template>
<script>
export default {
  data() {
    return {
      showPicker: false,
      pickerIndex: 2,
      pickerContent: [],
      val: ''
    }
  },
  created() {
    let num = 20
    let year = 2000
    while (num--) {
      this.pickerContent.push({
        name: `${year++}年`,
        id: 20 - num
      })
    }
  },
  methods: {
    pickChange(v) {
      this.val = v
    }
  }
}
</script>