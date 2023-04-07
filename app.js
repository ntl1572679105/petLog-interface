const express = require('express')
//解决跨域问题
const cors = require('cors')
const pool = require('./pool')
const app = express()
app.use(cors({
    origin: '*'
}))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    next();
})
app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send({ code: 500, msg: '服务器端错误' })
})
// 使用路由
const userRouter = require('./router/user')
const newsRouter = require('./router/news')
const communityRouter = require('./router/community')
const EncyclopediasRouter = require('./router/Encyclopedias')
const petshopRouter = require('./router/petshop')

//解决跨域
app.use(express.urlencoded({
    extended: true
}))
//使用路由器
app.use('/user/', userRouter)
app.use('/news/', newsRouter)
app.use('/community/', communityRouter)
app.use('/Encyclopedias/', EncyclopediasRouter)
app.use('/petshop',petshopRouter)
app.use(express.static('public'))
//报错问题

// 解决post传参

app.listen(3000, () => {
    console.log('服务器启动成功')
})