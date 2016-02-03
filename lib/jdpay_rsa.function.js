/* *
 * RSA
 * 详细：RSA加密
 */

var crypto = require('crypto');

/**
 * 签名字符串
 * @param prestr 需要签名的字符串
 * @param key 私钥
 * return 签名结果
 */

exports.rsaSign = function(prestr, key) {
	// console.error(crypto.createSign('RSA-SHA256').update(prestr).sign(key, 'hex'));
	return crypto.createSign('RSA-SHA256').update(prestr).sign(key, 'base64');
}

/**
 * 验证签名
 * @param prestr 需要签名的字符串
 * @param sign 签名结果
 * @param key 私钥
 * return 签名结果
 */
exports.rsaVerify = function(data, sign, key) {
	return crypto.creatVerify('RSA-SHA256').update(data).verify(key, sign, 'base64');
}