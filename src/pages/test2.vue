<template>
  <div></div>
</template>
<script>
export default {
  data() {
    return {
      showPicker: false,
      pickerIndex: [],
      pickerContent: [],
      val: ''
    }
  },
  created() {
    const temp = [
      { b: 2000, s: 100, u: '年' },
      { b: 1, s: 12, u: '月' },
      { b: 1, s: 30, u: '日' }
    ]
    temp.forEach(item => {
      this.pickerIndex2.push(Math.floor(Math.random() * item.s))
      this.pickerContent2.push(this.generateData(item.b, item.s, item.u))
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
    }
  }
}
</script>