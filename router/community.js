//首页
const express = require('express');
//引入连接池
const pool = require('../pool')
const Response = require("../utils/Response.js");
const router = express.Router()
const Joi = require("joi");
const e = require('express');
const { json } = require('express');
// 用户发布信息
router.post('/addInvite/', (req, res, next) => {
  let { invitation_title, invitation_content, invitation_time, user_id } = req.body
  // 表单验证
  let schema = Joi.object({
    invitation_title: Joi.string().required(), // 必填
    invitation_content: Joi.string().required(), // 必填
    invitation_time: Joi.string().required(),
    user_id: Joi.string().required(), // 必填
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  pool.query('insert into invitation(invitation_title,invitation_content,invitation_time,user_id) values(?,?,?,?)', [invitation_title, invitation_content, invitation_time, user_id], (err, r) => {
    if (err) {
      return next(err)
    }
    res.send({ code: 200, msg: '添加成功' })
  })
})
// 2.用户根据信息的用户id查询信息接口
router.get('/list/id/', (req, res, next) => {
  let { user_id, page, pagesize } = req.query
  // 表单验证
  let schema = Joi.object({
    user_id: Joi.string().required(), // 必填
    page: Joi.string().required(), // 必填
    pagesize: Joi.string().required(), // 必填
  });
  let { error, value } = schema.validate(req.query);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let startIndex = (page - 1) * pagesize;
  let size = parseInt(pagesize);
  pool.query('select * from invitation where `user_id` = ? limit ?,?;select count(*) as count from invitation where `user_id` = ?;select * from user where user_id = ?', [user_id, startIndex, size, user_id, user_id], (err, r) => {
    if (err) {
      return next(err)
    }
    let total = r[1][0].count
    if (r.length == 0) {
      res.send({ code: 400, msg: '没有该用户的评论' })
    } else {
      res.send({ code: 200, msg: '查询成功', data: r[0], page, pagesize, total, user: r[2] })

    }
  })
})
// 查询所有的信息
router.get('/list', (req, res, next) => {
  let { page, pagesize } = req.query;
  let schema = Joi.object({
    page: Joi.number().required(), // page必须是数字，必填
    pagesize: Joi.number().integer().required(), // pagesize必须是不大于100的数字，必填
  });
  let { error, value } = schema.validate(req.query);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let startIndex = (page - 1) * pagesize;
  let size = parseInt(pagesize);
  pool.query('select * from invitation JOIN user ON user.user_id = invitation.user_id LIMIT ?, ?;select count(*) as count from invitation;', [startIndex, size], (err, r) => {
    let total = r[1][0].count
    if (err) {
      return next(err)
    }
    if(r[0].length == 0){
      return res.send({code:401,msg:'没有数据'})
    }
    res.send({ code: 200, msg: '查询成功', data: r[0], page, pagesize, total })
  })
})
// 修改信息状态
router.post('/state/', (req, res, next) => {
  let { invitation_state, invitation_id } = req.body
  let schema = Joi.object({
    invitation_id: Joi.string().required(), // 必填
    invitation_state: Joi.string().required() // 必填
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let sql = 'update invitation set invitation_state = ? where invitation_id = ?'
  pool.query(sql, [invitation_state, invitation_id], (err, r) => {
    if (err) {
      return next(err)
    }
    res.send({ code: 200, msg: '修改成功' })
  })
})
// 修改信息接口
router.post('/update/', (req, res, next) => {
  let { invitation_title, invitation_content, invitation_time, invitation_id } = req.body
  let schema = Joi.object({
    invitation_title: Joi.string().required(), // 必填
    invitation_content: Joi.string().required(), // 必填
    invitation_time: Joi.string().required(),
    invitation_id: Joi.string().required() // 必填
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let sql = 'update invitation set invitation_title = ?,invitation_content = ?,invitation_time = ? where invitation_id = ?'
  pool.query(sql, [invitation_title, invitation_content, invitation_time, invitation_id], (err, r) => {
    if (err) {
      return next(err)
    }
    res.send({ code: 200, msg: '修改成功' })
  })
})
// 信息的删除接口
router.post('/del/', (req, res, next) => {
  let invitation_id = req.body.invitation_id
  let schema = Joi.object({
    invitation_id: Joi.string().required(), // 必填
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let sql = "delete from invitation where invitation_id = ?"
  pool.query(sql, [invitation_id], (err, r) => {
    if (err) {
      return next(err)
    }
    res.send({ code: 200, msg: '删除成功' })
  })
})
// 发表评论
router.post('/add/commenton', (req, res, next) => {
  let { commenton_content, invitation_id, parent_id, user_id } = req.body
  let schema = Joi.object({
    commenton_content: Joi.string().required(), // 必填
    invitation_id: Joi.string().required(), // 必填
    parent_id: Joi.number().required(),
    user_id: Joi.string().required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let sql = 'insert into commenton(commenton_content,invitation_id,parent_id,user_id) values(?,?,?,?)'
  pool.query(sql, [commenton_content, invitation_id, parent_id, user_id], (err, r) => {
    if (err) {
      return next(err)
    }
    res.send({ code: 200, msg: '评论成功' })
  })
})
// // 通过信息id查询该信息的评论
// router.get('/list/commenton/123',(req,res,next) => {
//   let invitation_id = req.query.invitation_id
//   let schema = Joi.object({
//     invitation_id: Joi.number().required(), // 必填
//   });
//   let { error, value } = schema.validate(req.query);
//   if (error) {
//     res.send(Response.error(400, error));
//     return; // 结束
//   }
//   let sql = 'select * from invitation , commenton where invitation.invitation_id=commenton.invitation_id and invitation.invitation_id=?'
//   pool.query(sql,[invitation_id],(err,r) => {
//     if (err) {
//       return next(err)
//     }
//     res.send({ code: 200, msg: '查询成功' ,data:r})
//   })
// })
// 通过用户id查询该用户的评论
router.get('/list/commenton/user', (req, res, next) => {
  let { user_id, page, pagesize } = req.query
  let schema = Joi.object({
    user_id: Joi.number().required(),
    page: Joi.number().required(),
    pagesize: Joi.number().required(), // 必填
  });
  let { error, value } = schema.validate(req.query);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let startIndex = (page - 1) * pagesize;
  let size = parseInt(pagesize);
  let sql = 'select * from invitation where user_id = ?  limit ?,?;select count(*) as count from invitation where user_id = ?'
  pool.query(sql, [user_id, startIndex, size, user_id], (err, r) => {
    if (err) {
      return next(err)
    }
    let total = r[1][0].count
    res.send({ code: 200, msg: '查询成功', data: r[0], page, pagesize, total })
  })
})
// 通过信息id查询该信息的评论
router.get('/list/commenton/888', (req, res, next) => {
  let invitation_id = req.query.invitation_id
  let schema = Joi.object({
    invitation_id: Joi.number().required(), // 必填
  });
  let { error, value } = schema.validate(req.query);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let sql = 'select * from commenton JOIN user ON user.user_id = commenton.user_id where invitation_id = ?;select count(*) as count from commenton where invitation_id = ?'
  pool.query(sql, [invitation_id,invitation_id], (err, r) => {
    if (err) {
      return next(err)
    }
    function get(r) {
      let data = r.filter(item => {
        item.children = r.filter(e => {
          return item.commenton_id == e.parent_id
        })
        return !item.parent_id

      })
      return data
    }
    let result = get(r)
    let total = result[1][0].count
    res.send({ code: 200, msg: '查询成功', result:result[0] , total})
  })
})
// 给信息点赞
router.post('like', (req, res, next) => {
  let { user_like, invitation_id } = req.body
  let sql = 'update invitation set user_like = ? where invitation_id = ?'
  pool.query(sql, [user_like, invitation_id], (ree, r) => {
    if (err) {
      return (next(err))
    }
    res.send({ code: 200, msg: 添加成功 })
  })
})
// 通过信息id查询信息评论
router.get('/list/commenton/invitation_id', (req, res, next) => {
  let invitation_id = req.query.invitation_id
  let schema = Joi.object({
    invitation_id: Joi.number().required(), // 必填
  });
  let { error, value } = schema.validate(req.query);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let sql = 'select * from invitation join user on user.user_id = invitation.user_id where invitation_id = ?'
  pool.query(sql, [invitation_id], (err, r) => {
    if (err) {
      return next(err)
    }
    res.send({ code: 200, msg: '查询成功', data: r })
  })
})
// 模糊查询信息
router.get('/list/name', (req, res, next) => {
  let keyword = req.query.keyword
  let schema = Joi.object({
    keyword: Joi.string().required(), // 必填
  });
  let { error, value } = schema.validate(req.query);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let sql = 'select * from invitation where invitation_title like ?'
  pool.query(sql, ['%' + keyword + '%'], (err, r) => {
    if (err) {
      return next(err)
    }
    if (r.length == 0) {
      return res.send({ code: 401, msg: '暂无数据' })
    }
    res.send({ code: 200, msg: '查询成功', data: r })
  })
})
module.exports = router