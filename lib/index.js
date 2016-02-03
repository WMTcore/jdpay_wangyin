'use strict';

let env = process.env.NODE_ENV || 'development';
let config={
	merchantNum:'22294531'
	// ,RSA_PrivateKey:''
	// ,MD5_Key:''
	// ,DES_key:''
	,RSA_PublicKey:'-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKE5N2xm3NIrXON8Zj19GNtLZ8\nxwEQ6uDIyrS3S03UhgBJMkGl4msfq4Xuxv6XUAN7oU1XhV3/xtabr9rXto4Ke3d6\nWwNbxwXnK5LSgsQc1BhT5NcXHXpGBdt7P8NMez5qGieOKqHGvT0qvjyYnYA29a8Z\n4wzNR7vAVHp36uD5RwIDAQAB\n-----END PUBLIC KEY-----'
}
var Jdpay = require('./jdpay').Jdpay;

var jdpay = new Jdpay (config);
 jdpay.on('verify_fail',function(){console.log('index emit verify_fail')})
    // .on('create_direct_pay_by_user_trade_finished', function(out_trade_no, trade_no){ console.log('test: callback: create_direct_pay_by_user_trade_finished ')})
    .on('create_direct_pay_by_user_trade_success', function(out_trade_no, trade_no){console.log('test： callback: create_direct_pay_by_user_trade_success')})
    // .on('refund_fastpay_by_platform_pwd_success', function(batch_no, success_num, result_details){console.log('test： callback: refund_fastpay_by_platform_pwd_success')})

module.exports = jdpay;