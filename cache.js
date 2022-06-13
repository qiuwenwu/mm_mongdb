/**
 * @fileOverview mongodb_cache缓存帮助类函数
 * @author <a href="http://qww.elins.cn">邱文武</a>
 * @version 1.2
 */

/* 创建Mongodb_cache帮助类函数 */
/// 构造函数
class Mongodb_cache {
	/**
	 * @description 创建Mongodb_cache帮助类函数 (构造函数)
	 * @param {String} scope 作用域
	 * @param {String} dir 当前路径
	 * @constructor
	 */
	constructor(scope, dir) {
		// 作用域
		this.scope;
		if (scope) {
			this.scope = scope;
		} else {
			this.scope = $.val.scope + '';
		}
		// 当前目录
		this.dir = __dirname;
		if (dir) {
			this.dir = dir;
		}
		
		// 数据库连接器
		this.conn;

		// 消息订阅器
		this.conn_rss;

		// 订阅回调函数
		this.func_list = {};
	}
}

/**
 * 消息订阅
 * @param {String} channel 订阅的频道
 * @param {Function} func 操作回调函数，可判断成功与否
 */
Mongodb_cache.prototype.subscribe = function(channel, func) {
	this.conn_rss.subscribe(channel);
	this.func_list[channel] = func;
};

/**
 * 取消订阅
 * @param {String} channel 订阅的频道
 */
Mongodb_cache.prototype.unsubscribe = function(channel) {
	this.conn_rss.unsubscribe(channel);
	delete this.func_list[channel];
};

/**
 * 发布消息
 * @param {String} channel 频道
 * @param {String} message 订阅的消息
 * @param {Function} func 消息发布成功回调函数
 */
Mongodb_cache.prototype.publish = function(channel, message, func) {
	this.conn.publish(channel, message, func);
};

/**
 * 订阅消息处理, 如果没有订阅函数，则其他的订阅消息会进入该函数
 * @param {String} channel
 * @param {String} message
 */
Mongodb_cache.prototype.main = async function(channel, message) {};

/**
 * 消息通知
 * @param {String} channel 频道
 * @param {String} message 消息
 */
Mongodb_cache.prototype.message = function(channel, message) {
	// console.log("我接收到信息了" + message);
	var func = this.func_list[channel];
	if (func) {
		func(message);
	} else {
		this.main(channel, message);
	}
};

/**z
 * @description 增加整数值(负数为减)
 * @param {String} key 键
 * @param {Number} num 数值
 * @return {Promise|Number} 计算后的结果
 */
Mongodb_cache.prototype.addInt = function(key, num) {
	var _this = this;
	return new Promise((resolve, reject) => {
		if (num > 0) {
			_this.conn.incrby(key, num, function(err, ret) {
				if (err) {
					reject(err);
				} else {
					resolve(ret);
				}
			});
		} else {
			_this.conn.decrby(key, -num, function(err, ret) {
				if (err) {
					reject(err);
				} else {
					resolve(ret);
				}
			});
		}
	});
};

/**
 * @description 增加浮点数值(负数为减)
 * @param {String} key 键
 * @param {Number} num 数值
 * @return {Promise|Number} 计算后的结果
 */
Mongodb_cache.prototype.addFloat = function(key, num) {
	var _this = this;
	return new Promise((resolve, reject) => {
		if (num > 0) {
			_this.conn.incrbyfloat(key, num, function(err, ret) {
				if (err) {
					reject(err);
				} else {
					resolve(ret);
				}
			});
		} else {
			_this.conn.decrby(key, -num, function(err, ret) {
				if (err) {
					reject(err);
				} else {
					resolve(ret);
				}
			});
		}
	});
};

/**
 * @description 增加字符串值到指定缓存
 * @param {String} key 键
 * @param {String} str 添加的字符串
 * @return {Promise|String} 添加后的字符串
 */
Mongodb_cache.prototype.addStr = function(key, str) {
	var _this = this;
	return new Promise((resolve, reject) => {
		_this.conn.append(key, str, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				resolve(ret);
			}
		});
	});
};

/**
 * @description 删除缓存
 * @param {String} key 键
 * @return {Promise|Boolean} 成功返回true,失败返回false
 */
Mongodb_cache.prototype.del = function(key) {
	var _this = this;
	return new Promise((resolve, reject) => {
		_this.conn.del(key, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				resolve(ret === "OK");
			}
		});
	});
};

/**
 * @description 修改缓存
 * @param {String} key 键
 * @param {Object} value 值
 * @param {Number} seconds 秒
 * @return {Object} 值
 */
Mongodb_cache.prototype.set = function(key, value, seconds) {
	var _this = this;
	return new Promise((resolve, reject) => {
		_this.conn.set(key, value, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				if (seconds) {
					_this.conn.expire(key, seconds);
				}
				resolve(ret === "OK");
			}
		});
	});
};

/**
 * @description 修改缓存
 * @param {String} key 键
 * @param {Object} value 值
 * @param {Number} seconds 秒
 * @return {Promise|Object} 值
 */
Mongodb_cache.prototype.add = function(key, value, seconds) {
	var _this = this;
	return new Promise((resolve, reject) => {
		_this.conn.exists(key, function(error, res) {
			if (error) {
				reject(error);
			} else {
				if (res) {
					// 已存在，不增加
					resolve(false);
				} else {
					_this.conn.set(key, value, function(err, ret) {
						if (err) {
							reject(err);
						} else {
							if (seconds) {
								_this.conn.expire(key, seconds);
							}
							resolve(ret === "OK");
						}
					});
				}
			}
		});
	});
};

/**
 * @description 查询缓存
 * @param {String} key 键
 * @return {Promise|Object} 查询值
 */
Mongodb_cache.prototype.get = function(key) {
	var _this = this;
	return new Promise((resolve, reject) => {
		_this.conn.get(key, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				resolve(ret);
			}
		});
	});
};

/**
 * @description 判断键是否存在
 * @param {String} key 键
 * @return {Promise|Boolean} 有返回true, 没有返回false
 */
Mongodb_cache.prototype.has = function(key) {
	var _this = this;
	return new Promise((resolve, reject) => {
		_this.conn.exists(key, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				resolve(ret === 1);
			}
		});
	});
};

/**
 * @description 查询缓存的字符串中的一段字符串
 * @param {String} key 键
 * @param {Number} start 开始位置
 * @param {Number} end 结束位置
 * @return {Promise|String} 查询值
 */
Mongodb_cache.prototype.getrange = function(key, start, end) {
	var _this = this;
	return new Promise((resolve, reject) => {
		_this.conn.getrange(key, start, end, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				resolve(ret);
			}
		});
	});
};

/**
 * @description 在值的指定位置开始增加一段字符串
 * @param {String} key 键
 * @param {Number} index 开始位置
 * @param {String} value 变更的值
 * @return {Promise|Number} 字符串长度
 */
Mongodb_cache.prototype.setrange = function(key, index, value) {
	var _this = this;
	return new Promise((resolve, reject) => {
		_this.conn.getrange(key, index, value, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				resolve(ret);
			}
		});
	});
};

/**
 * @description 清空缓存
 * @param {String} key 键, 为空则清空所有
 * @return {Promise|Array} 执行结果
 */
Mongodb_cache.prototype.clear = function(key) {
	var _this = this;
	return new Promise((resolve, reject) => {
		if (key) {
			_this.conn.del(key, function(err, ret) {
				if (err) {
					reject(err);
				} else {
					resolve(ret);
				}
			});
		} else {
			_this.conn.flushdb(function(err, ret) {
				if (err) {
					reject(err);
				} else {
					resolve(ret);
				}
			});
		}
	});
};

/**
 * @description 排序
 * @param {String} key 键
 * @param {String} way = [asc|desc]排序方式, 可以为空
 * @param {String} obj_key 排序成员的键
 * @return {Promise|Array} 排序后的数组
 */
Mongodb_cache.prototype.sort = function(key) {
	var _this = this;
	return new Promise((resolve, reject) => {
		_this.conn.sort(key, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				resolve(ret);
			}
		});
	});
};

/**
 * @description 获取所有键名
 * @param {String} key 键 支持*号, 前面加*表示后面名称一致, 前后加*表示包含名称, 后面加*表示前面名称一致
 * @return {Promise|Array} 键数组
 */
Mongodb_cache.prototype.keys = function(key) {
	var _this = this;
	if (!key) {
		key = "*";
	}
	return new Promise((resolve, reject) => {
		_this.conn.keys(key, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				resolve(ret);
			}
		});
	});
};

/**
 * @description 修改数组缓存
 * @param {String} key 键
 * @param {Object} value 值
 * @param {Number} seconds 秒
 * @return {Promise|Array} 执行结果
 */
Mongodb_cache.prototype.list_set = function(key, value, seconds) {
	var _this = this;
	return new Promise((resolve, reject) => {
		_this.conn.rpush(key, value, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				if (seconds) {
					_this.conn.expire(key, seconds);
				}
				resolve(ret);
			}
		});
	});
};

/**
 * @description 数组缓存追加对象
 * @param {String} key 键
 * @param {Object} value 值
 * @return {Promise|String} 追加后的数组
 */
Mongodb_cache.prototype.list_push = function(key, value) {
	var _this = this;
	return new Promise((resolve, reject) => {
		_this.conn.rpush(key, value, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				resolve(ret);
			}
		});
	});
};

/**
 * @description 判断成员是否存在
 * @param {String} key 键
 * @param {Object} value 值
 * @return {Promise|Boolean} 存在返回true, 否则返回false
 */
Mongodb_cache.prototype.list_has = function(key, value) {
	var _this = this;
	return new Promise(async (resolve, reject) => {
		if (!value) {
			reject('值不能为空');
		}
		var arr = await _this.list_get(key);
		var has = false;
		var len = arr.length;
		for (var i = 0; i < len; i++) {
			if (value == arr[i]) {
				has = true;
				break;
			}
		}
		resolve(has);
	});
};

/**
 * @description 查询数组缓存
 * @param {String} key 键
 * @param {Number} start 起始位置
 * @param {Number} end 结束位置
 * @return {Promise|Array} 查询到的数组
 */
Mongodb_cache.prototype.list_get = function(key, start, end) {
	var _this = this;
	if (start === undefined) {
		start = 0;
	}
	if (end === undefined) {
		end = -1;
	}
	return new Promise((resolve, reject) => {
		_this.conn.lrange(key, start, end, function(err, ret) {
			if (err) {
				reject(err);
			} else {
				resolve(ret);
			}
		});
	});
};

/**
 * @description 清空数组缓存
 * @param {String} key 键
 * @param {Array} value 新成员, 没有则删除数组
 * @return {Promise|Boolean} 成功返回true，是否返回false
 */
Mongodb_cache.prototype.list_clear = function(key, value) {
	var _this = this;
	return new Promise((resolve, reject) => {
		if (key) {
			if (value) {
				// 如果有值则删除其他成员，保留新值
				_this.list_push(key, value).then(function(len) {
					_this.conn.ltrim(key, len - value.length, len - 1, function(err, ret) {
						if (err) {
							reject(err);
						} else {
							resolve(ret === "OK");
						}
					});
				}, function(er) {
					reject(er);
				});
			} else {
				// 直接删除键
				_this.conn.del(key, function(err, ret) {
					if (err) {
						reject(err);
					} else {
						resolve(ret === "OK");
					}
				});
			}
		} else {
			reject('键不能为空');
		}
	});
};
/**
 * @description 导出Mongodb_cache类
 */
exports.Mongodb_cache = Mongodb_cache;

/**
 * @description mongodb_cache连接池
 */
if (!$.pool.mongodb_cache) {
	$.pool.mongodb_cache = {};
}

/**
 * @description 缓存管理器，用于创建缓存
 * @param {String} scope 作用域
 * @param {String} dir 当前路径
 * @return {Object} 返回一个缓存类
 */
function mongodb_cache_admin(scope, dir) {
	if (!scope) {
		scope = $.val.scope
	}
	var obj = $.pool.mongodb_cache[scope];
	if (!obj) {
		$.pool.mongodb_cache[scope] = new Mongodb_cache(scope, dir);
		obj = $.pool.mongodb_cache[scope];
	}
	return obj;
}

/**
 * @description 导出mongodb_cache管理函数
 */
exports.mongodb_cache_admin = mongodb_cache_admin;
