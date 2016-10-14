import React, { Component } from 'react'
import Relay from 'react-relay'

class ArticlePreview extends Component {
  render() {
    return <div className="article"
                data-id={this.props.article.id}
                onClick={() => this.props.onClick && this.props.onClick(this.props.article.id)}>
      <img
        className="article--image"
        src={this.props.article.thumbnailUrl}/>
      <div className="article--brand">
        <strong>{this.props.article.brand.name}</strong>
      </div>
      <div className="article--name">
         <small>{this.props.article.name}</small>
      </div>
    </div>
  }
}

export default Relay.createContainer(ArticlePreview, {
  fragments: {
    article: () => Relay.QL`
    fragment on Article {
      id
      name
      thumbnailUrl
      brand {name}
    }`
  }
});
