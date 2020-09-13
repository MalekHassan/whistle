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
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const todayDate = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
  const newsUrl = `https://newsapi.org/v2/everything?qInTitle="+soccer"&to=${todayDate}&pageSize=30&apiKey=${NEWS_API_KEY}`;
  superagent.get(newsUrl).then((data) => {
    let newsArray = data.body.articles.map((news) => {
      return new News(news);
    });
    res.render('pages/index', { news: newsArray });
  });
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
// Listen To Server

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
