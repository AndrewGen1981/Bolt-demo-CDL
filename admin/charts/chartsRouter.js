const express = require("express")
const path = require('path')

const charts = require("../adminProfileCharts")

const chartsRouter = express.Router()


// @GET Accounts Receivables
chartsRouter.get('/AR', async (req, res) => {
    const chartData = await charts.accountsReceivableChart()
    if(chartData.result && chartData.data) {
        res.render(path.join(__dirname+'/accountsReceivable.ejs'), { locationsData: chartData.data })
    } else {
        res.status(404).send(chartData.message)
    }
})


// @GET Passed/Failed
chartsRouter.get('/PF', async (req, res) => {
    const chartData = await charts.enrollmentStatusesChart(12)
    if(chartData.length) {
        res.render(path.join(__dirname+'/enrollmentStatus.ejs'), { chartData })
    } else {
        res.status(404).send("No data found")
    }
})


// @GET Instructors Activity
chartsRouter.get('/IA', async (req, res) => {
    const chartData = await charts.instructorsActivityChart(12)
    if(chartData.length) {
        res.render(path.join(__dirname+'/instructorsActivity.ejs'), { chartData })
    } else {
        res.status(404).send("No data found")
    }
})


module.exports = chartsRouter