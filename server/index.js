require('isomorphic-fetch');

const express = require('express'),
  bodyParser = require('body-parser'),
  {graphql, buildSchema} = require('graphql'),
  Article = require('../models/article'),
  app = express(),
  api = require('./api');

app.use(bodyParser.text());

const schema = buildSchema(`
# data models
${Article.schema()}

# queries
type Query {
  Articles: [Article],
  Articles(id: ID): Article
}
`);

const root = {
  Articles: ({id}) => id ? api.fetchArticle(id) : api.fetchArticles()
};

app.post('/graphql', (req, res) => {
  try {
    graphql(schema, req.body, root)
    .then(result => {
      res.status(200)
         .json(result);
    })
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
