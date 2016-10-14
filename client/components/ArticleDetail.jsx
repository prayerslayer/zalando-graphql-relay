import React, { Component } from 'react'
import Relay from 'react-relay'
import ImageSlider from './ImageSlider.jsx'
import ArticleList from './ArticleList.jsx'

const INITIAL_PAGE_SIZE = 5;
const PAGE_SIZE_INC = 5;

class ArticleDetail extends Component {
  onLoadMore() {
    this.props.relay.setVariables({
      pageSize: this.props.relay.variables.pageSize + PAGE_SIZE_INC
    })
  }

  onNavigate(id) {
    this.props.relay.setVariables({
      pageSize: INITIAL_PAGE_SIZE
    });
    this.props.onNavigate(id)
  }

  render() {
    const {article} = this.props;
    return <div className="article-detail">
      <h3 className="article-detail--brand">
        <img src={article.brand.logoUrl} alt={article.brand.name}/> {article.brand.name}
      </h3>
      <h1 className="article-detail--name">
        {article.name}
      </h1>
      <ImageSlider images={article.images.map(img => img.largeUrl)}/>
      <ArticleList articles={article.recommendations}
                   onLoadMore={this.onLoadMore.bind(this)}
                   onNavigate={this.onNavigate.bind(this)}/>
    </div>
  }
}

export default Relay.createContainer(ArticleDetail, {
  initialVariables: {
    pageSize: INITIAL_PAGE_SIZE
  },
  fragments: {
    article: () => Relay.QL`
    fragment on Article {
      name
      thumbnailUrl
      brand {name logoUrl}
      images {largeUrl}
      recommendations(first: $pageSize) { ${ArticleList.getFragment('articles')} }
    }`
  }
});
