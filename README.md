# IMSdk
云信 node.js sdk

     const uuidv4 = require('uuid/v4');
     const im = new IM(conf.appKey, conf.appSecret);
      // 注册账户
     const result = await im.createAccount({
         accid: uuidv4().replace(/\-/g, ''),
         name: "昵称",
         gender: 1, // 性别 1 男 2 女 0 未知
         icon:"imageUrl", // 头像地址URL       
     });
     if (result.code == 200) {
         token = result.info.token;
         accid = result.info.accid;    
     }     
     
     
