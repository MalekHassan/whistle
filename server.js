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

// Listen To Server

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
