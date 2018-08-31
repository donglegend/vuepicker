/*
 * Created on Mon May 28 2018
 * author dognsheng
 * Copyright (c) 2018 Your Company
 * fn: 简单封装一个识别手势事件库, 后续可继续扩展增强功能
 */
import Emitter from './Emitter';

export default class TouchEmitter {
  name = 'TouchEmitter';

  emitter = null;

  element = null;

  // 是否按下鼠标或者touchStart, 判断是否需要后续操作
  isTracing = false;

  // 起始点坐标
  startX = null;

  startY = null;

  // touchmove过程坐标
  moveX = null;

  moveY = null;

  startTime = null;

  // 最小滑动阈值
  moveThreshold = 10;

  swipeDirection = '';

  // 控制end事件是否需要阻止默认事件传递, 否则子元素绑定touchend会在滑动结束触发事件
  isMove = false;

  constructor(el) {
    // if (new.target !== TouchEmitter) {
    //   throw Error('class TouchEmitter must be used by the new operator');
    // }
    this.element = typeof el === 'string' ? document.querySelector(el) : el;
    this.bindEvents();
  }

  /**
   * 注册自定义逻辑函数，提供钩子
   * @param {*} type
   * @param {*} callback
   */
  on(type, callback = () => {}) {
    this.emitter.on(type, callback);
  }

  emit(type, ...rest) {
    this.emitter.emit(type, ...rest);
  }

  /**
   *
   * @param {*} e
   */
  _touchStart(e) {
    e && e.preventDefault();
    e && e.stopPropagation();

    const point = e.touches ? e.touches[0] : e;
    this.startX = point.pageX;
    this.startY = point.pageY;

    this.moveX = this.startX;
    this.moveY = this.startY;

    this.startTime = Date.now();

    this.emitter.emit('touchstart', {
      startPoint: point,
      startTime: this.startTime,
    });
    this.isMove = false;
    this.isTracing = true;
  }

  /**
   *
   * @param {*} e
   */
  _touchMove(e) {
    if (!this.isTracing) {
      return;
    }
    e && e.preventDefault();
    e && e.stopPropagation();
    const point = e.touches ? e.touches[0] : e;
    this.isMove = true;
    /**
     * 忽略微小的触摸滑动
     */
    if (
      Math.abs(point.pageX - this.startX) < this.moveThreshold
      && Math.abs(point.pageY - this.startY) < this.moveThreshold
    ) {
      return;
    }
    this.emitter.emit('touchmove', {
      differenceX: point.pageX - this.startX,
      differenceY: point.pageY - this.startY,
      distX: point.pageX - this.moveX,
      distY: point.pageY - this.moveY,
      movePoint: point,
      moveTime: Date.now(),
    });

    this.moveX = point.pageX;
    this.moveY = point.pageY;
  }

  /**
   * @param {*} e
   */
  _touchEnd(e) {
    if (!this.isTracing) {
      return;
    }
    this.isTracing = false;
    if (this.isMove) {
      e && e.preventDefault();
      e && e.stopPropagation();
    }
    const endTime = Date.now();
    const point = e.changedTouches ? e.changedTouches[0] : e;
    const distX = point.pageX - this.startX;
    const distY = point.pageY - this.startY;
    const absDistX = Math.abs(distX);
    const absDistY = Math.abs(distY);
    if (absDistX > this.moveThreshold || absDistY > this.moveThreshold) {
      if (absDistX >= absDistY) {
        this.swipeDirection = distX < 0 ? 'Left' : 'Right';
      } else {
        this.swipeDirection = distY < 0 ? 'Up' : 'Down';
      }
      const _data = {
        swipeDirection: this.swipeDirection,
        startPoint: {
          x: this.startX,
          y: this.startY,
        },
        endPoint: {
          x: point.pageX,
          y: point.pageY,
        },
        timeCost: endTime - this.startTime,
        endTime,
      };
      this.emitter.emit(`swipe${this.swipeDirection}`, _data);
      this.emitter.emit('swipe', _data);
      this.emitter.emit('touchend', _data);
    } else {
      this.emitter.emit('tap');
    }
  }

  /**
   * @param {*} e
   */
  _touchCancel(e) {
    this._touchEnd(e);
  }

  handleEvent(e) {
    switch (e.type) {
      case 'touchstart':
      case 'mousedown':
        this._touchStart(e);
        break;
      case 'touchmove':
      case 'mousemove':
        this._touchMove(e);
        break;
      case 'touchend':
      case 'mouseup':
      case 'mouseout':
        this._touchEnd(e);
        break;
      default:
        console.log('发现未捕获事件');
        break;
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.element) {
      return;
    }
    const _touchEvents = {
      touchstart: { capture: false },
      touchmove: { capture: false },
      touchend: { capture: true },
      touchcancel: { capture: false },
      mousedown: { capture: false },
      mousemove: { capture: false },
      mouseup: { capture: true },
      mouseout: { capture: true },
    };
    this._touchEvents = _touchEvents;
    Object.keys(_touchEvents).forEach(type => {
      this.element.addEventListener(type, this, _touchEvents[type].capture);
    });

    if (!this.emitter) this.emitter = new Emitter();
  }

  /**
   * 移除绑定事件
   */
  unBindEvents() {
    if (this._touchEvents) {
      Object.keys(this._touchEvents).forEach(type => {
        this.element.removeEventListener(
          type,
          this,
          this._touchEvents[type].capture
        );
      });
    }
  }
}

export { TouchEmitter };
