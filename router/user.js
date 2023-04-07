//首页
const express = require('express');
//引入连接池
const pool = require('../pool')
const Response = require("../utils/Response.js");
const router = express.Router()
const Joi = require("joi");
const response = require('../utils/Response.js');
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'JWT_SECRET_KEY'
// 用户登录
router.post("/login", (req, resp) => {
  let { user_phone, user_pwd } = req.body
  // 表单验证
  let schema = Joi.object({
    user_phone: Joi.string().required().regex(/^(?:(?:\+|00)86)?1[3-9]\d{9}$/),
    user_pwd: Joi.string().required(), // 必填
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    resp.send(Response.error(400, error));
    return; // 结束
  }
  // 查询数据库，账号密码是否填写正确
  let sql = "select * from user where user_phone=? and user_pwd=?"
  pool.query(sql, [user_phone, user_pwd], (error, result) => {
    if (error) {
      resp.send(Response.error(500, error));
    }
    if (result.length == 0) {
      return resp.send(Response.error(1001, '账号密码输入错误'));
    }

    resp.send({ code: 200, msg: '登录成功',data:result })
    // 获取登录用户对象
    // let user = result[0]
    // // 为该用户颁发一个token字符串，未来该客户端若做发送其他请求，则需要在请求Header中携带token，完成状态管理。
    // let payload = { id: user.id, nickname: user.nickname }
    // let token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' })
    // // 返回user对象与token字符串
    // user.password = undefined
    // resp.send(Response.ok({ user, token }));


  })
});
// 用户注册
router.post("/register/", (req, res, next) => {
  let { user_name, user_phone, user_pwd, user_email } = req.body // post请求参数在req.body中
  let schema = Joi.object({
    user_name: Joi.string().required().regex(/^[\w-]{4,16}$/),
    user_phone: Joi.string().required().regex(/^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/),
    user_pwd: Joi.string().required().regex(/^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/), // 必填
    user_email: Joi.string().required().email()
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  // 表单验证通过，执行添加操作
  let sql = "insert into user(user_phone,user_pwd,user_name,user_email) values (?,?,?,?)";
  pool.query(sql, [user_phone, user_pwd, user_name, user_email], (err, r) => {
    if (err) {
      return next(err)
    }
    res.send({ code: 200, msg: '添加成功' })
  });
});
// 验证用户手机号是否已经注册
router.post("/query/phone", (req, res, next) => {
  let user_phone = req.body.user_phone // post请求参数在req.body中
  // 表单验证通过，执行添加操作

  let sql = "select * from user where  user_phone=?";
  pool.query(sql, [user_phone], (err, r) => {
    if (r.length == 0) {
      return res.send({ code: 200, msg: '该手机号没有注册', r: r })
    } else {
      return res.send({ code: 400, msg: '该手机号已经注册' })

    }
  });
});
// 用户修改信息
router.post('/update', (req, res, next) => {
  let { user_id, user_name, user_phone, user_email, user_avatar } = req.body
  // 表单验证
  let schema = Joi.object({
    user_id: Joi.string().required(),
    user_phone: Joi.string().required(),
    user_name: Joi.string().required(), // 必填
    user_email: Joi.string().required(), // 必填
    user_avatar: Joi.string().required(), // 必填

  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  pool.query("update user set user_phone=?,user_pwd=?,user_name=?,user_avatar=? where user_id=?", [user_phone, user_name, user_email, user_avatar, user_id], (err, r) => {
    if (err) {
      return next(err)
    }
    if (r.affectedRows == 0) {
      res.send({ code: 400, msg: '没有改账号' })
    }
    res.send({ code: 200, msg: '修改成功' })
  })
})
// 后台登录接口
router.post("/admin/login", (req, resp) => {
  let { admin_phone, admin_pwd } = req.body
  // 表单验证
  let schema = Joi.object({
    admin_phone: Joi.string().required(),
    admin_pwd: Joi.string().required() // 必填
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    resp.send(Response.error(400, error));
    return; // 结束
  }
  // 查询数据库，账号密码是否填写正确
  let sql = "select * from admin_a where admin_phone=? and admin_pwd=?;select * from role where admin_level = (select admin_level from admin_a where admin_phone=?and admin_pwd=?) ||admin_level = 0"
  pool.query(sql, [admin_phone, admin_pwd,admin_phone, admin_pwd], (error, r) => {
    if (error) {
      resp.send(Response.error(500, error));
      throw error;
    }
    if (r[0].length == 0) {
     return resp.send(Response.error(1001, '账号密码输入错误'));
    }
    let rights = []
      let obj = {}
      r[1].forEach(item => {
        obj[item.rid] = item
      })
    r[1].forEach(item => {
      // item.pid 为" "时 返回underfined
      let parent = obj[item.parent_id]
      if (parent) {
        (parent.children || (parent.children = [])).push(item)
      } else {
        // 这里push的item是pid为undefined的数据
        rights.push(item)
      }
      
    })
    let payload = {id: r[0].admin_id, nickname: r[0].admin_phone}
      let token = jwt.sign(payload, SECRET_KEY, {expiresIn: '1d'})
      // 返回user对象与token字符串
      r[0].admin_pwd = undefined
    resp.send({ user: r[0], rights,meta:{ code: 200, msg: '登录成功' },token})
  // 获取登录用户对象
  // let user = result[0]
  // // 为该用户颁发一个token字符串，未来该客户端若做发送其他请求，则需要在请求Header中携带token，完成状态管理。
  // let payload = { id: user.id, nickname: user.nickname }
  // let token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' })
  // // 返回user对象与token字符串
  // user.password = undefined
  // resp.send(Response.ok({ user, token }));


})
});
// 宠物店添加
router.post('/petshop/add', (req, res, next) => {
  let { petshop_name, petshop_address, petshop_phone } = req.body
  let schema = Joi.object({
    petshop_name: Joi.string().required().regex(/^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/),
    petshop_address: Joi.string().required(), // 必填
    petshop_phone: Joi.string().required().regex(/^(?:(?:\+|00)86)?1[3-9]\d{9}$/),

  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let sql = 'insert into petshop(petshop_name,petshop_address,petshop_phone) values(?,?,?)'
  pool.query(sql, [petshop_name, petshop_address, petshop_phone], (error, r) => {
    if (error) {
      res.send(Response.error(500, error));
      throw error;
    }
    res.send({ code: 200, msg: '添加成功' })
  })
})
// 根据用户id查询用户信息
router.get('/query/id',(req,res,next)=>{
  let{user_id} = req.query

  let sql = 'select * from user where user_id = ?'
  pool.query(sql,[user_id,startIndex,size],(error,r) => {
    if(error){
      res.send(Response.error(500, error));
      throw error;
    }
    res.send({ code: 200, msg: '查询成功',data:r })

  })
})
// 查询所有用户信息
router.get('/list/user',(req,res,next)=>{
  let{page,pagesize} = req.query
  let startIndex = (page - 1) * pagesize;
  let size = parseInt(pagesize);
  let sql = 'select * from user limit ?,?;select count(*) as count from user'
  pool.query(sql,[startIndex,size],(error,r) => {
    if(error){
      res.send(Response.error(500, error));
      throw error;
    }
    res.send({ code: 200, msg: '查询成功',data:r[0],page,pagesize,total:r[1][0].count })

  })
})
module.exports = router