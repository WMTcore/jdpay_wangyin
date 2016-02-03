'use strict';
/* *
 * 类名：JdpaySubmit
 * 功能：京东各接口请求提交类
 * 详细：构造京东各接口表单HTML文本，获取远程HTTP数据
 */

var core_funcs = require('./jdpay_core.function');
var md5_f = require('./jdpay_md5.function');
var rsa_f = require('./jdpay_rsa.function');
var des_f = require('./jdpay_des.function');
var _ = require('lodash');
// var DOMParser = require('xmldom').DOMParser;

function JdpaySubmit(jdpay_config) {
    this.jdpay_config = jdpay_config;
}

/**
 * 生成签名结果
 * @param para_sort 已排序要签名的数组
 * return 签名结果字符串
 */
JdpaySubmit.prototype.buildRequestMysign = function(para_sort) {
    //把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
    var prestr = core_funcs.createLinkstring(para_sort);

    var mysign = rsa_f.rsaSign(prestr, this.jdpay_config['RSA_PrivateKey']);
    return mysign;
}

/**
 * 生成要请求给京东的参数数组
 * @param para_temp 请求前的参数数组
 * @return 要请求的参数数组
 */
JdpaySubmit.prototype.buildRequestParaRefund = function(para_temp) {
    //除去待加密参数数组中的多余参数
    var para_filter = core_funcs.paraFilter(para_temp);
    delete para_filter.merchantNum;

    //申请数据(data)需要做 DES 加密
    let data = new Buffer(para_filter, 'binary');
    let dataLength = data.length,
        size = swapUInt32(dataLength),
        patch = (dataLength + 4) % 8;
    patch = patch ? 8 - patch : patch;
    let buffer = new Buffer(4 + dataLength + patch);
    size.copy(buffer);
    data.copy(buffer, size.length);
    for (let i = 0; i < patch; i++) {
        new Buffer(1).copy(buffer, 4 + dataLength + i);
    }
    let encryptData = des_f.desEncode(buffer, this.jdpay_config.DES_key);

    //生成签名结果
    var merchantSign = rsa_f.rsaSign(encryptData, this.jdpay_config['RSA_PrivateKey']);

    //待提交参数
    let param = {
        version: para_temp.version,
        merchantNum: para_temp.merchantNum,
        data: encryptData,
        merchantSign: merchantSign
    }
    return param;
}

/**
 * 生成要请求给京东的参数数组
 * @param para_temp 请求前的参数数组
 * @return 要请求的参数数组
 */
JdpaySubmit.prototype.buildRequestPara = function(para_temp) {
    //除去待签名参数数组中的签名参数
    var para_filter = core_funcs.paraFilter(para_temp);

    //对待签名参数数组排序
    var para_sort = core_funcs.argSort(para_filter);

    //生成签名结果
    var merchantSign = this.buildRequestMysign(para_sort);

    //签名结果加入请求提交参数组中
    para_sort['merchantSign'] = merchantSign;

    return para_sort;
}

/**
 * 生成要请求给京东的参数数组
 * @param para_temp 请求前的参数数组
 * @return 要请求的参数数组字符串
 */
JdpaySubmit.prototype.buildRequestParaToString = function(para_temp, url) {
    //待请求参数数组
    var para = this.buildRequestPara(para_temp);

    //把参数组中所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串，并对字符串做urlencode编码
    var request_data = core_funcs.createLinkstringUrlencode(para);

    return url + request_data;
}

/**
 * 建立请求，以表单HTML形式构造（默认）
 * @param para_temp 请求参数数组
 * @param method 提交方式。两个值可选：post、get
 * @param button_name 确认按钮显示文字
 * @return 提交表单HTML文本
 */
JdpaySubmit.prototype.buildRequestForm = function(para_temp, url) {
    //除去待签名参数数组中的签名参数
    var para_filter = core_funcs.paraFilter(para_temp);
    var para = this.buildRequestPara(para_temp);

    var sHtml = "<form id='jdpaysubmit' method='post' name='jdpaysubmit' target= '_blank' action='" + url + "'>";

    for (var key in para) {
        var val = para[key];
        sHtml += "<input type='hidden' name='" + key + "' value='" + val + "'/>";
    }

    //submit按钮控件请不要含有name属性
    sHtml = sHtml + "<input type='submit' value='确认'></form>";

    sHtml = sHtml + "<script></script>";

    return sHtml;
}

exports.JdpaySubmit = JdpaySubmit;