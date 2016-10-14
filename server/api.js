require('isomorphic-fetch');

const API_URL = 'https://api.zalando.com';

function fetchJSON(url) {
  return fetch(`${url}`, {
    headers: {
      'Accept-Language': 'en-GB'
    }
  }).then(resp => resp.json())
}

function transformApiArticleToSchema(article) {
  return {
    id: article.id,
    name: article.name,
    thumbnailUrl: article.media.images[0].smallHdUrl,
    brand: article.brand,
    genders: article.genders
  }
}

function transformApiMediaToSchema(media) {
  return media.images
              .filter(img => img.type !== 'UNSPECIFIED')
              .sort((i1, i2) => i1.orderNumber < i2.oderNumber ?
                -1 : i2.orderNumber < i1.orderNumber ?
                1 : 0)
              .map(img => ({
                thumbnailUrl: img.smallHdUrl,
                smallUrl: img.smallHdUrl,
                mediumUrl: img.mediumHdUrl,
                largeUrl: img.largeHdUrl
              }))
}

function mergeArticleDataToSchema(articleData) {
  const [article, media] = articleData;
  console.log(`Preparing ${article.id}`)
  return Object.assign({
      images: transformApiMediaToSchema(media)
    },
    transformApiArticleToSchema(article)
  );
}

function fetchArticles() {
  console.log(`Fetching articles...`);
  return fetchJSON(`${API_URL}/articles?page=1&pageSize=100&category=women`)
  .then(response => response.content)
  .then(articles => articles.map(transformApiArticleToSchema))
  .catch(e => {
    console.log(`Error on fetching articles: ${e.message}`)
    throw e;
  })
}

function fetchArticle(id) {
  console.log(`Fetching article ${id}...`);
  return Promise.all([
                  fetchJSON(`${API_URL}/articles/${id}`),
                  fetchJSON(`${API_URL}/articles/${id}/media`)
                  .catch(e => {
                    return {
                      images: []
                    }
                  })
                ])
                .then(mergeArticleDataToSchema)
                .catch(e => {
                  console.log(`Error on fetch: ${e.message}`, e);
                  throw e;
                })
}

function fetchRecommendations(id) {
  return fetchJSON(`${API_URL}/recommendations/${id}?maxResults=50`)
  .then(recos => recos.map(reco => reco.id))
  .then(recoIds => Promise.all(recoIds.map(id => fetchArticle(id, false))))
}

module.exports = {
  fetchArticles,
  fetchRecommendations,
  fetchArticle
};
