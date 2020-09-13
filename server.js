'use strict';

// Dependencies

require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 3030;
const app = express();
const superagent = require('superagent');
app.set('view engine', 'ejs');

// Using the public folder and sunFiles
app.use(express.static('./public'));

// Routs
app.get('/', homePage);
app.get('/live', getData);
app.get('/h2h', h2hFunction)

// Functions

// Home page function

function homePage(req, res) {
  res.render('pages/index');
}

// Get Live Soccer Matches From API
function getData(req, res) {
  superagent
    .get(
      'https://apiv2.apifootball.com/?action=get_events&from=2020-09-12&to=2020-09-12&APIkey=3feadcb8f9ec3881cd3da4ac84d420374cbd4cd83c8a2eef9f6a0d57faa29c44',
      {}
    )
    .then((data) => {
      let array = data.body.filter((item) => {
        if (item.match_live === '1' && item.match_status !== 'Finished') {
          return item;
        }
      });
      res.status(200).json(array);
    })
    .catch((err) => {
      res.status(500).json({
        error: 'Somthing went bad',
      });
    });
}

// get head to head information from API
function h2hFunction(req, res) {
  let { match_hometeam_name, match_awayteam_name } = req.body
  let key = process.env.SOCCER_API_KEY;
  const url = `https://apiv2.apifootball.com/?action=get_H2H&firstTeam=${match_hometeam_name}&secondTeam=${match_awayteam_name}&APIkey=${key}`
  let h2hAgent = superagent.get(url).then(item => {
    return item.body.filter(e => {
      let matchResult = new H2hResult(e);
      return matchResult;
    })
  })
  res.redirect('pages/h2hResult', { h2hData: h2hAgent })

}

// constructor Function

function H2hResult(data){
  this.country_name = data.country_name;
  this.league_name = data.league_name;
  this.match_date = data.match_date;
  this.match_hometeam_name = data.match_hometeam_name;
  this.match_hometeam_score = data.match_hometeam_score;
  this.match_awayteam_name = data.match_awayteam_name;
  this.match_awayteam_score = data.match_awayteam_score;

}

// Listen To Server

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
