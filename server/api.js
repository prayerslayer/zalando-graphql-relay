const API_URL = 'https://api.zalando.com';

function fetchJSON(url) {
  return fetch(url).then(resp => resp.json())
}

function transformApiArticleToSchema(article) {
  return {
    id: article.id,
    name: article.name,
    thumbnailUrl: article.media.images[0].thumbnailHdUrl,
    brand: article.brand,
    available: article.available,
    genders: article.genders
  }
}

function transformApiRatingToSchema(rating) {
  return {
    averageStarRating: rating.averageStarRating,
    distribution: [
      rating.starRatingDistribution['1'],
      rating.starRatingDistribution['2'],
      rating.starRatingDistribution['3'],
      rating.starRatingDistribution['4'],
      rating.starRatingDistribution['5']
    ]
  }
}


function transformApiMediaToSchema(media) {
  return media.images.map(img => ({
    type: img.type,
    thumbnailUrl: img.thumbnailHdUrl,
    smallUrl: img.smallHdUrl,
    mediumUrl: img.mediumHdUrl,
    largeUrl: img.largeHdUrl
  }))
}

function transformApiRecommendationsToSchema(recos) {
  return recos.map(r => ({
    id: r.id,
    name: r.name,
    thumbnailUrl: r.media.images[0].thumbnailHdUrl
  }))
}

function mergeArticleDataToSchema(articleData) {
  const [article, rating, media, reco] = articleData;
  return Object.assign({
      rating: transformApiRatingToSchema(rating),
      images: transformApiMediaToSchema(media),
      recommendations: transformApiRecommendationsToSchema(reco)
    },
    transformApiArticleToSchema(article)
  );
}

function fetchArticles() {
  console.log(`Fetching articles...`)
  return fetchJSON(`${API_URL}/articles`)
  .then(response => response.content)
  .then(articles => articles.filter((_, i) => i < 10))
  .then(articles => articles.map(transformApiArticleToSchema))
  .catch(e => {
    throw e;
  })
}

function fetchArticle(id) {
  console.log(`Fetching article ${id}...`);
  return Promise.all([
                  fetchJSON(`${API_URL}/articles/${id}`),
                  fetchJSON(`${API_URL}/articles/${id}/reviews-summary`),
                  fetchJSON(`${API_URL}/articles/${id}/media`),
                  fetchJSON(`${API_URL}/recommendations/${id}`)
                ])
                .then(mergeArticleDataToSchema)
                .then(a => {
                  console.log(a);
                  return a;
                })
                .catch(e => {
                  console.log(`Error on fetch: ${e.message}`, e);
                  throw e;
                })
}

module.exports = {
  fetchArticles,
  fetchArticle
};
