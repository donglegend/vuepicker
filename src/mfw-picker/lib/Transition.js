/*
 * Created on Tue May 29 2018
 * author dongsheng
 * Copyright (c) 2018 Your Company
 * fn 辅助启动动画类，简单说就是一个定时器
 */
import event from '../event';
import easing from './easing';

const { Emitter } = event;

export default class Transition {
  constructor(ops) {
    this.ease = easing[ops.ease || 'Quart'];
    this.b = ops.b || 0;
    this.c = ops.c || 0;
    this.d = ops.d || 0;
    this.isTransition = false;
    this.rAFId = null;
    this.emitter = new Emitter();
  }

  setOptions(ops) {
    if (this.isTransition) {
      return;
    }
    this.b = ops.b || 0;
    this.c = ops.c || 0;
    this.d = ops.d || 0;
  }

  start() {
    const self = this;
    if (this.isTransition) {
      return;
    }
    this.isTransition = true;
    let startDate = null;
    function step(date) {
      if (!startDate) {
        startDate = date;
      }
      const t = date - startDate;
      if (t <= self.d) {
        const distance = self.ease.easeOut(t, self.b, self.c, self.d);
        self.emitter.emit('transition', Math.ceil(distance));
        self.rAFId = window.requestAnimationFrame(step);
      } else {
        self.stop();
      }
    }
    window.requestAnimationFrame(step);
  }

  stop() {
    if (this.isTransition) {
      window.cancelAnimationFrame(this.rAFId);
      this.isTransition = false;
      this.emitter.emit('transitionend');
    }
  }
}

export { Transition };
