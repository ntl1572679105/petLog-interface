//首页
const express = require('express');
//引入连接池
const pool = require('../pool')
const Response = require("../utils/Response.js");
const router = express.Router()
const Joi = require("joi");
// 查询科普
router.get('/list/', (req, res, next) => {
  let { page, pagesize } = req.query;
  let schema = Joi.object({
    page: Joi.number().required(), // page必须是数字，必填
    pagesize: Joi.number().required(), // pagesize必须是不大于100的数字，必填
  });
  let { error, value } = schema.validate(req.query);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let startIndex = (page - 1) * pagesize;
  let size = parseInt(pagesize);
  pool.query('select * from science limit ?,?;select count(*) as count from science', [startIndex, size], (err, r) => {
    let total = r[1][0].count
    if (err) {
      return next(err)
    }
    res.send({ code: 200, msg: 'ok', data: r[0], page, pagesize, total })
  });
})
// 通过类型查询科普
router.get('/list/type', (req, res, next) => {
  let { page, pagesize, science_type } = req.query;
  let schema = Joi.object({
    page: Joi.number().required(), // page必须是数字，必填
    pagesize: Joi.number().required(), // pagesize必须是不大于100的数字，必填
    science_type: Joi.string().required(), // pagesize必须是不大于100的数字，必填
  });
  let { error, value } = schema.validate(req.query);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let startIndex = (page - 1) * pagesize;
  let size = parseInt(pagesize);
  pool.query('select * from science where science_type = ? limit ?,?;select count(*) as count from science', [science_type, startIndex, size], (err, r) => {
    let total = r[1][0].count
    if (err) {
      return next(err)
    }
    res.send({ code: 200, msg: 'ok', data: r[0], page, pagesize, total })
  });
})
// 科普的删除接口
router.post('/del/', (req, res, next) => {
  let science_id = req.body.science_id // post请求参数在req.body中
  let schema = Joi.object({
    science_id: Joi.string().required(), // 必填
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  // 表单验证通过，执行添加操作
  let sql = "delete from science where  science_id=?";
  pool.query(sql, [science_id], (err, r) => {
    if (err) {
      return next(err)
    }
    if (r.affectedRows == 0) {
      return res.send({ code: 400, msg: '没有这条数据' })
    }
    res.send({ code: 200, msg: '删除成功' })
  });
})
// 新增科普
router.post('/add/', (req, res, next) => {
  let { science_name, science_pic } = req.body
  // 表单验证
  let schema = Joi.object({
    science_name: Joi.string().required(), // 必填
    science_pic: Joi.string().required() // 必填
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let sql = "insert into science(science_name,science_pic) values(?,?,?)";
  pool.query(sql, [science_name, science_pic], (err, r) => {
    if (err) {
      return next(err)
    }
    res.send({ code: 200, msg: '新增成功' })
  });
})
// 修改科普
router.post('/update/', (req, res, next) => {
  let { science_name, science_pic, science_id } = req.body
  let schema = Joi.object({
    science_name: Joi.string().required(), // 必填
    science_pic: Joi.string().required(), // 必填
    science_id: Joi.string().required() // 必填
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  let sql = "update science set science_name=?, science_pic=?where science_id = ?";
  pool.query(sql, [science_name, science_pic,science_id], (err, r) => {
    if (err) {
      return next(err)
    }
    if (r.affectedRows == 0) {
      return res.send({ code: 400, msg: '没有这条数据' })

    }
    res.send({ code: 200, msg: '修改成功' })
  });
})
// 模糊查询科普
router.get('/list/name', (req, resp, next) => {
  let { keyword, page, pagesize } = req.query
  let schema = Joi.object({
    keyword: Joi.string().required(),
    page: Joi.string().required(),
    pagesize: Joi.string().required(),
  })
  let { error, value } = schema.validate(req.query)
  if (error) {
    resp.send(Response.error(400, error))
    return
  }
  let startIndex = (page - 1) * pagesize;
  let size = parseInt(pagesize);
  let sql = 'select * from science where science_name like ? limit ?,?; select count(*) as count from science where science_name like ?'
  pool.query(sql, ['%' + keyword + '%', startIndex, size, '%' + keyword + '%'], (err, r) => {
    if (err) {
      return next(err)
    }
    if (r.length == 0) {
      resp.send({ code: 400, msg: '没有数据' })
      return
    }
    resp.send({ code: 200, msg: '查询成功', data: r[0], page, pagesize, total: r[1][0].count })
  })
})
// 根据科普id查询科普详情
router.get('/list/id', (req, resp, next) => {
  let { science_id } = req.query
  let sql = 'select * from science where science_id = ?'
  pool.query(sql, [science_id], (err, r) => {
    if (err) {
      return next(err)
    }
    if (r.length == 0) {
      resp.send({ code: 400, msg: '没有数据' })
      return
    }
    resp.send({ code: 200, msg: '查询成功', data: r[0] })
  })
})
module.exports = router