import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

//더미데이터
let tweets = [
  {
    id: "1",
    text: "first",
    userId: "2",
  },
  {
    id: "2",
    text: "second",
    userId: "1",
  },
];

let users = [
  {
    id: "1",
    firstName: "minhyeong",
    lastName: "Lee",
  },
  {
    id: "2",
    firstName: "elon",
    lastName: "musk",
  },
];

//"!" : required에 대한 구분
//query는 rest의 get요청 엔드포인트와 같다
const typeDefs = gql`
  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String!
    description_full: String!
    synopsis: String!
    yt_trailer_code: String!
    language: String!
    backround_image: String!
    backround_image_original: String!
    small_cover_image: String!
    large_cover_image: String!
  }

  type User {
    id: ID!
    username: String!
    firstName: String!
    lastName: String!
    fullName: String!
  }
  """
  Tweet object represnts a resource for a Tweet
  """
  type Tweet {
    id: ID!
    text: String!
    author: User
  }
  type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    movie(id: String!): Movie!
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    deleteTweet(id: ID!): Boolean!
  }
`;

//API요청이 있을때 실행되늰 함수
const resolvers = {
  //Query와 Mutation에서 동일한 작업 가능하지만 편의상 개념적으로 분리한 것
  Query: {
    allMovies() {
      return fetch("http://yts.mx/api/v2/list_movies.json")
        .then((r) => r.json())
        .then((json) => json.data.movies);
    },

    movie(_, { id }) {
      return fetch(`http://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
        .then((r) => r.json())
        .then((json) => json.data.movie);
    },

    allTweets() {
      return tweets;
    },
    //*타입에 정의한 arg가 두번째 인자로 들어온다
    //*구조분해 할당 활용
    tweet(root, { id }) {
      //?아이디가 일치하는 것을 리턴
      return tweets.find((tweet) => tweet.id === id);
    },
    allUsers() {
      // console.log("all users called");
      return users;
    },
  },
  Mutation: {
    //* arg의 순서에 유의
    //* arg의 _는 해당 arg를 무시하겠다는 의미
    postTweet(_, { text, userId }) {
      const newTweet = {
        id: tweets.length + 1,
        text,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(_, { id }) {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    fullName({ firstName, lastName }) {
      // console.log(root);
      // console.log("fullname called");
      return `${firstName} ${lastName}`;
    },
  },
  Tweet: {
    author({ userId }) {
      return users.find((user) => user.id === userId);
    },
  },
};

//타입정의가 있어야만 서버는 시작된다
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
