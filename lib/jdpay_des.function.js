/* *
 * des
 * 详细：des解密
 */
var crypto = require('crypto');

/**
 * 解密数据
 * @param data 待解密数据
 * @param key deskey
 * return 解密数据
 */
exports.desDecode = function(data, key) {
	data = new Buffer(data, 'base64');
	key = new Buffer(key, 'base64').slice(0, 8);
	return crypto.createDecipheriv('des-ecb', key, new Buffer(0)).update(data, 'base64', 'utf8');
}

/**
 * 加密数据
 * @param buffer 待加密数据
 * @param key deskey
 * return 加密数据
 */
exports.desEncode = function(buffer, key) {
	key = new Buffer(key, 'base64').slice(0, 24);
	return crypto.createCipher('des-ecb', key).update(buffer, 'binary', 'hex');
}