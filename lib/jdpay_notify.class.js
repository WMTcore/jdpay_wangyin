/* *
 * 类名：JdpayNotify
 * 功能：京东通知处理类
 * 详细：处理京东各接口通知返回
 */

var core_funcs = require('./jdpay_core.function');
var md5_f = require('./jdpay_md5.function');
var des_f = require('./jdpay_des.function');
var rsa_f = require('./jdpay_rsa.function');

function JdpayNotify(jdpay_config){
    /**
     * HTTPS形式消息验证地址
     */
    this.https_verify_url = 'https://mapi.alipay.com/gateway.do?service=notify_verify&';
    /**
     * HTTP形式消息验证地址
     */
    this.http_verify_url = 'http://notify.alipay.com/trade/notify_query.do?';
    this.jdpay_config = jdpay_config;
}

/**
 * 退款
 * 针对notify_url验证消息是否是京东发出的合法消息
 * @return 验证结果
 */
JdpayNotify.prototype.verifyNotifyRefund = function(_POST, callback) {
    if (Object.keys(_POST).length == 0) { //判断POST来的数组是否为空
        callback(false);
    } else {
        //生成签名结果
        var isSign = rsa_f.rsaVerify(_POST.data, _POST.sign,this.jdpay_config.RSA_PublicKey);
        if (isSign) {
            //解密DATA数据
            var data = des_f.desDecode(_POST.data, this.jdpay_config.DES_Key);
            callback(isSign, data);
        }
        callback(isSign);
    }
}


/**
 * 针对notify_url验证消息是否是京东发出的合法消息
 * @return 验证结果
 */
JdpayNotify.prototype.verifyNotify = function(_POST, callback) {
    if (Object.keys(_POST).length == 0) { //判断POST来的数组是否为空
        callback(false);
    } else {
        //生成签名结果
        var isSign =  this.getSignVerify(_POST, _POST.CHINABANK.SIGN);
        if (isSign) {
            //解密DATA数据
            var data = des_f.desDecode(_POST.CHINABANK.DATA, this.jdpay_config['DES_Key']);
            callback(isSign, data);
        }
        callback(isSign);
    }
}

/**
 * 针对return_url验证消息是否是京东发出的合法消息
 * @return 验证结果
 */
JdpayNotify.prototype.verifyReturn = function(_GET, callback){
    if(Object.keys(_GET).length == 0) {//判断POST来的数组是否为空
        callback(false);
    }
    else{
        //生成签名结果
        callback(this.getSignVerifyRSA(_GET, _GET["sign"]));
    }
}

/**
 * 获取返回时的签名验证结果
 * @param para_temp 通知返回来的参数对象
 * @param sign 返回的签名结果
 * @return 签名验证结果
 */
JdpayNotify.prototype.getSignVerify = function(para_temp, sign) {
    var CB = para_temp.CHINABANK,
        prestr = CB.VERSION + CB.MERCHANT + CB.TERMINAL + CB.DATA;
    return md5_f.md5Verify(prestr, sign, this.jdpay_config['MD5_Key']);
}

/**
 * 获取返回时的签名验证结果,RSA
 * @param para_temp 通知返回来的参数对象
 * @param sign 返回的签名结果
 * @return 签名验证结果
 */
JdpayNotify.prototype.getSignVerifyRSA = function(para_temp, sign) {
      //除去待签名参数数组中的签名参数
    var para_filter = core_funcs.paraFilter(para_temp);

    //对待签名参数数组排序
    var para_sort = core_funcs.argSort(para_filter);

    //把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
    var prestr = core_funcs.createLinkstring(para_sort);

    //生成签名结果
    return rsa_f.rsaVerify(prestr,sign,this.jdpay_config.RSA_PublicKey)
}

// /**
//  * 获取远程服务器ATN结果,验证返回URL
//  * @param notify_id 通知校验ID
//  * @return 服务器ATN结果
//  * 验证结果集：
//  * invalid命令参数不对 出现这个错误，请检测返回处理中partner和key是否为空
//  * true 返回正确信息
//  * false 请检查防火墙或者是服务器阻止端口问题以及验证时间是否超过一分钟
//  */
// JdpayNotify.prototype.getResponse = function(notify_id, callback){
//     var transport = this.jdpay_config['transport'].trim().toLowerCase();
//     var partner = this.jdpay_config['partner'].trim();
//     var veryfy_url = '';
//     if(transport == 'https') {
//         veryfy_url = this.https_verify_url;
//     }
//     else {
//         veryfy_url = this.http_verify_url;
//     }
//     veryfy_url = veryfy_url + "partner=" + partner +  "&notify_id=" + notify_id;

//     core_funcs.getHttpResponseGET(veryfy_url, this.jdpay_config['cacert'], callback);    
// }

exports.JdpayNotify = JdpayNotify;
