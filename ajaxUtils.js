import reqwest from 'reqwest';
import React from 'react';
import {
	Modal,
	Select,
} from 'antd';
const Option = Select.Option;
function jumpLoginPage() {
	localStorage.clear();
	location.reload()
}

function error(err) {
	let objStatus = {
		204: '服务器处理请求成功，但无返回无内容，请检查',
		302: '网关超时，请检查',//因为小贷后台重定向到index.html页面了
		400: '错误请求，请检查',
		403: '服务器拒绝请求，请检查',
		404: '资源不存在或未找到，请检查',
		500: '请求服务器失败...o(╯□╰)o',
		502: '错误网关，请检查',
		503: '服务不可用，请检查',
		504: '网关超时，请检查',
		505: 'HTTP 版本不受支持，请检查'
	}
	if (objStatus[err.status]) {
		Modal.error({
			title: objStatus[err.status]
		});
	}
}
var ajaxUtils = {
	transfer(arry) {
		arry.forEach(function (element) {
			element["label"] = element["text"];
			delete element.text;
			element["value"] = element["id"];
			element["key"] = element["id"];
			delete element.id;
			if (element.children) {
				this.transfer(element.children)
			}
		}, this);
	},
	getData: function (obj) {
		reqwest({
			url: obj.url,
			contentType: 'application/json;charset=UTF-8',
			method: 'get',
			data: obj.data,
			headers: {
				Token: localStorage.Token || null
			},
			type: 'json',
			success: function (result) {
				if (result.code == 200 || result.code == 400) {
					obj.callback(result);
				} else {
					Modal.error({
						title: result.msg,
						onOk: () => {
							if (result.code == "800") {
								jumpLoginPage();
							}
						}
					});
				}

			},
			error: function (err) {
				error(err);
			}
		});
	},
	sendForm: function (obj) {
		reqwest({
			url: obj.url,
			method: obj.method || 'post',
			data: obj.data,
			headers: {
				Token: localStorage.Token || null
			},
			processData: false,
			contentType: false,
			success: function (result) {
				if (result.code == 200 || result.code == 400) {
					obj.callback(result);
				} else {
					Modal.error({
						title: result.msg,
						onOk: () => {
							if (result.code == "800") {
								jumpLoginPage();
							}
						}
					});
				}
			},
			error: function (err) {
				error(err);
			}
		});
	},
	//发送请求
	sendAjax: function (obj) {
		reqwest({
			url: obj.url,
			contentType: obj.contentType || 'application/json;charset=UTF-8',
			method: obj.method || 'post',
			data: obj.data,
			//type: 'json',
			success: function (result) {
				if (typeof result == 'string' && /<!DOCTYPE html>/.test(result)) {
					Modal.error({
						title: '与后台服务连接超时,请重新登录',
						onOk: () => {
							jumpLoginPage();
						}
					});
				}
				else if (result.code == 200 || result.code == 400) {
					obj.callback(result);
				} else { 
					if (document.getElementsByClassName('ant-confirm-body').length && document.getElementsByClassName('anticon-cross-circle').length) {
						return
					}
					if (result.msg) {
						Modal.error({
							title: result.msg,
							onOk: () => {
								if (result.code == "800") {
									jumpLoginPage();
								}
							}
						});
					}

				}

			},
			error: function (err) {
				error(err);
			}
		});
	},
	//公用请求方法
	ajaxData: function (obj) {
		//console.log(obj);
		reqwest({
			url: obj.url,
			contentType: obj.contentType || 'application/x-www-form-urlencoded',
			method: obj.method || 'post',
			data: obj.data,
			success: function (result) { 
				if (typeof result == 'string' && /<!DOCTYPE html>/.test(result)) {
					Modal.error({
						title: '与后台服务连接超时,请重新登录',
						onOk: () => {
							jumpLoginPage();
						}
					});
				}
				else if (result.code == 200 || result.code == 400) {
					obj.callback(result);
				} else { 
					if (document.getElementsByClassName('ant-confirm-body').length && document.getElementsByClassName('anticon-cross-circle').length) {
						return
					}
					if (result.msg) {
						Modal.error({
							title: result.msg,
							onOk: () => {
								if (result.code == "800") {
									jumpLoginPage();
								}
							}
						});
					}

				}

			},
			error: function (err) {
				error(err);
			}
		});
	},
	//提交-加了按钮loading状态
	ajaxSubmit: function (obj) {
		var me = obj.me;
		me.setState({ loading: true });
		reqwest({
			url: obj.url,
			method: obj.method || 'post',
			data: obj.data,
			success: function (result) {
				me.setState({ loading: false });
				if (typeof result == 'string' && /<!DOCTYPE html>/.test(result)) {
					Modal.error({
						title: '与后台服务连接超时,请重新登录',
						onOk: () => {
							jumpLoginPage();
						}
					});
				}
				else if (result.code == 200 || result.code == 400) {
					obj.callback(result);
				} else {
					if (result.msg) {
						Modal.error({
							title: result.msg,
							onOk: () => {
								if (result.code == "800") {
									jumpLoginPage();
								}
							}
						});
					}
				}

			},
			error: function (err) {
				error(err);
			}
		});
	},
	//邮箱输入后缀方法
	emailChange: function (me, value) {
		
		var mailboxSuffix = ['gmail.com', 'yahoo.com', 'msn.com', 'qq.com', 'hotmail.com', '163.net', 'aol.com', 'ask.com', 'live.com', '0355.net', '263.net', '3721.net', 'yeah.net', 'googlemail.com', 'mail.com'];
		let options;
		if (!value || value.indexOf('@') >= 0) {
			options = [];
		} else {
			options = mailboxSuffix.map((domain) => {
				const email = `${value}@${domain}`;
				return <Option key={email}>{email}</Option>;
			});
		}
		me.setState({ options });
	},
	//附件大小单位选择方法
	chooseUnit: function (size) {
		if (size < 1024) {
			return size + 'B'
		} else if (size < 1024 * 1024) {
			return (size / 1024).toFixed2() + 'KB'
		} else {
			return (size / (1024 * 1024)).toFixed2() + 'MB'
		}
	},
	//列表利率小数转换成百分比方法
	changePercent: function (value) {
		if (!value&&value!=0) {
			return ''
		} else {
			return (value*100).toFixed2()
		}
	},
	dateAdd(date, strInterval, Number) {  //参数分别为日期对象，增加的类型，增加的数量 
		var dtTmp = date;
		switch (strInterval) {
			case 'second':
			case 's':
				return new Date(Date.parse(dtTmp) + (1000 * Number));
			case 'minute':
			case 'n':
				return new Date(Date.parse(dtTmp) + (60000 * Number));
			case 'hour':
			case 'h':
				return new Date(Date.parse(dtTmp) + (3600000 * Number));
			case 'day':
			case 'd':
				return new Date(Date.parse(dtTmp) + (86400000 * Number));
			case 'week':
			case 'w':
				return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));
			case 'month':
			case 'm':
				return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
			case 'year':
			case 'y':
				return new Date((dtTmp.getVullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
		}
	},
	//若后台无唯一标示，前台生成唯一key
	generateKey(data, keyName) {
		keyName = keyName ? keyName : 'key';
		if (data && data.length > 0) {
			data.map((item, index) => {
				item[keyName] = index
			});
		}
		return data
	},
	onTransLate(num) {
		var strPrefix = "";
		num = Math.abs(num);
		var strOutput = "";
		var strUnit = '仟佰拾亿仟佰拾万仟佰拾元角分';
		var strCapDgt = '零壹贰叁肆伍陆柒捌玖';
		num += "00";
		var intPos = num.indexOf('.');
		if (intPos >= 0) {
			num = num.substring(0, intPos) + num.substr(intPos + 1, 2);
		}
		strUnit = strUnit.substr(strUnit.length - num.length);
		for (var i = 0; i < num.length; i++) {
			strOutput += strCapDgt.substr(num.substr(i, 1), 1) + strUnit.substr(i, 1);
		}
		return strPrefix + strOutput.replace(/零角零分$/, '整').replace(/零[仟佰拾]/g, '零').replace(/零{2,}/g, '零').replace(/零([亿|万])/g, '$1').replace(/零+元/, '元').replace(/亿零{0,3}万/, '亿').replace(/^元/, "零元");
	},
	toThousands(num) {
		if (!num) {
			return 0
		};
		var str = Math.abs(num);
		str = String(str);
		var newStr = "";
		var count = 0;

		if (str.indexOf(".") == -1) {
			for (var i = str.length - 1; i >= 0; i--) {
				if (count % 3 == 0 && count != 0) {
					newStr = str.charAt(i) + "," + newStr;
				} else {
					newStr = str.charAt(i) + newStr;
				}
				count++;
			}
			//str = newStr + ".00"; //自动补小数点后两位
			str = newStr;
		}
		else {
			for (var i = str.indexOf(".") - 1; i >= 0; i--) {
				if (count % 3 == 0 && count != 0) {
					newStr = str.charAt(i) + "," + newStr;
				} else {
					newStr = str.charAt(i) + newStr; //逐个字符相接起来
				}
				count++;
			}
			str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
		}
		if (num < 0) {
			return '-' + str
		} else {
			return str
		}
	},
	//验证页面配置的子组件
	validateForms(me, listValid) {
		var a = true;
		for (var i = 0, length = listValid.length; i < length; i++) {
			if (me.refs[listValid[i]]) {
				me.refs[listValid[i]].validateFieldsAndScroll((errors, values) => {
					if (!!errors) {
						a = false
					} else {
						return;
					}
				})
			}
		}
		return a
	},
	//重置页面配置的子组件
	resetForms(me, listValid) {
		for (var i = 0, length = listValid.length; i < length; i++) {
			if (me.refs[listValid[i]]) {
				me.refs[listValid[i]].resetFields();
			}
		}
	},
	//赋值页面配置的子组件
	addTestData(me, assemblyList, data) {
		Utils.setFormsValue(me, assemblyList, data)
	},
	//本地存储 key,val
	localSaveJsonStorage: function (key, val) {
		var data = {
			val: val
		};
		var str = JSON.stringify(data);
		localStorage.setItem(key, str);
	},

	//提取本地存储数据
	localLoadJsonStorage: function (key) {
		var str = localStorage.getItem(key);
		var data = JSON.parse(str);
		return data.val;
	},
	//可编辑table,转换数组数据给form赋值用
	//transFormFormData(arr data,arr columns,id)
	transformFormData(data, columns) {
		var formData = {};
		var keys = [];
		data.forEach((item, index) => {
			keys.push(index);
			columns.forEach(name => {
				formData[index + name] = item[name];
			})
		})
		formData["keys"] = keys;
		return formData;
	},
	//可编辑table,转换form数据为数组数据
	//getDataSet(arr data,arr columns,id)
	getDataSet(data, columns, id) {
		var list = [];
		data.keys.forEach(key => {
			let obj = {};
			columns.forEach(name => {
				if (typeof id == 'undefined') {
					id = 'id';
				}
				if (name == id && data[key + id]) {
					obj[id] = data[key + id];
				}
				else {
					obj[name] = data[key + name];
				}
			})
			list.push(obj);
		});
		return list
	},
	getTableColums(data) {
		var columns = [], rowKey = 'id';
		data.forEach((field) => {
			const col = {};
			col.key = field.key;
			col.dataIndex = field.key;
			col.title = field.title;
			if (field.render) {
				col.render = field.render;
			}
			columns.push(col);
			// 当前列是否是主键?
			if (field.primary) {
				rowKey = field.key;
			}
		});
		return { columns, rowKey }
	},
}
module.exports = ajaxUtils;