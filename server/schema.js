const {
  GraphQLSchema,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
} = require('graphql');
const api = require('./api');

function toConnection(apiCall, params) {
  const {before, after, first, last} = params;
  console.log(`Connection type resolved`);
  return apiCall.then(items => {
                  // before/after filter
                  let filteredItems = items
                  if (before || after) {
                    let beforeIdx = items.findIndex(r => r.id === before);
                    let afterIdx = items.findIndex(r => r.id === after);
                    if (beforeIdx === -1) {
                      beforeIdx = Infinity
                    }
                    filteredItems = items.filter((_, i) => i < beforeIdx && i > afterIdx)
                  }
                  const pageInfo = {
                    hasPreviousPage: !last ? false : filteredItems.length > last,
                    hasNextPage: !first ? false : filteredItems.length > first
                  };
                  return [filteredItems, pageInfo]
                })
                .then(([items, pageInfo]) => {
                  // first/last filter
                  if (first || last) {
                    if (first > 0) {
                      return [items.slice(0, first), pageInfo]
                    } else if (last > 0) {
                      return [items.slice(last * -1), pageInfo]
                    }
                    throw new Error(`first or last has zero or negative value`)
                  }
                  return [items, pageInfo]
                })
                .then(([items, pageInfo]) => ({
                  pageInfo,
                  edges: items.map(r => ({
                    node: r,
                    cursor: r.id
                  }))
                }))
}

/**
 interface Node {
  id: ID!
}
 */
const Node = new GraphQLInterfaceType({
  name: 'Node',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    }
  }
});

/**
 type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
 */
const PageInfo = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  }
});

/**
 enum Gender {
  MALE,
  FEMALE
}
 */
const Gender = new GraphQLEnumType({
  name: 'Gender',
  values: {
    MALE: {
      type: GraphQLString
    },
    FEMALE: {
      type: GraphQLString
    }
  }
});

/**
 type Brand {
   name: String,
   logoUrl: String
 }
 */
const Brand = new GraphQLObjectType({
  name: 'Brand',
  fields: {
    name: {
      type: GraphQLString
    },
    logoUrl: {
      type: GraphQLString
    }
  }
});

/**
 type Image {
   thumbnailUrl: String,
   smallUrl: String,
   mediumUrl: String,
   largeUrl: String
 }
 */
const Image = new GraphQLObjectType({
  name: 'Image',
  fields: {
    thumbnailUrl: {
      type: GraphQLString
    },
    smallUrl: {
      type: GraphQLString
    },
    mediumUrl: {
      type: GraphQLString
    },
    largeUrl: {
      type: GraphQLString
    }
  }
});

/**
 type ArticleEdge {
  node: Article!,
  cursor: ID!
}
 */
const ArticleEdge = new GraphQLObjectType({
  name: 'ArticleEdge',
  fields: () => ({
    node: {
      type: new GraphQLNonNull(Article)
    },
    cursor: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
});

/**
 type ArticleConnection {
 edges: [ArticleEdge],
 pageInfo: PageInfo
}
 */
const ArticleConnection = new GraphQLObjectType({
  name: 'ArticleConnection',
  fields: () => ({
    pageInfo: {
      type: PageInfo
    },
    edges: {
      type: new GraphQLList(ArticleEdge)
    }
  })
});

/**
 type Article implements Node {
    id: ID!,
    name: String,
    thumbnailUrl: String,
    brand: Brand,
    genders: [Gender],
    images: [Image],
    recommendations(first: Int, last: Int, before: ID, after: ID): ArticleConnection
 }
 */
const Article = new GraphQLObjectType({
  name: 'Article',
  interfaces: [Node],
  isTypeOf: (value) => !!value.id,
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: GraphQLString
    },
    thumbnailUrl: {
      type: GraphQLString
    },
    brand: {
      type: Brand
    },
    genders: {
      type: new GraphQLList(Gender)
    },
    images: {
      type: new GraphQLList(Image)
    },
    recommendations: {
      type: ArticleConnection,
      args: {
        first: {
          type: GraphQLInt
        },
        last: {
          type: GraphQLInt
        },
        before: {
          type: GraphQLID
        },
        after: {
          type: GraphQLID
        }
      },
      resolve: function (article, params) {
        return toConnection(api.fetchRecommendations(article.id), params)
      }
    }
  }
});


/**
 type Viewer {
    articles(first: Int, last: Int, after: ID, before: ID): ArticleConnection
 }
 */
const Viewer = new GraphQLObjectType({
  name: 'Viewer',
  fields: {
    article: {
      type: Article,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: (_, {id}) => api.fetchArticle(id)
    },
    articles: {
      type: ArticleConnection,
      args: {
        first: {
          type: GraphQLInt
        },
        last: {
          type: GraphQLInt
        },
        before: {
          type: GraphQLID
        },
        after: {
          type: GraphQLID
        }
      },
      resolve: (_, params) => toConnection(api.fetchArticles(), params)
    }
  }
});

/**
 type Query {
   Article(id: ID): Article,
   node(id: ID): Node,
   viewer
 }*/
const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    Articles: {
      type: ArticleConnection,
      args: {
        first: {
          type: GraphQLInt
        },
        last: {
          type: GraphQLInt
        },
        before: {
          type: GraphQLID
        },
        after: {
          type: GraphQLID
        }
      },
      resolve: (_, params) => toConnection(api.fetchArticles(), params)
    },
    Article: {
      type: Article,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: (_, {id}) => api.fetchArticle(id)
    },
    Viewer: {
      type: Viewer,
      resolve: () => ({
        article: {},
        articles: {} // will be added by resolver on Viewer type
      })
    },
    node: {
      type: Node,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: (_, {id}) => api.fetchArticle(id)
    }
  }
});

module.exports = {
  Schema: new GraphQLSchema({
    query: Query
  }),
  Types: {
    Node,
    PageInfo,
    Gender,
    Brand,
    Image,
    ArticleEdge,
    ArticleConnection,
    Article,
    Viewer,
    Query
  }
};

