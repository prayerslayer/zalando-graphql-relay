import React from 'react'
import Relay from 'react-relay'
import ArticleList from './ArticleList.jsx'
import ArticleDetail from './ArticleDetail.jsx'

class App extends React.Component {

  componentDidMount() {
    window.onpopstate = ({state}) => {
      if (state && state.id) {
        this.onNavigate(state.id, false)
      }
      else {
        this.onShowList()
      }
    }
  }

  onShowList() {
    this.props.relay.setVariables({
      showDetailPage: false
    })
  }

  onLoadMore() {
    this.props.relay.setVariables({
      pageSize: this.props.relay.variables.pageSize + 10,
      showDetailPage: false
    })
  }

  onNavigate(id, updateHistory = true) {
    window.scrollTo(0, 0);
    if (updateHistory) {
      history.pushState({id: id}, id, `/${id}`);
    }
    this.props.relay.setVariables({
      articleId: id,
      showDetailPage: true
    })
  }

  render() {
    return this.props.relay.variables.showDetailPage ?
      <ArticleDetail article={this.props.Viewer.article}
                     onNavigate={this.onNavigate.bind(this)}/> :
      <ArticleList articles={this.props.Viewer.articles}
                   onLoadMore={this.onLoadMore.bind(this)}
                   onNavigate={this.onNavigate.bind(this)}/>
  }
}

export default Relay.createContainer(App, {
  initialVariables: {
    articleId: window.location.pathname.substr(1),
    showDetailPage: window.location.pathname.substr(1) !== '',
    pageSize: 20
  },
  fragments: {
    Viewer: () => Relay.QL`
      fragment on Viewer {
        articles(first: $pageSize) @skip(if: $showDetailPage) {
          ${ArticleList.getFragment('articles')}
        }
        article(id: $articleId) @include(if: $showDetailPage) {
          ${ArticleDetail.getFragment('article')}
        }
      }
    `
  }
});
