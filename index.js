/**
 * @fileOverview mongoDB帮助类函数
 * @author <a href="http://qww.elins.cn">邱文武</a>
 * @version 1.2.1
 */
require('mm_expand');
const MongoClient = require('mongodb').MongoClient;

/**
 * @description MongoDB帮助类
 */
class MongoDB {
	/**
	 * @description 创建MongoDB帮助类函数 (构造函数)
	 * @param {String} scope 作用域
	 * @param {String} dir 当前路径
	 * @constructor
	 */
	constructor(scope, dir, config) {
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
		this.config = Object.assign({
			// 服务器地址
			host: "localhost",
			// 端口号
			port: 27017,
			// 数据库名
			database: "mm",
			// 用户名
			user: "admin",
			// 密码
			password: "",
			// 附加选项
			options: {
				// 使用新的url分析器
				useNewUrlParser: true,
				// 自动重连接
				// auto_reconnect: true,
				// 使用统一拓扑
				useUnifiedTopology: true,
				// useCreateIndex: true,
				// 连接池数
				// poolSize: 10
			}
		}, config);
		// 连接地址
		this.url;
		// 数据库连接器
		this.conn;
		// 操作的数据库
		this.db;
		// 表名
		this.table = "cache";
		/**
		 * 页码
		 */
		this.page = 1;
		/**
		 * 每页显示条数
		 */
		this.size = 0;
	}
}

/**
 * @description 设置配置
 * @param {Object|String} cg 配置对象或配置路径
 */
MongoDB.prototype.setConfig = function(cg) {
	var obj;
	if (typeof(cg) === "string") {
		obj = cg.loadJson(this.dir);
	} else {
		obj = cg;
	}
	$.push(this.config, obj);
};

/**
 * @description 设置Url
 */
MongoDB.prototype.setUrl = function() {
	var url = "mongodb://";
	if (this.config.password) {
		url += this.config.user + ':' + this.config.password + '@';
	}
	url += this.config.host + ":" + this.config.port + "/";
	this.url = url;
};

/**
 * @description 连接mongoDB数据库
 * @return {Boolean} 连接成功返回true, 失败返回false
 */
MongoDB.prototype.open = async function() {
	if (!this.url) {
		this.setUrl();
	}
	if (!this.conn) {
		this.conn = await MongoClient.connect(this.url, this.config.options);
		this.db = this.conn.db(this.config.database);
	}
	return this.conn == true;
};

/**
 * 关闭数据库连接
 */
MongoDB.prototype.close = function() {
	if (this.conn) {
		this.conn.close();
	}
};

/**
 * @description 创建数据表
 * @param {Object} table 表名
 * @return {Promise|Object} 执行结果
 */
MongoDB.prototype.addTable = function(table) {
	if (table) {
		this.table = table;
	} else {
		table = this.table;
	}
	return this.db.createCollection(table);
};

/**
 * @description 增加一条缓存
 * @param {Object} obj 对象
 * @return {Promise|Object} 执行结果
 */
MongoDB.prototype.addObj = function(obj) {
	return this.db.collection(this.table).insertOne(obj);
};

/**
 * @description 增加多条缓存
 * @param {Array} list 对象数组
 * @return {Promise|Object} 执行结果
 */
MongoDB.prototype.addList = function(list) {
	return this.db.collection(this.table).insertMany(list);
};

/**
 * @description 删除缓存
 * @param {Object} query 查询条件对象
 * @return {Promise|Object} 执行结果
 */
MongoDB.prototype.del = function(query) {
	return this.db.collection(this.table).remove(query);
};

/**
 * @description 修改缓存
 * @param {Object} query 查询条件对象
 * @param {Object} body 修改对象
 * @return {Promise|Object} 执行结果
 */
MongoDB.prototype.set = function(query, body) {
	return this.db.collection(this.table).update(query, body);
};

/**
 * @description 查询缓存
 * @param {Object} query 查询条件对象
 * @return {Promise|Array} 执行结果
 */
MongoDB.prototype.get = function(query) {
	if (this.page !== 0 && this.size !== 0) {
		return this.db.collection(this.table).find(query).limit(this.size).skip((this.page - 1) * this
			.size).toArray();
	} else {
		return this.db.collection(this.table).find(query).toArray();
	}
};

/**
 * @module 导出MongoDB帮助类
 */
exports.MongoDB = MongoDB;


/**
 * @description mongoDB连接池
 */
if (!$.pool.mongoDB) {
	$.pool.mongoDB = {};
}

/**
 * @description MongoDB管理器，用于创建缓存
 * @param {String} scope 作用域
 * @param {String} dir 当前路径
 * @return {Object} 返回一个缓存类
 */
function mongoDB_admin(scope, dir) {
	if (!scope) {
		scope = $.val.scope
	}
	var obj = $.pool.mongoDB[scope];
	if (!obj) {
		$.pool.mongoDB[scope] = new MongoDB(scope, dir);
		obj = $.pool.mongoDB[scope];
	}
	return obj;
}

/**
 * @module 导出MongoDB管理器
 */
exports.mongoDB_admin = mongoDB_admin;
