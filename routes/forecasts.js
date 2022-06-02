const express = require('express')
const Forecast = require('../models/forecast')
const router = express.Router()
const Cookies=require('cookies')
var keys = ['Spirt']
let cookies = new Cookies((req,res)=>{keys:keys})

router.get('/new', (req, res) => {
  res.render('forecasts/new', { forecast: new Forecast() })
})

router.get('/edit/:id', async (req, res) => {
  const forecast = await Forecast.findById(req.params.id)
  res.render('forecasts/edit', { forecast: forecast })
})

router.get('/:slug', async (req, res) => {
  const forecast = await Forecast.findOne({ slug: req.params.slug })
  if (forecast == null) res.redirect('/')
  res.render('forecasts/show', { forecast: forecast })
})

router.post('/', async (req, res, next) => {
  req.forecast = new Forecast
  next()
}, saveForecastAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
  req.forecast = await Forecast.findById(req.params.id)
  next()
}, saveForecastAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
  await Forecast.findByIdAndDelete(req.params.id)
  res.redirect('/forecasts/index')
})

function saveForecastAndRedirect(path) {
  return async (req, res) => {
    //let login=cookies.get('login')
    let forecast = req.forecast
    //forecast.login = login
    forecast.title = req.body.title
    forecast.description = req.body.description
    forecast.markdown = req.body.markdown
    try {
      forecast = await forecast.save()
      res.redirect('/forecasts/index')
    } catch (e) {
      res.render(`forecasts/${path}`, { forecast: forecast })
    }
  }
}

module.exports = router
