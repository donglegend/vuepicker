<template>
  <transition name="ant-picker-fade">
    <ant-popup type="picker" :mask="true" :center="false" :z-index="9999" v-show="showDialog" @touchmove.prevent @mask-click="dispatch(EVENT.HIDE)">
      <transition name="ant-picker-move">
        <div v-show="showDialog">
          <div class="mh-select-options">
            <div class="mh-select-options-title">
              <div class="mh-selece-options-cancle" @click="handleCancle">取消</div>
              <div class="mh-selece-options-comfirm" @click="handleConfirm">确定</div>
            </div>
          </div>
          <div class="mh-picker-box" v-if="showDialog" :class="pickerBoxClass">
            <div class="mh-picker-item" :class="pickerItemClass" v-for="(item,pIndex) in pickerContent" :key="pIndex" :style="styles[pIndex]">
              <base-picker :index="pickerIndex[pIndex]" :content="pickerContent[pIndex]" @change="pickChange($event, pIndex)">
                <template slot-scope="props">
                  <slot :item="props.item"></slot>
                </template>
              </base-picker>
            </div>
          </div>
        </div>
      </transition>
    </ant-popup>
  </transition>
</template>
<script>
// import MhDialog from '../Dialog/Dialog';
import antPopup from '../popup/popup.vue'
import BasePicker from './BasePicker'

export default {
  name: 'mfw-picker',
  props: {
    cascade: {
      type: Boolean,
      default: false
    },
    indexs: {
      type: Array | String,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    columnWidth: {
      type: Array,
      default: () => []
    },
    pickerItemClass: {
      type: Array,
      default: () => []
    },
    pickerBoxClass: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      EVENT: {
        CHANGE: 'change',
        HIDE: 'hide'
      },
      pickerIndex: [],
      pickerContent: [],
      pickerValue: [],
      isSingleCol: false,
      showDialog: this.visible,
      oldPickerIndex: [],
      oldPickerValue: []
    }
  },
  computed: {
    // pickerValue() {},
    /**
     * 设置 宽度样式，默认 flex: 1
     */
    styles() {
      const _style = []
      for (let i = 0; i < this.pickerContent.length; i++) {
        let _temp
        if (this.columnWidth[i]) {
          _temp = { width: this.columnWidth[i] }
        } else {
          _temp = { flex: 1 }
        }
        _style.push(_temp)
      }
      return _style
    }
  },
  components: {
    BasePicker,
    antPopup
    // MhDialog
  },
  watch: {
    indexs(v) {
      this.initData()
    },
    data(v) {
      this.initData()
    },
    visible(v) {
      this.showDialog = v
      this.oldPickerIndex = clone(this.pickerIndex)
      this.oldPickerValue = clone(this.pickerValue)
    }
  },
  methods: {
    /**
     * 初始化 列表数据，对单列或者 级联做特殊处理转化
     * 如果不是级联，直接渲染，设置初始值
     * 如果是 级联，那么做级联数据转换
     */
    initData() {
      this.pickerIndex = clone(this.indexs)
      this.isSingleCol = false // 初始默认 多列
      if (!this.cascade) {
        if (!Array.isArray(this.pickerIndex) || !Array.isArray(this.data[0])) {
          // 单列数据格式
          this.isSingleCol = true
          this.pickerIndex = [this.pickerIndex]
          this.pickerContent = [clone(this.data)]
        } else {
          this.pickerContent = clone(this.data)
        }
      } else {
        this.getCascadeContents()
      }
      this.updatePickerVal()
    },
    /**
      级联数据转换，获取 子列表
      data: 数据列表
      res: 保存结果列表数组
      activeIndex: 当前第几列数据
     */
    getChild(data, res = [], activeIndex = 0) {
      const arr = []
      for (let i = 0, len = data.length; i < len; i++) {
        const item = data[i]
        let _curi = 0 // 子列表第几列的值,默认0
        arr.push(clone(item, ['children']))
        /**
         * 确定获取 那一列的 值需要递归处理获取
         */
        if (
          this.pickerIndex[activeIndex] !== undefined &&
          typeof this.pickerIndex[activeIndex] === 'number'
        ) {
          _curi = this.pickerIndex[activeIndex]
        }
        /**
         * 如果有子元素，可能需要递归，具体递归子元素那一项，根据index决定
         */
        if (
          item.children &&
          Array.isArray(item.children) &&
          item.children.length
        ) {
          /**
           * 可能传入索引超出 数据长度，做修正处理
           */
          if (_curi > data.length - 1) {
            _curi = 0
          }
          /**
           * 此列符号条件，做递归处理
           */
          if (i === _curi) {
            this.getChild(item.children, res, activeIndex + 1)
          }
        }
      }
      res.unshift(arr)
      return res
    },
    /**
     * 级联数据转换
     */
    getCascadeContents() {
      // const res = [];
      const res = this.getChild(this.data)
      this.pickerContent = res
      // this.updatePickerVal(); 应该是多调用了一次，暂时注销
    },
    /**
     * 监听值改变
     */
    pickChange(data, id) {
      if (data.index !== this.pickerValue[id].index) {
        this.pickerIndex.splice(id, 1, data.index)
        if (this.cascade) {
          // this.pickerIndex.splice(id, 1, data.index);
          this.getCascadeContents()
          this.updatePickerVal() // 级联需要更新下一列的数据值
        } else {
          this.pickerValue[id] = data
          // this.pickerIndex.splice(id, 1, data.index);
        }
        // this.dispatch(this.pickerValue);
        // this.$emit('change', this.pickerValue);
      }
    },
    /**
     * 更新列表选择的值
     */
    updatePickerVal() {
      const arr = []
      if (this.pickerContent.length > 0) {
        const len = this.pickerContent.length
        for (let i = 0; i < len; i++) {
          let _i = 0
          if (this.pickerIndex[i] < this.pickerContent[i].length) {
            _i = this.pickerIndex[i]
          }
          arr[i] = { index: _i, val: this.pickerContent[i][_i] }
        }
      }
      this.pickerValue = arr
      // this.dispatch(arr);
      // this.$emit('change', arr);
    },
    /**
     * 对外派发事件，包括 hide, change 事件
     */
    dispatch(event, payload) {
      if (!event) return
      let _payload = payload
      if (payload && Array.isArray(payload)) {
        _payload = payload.map(item => item.val)
      }
      if (event === this.EVENT.CHANGE && this.isSingleCol) {
        _payload = _payload && _payload[0]
      }
      this.$emit(event, _payload)
    },
    /**
     * 取消，还原 list 列表值
     */
    handleCancle() {
      this.dispatch(this.EVENT.HIDE)
      this.pickerIndex = clone(this.oldPickerIndex)
      this.pickerValue = clone(this.oldPickerValue)
    },

    handleConfirm() {
      this.dispatch(this.EVENT.HIDE)
      this.dispatch(this.EVENT.CHANGE, this.pickerValue)
    }
  },
  created() {
    console.log('picker created')
    console.log(this.indexs)
    console.log(this.pickerIndex)
    this.initData()
  },
  mounted() {
    // this.visible = true;
  }
}

function clone(obj, ignoreList = []) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  const copy = Array.isArray(obj) ? [] : {}
  Object.keys(obj).forEach(key => {
    if (ignoreList.indexOf(key) === -1) {
      copy[key] = clone(obj[key])
    }
  })
  return copy
}
</script>

<style lang="scss">
.mh-picker-box {
  display: flex;
  background: #ffffff;
}

.mh-select-options-title {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 45px;
  line-height: 45px;
  font-size: 18px;
  font-weight: 400;
  // border-top: 1px solid $color-gray-cd;
  border-bottom: 1px solid #e5e5e5;
  background-color: #f8f8f8;
}
.mh-selece-options-cancle {
  padding: 0 15px;
  color: #c1c1c1;
}
.mh-selece-options-comfirm {
  padding: 0 15px;
  color: #0c8ae0;
}

.ant-picker-fade-enter {
  opacity: 0;
}
.ant-picker-fade-leave-active {
  opacity: 0;
  transition: all 0.3s ease-in-out;
}
.ant-picker-fade-enter-active {
  transition: all 0.3s ease-in-out;
}
.ant-picker-move-enter {
  transform: translate3d(0, 800px, 0);
}
.ant-picker-move-leave-active {
  transform: translate3d(0, 800px, 0);
  transition: all 0.3s ease-in-out;
}
.ant-picker-move-enter-active {
  transition: all 0.3s ease-in-out;
}
</style>
