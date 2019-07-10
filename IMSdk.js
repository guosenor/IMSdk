const crypto = require('crypto');
const axios = require('axios').create();
const config = {
    URL_CREATE_ACCOUNT: 'https://api.netease.im/nimserver/user/create.action',
    URL_UPDATE_ACCOUNT: 'https://api.netease.im/nimserver/user/update.action',
    URL_REFRESH_TOKEN: 'https://api.netease.im/nimserver/user/refreshToken.action',
    URL_BLOCK_ACCOUNT: 'https://api.netease.im/nimserver/user/block.action',
    URL_UNBLOCK_ACCOUNT: 'https://api.netease.im/nimserver/user/unblock.action',
    URL_FRIEND_ADD: 'https://api.netease.im/nimserver/friend/add.action',
    URL_FRIEND_UPATE: 'https://api.netease.im/nimserver/friend/update.action',
    URL_FRIEND_DELETE: 'https://api.netease.im/nimserver/friend/delete.action',
    URL_FRIEND_GET: 'https://api.netease.im/nimserver/friend/get.action',
    URL_BLACK_SET: 'https://api.netease.im/nimserver/user/setSpecialRelation.action',
    URL_BLACK_LIST: 'https://api.netease.im/nimserver/user/listBlackAndMuteList.action',
    URL_BATCH_ATTACH_MSG: 'https://api.netease.im/nimserver/msg/sendBatchAttachMsg.action',
    URL_ATTACH_MSG: 'https://api.netease.im/nimserver/msg/sendAttachMsg.action'
};

class IM {
    constructor(appKey, appSecret, options) {
        if (!appKey || !appSecret) {
            throw new Error('appKey与secret不能为空');
        }

        this.appKey = appKey;
        this.appSecret = appSecret;
    }

    getAuthHeaders({ nonce = Math.random().toFixed(15) * Math.pow(10, 15), curTime = Math.floor(Date.now() / 1000) } = {}) {
        const checkSum = crypto.createHash('sha1').update(this.appSecret + nonce + curTime).digest('hex');

        return {
            AppKey: this.appKey,
            Nonce: nonce,
            CurTime: `${curTime}`,
            CheckSum: checkSum,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        };
    }

    /**
     * 验证服务器推送过来的消息
     * @param md5 header的Md5
     * @param checkSum header的Checksum
     * @param curTime header中的Curtime
     * @param bodyStr 服务器推送过来的body
     * @returns {boolean}
     */
    verifyPushMessage({ md5, checkSum, curTime, bodyStr }) {
        // verify md5
        const calcMd5 = crypto.createHash('md5').update(bodyStr).digest('hex');
        const calcCheckSum = crypto.createHash('sha1').update(this.appSecret + calcMd5 + curTime).digest('hex');

        return calcMd5 === md5 && calcCheckSum === checkSum;
    }

    /**
     * 创建云信账号
     * @param account {Object} 字段名：（具体见文档）
     *              accid  String  是  网易云通信ID，最大长度32字符，必须保证一个
     *              APP内唯一（只允许字母、数字、半角下划线_、
     *              @、半角点以及半角-组成，不区分大小写，
     *              会统一小写处理，请注意以此接口返回结果中的accid为准）。
     *              name  String  否  网易云通信ID昵称，最大长度64字符，用来PUSH推送
     *              时显示的昵称
     *              props  String  否  json属性，第三方可选填，最大长度1024字符
     *              icon  String  否  网易云通信ID头像URL，第三方可选填，最大长度1024
     *              token  String  否  网易云通信ID可以指定登录token值，最大长度128字符，
     *              并更新，如果未指定，会自动生成token，并在
     *              创建成功后返回
     *              sign  String  否  用户签名，最大长度256字符
     *              email  String  否  用户email，最大长度64字符
     *              birth  String  否  用户生日，最大长度16字符
     *              mobile  String  否  用户mobile，最大长度32字符
     *              gender  int  否  用户性别，0表示未知，1表示男，2女表示女，其它会报参数错误
     *              ex  String  否  用户名片扩展字段，最大长度1024字符，用户可自行扩展，建议封装成JSON字符串
     * @returns {Promise.<*>}
     *
     * {code:200,info:{ token: '7e986f16f5ea8b5c3f11c1093021cccd', accid: '1',name: '' }}
     */
    createAccount(params) {
        return this._request({ uri: config.URL_CREATE_ACCOUNT, params });
    }

    /**
     * 网易云通信ID基本信息更新
     * @param params
     *       accid	String	是	用户帐号，最大长度32字符，必须保证一个APP内唯一
     *       name	String	否	用户昵称，最大长度64字符，可设置为空字符串
     *       icon	String	否	用户头像，最大长度1024字节，可设置为空字符串
     *       sign	String	否	用户签名，最大长度256字符，可设置为空字符串
     *       email	String	否	用户email，最大长度64字符，可设置为空字符串
     *       birth	String	否	用户生日，最大长度16字符，可设置为空字符串
     *       mobile	String	否	用户mobile，最大长度32字符，非中国大陆手机号码需要填写国家代码(如美国：+1-xxxxxxxxxx)或地区代码(如香港：+852-xxxxxxxx)，可设置为空字符串
     *       gender	int	否	用户性别，0表示未知，1表示男，2女表示女，其它会报参数错误
     *       ex	String	否	用户名片扩展字段，最大长度1024字符，用户可自行扩展，建议封装成JSON字符串，也可以设置为空字符串
     * 
     * @returns {Promise.<void>}
     */
    updateAccount(params) {
        return this._request({ uri: config.URL_UPDATE_ACCOUNT, params });
    }

    /**
     * 刷新token
     * @param params
     *          accid  String  是  网易云通信ID，最大长度32字符，必须保证一个APP内唯一
     * @returns {Promise.<*>}
     * {accid: '1' }
     */
    async refreshToken(params) {
        return this._request({ uri: config.URL_REFRESH_TOKEN, params });
    }

    /**
     * 封禁账号
     * @param params
     *          accid  String  是  网易云通信ID，最大长度32字符，必须保证一个APP内唯一
     *          needkick  String  否  是否踢掉被禁用户，true或false，默认false
     * @returns {Promise.<void>}
     */
    blockAccount(params) {
        return this._request({ uri: config.URL_BLOCK_ACCOUNT, params });
    }

    /**
     * 解封账号
     * @param params
     *              accid  String  是  网易云通信ID，最大长度32字符，必须保证一个APP内唯一
     * @returns {Promise.<void>}
     */
    unblockAccount(params) {
        return this._request({ uri: config.URL_UNBLOCK_ACCOUNT, params });
    };

    /**
     * 设置二人为好友
     * @param {*} params
     *             accid  String  是  发起者ID
     *             faccid  String	是	加好友接收者accid
     *             type	int	是	1直接加好友，2请求加好友，3同意加好友，4拒绝加好友
     *             msg	String	否	加好友对应的请求消息，第三方组装，最长256字符
     *             serverex	String	否	服务器端扩展字段，限制长度256 此字段client端只读，server端读写
     * @returns {Promise.<void>}
     */
    async friendAdd(params) {
        return this._request({ uri: config.URL_FRIEND_ADD, params })
    }

    /**
     * 已经是好友更新信息
     * @param {*} params
     *    accid	String	是	发起者accid
     *    faccid	String	是	要修改朋友的accid
     *    alias	String	否	给好友增加备注名，限制长度128，可设置为空字符串
     *    ex	String	否	修改ex字段，限制长度256，可设置为空字符串
     *    serverex	String	否	修改serverex字段，限制长度256，可设置为空字符串
     *    此字段client端只读，server端读写
     * @returns {Promise.<void>}
     */
    friendUpdate(params) {
        return this._request({ uri: config.URL_FRIEND_UPATE, params })
    }

    /**
     * 删除好友
     * @param {*} params
     * accid	String	是	发起者accid
     * faccid	String	是	要删除朋友的accid
     * isDeleteAlias	Boolean	否	是否需要删除备注信息默认false:不需要，true:需要
     */
    friendDelete(params) {
        return this._request({ uri: config.URL_FRIEND_DELETE, params })
    };
    /**
     * 获取好友列表
     * @param {*} params
     *       accid	String	是	发起者accid
     *       updatetime	Long	是	更新时间戳，接口返回该时间戳之后有更新的好友列表
     *       createtime	Long	否	【Deprecated】定义同updatetime
     * @returns {Promise.<void>}
     */
    friendList(params) {
        return this._request({ uri: config.URL_FRIEND_GET, params });
    };

    /**
     * 设置黑名单或静音
     * @param {*} params
     *    accid	      String	是	用户帐号，最大长度32字符，必须保证一个APP内唯一
     *    targetAcc	  String	是	被加黑或加静音的帐号
     *    relationType	 int	是	本次操作的关系类型,1:黑名单操作，2:静音列表操作
     *    value	         int	是	操作值，0:取消黑名单或静音，1:加入黑名单或静音
     * @returns {Promise.<void>}
     */
    setBlack(params) {
        return this._request({ uri: config.URL_BLACK_SET, params });
    }

    /**
     * 获取用户黑名单列表
     * @param {*} params
     *    accid	String	是	用户帐号，最大长度32字符，必须保证一个APP内唯一
     * @returns {Promise.<void>}
     */
    getBlack(params) {
        return this._request({ uri: config.URL_BLACK_LIST, params });
    }

    /**
     * 批量发送自定义系统通知
     * 
     * @param {*} params
     * 
     *      fromAccid	String	是	发送者accid，用户帐号，最大32字符，APP内唯一
     *      toAccids	String	是	["aaa","bbb"]（JSONArray对应的accid，如果解析出错，会报414错误），最大限500人
     *      attach	    String	是	自定义通知内容，第三方组装的字符串，建议是JSON串，最大长度4096字符
     *      pushcontent	String	否	推送文案，android以此为推送显示文案；ios若未填写payload，显示文案以pushcontent为准。超过500字符后，会对文本进行截断。
     *      payload	    String	否	iOS推送对应的payload,必须是JSON,不能超过2k字符
     *      sound	    String	否	如果有指定推送，此属性指定为客户端本地的声音文件名，长度不要超过30个字符，如果不指定，会使用默认声音
     *      save	    int	    否	1表示只发在线，2表示会存离线，其他会报414错误。默认会存离线
     *      option      String	否	发消息时特殊指定的行为选项,Json格式，可用于指定消息计数等特殊行为;option中字段不填时表示默认值。
     *                              option示例：
     *                              {"badge":false,"needPushNick":false,"route":false}
     *                              字段说明：
     *                              1. badge:该消息是否需要计入到未读计数中，默认true;
     *                              2. needPushNick: 推送文案是否需要带上昵称，不设置该参数时默认false(ps:注意与sendBatchMsg.action接口有别)。
     *                              3. route: 该消息是否需要抄送第三方；默认true (需要app开通消息抄送功能)
     * 
     */
    sendBatchAttachMsg(params) {
        return this._request({ uri: config.URL_BATCH_ATTACH_MSG, params });
    }

    /**
     * 发送单个自定义系统通知
     * 
     * @param {*} params
     *          from	    String	是	发送者accid，用户帐号，最大32字符，APP内唯一
     *          msgtype	     int	是	0：点对点自定义通知，1：群消息自定义通知，其他返回414
     *          to	S      tring	是	msgtype==0是表示accid即用户id，msgtype==1表示tid即群id
     *          attach	   String	是	自定义通知内容，第三方组装的字符串，建议是JSON串，最大长度4096字符
     *          pushcontent	String	否	推送文案，android以此为推送显示文案；ios若未填写payload，显示文案以pushcontent为准。超过500字符后，会对文本进行截断。
     *          payload	  String	否	iOS推送对应的payload,必须是JSON,不能超过2k字符
     *          sound	  String	否	如果有指定推送，此属性指定为客户端本地的声音文件名，长度不要超过30个字符，如果不指定，会使用默认声音
     *          save	     int	否	1表示只发在线，2表示会存离线，其他会报414错误。默认会存离线
     *          option	   String	否	发消息时特殊指定的行为选项,Json格式，可用于指定消息计数等特殊行为;option中字段不填时表示默认值。
     *                                  option示例：
     *                                  {"badge":false,"needPushNick":false,"route":false}
     *                                  字段说明：
     *                                  1. badge:该消息是否需要计入到未读计数中，默认true;
     *                                  2. needPushNick: 推送文案是否需要带上昵称，不设置该参数时默认false(ps:注意与sendMsg.action接口有别);
     *                                  3. route: 该消息是否需要抄送第三方；默认true (需要app开通消息抄送功能)
     * 
     */
    sendBatchAttachMsg(params) {
        return this._request({ uri: config.URL_BATCH_ATTACH_MSG, params });
    }

    async _request({ uri, params }) {
        const headers = this.getAuthHeaders();
        const res = await axios({
            method: 'post',
            url: uri,
            headers: headers,
            data: params,
            params: params
        });
        // this._checkError(res.data);
        // console.log(res);
        return res.data;
    }
}

module.exports = IM;
