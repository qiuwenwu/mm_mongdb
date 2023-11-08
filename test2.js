const { Mongodb_cache, mongodb_cache_admin } = require('./cache.js');

async function test2() {
	var mb = mongodb_cache_admin("sys");
	mb.setConfig();
	// mb.open();
	console.log(mb);
}
test2();

/* 调用示例 */
async function test() {
	console.log("测试开始");
	// 实例化构造函数，传入服务器地址和数据库名
	var mb = new Mongodb_cache("localhost", "mm");
	mb.setConfig();

	await mb.open();
	try {
		// 创建数据表
		await mb.addTable('bs_keyValue');
		console.log("创建表bs_keyValue");
	} catch (e) {
		// console.log("创建表错误提示：", e);
		//TODO handle the exception
	}
	mb.table = "mm_table";

console.log("查询", mb.conn);
	var ret = await mb.get('李四');
	console.log("查询李四",ret);

	ret = await mb.get('张三');
	console.log("查询张三",ret);

	// 选择要操作的表
	mb.table = 'mm_table';

	// 添加一条数据
	ret = await mb.add("张三", {
		age: 21,
		sex: true
	});
	console.log("添加一条数据", ret);
	
	
	// 修改一条数据
	ret = await mb.add("李四", {
		age: 24,
		sex: false
	});
	console.log("修改一条数据", ret);
	
	console.log("测试完成");
}

test();
