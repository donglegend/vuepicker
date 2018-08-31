<template>
  <div class="mh-picker">
    <div class="mh-picker__mask"></div>
    <div class="mh-picker__indicator"></div>
    <div class="mh-picker__content" :style="{transform: 'translate3d(0px, ' + translateY + 'px, 0px)'}" :class="{'hastransition':hastransition}">
      <div class="mh-picker__content__item" :class="[...pickerContentListClass,pindex === currentIndex ? 'mh-picker_item_active': '']" :key="pindex" v-for="(item,pindex) in content ">
        <slot :item="item">{{item}}</slot>
      </div>
    </div>
  </div>
</template>

<script>
import transition from './lib/'

const { TouchInertial } = transition
const InertialMotion = TouchInertial

export default {
  name: 'mfw-base-picker',
  props: {
    index: {
      type: Number,
      default: 0
    },
    content: {
      type: Array,
      default: () => []
    },
    pickerContentListClass: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      hastransition: false,
      translateY: 0,
      maxSportThreshold: null,
      minSportThreshold: null,
      picker: null,
      currentIndex: this.index,
      oldIndex: this.index,
      itemHeight: 0,
      ITEMNUMS: 5,
      threshold: 80
    }
  },
  computed: {
    _itemHalfCount() {
      return Math.floor(this.ITEMNUMS / 2)
    }
  },
  watch: {
    index(val) {
      this.currentIndex = val
      this.setOps()
    },
    content() {
      this.setOps()
    }
  },
  methods: {
    emitChange() {
      const _val = this.content[this.currentIndex]
      this.$emit('change', {
        index: this.currentIndex,
        val: typeof _val === 'object' ? Object.assign({}, _val) : _val
      })
    },
    handleEnd() {
      try {
        this.hastransition = true
        // this.translateY超过了界值，产生了一个bug，原因在于，使用缓动曲线动画back超出了界值，紧接着再次触发 touch事件，马上停止了动画，在这里做安全容错处理
        this.translateY = Math.min(
          this.maxSportThreshold,
          Math.max(this.translateY, this.minSportThreshold)
        )
        const position = Math.round(this.translateY / this.itemHeight)
        this.translateY = position * this.itemHeight
        this.currentIndex = Math.abs(position - this._itemHalfCount)
        if (this.currentIndex !== this.oldIndex) {
          this.emitChange()
        }
        this.oldIndex = this.currentIndex

        setTimeout(() => {
          this.hastransition = false
        }, 200)
      } catch (error) {
        console.log(error.toString())
      }
    },
    setOps() {
      if (this.content.length < this.currentIndex + 1) {
        this.currentIndex = 0
        this.oldIndex = 0
      }
      this.emitChange()
      const elItem = this.$el.querySelector('.mh-picker__content__item')
      this.itemHeight = elItem.getBoundingClientRect().height
      this.translateY =
        (this._itemHalfCount - this.currentIndex) * this.itemHeight
      this.maxSportThreshold = this.itemHeight * this._itemHalfCount
      this.minSportThreshold =
        -(this.content.length - this._itemHalfCount - 1) * this.itemHeight
    },
    bindEvents() {
      this.picker = new InertialMotion(this.$el, {
        maxSportThreshold: this.maxSportThreshold,
        minSportThreshold: this.minSportThreshold
      })
      this.picker.on('touchstart', () => {
        this.hastransition = false
      })
      this.picker.on('touchmove', data => {
        const willY = this.translateY + data.distY
        if (
          (willY > this.minSportThreshold - this.threshold &&
            willY < this.minSportThreshold) ||
          (willY > this.maxSportThreshold &&
            willY < this.maxSportThreshold + this.threshold)
        ) {
          this.translateY = this.translateY + data.distY / 3
        } else if (
          willY >= this.minSportThreshold &&
          willY <= this.maxSportThreshold
        ) {
          this.translateY = willY
        }
      })
      this.picker.on('beforeAnimation', () => {
        this.picker.setOptions({
          sportInitValue: this.translateY,
          maxSportThreshold: this.maxSportThreshold + this.threshold,
          minSportThreshold: this.minSportThreshold - this.threshold
        })
      })
      this.picker.on('animationChange', distance => {
        this.translateY = distance
      })
      this.picker.on('animationEnd', this.handleEnd.bind(this))
      this.picker.on('tap', this.handleEnd.bind(this))
    },
    init() {
      this.$nextTick(this.setOps.bind(this))
      this.bindEvents()
    }
  },
  mounted() {
    console.log('base picker mounted')
    if (this.content.length > 0) {
      this.init()
    }
  },
  beforeDestroy() {
    console.log('base picker beforedestroy')
    this.picker && this.picker.destroy()
    this.picker = null
  }
}
</script>

<style lang="scss">
.mh-picker {
  display: block;
  position: relative;
  height: 270px;
  overflow: hidden;
  width: 100%;
  .mh-picker__mask {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    margin: 0 auto;
    width: 100%;
    z-index: 3;
    transform: translateZ(0px);
    background-image: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.9),
        rgba(255, 255, 255, 0.6)
      ),
      linear-gradient(
        to top,
        rgba(255, 255, 255, 0.9),
        rgba(255, 255, 255, 0.6)
      );
    background-position: top, bottom;
    background-size: 100% 108px;
    background-repeat: no-repeat;
  }
  .mh-picker__indicator {
    width: 100%;
    height: 54px;
    position: absolute;
    left: 0;
    top: 108px;
    z-index: 3;
    background-image: -webkit-linear-gradient(
        top,
        #d0d0d0,
        #d0d0d0,
        transparent,
        transparent
      ),
      -webkit-linear-gradient(bottom, #d0d0d0, #d0d0d0, transparent, transparent);
    background-image: linear-gradient(
        to bottom,
        #d0d0d0,
        #d0d0d0,
        transparent,
        transparent
      ),
      linear-gradient(to top, #d0d0d0, #d0d0d0, transparent, transparent);
    background-position: top, bottom;
    background-size: 100% 1px;
    background-size: 100% 1px;
    background-repeat: no-repeat;
  }
  .mh-picker__content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 1;
  }
}
.mh-picker__content__item {
  text-align: center;
  font-size: 18px;
  height: 54px;
  overflow: hidden;
  line-height: 54px;
  transition: all 0.3s;
}
.mh-picker_item_active {
  color: #333;
  font-weight: 400;
}
.hastransition {
  transition: all 0.2s;
}
</style>
