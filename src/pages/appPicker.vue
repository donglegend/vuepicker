<template>
  <div class="page">
    <ul>
      <li>
        <label>单列picker:</label>
        <input type="text" readonly :value="val.name" placeholder="请选择年份" @click="showPicker = true" />
      </li>
      <li>
        <label>多列picker:</label>
        <input type="text" readonly :value="val2" placeholder="请选择时间" @click="showPicker2 = true" />
      </li>
      <li>
        <label>级联picker:</label>
        <input type="text" readonly :value="val3" placeholder="请选择时间" @click="showPicker3 = true" />
      </li>
    </ul>

    <mfw-picker :visible="showPicker" v-on:hide="onHide" :indexs="pickerIndex" :data="pickerContent" @change="pickChange">
      <template slot-scope="props">
        <span class="itemfz">{{props.item.name}}</span>
      </template>
    </mfw-picker>

    <mfw-picker :visible="showPicker2" v-on:hide="showPicker2 = false" :indexs="pickerIndex2" :data="pickerContent2" @change="pickChange2">
      <template slot-scope="props">
        <span class="itemfz">{{props.item.name}}</span>
      </template>
    </mfw-picker>

    <mfw-picker :visible="showPicker3" v-on:hide="showPicker3 = false" :indexs="pickerIndex3" :data="pickerContent3" @change="pickChange3" :cascade="true">
      <template slot-scope="props">
        <span class="itemfz">{{props.item.name}}</span>
      </template>
    </mfw-picker>
  </div>
</template>
<script>
import mfwPicker from '../mfw-picker/Picker'
import provinces from '../data/mfwpicker.js'
export default {
  data() {
    return {
      showPicker: false,
      pickerIndex: 2,
      pickerContent: [],
      val: '',

      showPicker2: false,
      pickerIndex2: [],
      pickerContent2: [],
      val2: '',

      showPicker3: false,
      pickerIndex3: [0, 3, 4],
      pickerContent3: [],
      val3: ''
    }
  },
  components: {
    mfwPicker
  },
  created() {
    // 第一个picker  data
    let num = 20
    let year = 2000
    while (num--) {
      this.pickerContent.push({
        name: `${year++}年`,
        id: 20 - num
      })
    }

    // 第二个picker  data
    const temp = [
      { b: 2000, s: 100, u: '年' },
      { b: 1, s: 12, u: '月' },
      { b: 1, s: 30, u: '日' }
      // { b: 1, s: 24, u: '时' },
      // { b: 1, s: 60, u: '分' }
    ]
    temp.forEach(item => {
      this.pickerIndex2.push(Math.floor(Math.random() * item.s))
      this.pickerContent2.push(this.generateData(item.b, item.s, item.u))
    })

    // 第三个picker data
    const citys = provinces.map(item => ({
      name: item.provinceName,
      value: item.provinceName,
      children: item.citys.map(element => ({
        name: element.citysName,
        value: element.citysName
      }))
    }))

    this.pickerContent3.splice(0, 1, {
      name: '中国',
      value: 'china',
      children: citys
    })
  },
  methods: {
    generateData(_base, _size, unit) {
      let base = _base
      let size = _size
      const arr = []
      while (size--) {
        arr.push({
          name: `${base++}${unit}`
        })
      }
      return arr
    },
    pickChange(d) {
      this.val = d
    },
    pickChange2(d) {
      this.val2 = d.map(item => item.name).join('')
    },
    pickChange3(d) {
      this.val3 = d.map(item => item.name).join('')
    },
    onHide() {
      this.showPicker = false
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  font-size: 18px;
}
li {
  margin: 8px 4px;
}
input {
  // text-decoration: underline;
  outline: none;
  border: none;
  padding: 8px 4px;
  border: 1px #cccccc solid;
}
</style>
