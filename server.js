'use strict';

// Dependencies

require('dotenv').config({ path: require('find-config')('.env') });
const express = require('express');
const app = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 3030;
app.set('view engine', 'ejs');

// Using the public folder and sunFiles
app.use(express.static('./public'));

// Routs
app.get('/', homePage);

app.get('/h2h', h2hFunction);
app.get('/player', playerInfo);
app.get('/events', eventsInfo);
app.get('/bestOf', bestPlayerInfo);
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
          //item.match_status !== 'Finished'
          if (item.match_live === '1') {
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

// get head to head information from API
function h2hFunction(req, res) {
  let { match_hometeam_name, match_awayteam_name } = req.query;
  let key = process.env.SOCCER_API_KEY;
  // console.log('key',key);
  const url = `https://apiv2.apifootball.com/?action=get_H2H&firstTeam=${match_hometeam_name}&secondTeam=${match_awayteam_name}&APIkey=${key}`;
  // console.log('url',url)
  superagent.get(url).then((item) => {
    // console.log("url data",item)
    let h2hAgent = item.body.firstTeam_VS_secondTeam.map((e) => {
      return new H2hResult(e);
    });
    res.render('pages/h2hResult', { h2hData: h2hAgent });
  });
}
// get the player information
function playerInfo(req, res) {
  let { player_name } = req.query;
  let key = process.env.SOCCER_API_KEY;
  // console.log('key',key);
  const url = `https://apiv2.apifootball.com/?action=get_players&player_name=${player_name}&APIkey=${key}`;
  // console.log('url',url)
  superagent.get(url).then((item) => {
    // console.log("url data", item)
    let playerAgent = item.body.map((e) => {
      return new Player(e);
    });
    res.render('pages/playerInfo', { playerData: playerAgent });
  });
}
// get the details for any match depending on the date
function eventsInfo(req, res) {
  let { fromDate, toDate } = req.query;
  let key = process.env.SOCCER_API_KEY;
  // console.log('key',key);
  const url = `https://apiv2.apifootball.com/?action=get_events&from=${fromDate}&to=${toDate}&APIkey=${key}`;
  // console.log('url',url)
  superagent.get(url).then((item) => {
    // console.log("url data", item)
    let dateAgent = item.body.map((e) => {
      return new Date1(e);
    });
    res.render('pages/dateInfo', { dateData: dateAgent });
  });
}

// Get the best player from league id then from the teams of each league
let teamArr = [];
function bestPlayerInfo(req, res) {
  let { leagueName } = req.query;
  let key = process.env.SOCCER_API_KEY;
  const url = `https://apiv2.apifootball.com/?action=get_teams&league_id=${leagueName}&APIkey=${key}`;
  superagent.get(url).then((item) => {
    item.body.map((e) => {
      e.players.forEach((el) => {
        if (el.player_goals > 1) {
          let obj1 = new Team(e);
          let Obj2 = new TopPlayer(el);
          let object3 = { ...obj1, ...Obj2 };
          // console.log(object3.player_goals);
          teamArr.push(object3);
          teamArr.sort((a, b) => {
            if (Number(a.player_goals) > Number(b.player_goals)) {
              return -1;
            } else if (Number(a.player_goals) < Number(b.player_goals)) {
              return 1;
            } else return 0;
          });
          // console.log("teamArr",teamArr)
        }
      });
    });
    res.render('pages/topPlayer', { TopPlayerData: teamArr });
    teamArr = [];
  });
}

// constructor Function for match details

function H2hResult(data) {
  this.country_name = data.country_name;
  this.league_name = data.league_name;
  this.match_date = data.match_date;
  this.match_hometeam_name = data.match_hometeam_name;
  this.match_hometeam_score = data.match_hometeam_score;
  this.match_awayteam_name = data.match_awayteam_name;
  this.match_awayteam_score = data.match_awayteam_score;
}

// constructor Function for player details
function Player(data) {
  this.player_name = data.player_name;
  this.player_number = data.player_number;
  this.player_country = data.player_country;
  this.player_type = data.player_type;
  this.player_age = data.player_age;
  this.player_match_played = data.player_match_played;
  this.player_goals = data.player_goals;
  this.player_yellow_cards = data.player_yellow_cards;
  this.player_red_cards = data.player_red_cards;
  this.team_name = data.team_name;
}

// constructor function for the date
function Date1(data) {
  this.country_id = data.country_id;
  this.country_name = data.country_name;
  this.league_id = data.league_id;
  this.league_name = data.league_name;
  this.match_date = data.match_date;
  this.match_status = data.match_status;
  this.match_time = data.match_time;
  this.match_hometeam_id = data.match_hometeam_id;
  this.match_hometeam_name = data.match_hometeam_name;
  this.match_hometeam_score = data.match_hometeam_score;
  this.match_awayteam_name = data.match_awayteam_name;
  this.match_awayteam_id = data.match_awayteam_id;
  this.match_awayteam_score = data.match_awayteam_score;
  this.match_hometeam_halftime_score = data.match_hometeam_halftime_score;
  this.match_awayteam_halftime_score = data.match_awayteam_halftime_score;
  this.match_live = data.match_live;
  this.match_round = data.match_round;
  this.match_stadium = data.match_stadium;
  this.match_referee = data.match_referee;
  this.team_home_badge = data.team_home_badge;
  this.team_away_badge = data.team_away_badge;
}

// constructor function for top players
function Team(data) {
  this.team_name = data.team_name;
  this.team_badge = data.team_badge;
  // data.players.map(k=>{
  //   this.player_name = k.player_name;
  //   this.player_goals = k.player_goals;
  // })
}
// let goalsArr = []
// constructor function for top players
function TopPlayer(data) {
  this.player_name = data.player_name;
  // this.player_number = data.player_number;
  // this.player_country = data.player_country;
  // this.player_type = data.player_type;
  // this.player_age = data.player_age;
  // this.player_match_played = data.player_match_played;
  this.player_goals = data.player_goals;
  // this.player_yellow_cards = data.player_yellow_cards;
  // this.player_red_cards = data.player_red_cards;
  // goalsArr.push(this.player_goals)
}

// to sort the goals

// Get UpComming Matches From API
async function getUpCommingMatches(req, res) {
  const { league_id } = req.query;
  const SOCCER_API_KEY = process.env.SOCCER_API_KEY;
  const todayDate = getTodayDate();
  const liveURL = `https://apiv2.apifootball.com/?action=get_events&from=${todayDate}&to=${todayDate}&league_id=${
    league_id || 148
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
    let qustionArray = data.body.results.map((question) => {
      return new challengeQuestion(question);
    });
    res.render('pages/questions', { questions: qustionArray });
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
  this.match_hometeam_halftime_score = matchData.match_hometeam_halftime_score;
  this.match_awayteam_halftime_score = matchData.match_awayteam_halftime_score;
  this.match_round = matchData.match_round;
  this.match_referee =  matchData.match_referee;
  this.team_home_badge = matchData.team_home_badge;
  this.team_away_badge = matchData.team_away_badge;
  this.league_logo = matchData.league_logo;
  this.cards = matchData.cards; /*array*/
  this.substitutions = matchData.substitutions;
  this.score = `${matchData.match_hometeam_score} : ${matchData.match_awayteam_score}`;
  this.goalscorer = matchData.goalscorer;
  this.lineup = matchData.lineup;
  this.statistics=matchData.statistics;
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
