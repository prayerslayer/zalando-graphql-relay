import React, { Component } from 'react'
import Relay from 'react-relay'
import ArticlePreview from './ArticlePreview.jsx'

class ArticleList extends Component {
  render() {
    const {articles} = this.props;
    return <main>
      <section className="article-list">
        {articles.edges.map((a, i) => <ArticlePreview key={i}
                                                      onClick={(id) =>
                                                        this.props.onNavigate &&
                                                        this.props.onNavigate(id)}
                                                      article={a.node}/>)}
        {this.props.onLoadMore && articles.pageInfo.hasNextPage ?
          <div
            className="btn-load-more"
            onClick={() =>
              this.props.onLoadMore()}>
            <div className="btn-load-more--plus"></div>
            <div className="btn-load-more--text">
              Load more articles
            </div>
          </div>
          :
          null}
      </section>
    </main>
  }
}

export default Relay.createContainer(ArticleList, {
  fragments: {
    articles: (vars) => Relay.QL`
    fragment on ArticleConnection {
      pageInfo { hasNextPage }
      edges {
        node {
          ${ArticlePreview.getFragment('article', {...vars})}
        }
      }
    }`
  }
})
