'use strict';

let express = require('express');
let router = express.Router();
let jdpay = require('../../lib');
let moment = require('moment');

router.get('/', function(req, res, next) {
	let data = {
		tradeNum: "1447138407417", //订单号
		tradeName: "支付测试", //商品名称
		tradeAmount: 0.01, //交易金额
		tradeDescription: "goodth", //商品描述
		tradeTime: moment().format('YYYY-MM-DD hh:mm:ss'), //时间
		ip:'102.168.1.1'
	};
	jdpay.create_direct_pay_by_user(data,res);
});

module.exports = router;