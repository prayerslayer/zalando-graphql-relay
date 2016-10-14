const express = require('express'),
  fs = require('fs'),
  bodyParser = require('body-parser'),
  // we use graphql for query execution
  {graphql, buildSchema} = require('graphql'),
  // our article schema
  Schema = String(fs.readFileSync('./data/schema.graphql')),
  app = express(),
  // functions to fetch data from REST API and transform according to schema
  api = require('./api'),
  jsSchema = buildSchema(Schema);

const queryResolver = {
  Article: ({id}) => api.fetchArticle(id),
  Articles: () => api.fetchArticles(),
  node: ({id}) => api.fetchArticle(id)
};

// GraphQL queries will be plain text
app.use(bodyParser.text());

// we use POST /graphql to submit queries
app.post('/graphql', (req, res) => {
  const query = req.body;
  console.log(query);
  graphql(jsSchema, query, queryResolver)
  .then(result => res.status(200)
                     .json(result))

});

app.listen(process.env.PORT || 3001);
