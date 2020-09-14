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
app.get('/live', getLiveMatches);
app.get('/match_detail/:matchID', getLiveMatchDetails);
app.get('/question', getQuestionsChall);

// Functions

// Get Today date

function getTodayDate() {
  return new Date().toJSON().slice(0, 10).replace(/-/g, '/');
}

// Home page function

async function homePage(req, res) {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const todayDate = getTodayDate();
  const newsUrl = `https://newsapi.org/v2/everything?qInTitle="+soccer"&from=${todayDate}&to=${todayDate}&pageSize=30&apiKey=${NEWS_API_KEY}`;
  let liveMatches = await getUpCommingMatches(req, res);
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
async function getLiveMatches(req, res) {
  const SOCCER_API_KEY = process.env.SOCCER_API_KEY;
  const todayDate = getTodayDate();
  const liveURL = `https://apiv2.apifootball.com/?action=get_events&from=${todayDate}&to=${todayDate}&APIkey=${SOCCER_API_KEY}`;
  // console.log(liveURL);
  await superagent
    .get(liveURL)
    .then((data) => {
      // console.log(data.body);
      let liveMatchesArray = data.body
        .filter((item) => {
          // item.match_live === '1'
          if (item.match_status !== 'Finished') {
            return item;
          }
        })
        .map((match) => {
          return new liveMatches(match);
        });
      // console.log(liveMatchesArray);
      res.render('pages/live', { matchArray: liveMatchesArray });
    })
    .catch((err) => {
      res.status(500).json({
        error: 'Somthing went bad',
      });
    });
}

// Get UpComming Matches From API
async function getUpCommingMatches(req, res) {
  const { league_id } = req.query;
  const SOCCER_API_KEY = process.env.SOCCER_API_KEY;
  const todayDate = getTodayDate();
  const liveURL = `https://apiv2.apifootball.com/?action=get_events&from=${todayDate}&to=${todayDate}&league_id=${league_id || 148
    }&APIkey=${SOCCER_API_KEY}`;

  let matchesArray = await superagent.get(liveURL).then((data) => {
    if (data.body.length > 0) {
      return data.body
        .map((match) => {
          return new UpCommingMatches(match);
        })
        .sort((a, b) => {
          if (a.time < b.time) {
            return -1;
          } else if (a.time > b.time) {
            return 1;
          } else return 0;
        });
    } else {
      return [];
    }
  });
  return matchesArray;
}

// Get Live Match Details

function getLiveMatchDetails(req, res) {
  const matchID = req.params.matchID;
  const todayDate = getTodayDate();
  const SOCCER_API_KEY = process.env.SOCCER_API_KEY;
  const matchResultUrl = `https://apiv2.apifootball.com/?action=get_events&from=${todayDate}&to=${todayDate}&match_id=${matchID}&APIkey=${SOCCER_API_KEY}`;
  console.log('getLiveMatchDetails -> matchResultUrl', matchResultUrl);
  return superagent.get(matchResultUrl).then((data) => {
    let matchDetail = new MatchDetail(data.body[0]);
    res.render('pages/matchDetails', { match: matchDetail });
  });
}

// Challenge Questions

function getQuestionsChall(req, res) {
  // console.log(req.query);
  const { question, diffculty } = req.query;
  const questionURL = `https://opentdb.com/api.php?amount=${question}&category=21&difficulty=${diffculty}&type=multiple`;
  console.log(questionURL);
  superagent.get(questionURL).then((data) => {
    let qustionArray = data.body.results.map(question => {
      return new challengeQuestion(question);
    })
    res.render('pages/questions', { questions: qustionArray })
  });
}

//Constructors

//News Constructors - #1
function News(newsData) {
  this.title = newsData.title;
  this.image_url = newsData.urlToImage
    ? newsData.urlToImage.includes('rcom-default')
      ? '/images/background.jpg'
      : newsData.urlToImage
    : '/images/background.jpg';
  this.url = newsData.url;
  this.author = newsData.author;
  this.description = newsData.description;
}

// Main page UpCommingMatches constructor
function UpCommingMatches(matchData) {
  this.time = matchData.match_time;
  this.home_team = matchData.match_hometeam_name;
  this.away_team = matchData.match_awayteam_name;
  this.home_team_logo = matchData.team_home_badge;
  this.away_team_logo = matchData.team_away_badge;
}

// Live Matches Constructor

function liveMatches(matchData) {
  this.match_id = matchData.match_id;
  this.league_logo = matchData.league_logo;
  this.league_name = matchData.league_name;
  this.match_time = matchData.match_time;
  this.match_hometeam_name = matchData.match_hometeam_name;
  this.match_awayteam_name = matchData.match_awayteam_name;
  this.team_home_badge = matchData.team_home_badge
    ? matchData.team_home_badge
    : 'https://apiv2.apifootball.com/badges/17691_hafnarfjordur-w.png';
  this.team_away_badge = matchData.team_away_badge
    ? matchData.team_away_badge
    : 'https://apiv2.apifootball.com/badges/17691_hafnarfjordur-w.png';
  this.score = `${matchData.match_hometeam_score} : ${matchData.match_awayteam_score}`;
}

// get live match deatail

function MatchDetail(matchData) {
  this.country_name = matchData.country_name;
  this.league_name = matchData.league_name;
  this.match_date = matchData.match_date;
  this.match_time = matchData.match_time;
  this.match_hometeam_name = matchData.match_hometeam_name;
  this.match_awayteam_name = matchData.match_awayteam_name;
  this.match_stadium = matchData.match_stadium;
  this.team_home_badge = matchData.team_home_badge;
  this.team_away_badge = matchData.team_away_badge;
  this.league_logo = matchData.league_logo;
  this.cards = matchData.cards; /*array*/
  this.substitutions = matchData.substitutions;
  this.score = `${matchData.match_hometeam_score} : ${matchData.match_awayteam_score}`;
}

// get challenge Constructor
function challengeQuestion(question) {
  this.question = question.question;
  this.answers = question.incorrect_answers.concat(question.correct_answer);
  this.correct_answer = question.correct_answer;
}

// Listen To Server

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
