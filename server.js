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

// Functions

// Get Today date

function getTodayDate() {
  return new Date().toJSON().slice(0, 10).replace(/-/g, '/');
}

// Home page function

async function homePage(req, res) {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const todayDate = getTodayDate();
  const newsUrl = `https://newsapi.org/v2/everything?qInTitle="+soccer"&to=${todayDate}&pageSize=30&apiKey=${NEWS_API_KEY}`;
  let liveMatches = await getLiveMatches(req, res);
  superagent.get(newsUrl).then((data) => {
    let newsArray = data.body.articles.map((news) => {
      return new News(news);
    });
    res.render('pages/index', {
      news: newsArray,
      matches: liveMatches,
    });
  });
}

// Get Live Soccer Matches From API
function getData(req, res) {
  const SOCCER_API_KEY = process.env.SOCCER_API_KEY;
  const todayDate = getTodayDate();
  const liveURL = `https://apiv2.apifootball.com/?action=get_events&from=${todayDate}&to=${todayDate}&APIkey=${SOCCER_API_KEY}`;
  superagent
    .get(liveURL)
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

async function getLiveMatches(req, res) {
  const { league_id } = req.query;
  const SOCCER_API_KEY = process.env.SOCCER_API_KEY;
  const todayDate = getTodayDate();
  const liveURL = `https://apiv2.apifootball.com/?action=get_events&from=${todayDate}&to=${todayDate}&league_id=${
    league_id || 148
  }&APIkey=${SOCCER_API_KEY}`;

  return await superagent.get(liveURL).then((data) => {
    return data.body.map((match) => {
      return new LiveMatch(match);
    });
  });
}
//Constructors

//News Constructors - #1
function News(newsData) {
  this.title = newsData.title;
  // this.image_url = newsData.urlToImage;
  this.image_url = newsData.urlToImage
    ? newsData.urlToImage.includes('rcom-default')
      ? '/images/background.jpg'
      : newsData.urlToImage
    : '/images/background.jpg';
  this.url = newsData.url;
  this.author = newsData.author;
  this.description = newsData.description;
}

// Main page Live constructor
function LiveMatch(matchData) {
  this.time = matchData.match_time;
  this.home_team = matchData.match_hometeam_name;
  this.away_team = matchData.match_awayteam_name;
  this.home_team_logo = matchData.team_home_badge;
  this.away_team_logo = matchData.team_away_badge;
}

// Listen To Server

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
