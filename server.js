const express = require('express');
const Twitter = require('twit');

const app = express();
const twitClient = new Twitter({
  consumer_key: 'YOUR CONSUMER KEY',
  consumer_secret: 'YOUR CONSUMER SECRET',
  access_token: 'YOUR ACCESS TOKEN',
  access_token_secret: 'YOUR ACESS SECRET'
});

app.use(require('cors')());
app.use(require('body-parser').json());

app.get('/api/user', (req, res) => {
  twitClient
    .get('account/verify_credentials')
    .then(user => {
      res.send(user);
    })
    .catch(error => {
      res.send(error);
    });
});

let cache = [];
let cacheAge = 0;

app.get('/api/timeline', (req, res) => {
  if (Date.now() - cacheAge > 60000) {
    cacheAge = Date.now();
    const params = { tweet_mode: 'extended', count: 50 };
    if (req.query.since) {
      params.since_id = req.query.since;
    }
    twitClient
      .get(`statuses/home_timeline`, params)
      .then(timeline => {
        console.log('timeline is --->')
        cache = timeline;
        res.send(cache);
      })
      .catch(error => res.send(error));
  } else {
    res.send(cache);
  }
});

app.post('/api/favorite/:id', (req, res) => {
  const path = req.body.state ? 'create' : 'destroy';
  twitClient
    .post(`favorites/${path}`, { id: req.params.id })
    .then(tweet => res.send(tweet))
    .catch(error => res.send(error));
});

app.post('/api/retweet/:id', (req, res) => {
  const path = req.body.state ? 'retweet' : 'unretweet';
  twitClient
    .post(`statuses/retweet/${req.params.id}`)
    .then(tweet => res.send(tweet))
    .catch(error => res.send(error));
});

app.listen(3000, () => console.log('Server running'));
