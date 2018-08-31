<template>
  <div class="ant-popup" :style="{'z-index': zIndex}" :class="typeClass" v-show="isVisible">
    <div class="ant-popup-mask" v-show="mask" @click="maskClick">
      <slot name="mask"></slot>
    </div>
    <div class="ant-popup-container" :class="{'ant-popup-center': center}">
      <div class="ant-popup-content" v-if="$slots.default">
        <slot></slot>
      </div>
      <div class="ant-popup-content" v-else v-html="content">
      </div>
    </div>
  </div>
</template>

<script>
import visibilityMixin from './visibility'
const COMPONENT_NAME = 'ant-popup'
const EVENT_MASK_CLICK = 'mask-click'

export default {
  name: COMPONENT_NAME,
  mixins: [visibilityMixin],
  props: {
    type: {
      type: String,
      default: ''
    },
    mask: {
      type: Boolean,
      default: true
    },
    content: {
      type: String,
      default: ''
    },
    center: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: Number,
      default: 100
    }
  },
  computed: {
    typeClass() {
      return this.type ? `ant-${this.type}` : ''
    }
  },
  methods: {
    maskClick(e) {
      this.$emit(EVENT_MASK_CLICK, e)
    }
  }
}
</script>

<style lang="scss">
// @import '../../assets/style/var.scss';

.ant-popup {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  font-size: 24px;
  .ant-popup-mask,
  .ant-popup-container {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .ant-popup-mask {
    overflow: hidden;
    background-color: rgb(37, 38, 45);
    opacity: 0.4;
  }
  // fix some android webview opacity render bug
  &::before {
    content: '.';
    display: block;
    width: 1px;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.1);
    margin-left: -10px;
  }
  .ant-popup-container {
    transform: translate(100%, 100%);
  }
  .ant-popup-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    transform: translate(-100%, -100%);
  }
  .ant-popup-center {
    .ant-popup-content {
      position: absolute;
      top: -50%;
      left: -50%;
      width: auto;
      max-width: 100%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
