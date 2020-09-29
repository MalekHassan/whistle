'use strict';

// Dependencies
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
let localStorage;
if (typeof localStorage === 'undefined' || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
require('dotenv').config({ path: require('find-config')('.env') });
const express = require('express');
const app = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 3030;
const cors = require('cors');
const pg = require('pg');
const methodOverride = require('method-override');
const httpMsgs = require('http-msgs');

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// Using the public folder and sunFiles
app.use(express.static('./public'));

// to manage our data base
const client = new pg.Client(process.env.DATABASE_URL);

// Routs
app.get('/', homePage);
app.get('/h2h', h2hFunction);
app.get('/player', playerInfo);
app.get('/events', eventsInfo);
app.get('/bestOf', bestPlayerInfo);
app.get('/team/:teamId',getTeamInfo)
app.get('/live', getLiveMatches);
app.get('/match_detail/:matchID', getLiveMatchDetails);
app.delete('/match_delete/:matchID', deleteMatch);
app.get('/question', getQuestionsChall);
app.get('/signin', renderSignin);
app.post('/signin', signinFun);
app.get('/answers', getQuesResult);
app.get('/userPage', userPage);
app.get('/addToFav/:matchID', addFavToDataBase);
app.post('/addNewUser', addNewUserToDB);
app.get('/signout', signOutUser);
app.put('/changePersonalInfo/:userID', updatePersonalInfo);
app.put('/changeUserPass/:userID', updateUserPassword);

// Functions

// Get Today date

function getTodayDate() {
  return new Date().toJSON().slice(0, 10).replace(/-/g, '/');
}

// render sign in page

function renderSignin(req, res) {
  res.render('pages/sign');
}

// Home page function

async function homePage(req, res) {
  let liveMatches = await getUpCommingMatches(req, res);
  let newsArray = await getNewsData();
  let ifUserExcesit;
  let userID = JSON.parse(localStorage.getItem('userID'))
    ? JSON.parse(localStorage.getItem('userID'))
    : null;
  if (userID) {
    ifUserExcesit = await getUserData(userID);
  }
  res.render('pages/index', {
    news: newsArray,
    matches: liveMatches,
    user: ifUserExcesit,
  });
}

async function getUserId() {
  const selectSQl = 'SELECT * FROM users WHERE u_id=$1';
  const safeValues = [JSON.parse(localStorage.getItem('userID'))];
  client.query(selectSQl, safeValues).then((result) => {
    return result.rows[0].username;
  });
}

async function getUserData(userID) {
  const SQL = 'select * from users Where u_id=$1';
  const safeVales = [userID];
  let userData = await client.query(SQL, safeVales).then((result) => {
    return result.rows[0];
  });
  return userData;
}

async function getNewsData() {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const todayDate = getTodayDate();
  const newsUrl = `https://newsapi.org/v2/everything?qInTitle="+soccer"&from=${todayDate}&to=${todayDate}&pageSize=30&apiKey=${NEWS_API_KEY}`;
  let newsArray = await superagent.get(newsUrl).then((data) => {
    return data.body.articles.map((news) => {
      return new News(news);
    });
  });
  return newsArray;
}

// Get Live Soccer Matches From API
async function getLiveMatches(req, res) {
  const SOCCER_API_KEY = process.env.SOCCER_API_KEY;
  const todayDate = getTodayDate();
  const liveURL = `https://apiv2.apifootball.com/?action=get_events&from=${todayDate}&to=${todayDate}&APIkey=${SOCCER_API_KEY}`;
  await superagent
    .get(liveURL)
    .then((data) => {
      let liveMatchesArray = data.body
        .filter((item) => {
          //item.match_status !== 'Finished'
          // if (item.match_live === '1') {
          return item;
          // }
        })
        .map((match) => {
          return new liveMatches(match);
        });
      res.render('pages/live', { matchArray: liveMatchesArray });
    })
    .catch((err) => {
      res.status(500).json({
        error: 'Somthing went bad',
      });
    });
}

// get head to head information from API
async function h2hFunction(req, res) {
  let { match_hometeam_name, match_awayteam_name } = req.query;
  let key = process.env.SOCCER_API_KEY;
  const url = `https://apiv2.apifootball.com/?action=get_H2H&firstTeam=${match_hometeam_name}&secondTeam=${match_awayteam_name}&APIkey=${key}`;
  let h2hAgent = await superagent.get(url).then((data) => {
    return data.body.firstTeam_VS_secondTeam.map((match) => {
      return new H2hResult(match);
    });
  });
  let matchId = h2hAgent[0].match_id;
  let teamsBadge = await getBadge(matchId);
  res.render('pages/h2hResult', {
    matchArray: h2hAgent,
    badges: teamsBadge,
  });
}
// get logo team
async function getBadge(id) {
  let key = process.env.SOCCER_API_KEY;
  const url = `https://apiv2.apifootball.com/?action=get_events&match_id=${id}&APIkey=${key}`;
  let team_badge = await superagent.get(url).then((item) => {
    return {
      home_badge: item.body[0].team_home_badge,
      away_badge: item.body[0].team_away_badge,
      home_name: item.body[0].match_hometeam_name,
      away_name: item.body[0].match_awayteam_name,
    };
  });
  return team_badge;
}

// get team information function

function getTeamInfo(req,res){
// console.log(req.params)
let teamId = req.params.teamId;
let key = process.env.SOCCER_API_KEY;
let url = `https://apiv2.apifootball.com/?action=get_teams&team_id=${teamId}&APIkey=${key}`;
// console.log(url);
superagent.get(url).then((item) => {
  let teamDetails = item.body.map((k)=>{
    
     return new Teams(k);
    })
   
    res.render('pages/teamdeatails',{data :teamDetails})
})
}

// get the player information
function playerInfo(req, res) {
  let { player_name } = req.query;
  let key = process.env.SOCCER_API_KEY;
  const url = `https://apiv2.apifootball.com/?action=get_players&player_name=${player_name}&APIkey=${key}`;
  superagent.get(url).then((item) => {
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
  const url = `https://apiv2.apifootball.com/?action=get_events&from=${fromDate}&to=${toDate}&APIkey=${key}`;
  superagent.get(url).then((item) => {
    let dateAgent = item.body.map((e) => {
      return new liveMatches(e);
    });
    res.render('pages/dateInfo', { matchArray: dateAgent });
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
          teamArr.push(object3);
          teamArr.sort((a, b) => {
            if (Number(a.player_goals) > Number(b.player_goals)) {
              return -1;
            } else if (Number(a.player_goals) < Number(b.player_goals)) {
              return 1;
            } else return 0;
          });
        }
      });
    });
    res.render('pages/topPlayer', { TopPlayerData: teamArr });
    teamArr = [];
  });
}

// sign in function
var usernamedata = '';
async function signinFun(req, res) {
  usernamedata = '';
  let { email, password } = req.body;
  let SQL = 'SELECT * FROM  users WHERE email= $1 AND password=$2;';
  let values = [email, password];
  let liveMatches = await getUpCommingMatches(req, res);
  let newsArray = await getNewsData();
  client.query(SQL, values).then((results) => {
    if (results.rows.length) {
      storeInLocalStorage('userID', JSON.stringify(results.rows[0].u_id));
      usernamedata = results.rows[0];
      res.render('pages/index', {
        user: usernamedata,
        news: newsArray,
        matches: liveMatches,
      });
    } else {
      console.log('username does NOT exist');
      res.redirect('/signin');
    }
  });
}

// User Page Funtcion
async function userPage(req, res) {
  let userID = JSON.parse(localStorage.getItem('userID'))
    ? JSON.parse(localStorage.getItem('userID'))
    : null;
  if (userID) {
    const SQL = 'select match_id from matches where u_id=$1';
    const selectSQL = 'SELECT * FROM users WHERE u_id=$1';
    const safeValues = [userID];
    let userInfo = await client
      .query(selectSQL, safeValues)
      .then((result) => result.rows[0]);
    let matchsArray = await client.query(SQL, safeValues).then((result) => {
      return result.rows;
    });
    if (matchsArray.length > 0) {
      let matchesIds = matchsArray
        .map((item) => {
          return item.match_id;
        })
        .join(',');
      res.render('pages/user', { matchesIds, userID });
      let SOCCER_API_KEY = process.env.SOCCER_API_KEY;
      let matchResultUrl = `https://apiv2.apifootball.com/?action=get_events&match_id=${matchesIds}&APIkey=${SOCCER_API_KEY}`;
      let matchDetail = await superagent.get(matchResultUrl).then((result) => {
        return result.body.map((match) => {
          return new liveMatches(match);
        });
      });
      // res.render('pages/user', { matchArray: matchDetail });
      res.render('pages/user');
    } else {
      res.render('pages/user', { matchesIds: '', userID, userInfo });
    }
  } else {
    res.redirect('/');
  }
}

// Get result for the challenge function

async function getQuesResult(req, res) {
  let counter = 0;
  let correctAnswers = JSON.parse(localStorage.getItem('rightAnswers'));
  const userAnswers = Object.values(req.query);
  let liveMatches = await getUpCommingMatches(req, res);
  let newsArray = await getNewsData();
  userAnswers.forEach((answer, index) => {
    if (answer === correctAnswers[index]) {
      counter++;
    }
  });
  res.render('pages/index', {
    news: newsArray,
    matches: liveMatches,
  });
}

// Add match id to dataBase

function addFavToDataBase(req, res) {
  const { matchID } = req.params;
  let userID = JSON.parse(localStorage.getItem('userID'))
    ? JSON.parse(localStorage.getItem('userID'))
    : null;

  if (!userID) {
    res.redirect('/');
  } else {
    const SQL = `INSERT INTO matches (match_id,u_id) VALUES ($1,$2)`;
    const safeValues = [matchID, userID];
    client.query(SQL, safeValues).then((result) => {
      res.redirect('/userPage');
    });
  }
}

// Add New User To Data Base
// select * from books_table ORDER BY id DESC LIMIT 1
function addNewUserToDB(req, res) {
  console.log(req.body);
  const { firstname, lastname, email, password } = req.body;
  const inserSQL =
    'INSERT INTO users (first_name,last_name,email,password) VALUES ($1,$2,$3,$4);';
  const safeValues = [firstname, lastname, email, password];
  client.query(inserSQL, safeValues).then(() => {
    console.log('user has been added');
    let selectSQL = 'select * from users ORDER BY u_id DESC LIMIT 1';
    client.query(selectSQL).then((result) => {
      storeInLocalStorage('userID', result.rows[0].u_id);
      res.redirect('/');
    });
  });
}

// constructor Function for match details

function H2hResult(data) {
  this.league_name = data.league_name;
  this.match_id = data.match_id;
  this.match_date = data.match_date;
  this.match_hometeam_id = data.match_hometeam_id;
  this.match_hometeam_name = data.match_hometeam_name;
  this.match_awayteam_id = data.match_awayteam_id;
  this.match_awayteam_name = data.match_awayteam_name;
  this.score = `${data.match_hometeam_score} : ${data.match_awayteam_score}`;
}

// constructor for team details
function Teams(data){
  this.team_badge = data.team_badge;
  this.team_name = data.team_name;
  this.players = data.players;
  this.coaches = data.coaches
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
  this.player_number = data.player_number;
  this.player_country = data.player_country;
  this.player_type = data.player_type;
  this.player_age = data.player_age;
  this.player_match_played = data.player_match_played;
  this.player_goals = data.player_goals;
  // this.player_yellow_cards = data.player_yellow_cards;
  // this.player_red_cards = data.player_red_cards;
  // goalsArr.push(this.player_goals)
}

// to sort the goals

// Get UpComming Matches From API
async function getUpCommingMatches(req, res) {
  const { league_id } = req.query ? req.query : '148';
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

// User Sign out funstion

function signOutUser(req, res) {
  localStorage.removeItem('userID');
  res.redirect('/');
}

// Update User Personal Information

async function updatePersonalInfo(req, res) {
  const selectURL = 'SELECT * FROM users WHERE u_id=$1';
  const userId = [req.params.userID];
  let userInfo = await client
    .query(selectURL, userId)
    .then((result) => result.rows[0]);
  console.log('user Info', userInfo);
  const first_name = req.body.first_name
    ? req.body.first_name
    : userInfo.first_name;
  const last_name = req.body.last_name
    ? req.body.last_name
    : userInfo.last_name;
  const email = req.body.email ? req.body.email : userInfo.email;
  const gender = req.body.gender ? req.body.gender : userInfo.gender;
  const phone_number = req.body.phone_number
    ? req.body.phone_number
    : userInfo.phone_number;
  const updateSQL =
    'UPDATE users SET first_name=$1,last_name=$2,email=$3,gender=$4,phone_number=$5 WHERE u_id=$6';
  const values = [
    first_name,
    last_name,
    email,
    gender,
    phone_number,
    req.params.userID,
  ];
  client.query(updateSQL, values).then(() => {
    res.redirect('/userPage');
  });
}

// Update user Password

function updateUserPassword(req, res) {
  const userId = req.params.userID;
  const newpass = req.body.newpass;
  const updateSQL = 'UPDATE users set password=$1 WHERE u_id=$2';
  const safeValues = [newpass, userId];
  client.query(updateSQL, safeValues).then(() => {
    res.redirect('/userPage');
  });
}

// Deelte Match

function deleteMatch(req, res) {
  let safeValue = [req.params.matchID];
  const SQL = 'DELETE FROM matches WHERE match_id=$1';
  client.query(SQL, safeValue).then(() => {
    res.redirect('/');
  });
}

// Get Live Match Details

function getLiveMatchDetails(req, res) {
  const matchID = req.params.matchID;
  const SOCCER_API_KEY = process.env.SOCCER_API_KEY;
  const matchResultUrl = `https://apiv2.apifootball.com/?action=get_events&match_id=${matchID}&APIkey=${SOCCER_API_KEY}`;
  return superagent.get(matchResultUrl).then((data) => {
    console.log(data);
    let matchDetail = new MatchDetail(data.body[0]);
    res.render('pages/matchDetails', { match: matchDetail });
  });
}

// Challenge Questions

async function getQuestionsChall(req, res) {
  const { question, diffculty } = req.query;
  const questionURL = `https://opentdb.com/api.php?amount=${question}&category=21&difficulty=${diffculty}&type=multiple`;
  let qustionArray = await superagent.get(questionURL).then((data) => {
    return data.body.results.map((question) => {
      return new challengeQuestion(question);
    });
  });
  let rightQuestions = qustionArray.map((question) => {
    return question.correct_answer;
  });
  storeInLocalStorage('rightAnswers', rightQuestions);
  res.render('pages/questions', {
    questions: qustionArray,
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
  this.match_id = matchData.match_id;
  this.time = matchData.match_time;
  this.home_team = matchData.match_hometeam_name;
  this.match_hometeam_id = matchData.match_hometeam_id;
  this.away_team = matchData.match_awayteam_name;
  this.match_awayteam_id = matchData.match_awayteam_id;
  this.home_team_logo = matchData.team_home_badge;
  this.away_team_logo = matchData.team_away_badge;
}

// Live Matches Constructor

function liveMatches(matchData) {
  this.match_id = matchData.match_id;
  this.match_status = matchData.match_status;
  this.league_logo = matchData.league_logo;
  this.league_name = matchData.league_name;
  this.match_time = matchData.match_time;
  this.match_hometeam_id = matchData.match_hometeam_id;
  this.match_awayteam_id = matchData.match_awayteam_id;
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
  this.match_status = matchData.match_status;
  this.match_hometeam_id = matchData.match_hometeam_id;
  this.match_hometeam_name = matchData.match_hometeam_name;
  this.match_awayteam_name = matchData.match_awayteam_name;
  this.match_awayteam_id = matchData.match_awayteam_id;
  this.match_stadium = matchData.match_stadium;
  this.match_hometeam_halftime_score = matchData.match_hometeam_halftime_score;
  this.match_awayteam_halftime_score = matchData.match_awayteam_halftime_score;
  this.match_round = matchData.match_round;
  this.match_referee = matchData.match_referee;
  this.team_home_badge = matchData.team_home_badge;
  this.team_away_badge = matchData.team_away_badge;
  this.league_logo = matchData.league_logo;
  this.cards = matchData.cards; /*array*/
  this.substitutions = matchData.substitutions;
  this.score = `${matchData.match_hometeam_score} - ${matchData.match_awayteam_score}`;
  this.goalscorer = matchData.goalscorer;
  this.lineup = matchData.lineup;
  this.statistics = matchData.statistics;
}

// get challenge Constructor
function challengeQuestion(question) {
  this.question = question.question;
  this.answers = question.incorrect_answers.concat(question.correct_answer);
  this.correct_answer = question.correct_answer;
}

function storeInLocalStorage(key, wantedData) {
  localStorage.setItem(key, JSON.stringify(wantedData));
  console.log('data was saved');
}

// Listen To Server

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
  });
});
