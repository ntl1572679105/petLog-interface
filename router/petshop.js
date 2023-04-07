const express = require('express');
//引入连接池
const pool = require('../pool')
const Response = require("../utils/Response.js");
const router = express.Router()
const Joi = require("joi");
const response = require('../utils/Response.js');

//宠物店新增商品接口n
router.post('/addcommodity', (req, resp, next) => {
  let { commondity_name, commondity_description, commondity_img, commondity_price, petshop_id } = req.body
  let schema = Joi.object({
    commondity_name: Joi.string().required(), // 必填
    commondity_description: Joi.string().required(), // 必填
    commondity_img: Joi.string().required(),
    commondity_price: Joi.string().required(),
    petshop_id: Joi.number().required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) {
    resp.send(Response.error(400, error));
    return; // 结束
  }
  let sql = "insert into commondity(commondity_name,commondity_description,commondity_img,commondity_price,petshop_id) values(?,?,?,?,?)";
  pool.query(sql, [commondity_name, commondity_description, commondity_img, commondity_price, petshop_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '新增成功' })
  });
})

//管理员修改商品状态
router.post('/updatestate', (req, resp, next) => {
  let { state, commondity_id } = req.body
  console.log(req.body)
  let sql = "update commondity set commondity_state=? where commondity_id=?";
  pool.query(sql, [state, commondity_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '更新状态成功' })
  });
})

//宠物店查询商品接口
router.get('/getcommondity', (req, resp, next) => {
  let { petshop_id, pno, count } = req.query
  petshop_id=parseInt(petshop_id)
  console.log(req.query)
  let sql = 'select * from commondity where petshop_id = ? limit ?,? ;select count(*) as pageCount from commondity where petshop_id = ?'
  pool.query(sql, [petshop_id,(pno-1)*count,+count,petshop_id], (err, r) => {
    if (err) {
      return next(err)
    }
    let { pageCount } = r[1][0]
    pageCount = Math.ceil(pageCount / count)
    resp.send({ code: 200, msg: '查询成功',data: { data: r[0], pageCount: pageCount } })
  });
})
//宠物店修改商品接口
router.post('/updatecommondity', (req, resp, next) => {
  let { commondity_name, commondity_description, commondity_img, commondity_price, commondity_id } = req.body
  console.log(req.body)
  let sql = "update commondity set commondity_name=?,commondity_description=?,commondity_img=?,commondity_price=? where commondity_id=?";
  pool.query(sql, [commondity_name, commondity_description, commondity_img, commondity_price, commondity_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '修改商品成功' })
  });
})

//宠物店删除商品接口
router.post('/deletecommondity', (req, resp, next) => {
  let { commondity_id } = req.body
  let sql = "delete from commondity where commondity_id = ?";
  pool.query(sql, [commondity_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '删除商品成功' })
  });
})


// 用户预约洗护接口
router.post('/addwash', (req, resp, next) => {
  let { type_id, wash_time, user_id, petshop_id } = req.body
  let sql = "insert into wash(type_id,wash_time,user_id,petshop_id) values(?,?,?,?)"
  pool.query(sql, [type_id, wash_time, user_id, petshop_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '新增预约成功' })
  });
})

// 宠物店修改预约状态
router.post('/updatewashstate', (req, resp, next) => {
  let { wash_id } = req.body
  console.log(wash_id)
  let sql = "update wash set wash_resolve=1 where wash_id=?"
  pool.query(sql, [wash_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '修改预约成功' })
  });
})

//用户跟读预约的用户id显示预约信息
router.get('/getwashByUserId', (req, resp, next) => {
  let { user_id, pno, count } = req.query
  console.log(req.query)
  user_id = parseInt(user_id)
  let sql = 'select * from wash,petshop where wash.petshop_id= petshop.petshop_id and wash.user_id =? limit ?,? ;select count(*) as pageCount from wash where user_id =?'
  pool.query(sql, [user_id, (pno - 1) * count, + count, user_id], (err, r) => {
    if (err) {
      return next(err)
    }
    let { pageCount } = r[1][0]
    pageCount = Math.ceil(pageCount / count)
    resp.send({ code: 200, msg: '成功', data: { data: r[0], pageCount: pageCount } })
  });
})

//宠物店根据预约宠物店id显示预约
router.get('/getwashByPetshopId', (req, resp, next) => {
  let { petshop_id, pno, count } = req.query
  console.log(req.query)
  petshop_id = parseInt(petshop_id)
  let sql = 'select * from wash ,user where wash.user_id=user.user_id and wash.petshop_id =? limit ?,? ;select count(*) as pageCount from wash where petshop_id =?'
  pool.query(sql, [petshop_id, (pno - 1) * count, + count, petshop_id], (err, r) => {
    if (err) {
      return next(err)
    }
    let { pageCount } = r[1][0]
    pageCount = Math.ceil(pageCount / count)
    resp.send({ code: 200, msg: '成功', data: { data: r[0], pageCount: pageCount } })
  });
})
//宠物店上架洗护套餐
router.post('/addwashType', (req, resp, next) => {
  let { type_name, price, petshop_id } = req.body
  let sql = 'insert into washtype(type_name,price,petshop_id) values(?,?,?)'
  pool.query(sql, [type_name, price, petshop_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '新增套餐成功' })
  });
})

// 查询所有宠物店
router.get('/getallpetshop', (req, resp, next) => {
  let { pno, count } = req.query
  let sql = 'select * from petshop limit ?,?;select count(*) as pageCount from petshop'
  pool.query(sql, [(pno - 1) * count, + count], (err, r) => {
    if (err) {
      return next(err)
    }
    let { pageCount } = r[1][0]
    pageCount = Math.ceil(pageCount / count)
    resp.send({ code: 200, msg: '查询宠物店成功', data: { data: r[0], pageCount: pageCount } })
  });
})



//模糊查询商品
router.get('/queryListByName', (req, resp, next) => {
  let { keyword,pno, count  } = req.query
  // let schema = Joi.object({
  //     keyword: Joi.string().required(), // 必填
  //  });
  //  let { error, value } = schema.validate(req.query);
  //  if (error) {
  //    resp.send(Response.error(400, error));
  //    return; // 结束
  //  }
  let sql = "SELECT * FROM `commondity` WHERE `commondity_name` LIKE ? "
  pool.query(sql, ['%' + keyword + '%'], (err, r) => {
    if (err) {
      return next(err)
    }
    if (r.length == 0) {
      resp.send({ code: 401, msg: '没有该商品' })
    }
    resp.send({ code: 200, msg: '查询成功', data:r })
  });
})

//根据宠物店id模糊查询商品
router.get('/queryListById', (req, resp, next) => {
  let { keyword ,petshop_id} = req.query
  console.log(keyword)
  console.log(keyword,petshop_id)
  // let schema = Joi.object({
  //     keyword: Joi.string().required(), // 必填
  //  });
  //  let { error, value } = schema.validate(req.query);
  //  if (error) {
  //    resp.send(Response.error(400, error));
  //    return; // 结束
  //  }
  let sql = "SELECT * FROM `commondity` WHERE petshop_id=? and `commondity_name` LIKE ? ;"
  pool.query(sql, [petshop_id , `%${keyword}%`], (err, r) => {
    if (err) {
      return next(err)
    }
    if (r.length == 0) {
    return  resp.send({ code: 401, msg: '没有该商品' })
    }
    resp.send({ code: 200, msg: '查询成功', data: r })
  });
})



//新增寄养
router.post('/addfosterage', (req, resp, next) => {
  let{petshop_id,daylong,total,user_id} = req.body
  let sql='insert into fosterage(petshop_id,daylong,total,user_id) values(?,?,?,?)'
  pool.query(sql, [petshop_id,daylong,total,user_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '新增寄养成功' })
  });
})


//宠物店根据petshop_id 查询寄养信息
router.get('/getfosteragebypetshopid',(req,resp,next)=>{
  let{petshop_id} = req.query
  let sql = 'select * from fosterage ,user where fosterage.user_id = user.user_id and fosterage.petshop_id = ?'
  pool.query(sql, [petshop_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '查询寄养成功',data:r })
  });
})


//用户根据id查询寄养信息
router.get('/getfosteragebyuserid',(req,resp,next)=>{
  let{user_id} = req.query
  let sql = 'select * from fosterage ,petshop where fosterage.petshop_id = petshop.petshop_id and fosterage.user_id = ?'
  pool.query(sql, [user_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '查询寄养成功',data:r })
  });
})


//新增预约照相
router.post('/addtakepic', (req, resp, next) => {
  let{petshop_id,user_id,pic_time} = req.body
  let sql='insert into takepicture(petshop_id,user_id,pic_time) values(?,?,?)'
  pool.query(sql, [petshop_id,user_id,pic_time], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '新增预约照相成功' })
  });
})


//宠物店根据petshop_id 查询照相信息
router.get('/getpicbypetshopid',(req,resp,next)=>{
  let{petshop_id} = req.query
  let sql = 'select * from takepicture ,user where takepicture.user_id = user.user_id and takepicture.petshop_id = ?'
  pool.query(sql, [petshop_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '查询拍照信息成功',data:r })
  });
})


//用户根据id查询寄养信息
router.get('/getpicbyuserid',(req,resp,next)=>{
  let{user_id} = req.query
  let sql = 'select * from takepicture ,petshop where takepicture.petshop_id = petshop.petshop_id and takepicture.user_id = ?'
  pool.query(sql, [user_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '查询拍照信息成功',data:r })
  });
})

//用户根据id查询宠物店信息
router.get('/listpetshopById',(req,resp,next)=>{
  let{petshop_id} = req.query
  let sql = 'select * from petshop where petshop_id = ?'
  pool.query(sql, [petshop_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '查询宠物店成功',data:r })
  });
})
//查询所有审核通过的商品
router.get('/listshopSuccess',(req,resp,next)=>{
  let{page,pagesize} = req.query
  let schema = Joi.object({
    page: Joi.number().required(), // page必须是数字，必填
    pagesize: Joi.number().integer().required(), // pagesize必须是不大于100的数字，必填
  });
  let { error, value } = schema.validate(req.query);
  if (error) {
    resp.send(Response.error(400, error));
    return; // 结束
  }
  let startIndex = (page - 1) * pagesize;
  let size = parseInt(pagesize);
  let sql = 'select * from commondity  where commondity_state=1 limit ?,?;select count(*) as total from commondity where commondity_state=1 '
  pool.query(sql, [startIndex, size], (err, r) => {
    if (err) {
      return next(err)
    }
    let { total } = r[1][0]
    resp.send({ code: 200, msg: '查询所有商品成功', data: { data: r[0], total: total }})
  });
})
//查询所有等待审核通过的商品
router.get('/listshopUn',(req,resp,next)=>{
  let{page,pagesize} = req.query
  let schema = Joi.object({
    page: Joi.number().required(), // page必须是数字，必填
    pagesize: Joi.number().integer().required(), // pagesize必须是不大于100的数字，必填
  });
  let { error, value } = schema.validate(req.query);
  if (error) {
    resp.send(Response.error(400, error));
    return; // 结束
  }
  let startIndex = (page - 1) * pagesize;
  let size = parseInt(pagesize);
  let sql = 'select * from commondity  where commondity_state=0 limit ?,?;select count(*) as total from commondity where commondity_state=0 '
  pool.query(sql, [startIndex, size], (err, r) => {
    if (err) {
      return next(err)
    }
    let { total } = r[1][0]
    resp.send({ code: 200, msg: '查询所有未审核商品成功', data: { data: r[0], total: total }})
  });
})


















//根据商品id查询商品
router.get('/querycommonditybyid',(req,resp,next)=>{
  let {commondity_id} = req.query
  let sql = 'select * from commondity where commondity_id=?'
  pool.query(sql,[commondity_id],(err,r)=>{
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '查询所有商品成功',data:r })
  })
})


//宠物店修改拍照状态
router.post('/updatepicstate', (req, resp, next) => {
  let { pic_id } = req.body
  
  let sql = "update takepicture set pic_resolve=1 where pic_id=?"
  pool.query(sql, [pic_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '修改预约成功' })
  });
})

//宠物店修改寄养状态
router.post('/updatefosterage', (req, resp, next) => {
  let { fosterage_id } = req.body
  let sql = "update fosterage set fosterage_resolve=1 where fosterage_id=?"
  pool.query(sql, [fosterage_id], (err, r) => {
    if (err) {
      return next(err)
    }
    resp.send({ code: 200, msg: '修改预约成功' })
  });
})

// 模糊查询宠物店地址
router.get('/listPetshop/Address',(req,resp,next)=>{
  let keyword = req.query.keyword
  let schema = Joi.object({
    keyword: Joi.string().required()
  })
  let{error,value} = schema.validate(req.query)
  if(error) {
    resp.send(Response.error(400,error))
    return
  }
  let sql = 'select * from petshop where petshop_address like ?'
  pool.query(sql,['%' + keyword + '%'],(err,r) => {
    if(err){
      return next(err)
    }
    if (r.length ==0 ){
      resp.send({code:400,msg:'没有数据'})
      return
    }
    resp.send({code:200,msg:'查询成功',data:r})
  })
})
router.get('/listPetshop/Address',(req,resp,next)=>{
  let keyword = req.query.keyword
  let schema = Joi.object({
    keyword: Joi.string().required()
  })
  let{error,value} = schema.validate(req.query)
  if(error) {
    resp.send(Response.error(400,error))
    return
  }
  let sql = 'select * from petshop where petshop_address like ?'
  pool.query(sql,['%' + keyword + '%'],(err,r) => {
    if(err){
      return next(err)
    }
    if (r.length ==0 ){
      resp.send({code:400,msg:'没有数据'})
      return
    }
    resp.send({code:200,msg:'查询成功',data:r})
  })
})












module.exports = router