'use strict';

var JdpayNotify = require('./jdpay_notify.class').JdpayNotify;    
var JdpaySubmit = require('./jdpay_submit.class').JdpaySubmit;
var assert = require('assert');
var url = require('url');
var inherits = require('util').inherits,
    EventEmitter = require('events').EventEmitter;
var middleware = require('../middleware');
var https = require('https');
var xml2js = require('xml2js');
var _ = require('lodash');

var RSA_PrivateKey = '-----BEGIN PRIVATE KEY-----\n' +
    'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBALLGo327aYxnMYPL\n' +
    'MCq7c34qGT+B3QhyCfkDQ/d0KpOGr1o0OuLMcCkp4bPvNtg0LklmPUAA6ZiLjGPO\n' +
    'tlYOIDe/3yjeZy4rCyZ4vBmnlDj7OZfYK5e90qrTP/i7Q36us8DhFyecWALAY1xH\n' +
    'tNTi0FOrBRFq/duUkCuwXekEB/kbAgMBAAECgYBzNLC84J4G/aUZ8kGK+BtYDVcR\n' +
    '5uUCgULN9n3BJFofkabEsW3VI7uPu06YfqpQL2g4oqsL6MqgJCWHV/mGgTnev3f9\n' +
    'ChbktfegfvXpMprZ55iKtssovx7DvrdIMvJ1H8S0HaVDqQqrsyftWXuTdUpbzkkw\n' +
    'vYOUTXYbYqum6wKDeQJBANscKZ2dQ76Zv19yOoZPcKUOexpgacVMkcu9kG9qf0ay\n' +
    'hgZp1hpxXrmbnb83brFSrrEqaxr/j9ov+XRo+i6ejGUCQQDQ4AqOuSgVSX8QFaZd\n' +
    'rB4pBNG2/LxsSpqX5ZT5mxV+UAT4bmD7GdB9TJNJgpm0qLrS/j5HYkh/N9CQmEWH\n' +
    'Yld/AkBpVmG/b4LJGDtD1LPELF7YS1ztclqHSudwzsKofceQonUCklEnR0el7eVp\n' +
    'r2mdAEYR0HXLdf+fgp7n0ywry3dtAkBGOn3yPNj4R0zciJr2Nc+yNPeaEeH8exz9\n' +
    'Y2iyf+07GgaBzQL4ilZqOpvvBGVPs8eU93zTHX2IoKiUZU5DVdJbAkEAt5eCpJy4\n' +
    'yRWkKXJOqTEToEGck8UzRoOVIL+zmFDTpVKCCEyCQ0EqxSISX6biOBhSZDfVaGLp\n' +
    'c6EHpKqLVb0ZzA==\n' +
    '-----END PRIVATE KEY-----';

// var RSA_PrivateKey = '-----BEGIN RSA PRIVATE KEY-----\n' +
//     'MIICXAIBAAKBgQCyxqN9u2mMZzGDyzAqu3N+Khk/gd0Icgn5A0P3dCqThq9aNDri\n' +
//     'zHApKeGz7zbYNC5JZj1AAOmYi4xjzrZWDiA3v98o3mcuKwsmeLwZp5Q4+zmX2CuX\n' +
//     'vdKq0z/4u0N+rrPA4RcnnFgCwGNcR7TU4tBTqwURav3blJArsF3pBAf5GwIDAQAB\n' +
//     'AoGAczSwvOCeBv2lGfJBivgbWA1XEeblAoFCzfZ9wSRaH5GmxLFt1SO7j7tOmH6q\n' +
//     'UC9oOKKrC+jKoCQlh1f5hoE53r93/QoW5LX3oH716TKa2eeYirbLKL8ew763SDLy\n' +
//     'dR/EtB2lQ6kKq7Mn7Vl7k3VKW85JML2DlE12G2KrpusCg3kCQQDbHCmdnUO+mb9f\n' +
//     'cjqGT3ClDnsaYGnFTJHLvZBvan9GsoYGadYacV65m52/N26xUq6xKmsa/4/aL/l0\n' +
//     'aPounoxlAkEA0OAKjrkoFUl/EBWmXaweKQTRtvy8bEqal+WU+ZsVflAE+G5g+xnQ\n' +
//     'fUyTSYKZtKi60v4+R2JIfzfQkJhFh2JXfwJAaVZhv2+CyRg7Q9SzxCxe2Etc7XJa\n' +
//     'h0rncM7CqH3HkKJ1ApJRJ0dHpe3laa9pnQBGEdB1y3X/n4Ke59MsK8t3bQJARjp9\n' +
//     '8jzY+EdM3Iia9jXPsjT3mhHh/Hsc/WNosn/tOxoGgc0C+IpWajqb7wRlT7PHlPd8\n' +
//     '0x19iKColGVOQ1XSWwJBALeXgqScuMkVpClyTqkxE6BBnJPFM0aDlSC/s5hQ06VS\n' +
//     'gghMgkNBKsUiEl+m4jgYUmQ31Whi6XOhB6Sqi1W9Gcw=\n' +
//     '-----END RSA PRIVATE KEY-----\n';

var default_jdpay_config = {
    merchantNum:'' //商户号
    ,host:'http://49.74.100.160:3000/' //域名
    ,create_direct_pay_by_user_return_url : '/jdpay/create_direct_pay_by_user/return_url'
    ,create_direct_pay_by_user_notify_url: '/jdpay/create_direct_pay_by_user/notify_url'
    ,refund_fastpay_by_platform_pwd_notify_url : '/jdpay/refund_fastpay_by_platform_pwd/notify_url'
    ,RSA_PrivateKey : RSA_PrivateKey
    ,MD5_Key:''
    ,DES_key:''
    ,jdpay_pay_url :'https://plus.jdpay.com/nPay.htm?'
    ,jdpay_refund_url :'https://m.jdpay.com/wepay/refund'
    ,RSA_PublicKey :''
};
            
function Jdpay(jdpay_config){     
    EventEmitter.call(this);
    
    //default config
    this.jdpay_config = default_jdpay_config;
    //config merge
    _.merge(this.jdpay_config,jdpay_config);  
}

/**
 * @ignore
 */
inherits(Jdpay, EventEmitter);

Jdpay.prototype.route = function(app){
    var self = this;
    app.get(this.jdpay_config.create_direct_pay_by_user_return_url, function(req, res){self.create_direct_pay_by_user_return(req, res)});
    app.post(this.jdpay_config.create_direct_pay_by_user_notify_url,middleware.jdpay.Decode,function(req, res){self.create_direct_pay_by_user_notify(req, res)});
    app.post(this.jdpay_config.refund_fastpay_by_platform_pwd_notify_url,middleware.jdpay.Decode,function(req, res){self.refund_fastpay_by_platform_pwd_notify(req, res)});
}

//京东支付即时到帐交易接口
/*data{
    token://用户交易令牌，选填
 tradeNum:'' //交易流水号, 商户网站订单系统中唯一订单号，必填
 ,tradeName:'' //交易名称，订单的标题/商 品名称/关键字 必填
 ,tradeAmount:'' //交易金额,必填
 ,tradeDescription:'' //交易描述，选填
 ,tradeTime:''//交易时间 年-月-日 时:分:秒 必填
 ,ip:'' //用户ip 必填
 }*/

Jdpay.prototype.create_direct_pay_by_user = function(data, res){
    assert.ok(data.tradeNum && data.tradeName && data.tradeAmount && data.tradeDescription && data.tradeTime && data.ip);

    //建立请求
    var jdpaySubmit = new JdpaySubmit(this.jdpay_config);

    var parameter = {
        token:''
        ,tradeDescription:''
        ,merchantRemark:''//是统一的还是变动的
        ,version:'1.1.5'
        ,merchantNum:this.jdpay_config.merchantNum
        ,currency:'CNY' //货币类型,固定填 CNY
        ,notifyUrl: this.jdpay_config.host+this.jdpay_config.create_direct_pay_by_user_notify_url//服务器异步通知页面路径,必填，不能修改, 需http://格式的完整路径，
        ,successCallbackUrl: this.jdpay_config.host+this.jdpay_config.create_direct_pay_by_user_return_url//页面跳转同步通知页面路径 需http://格式的完整路径，不能写成http://localhost/      
    };
    _.merge(parameter,data);
    
    var url = jdpaySubmit.buildRequestForm(parameter,this.jdpay_config.jdpay_pay_url);
    console.error(url)
    res.send(url);
}


/**
 * 退款接口 
 * data{
 *  tradeNum:'',//不支持批量,数字或字母,标识本次请求。
 *  oTradeNum: '', //数字或字母,标识需要退款的那笔交易流水。原支付单的订单号。
 *  tradeAmount:'', //交易金额
 *  tradeNote :''//选填
 * } 
 */
Jdpay.prototype.refund = function(data, res) {
    assert.ok(data.tradeNum && data.oTradeNum && data.tradeAmount);
    //建立请求
    var jdpaySubmit = new JdpaySubmit(this.jdpay_config),
        jdpayNotify = new JdpayNotify(this.jdpay_config);

    //构造要请求的参数数组，无需改动
    var parameter = {
        version: '1.0',
        merchantNum: this.jdpay_config.merchantNum,
        tradeNum: data.tradeNum,
        tradeNotice: this.jdpay_config.host + this.jdpay_config.refund_fastpay_by_platform_pwd_notify_url,
        tradeCurrency: 'CNY',
        tradeAmount: data.tradeAmount,
        oTradeNum: data.oTradeNum,
        tradeNote: data.tradeNote || ''
    };

    var postData = jdpaySubmit.buildRequestParaRefund(parameter),
        parsed_url = require('url').parse(this.jdpay_config.jdpay_refund_url);

    return new Promise(function(resolve, reject) {
        var req = https.request({
            hostname: parsed_url.host,
            path: parsed_url.path,
            method: 'POST'
        }, function(res) {
            var responseText = '';
            res.on('data', function(chunk) {
                responseText += chunk;
            });
            res.on('end', function() {
                jdpayNotify.verifyNotifyRefund(responseText, function(verify_result, data) {
                    if (verify_result) { //验证成功
                        if (data.tradeStatus == 0) {
                            //标识本次请求,标识需要退款的那笔交易流水,交易金额
                            resolve(_.pick(data, ['tradeNum,oTradeNum,tradeAmount']));
                        }
                        reject(data.tradeStatus);
                    } else {
                        reject("verify_fail");
                    }
                })
            });
        });
        req.write(postData);
        req.end();
    });
}

Jdpay.prototype.create_direct_pay_by_user_notify = function(req, res) {
    var self = this;

    var _POST = req.body;

    xml2js.parseString(req.body, {
        explicitArray: false
    }, function(err, result) {
        //计算得出通知验证结果
        var jdpayNotify = new JdpayNotify(this.jdpay_config);
        //验证消息是否是京东发出的合法消息
        jdpayNotify.verifyNotify(result, function(verify_result ,data) {
            if (verify_result) { //验证成功
                xml2js.parseString(data, {
                    explicitArray: false
                }, function(err, data) {
                    //商户订单号
                    var tradeNum = data.TRADE.ID;
                    //交易状态
                    var status = data>TRADE.STATUS;

                    if (status == 0) {
                        self.emit('create_direct_pay_by_user_trade_success', out_trade_no, trade_no);
                    }
                    res.send("success"); //请不要修改或删除
                })
            } else {
                //验证失败
                self.emit("verify_fail");
                res.send("fail");
            }
        });
    })

}

Jdpay.prototype.create_direct_pay_by_user_return = function(req, res){ 
    var self = this;
    
    var _GET = req.query;
    //计算得出通知验证结果
    var jdpayNotify = new JdpayNotify(this.jdpay_config);
    jdpayNotify.verifyReturn(_GET, function(verify_result){
        if(verify_result) {//验证成功
            //商户订单号
            var tradeNum = _GET.tradeNum,
                tradeAmount =_GET.tradeAmount;//金额
                self.emit('create_direct_pay_by_user_trade_return', tradeNum, _GET.token);
            res.send("success");     
        }
        else {
            //验证失败
            self.emit("verify_fail");
            res.send("fail");
        }
    });
    
}
    
exports.Jdpay = Jdpay;
    



