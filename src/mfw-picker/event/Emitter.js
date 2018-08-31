/*
 * Created on Mon May 28 2018
 * author dognsheng
 * Copyright (c) 2018 Your Company
 * fn: 简单封装一个事件管理器
 */
export default class Emitter {
  constructor() {
    this.name = 'Emitter';
    this._events = {};
  }

  /**
   *
   * @param type 注册事件类型
   * @param callback 处理函数
   * @param context 代码运行上下文
   */
  on(type, callback = () => {}, context) {
    if (!this._events[type]) {
      this._events[type] = [];
    }
    this._events[type].push({
      type,
      callback,
      context,
    });
    return this;
  }

  /**
   *
   * @param type 触发事件类型
   * @param args 其他参数
   */
  emit(type, ...args) {
    const _cbs = this._events[type] || null;
    if (!_cbs) {
      return;
    }
    let i = 0;
    const len = _cbs.length;
    if (!len) {
      return;
    }
    for (; i < len; i++) {
      _cbs[i].callback.apply(_cbs[i].context || this, args);
    }
  }

  /**
   *
   * @param type 移除事件类型
   * @param callback 处理函数
   */
  off(type, callback) {
    if (!this._events[type]) {
      return;
    }
    const index = this._events[type].indexOf(callback);
    if (index !== -1) {
      this._events[type].splice(index, 1);
    }
  }

  /**
   *
   * @param type 移除事件类型
   */
  clear(type) {
    if (type) {
      delete this._events[type];
    } else {
      this._events = {};
    }
  }
}

export { Emitter };
