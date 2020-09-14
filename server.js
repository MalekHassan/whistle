'use strict';

// Dependencies

require('dotenv').config({ path: require('find-config')('.env') })
const express = require('express');
const app = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 3030;
app.set('view engine', 'ejs');

// Using the public folder and sunFiles
app.use(express.static('./public'));

// Routs
app.get('/', homePage);
app.get('/live', getData);
app.get('/h2h', h2hFunction);
app.get('/player', playerInfo);
app.get('/events', eventsInfo);
app.get('/bestOf', bestPlayerInfo);


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
  let { match_hometeam_name, match_awayteam_name } = req.query;
  let key = process.env.SOCCER_API_KEY;
  // console.log('key',key);
  const url = `https://apiv2.apifootball.com/?action=get_H2H&firstTeam=${match_hometeam_name}&secondTeam=${match_awayteam_name}&APIkey=${key}`
  // console.log('url',url) 
  superagent.get(url).then(item => {
    // console.log("url data",item)
    let h2hAgent = item.body.firstTeam_VS_secondTeam.map(e => {
      return new H2hResult(e);
    })
    res.render('pages/h2hResult', { h2hData: h2hAgent })
  })
}
// get the player information
function playerInfo(req, res) {
  let { player_name } = req.query;
  let key = process.env.SOCCER_API_KEY;
  // console.log('key',key);
  const url = `https://apiv2.apifootball.com/?action=get_players&player_name=${player_name}&APIkey=${key}`
  // console.log('url',url) 
  superagent.get(url).then(item => {
    // console.log("url data", item)
    let playerAgent = item.body.map(e => {
      return new Player(e);
    })
    res.render('pages/playerInfo', { playerData: playerAgent })
  })
}
// get the details for any match depending on the date
function eventsInfo(req, res) {
  let { fromDate, toDate } = req.query;
  let key = process.env.SOCCER_API_KEY;
  // console.log('key',key);
  const url = `https://apiv2.apifootball.com/?action=get_events&from=${fromDate}&to=${toDate}&APIkey=${key}`
  // console.log('url',url) 
  superagent.get(url).then(item => {
    // console.log("url data", item)
    let dateAgent = item.body.map(e => {
      return new Date(e);
    })
    res.render('pages/dateInfo', { dateData: dateAgent })
  })
}

// Get the best player from league id then from the teams of each league
let teamArr = []
function bestPlayerInfo(req, res) {
  let { leagueName } = req.query;
  let key = process.env.SOCCER_API_KEY;
  const url = `https://apiv2.apifootball.com/?action=get_teams&league_id=${leagueName}&APIkey=${key}`
  superagent.get(url).then(item => {
    item.body.map(e => {
      e.players.forEach(el => {
        if (el.player_goals > 1) {
          let obj1 = new Team(e);
          let Obj2 = new TopPlayer(el);
          let object3 = {...obj1, ...Obj2 }
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
    })
    res.render('pages/topPlayer', { TopPlayerData: teamArr })
    teamArr=[]
  })
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
function Date(data) {
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


// Listen To Server

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});