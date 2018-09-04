/*
 * Created on Mon May 28 2018
 * author dongsheng
 * Copyright (c) 2018 Your Company
 * fn: 继承自touchGesture,增加 滑动结束 惯性运动 功能
 */

import event from '../event'
import Transition from './Transition'

const { TouchEmitter } = event

export default class TouchInertial extends TouchEmitter {
  name = 'TouchInertial'

  // transition实例
  transition = null

  // 滑动过程中，存储一系列轨迹坐标，辅助计算惯性初始速度
  keyPoints = []

  // 运动方向,默认y
  direction = 'y'

  // 加速度，速度变化量，默认0.0009;
  acceleration = 0.0009

  // 最大运动距离
  maxSportThreshold = null

  // 最小运动距离
  minSportThreshold = null

  // 惯性缓动初始值
  sportInitValue = null

  // 如果最后计算初速度小于此值，放弃滚动
  velocityThreshold = 0.2

  constructor(el, ops) {
    super(el)
    // if (new.target !== TouchInertial) {
    //   throw Error('class TouchInertial must be used by the new operator');
    // }

    this.direction = ops.direction || 'y'
    this.acceleration = ops.acceleration || 0.0009
    this.maxSportThreshold = ops.maxSportThreshold || null
    this.minSportThreshold = ops.minSportThreshold || null
    this.sportInitValue = ops.sportInitValue || null

    this._initEvent()
  }

  /**
   * 辅助计算惯性滚动距离和时间
   * @param {*} threshold
   * @param {*} acceleration
   * @param {*} sportInitValue
   * @param {*} maxDistance
   */
  static helpScalar(threshold, acceleration, sportInitValue, maxDistance, v) {
    // 惯性时间
    let inertiaTime
    // 惯性变化量
    let inertiaDistance
    if (threshold === undefined || threshold === null) {
      // 无最值限定，自由滚动
      inertiaTime = Number(Math.abs(v / acceleration).toFixed(2))
      inertiaDistance = Math.floor(maxDistance)
    } else {
      const thresholdDetla = Math.abs(threshold - sportInitValue)
      // 比较，取较小值为惯性距离
      if (maxDistance > thresholdDetla) {
        // 近似计算
        inertiaTime = Math.abs(thresholdDetla / v)
        inertiaDistance = thresholdDetla
      } else {
        inertiaTime = Math.abs(v / acceleration)
        inertiaDistance = maxDistance
      }
      inertiaDistance = Math.ceil(inertiaDistance)
      inertiaTime = Number(inertiaTime.toFixed(2))
    }
    return {
      inertiaDistance,
      inertiaTime
    }
  }

  /**
   * 根据初始速度获取惯性距离和时间
   * @param {速度} v
   */
  _getDistanceAndTime(v) {
    const s = Math.abs((v * v) / (2 * this.acceleration))
    const _threshold = v > 0 ? this.maxSportThreshold : this.minSportThreshold
    return TouchInertial.helpScalar(
      _threshold,
      this.acceleration,
      this.sportInitValue,
      s,
      v
    )
  }

  /**
   * 获取初始速度
   * @param {坐标信息} point
   */
  _getVelocity(point) {
    let v = 0
    if (this.direction === 'x') {
      v = point.x / point.time
    } else {
      v = point.y / point.time
    }
    if (Math.abs(v) <= this.velocityThreshold) {
      v = 0
    }
    v = Number(v.toFixed(2))
    return v
  }

  /**
   * 存储更新一些列轨迹坐标，精确计算惯性初始速度使用
   * @param {点坐标信息} obj
   */
  _updateKeyPoints(obj) {
    this.keyPoints.push(obj)
    let last
    let first
    while (this.keyPoints.length > 0) {
      last = this.keyPoints[this.keyPoints.length - 1]
      ;[first] = this.keyPoints

      const interval = last.time - first.time
      if (interval > 300) this.keyPoints.shift()
      else break
    }
    return {
      x: last.x - first.x,
      y: last.y - first.y,
      time: last.time - first.time
    }
  }

  /**
   * 开始惯性运动
   * @param {惯性运动所需参数} ops
   */
  _inertiaMove(ops) {
    // const _d = ops.b + ops.c
    // if (_d <= this.minSportThreshold || _d >= this.maxSportThreshold) {
    //   ops.ease = 'Back'
    // } else {
    //   ops.ease = 'Quart'
    // }
    if (this.transition) {
      this.transition.setOptions(ops)
    } else {
      this.transition = new Transition(ops)
      this.transition.emitter.on('transition', distance => {
        this.emit('animationChange', distance)
      })
      this.transition.emitter.on('transitionend', () => {
        this.emit('animationEnd')
      })
    }
    this.transition.start()
  }

  /**
   * 对外提供批量修改属性
   * @param {本类参数} ops
   */
  setOptions(ops) {
    Object.keys(ops).forEach(key => {
      this[key] = ops[key]
    })
  }

  _initEvent() {
    this.on('touchstart', obj => {
      if (this.transition) {
        this.transition.stop()
      }
      this.keyPoints = []
      this._updateKeyPoints({
        x: obj.startPoint.pageX,
        y: obj.startPoint.pageY,
        time: obj.startTime
      })
    })
    this.on('touchmove', obj => {
      this._updateKeyPoints({
        x: obj.movePoint.pageX,
        y: obj.movePoint.pageY,
        time: obj.moveTime
      })
    })

    this.on('touchend', obj => {
      const intervalPoint = this._updateKeyPoints({
        x: obj.endPoint.x,
        y: obj.endPoint.y,
        time: obj.endTime
      })
      // 没有缓动，直接结束
      if (intervalPoint.time > 300 || intervalPoint.time === 0) {
        this.emit('animationEnd')
        return
      }
      const v0 = this._getVelocity(intervalPoint)
      if (v0 === 0) {
        this.emit('animationEnd')
        return
      }
      // 开始惯性运动，提供before钩子
      this.emit('beforeAnimation', obj)
      // 获取运动距离
      const resultInfo = this._getDistanceAndTime(v0)
      if (resultInfo.inertiaDistance === 0 || resultInfo.inertiaTime === 0) {
        this.emit('animationEnd')
        return
      }
      // 开始运动
      this._inertiaMove({
        b: this.sportInitValue,
        c: v0 > 0 ? resultInfo.inertiaDistance : -resultInfo.inertiaDistance,
        d: resultInfo.inertiaTime
      })
    })
  }

  /**
   * 销毁
   */
  destroy() {
    this.unBindEvents()
    try {
      this.emitter.clear()
      this.transition && this.transition.emitter.clear()
    } catch (err) {}
  }
}

export { TouchInertial }
