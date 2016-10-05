const schema = `
enum Gender {
  MALE,
  FEMALE
}

type Rating {
  averageStarRating: Float,
  distribution: [Int]
}

type Brand {
  name: String,
  logoUrl: String
}

enum ImageType {
  NON_MODEL,
  MODEL,
  STYLE,
  PREMIUM,
  UNKNOWN
}

type Image {
  type: ImageType,
  thumbnailUrl: String,
  smallUrl: String,
  mediumUrl: String,
  largeUrl: String
}

type Article {
  id: ID,
  name: String,
  thumbnailUrl: String,
  brand: Brand,
  available: Boolean,
  genders: [Gender],
  rating: Rating,
  images: [Image],
  recommendations: [Article]
}`;

module.exports = class Article {
  static schema() {
    return schema;
  }
}
