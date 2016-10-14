const express = require('express'),
  bodyParser = require('body-parser'),
  // graphql is for query execution,
  {graphql} = require('graphql'),
  // our complete article schema
  {Schema} = require('./schema'),
  app = express(),
  // functions to fetch data from REST API and transform according to schema
  api = require('./api');

// GraphQL queries will be plain text
app.use(bodyParser.json());
app.use(bodyParser.text());
// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
     .header('Access-Control-Allow-Method', 'POST')
     .header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
  if (req.method === 'OPTIONS') {
    return res.status(200).send()
  }
  return next()
})

app.post('/graphql', (req, res) => {
  let query = '',
    variables = {};
  if (typeof req.body === 'string') {
    query = req.body
  } else if (typeof req.body === 'object') {
    query = req.body.query
    variables = req.body.variables
  }
  console.log(query, variables)
  try {
    graphql(Schema, query, {}, {}, variables)
    .then(result => res.status(200)
                       .json(result))
    .catch(e => {
      throw e;
    })
  } catch (e) {
    console.log(e)
    res.status(500)
       .send(e.message)
  }
});

app.listen(process.env.PORT || 3001);
