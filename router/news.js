//首页
const express = require('express');
//引入连接池
const pool = require('../pool')
const response = require('../utils/Response.js');
const { get } = require('./user');
const router = express.Router()
const Joi = require("joi");
// 查询所有新闻列表
router.get('/list/', (req, res, next) => {
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
    pool.query('select * from news limit ?,?;select count(*) as count from news', [startIndex, size] ,(err, r) => {
        if (err) {
          return next(err)
        }
        let total = r[1][0].count
        res.send({ code: 200, msg: 'ok',data:r[0] ,page,pagesize,total})
      });
})
// 新闻的删除接口
router.post('/del/',(req,res,next)=>{
    let news_id = req.body.news_id // post请求参数在req.body中
    let schema = Joi.object({
      news_id: Joi.string().required(), // 必填
    });
    let { error, value } = schema.validate(req.body);
    if (error) {
      res.send(Response.error(400, error));
      return; // 结束
    }
    // 表单验证通过，执行添加操作
    let sql = "delete from news where  news_id=?";
    pool.query(sql, [news_id], (err, r) => {
      if(err){
        return next(err)
      }
      res.send({code: 200, msg: '删除成功'})
    });
})
// 新增新闻
router.post('/add/',(req,res,next)=>{
    let{news_title,news_img,news_content,news_time} = req.body
    // 表单验证
    let schema = Joi.object({
      news_title: Joi.string().required(), // 必填
      news_img: Joi.string().required(), // 必填
      news_content: Joi.string().required(),
      news_time: Joi.string().required(), // 必填
    });
    let { error, value } = schema.validate(req.body);
    if (error) {
      res.send(Response.error(400, error));
      return; // 结束
    }
    let sql = "insert into news(news_title,news_img,news_content,news_time) values(?,?,?,?)";
    pool.query(sql, [news_title,news_img,news_content,news_time], (err, r) => {
      if(err){
        return next(err)
      }
      res.send({code: 200, msg: '新增成功'})
    });
})
// 修改新闻
router.post('/update/',(req,res,next)=>{
    let{news_title,news_img,news_content,news_time,news_id} = req.body
    let schema = Joi.object({
      news_title: Joi.string().required(), // 必填
      news_img: Joi.string().required(), // 必填
      news_content: Joi.string().required(), // 必填
      news_time: Joi.string().required(), // 必填
      news_id: Joi.string().required(), // 必填
    });
    let { error, value } = schema.validate(req.body);
    if (error) {
      res.send(Response.error(400, error));
      return; // 结束
    }
    let sql = "update news set news_title=?, news_img=?,news_content=?,news_time=? where news_id = ?";
    pool.query(sql, [news_title,news_img,news_content,news_time,news_id], (err, r) => {
      if(err){
        return next(err)
      }
      if(r.affectedRows == 0){
      return  res.send({code: 400, msg: '没有这条数据'}) 
    }
      res.send({code: 200, msg: '修改成功'})
    });
})
// 模糊查询新闻列表
router.get('/list/name',(req,resp,next)=>{
  let {keyword,page,pagesize} = req.query
  let schema = Joi.object({
    keyword: Joi.string().required(),
    page: Joi.string().required(),
    pagesize: Joi.string().required()
  })
  let{error,value} = schema.validate(req.query)
  if(error) {
    resp.send(Response.error(400,error))
    return
  }
  let startIndex = (page - 1) * pagesize;
  let size = parseInt(pagesize);
  let sql = 'select * from news where news_title like ? limit ?,?;select count(*) as count from news where news_title like ?'
  pool.query(sql,['%' + keyword + '%',startIndex,size,'%' + keyword + '%'],(err,r) => {
    if(err){
      return next(err)
    }
    if (r.length ==0 ){
      resp.send({code:400,msg:'没有数据'})
      return
    }
    resp.send({code:200,msg:'查询成功',data:r[0],page,pagesize,total:r[1][0].count})
  })
})
// 通过新闻id查询新闻详情
router.get('/list/id',(req,res,next)=>{
  let news_id = req.query
  let sql = 'select * from news where news_id = ?'
  pool.query(sql,[news_id],(err,r)=>{
    if(err){
      return next(err)
    }
    if (r.length ==0 ){
      res.send({code:400,msg:'没有数据'})
      return
    }
    res.send({code:200,msg:'查询成功',data:r[0]})
  })
})
// 查询所有的新闻列表
router.get('/list/type',(req,res,next)=>{
  let sql = 'select * from news_type'
  pool.query(sql,(err,r)=>{
    if(err){
      return next(err)
    }
    res.send({code:200,msg:'查询所有新闻列表成功',data:r})
  })
})
router.get('/list/', (req, res, next) => {
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
  let startIndex = (page - 1) * 10;
  let size = parseInt(pagesize);
    pool.query('select * from news limit ?,?;select count(*) as count from news', [startIndex, size] ,(err, r) => {
        if (err) {
          return next(err)
        }
        let total = r[1][0].count
        res.send({ code: 200, msg: 'ok',data:r[0] ,page,pagesize,total})
      });
})
// 新闻的删除接口
router.post('/del/',(req,res,next)=>{
    let news_id = req.body.news_id // post请求参数在req.body中
    let schema = Joi.object({
      news_id: Joi.string().required(), // 必填
    });
    let { error, value } = schema.validate(req.body);
    if (error) {
      res.send(Response.error(400, error));
      return; // 结束
    }
    // 表单验证通过，执行添加操作
    let sql = "delete from news where  news_id=?";
    pool.query(sql, [news_id], (err, r) => {
      if(err){
        return next(err)
      }
      res.send({code: 200, msg: '删除成功'})
    });
})
// 新增新闻
router.post('/add/',(req,res,next)=>{
    let{news_title,news_img,news_content,news_time} = req.body
    // 表单验证
    let schema = Joi.object({
      news_title: Joi.string().required(), // 必填
      news_img: Joi.string().required(), // 必填
      news_content: Joi.string().required(),
      news_time: Joi.string().required(), // 必填
    });
    let { error, value } = schema.validate(req.body);
    if (error) {
      res.send(Response.error(400, error));
      return; // 结束
    }
    let sql = "insert into news(news_title,news_img,news_content,news_time) values(?,?,?,?)";
    pool.query(sql, [news_title,news_img,news_content,news_time], (err, r) => {
      if(err){
        return next(err)
      }
      res.send({code: 200, msg: '新增成功'})
    });
})
// 修改新闻
router.post('/update/',(req,res,next)=>{
    let{news_title,news_img,news_content,news_time,news_id} = req.body
    let schema = Joi.object({
      news_title: Joi.string().required(), // 必填
      news_img: Joi.string().required(), // 必填
      news_content: Joi.string().required(), // 必填
      news_time: Joi.string().required(), // 必填
      news_id: Joi.string().required(), // 必填
    });
    let { error, value } = schema.validate(req.body);
    if (error) {
      res.send(Response.error(400, error));
      return; // 结束
    }
    let sql = "update news set news_title=?, news_img=?,news_content=?,news_time=? where news_id = ?";
    pool.query(sql, [news_title,news_img,news_content,news_time,news_id], (err, r) => {
      if(err){
        return next(err)
      }
      if(r.affectedRows == 0){
        res.send({code: 400, msg: '没有这条数据'}) 
    }
      res.send({code: 200, msg: '修改成功'})
    });
})
// 通过新闻id查询新闻详情
router.get('/list/news-detail',(req,res,next)=>{
  // let news_id = req.query
  let news_id = req.query.news_id
  let sql = 'select * from news where news_id = ?'
  pool.query(sql,[news_id],(err,r)=>{
   if(err){
    return next(err)
   }
   if (r.length ==0 ){
    res.send({code:400,msg:'没有数据'})
    return
   }
   res.send({code:200,msg:'查询成功',data:r[0]})
  })
  })
// 查询所有的类型列表
router.get('/list/type',(req,res,next)=>{
   let sql = 'select * from news_type'
   pool.query(sql,(err,r)=>{
    if(err){
     return next(err)
    }
    res.send({code:200,msg:'查询所有类型列表成功',data:r})
   })
  })

// 模糊查询新闻列表
router.get('/list/name',(req,resp,next)=>{
   let {keyword,page,pagesize} = req.query
   let schema = Joi.object({
    // keyword: Joi.string(),
    page: Joi.string().required(),
    pagesize: Joi.string().required()
   })
   console.log(keyword.length);
  //  let{error,value} = schema.validate(req.query)
    let{error,value} = schema.validate({page,pagesize})
   if(error) {
    resp.send(Response.error(400,error))
    console.log('cuowu',error);
    return
   }
   let startIndex = (page - 1) * pagesize;
   let size = parseInt(pagesize);
  //  let sql = 'select * from news where news_title like ? limit ?,?;select count(*) as count from news where news_title like ?'
  let sql= 'select * from news where news_title like ? '
  //  pool.query(sql,['%' + keyword + '%',startIndex,size,'%' + keyword + '%'],(err,r) => {
  //   console.log(r);
  //   if(err){
  //    return next(err)
  //   }
  //   if (r.length ==0 ){
  //    resp.send({code:400,msg:'没有数据'})
  //    return
  //   }
  //   resp.send({code:200,msg:'查询成功',data:r[0],page,pagesize,total:r[1][0].count})
  //  })
  console.log('sql');
  pool.query(sql,['%' + keyword + '%'],(err,r) => {
    console.log(r.slice(startIndex,size),'1月胡');
    if(err){
     return next(err)
    }
    if (r.length ==0 ){
     resp.send({code:400,msg:'没有数据',data:[]})
     return
    }
    resp.send({code:200,msg:'查询成功',data:r.slice(startIndex,size)})
   })
  })


module.exports = router