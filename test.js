const MongoDB = require('./index.js').MongoDB;
const mongodb_admin = require('./index.js').mongoDB_admin;

async function test2(){
	var mb = mongodb_admin("sys");
	mb.setConfig();
	// mb.open();
	console.log(mb);
}
test2();

/* 调用示例 */
async function test() {
	// 实例化构造函数，传入服务器地址和数据库名
	var mb = new MongoDB("localhost", "mm"); 
	// mb.setConfig();
	
	// await mb.open();
	// // 创建数据表
	// await mb.addTable('bs_table');
	// mb.table = "mm_table";
	
	// var ret = await mb.get({
	// 	'name': '李四'
	// });
	
	// ret = await mb.get({
	// 	'name': '张三'
	// });
	// console.log(ret);
	
	//  // 选择要操作的表
	// mb.table = 'mm_table';
	
	//  // 添加一条数据
	// ret = await mb.addObj({
	// 	name: "张三",
	// 	age: 21,
	// 	sex: true
	// });
	
	//  // 添加多条数据
	// ret = await mb.addList([{
	// 	name: "李四",
	// 	age: 18,
	// 	sex: false
	// }, {
	// 	name: "王五",
	// 	age: 15,
	// 	sex: true
	// }]);
}

// test();
