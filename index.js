const { ApolloServer, gql } = require("apollo-server");
const mysql = require("mysql");

const typeDefs = gql`
  type User {
    id: ID!
    name: String
    email: String
  }

  type Query {
    users: [User]
  }
`;

const resolvers = {
  Query: {
    users: async (_, __, { dataSources }) => {
      try {
        const results = await dataSources.mysql.getUsers();
        return results;
      } catch (error) {
        throw new Error("Failed to get data");
      }
    },
    user: async (_, { id }, { dataSources }) => {
      try {
        const result = await dataSources.mysql.getUserById(id);
        return result;
      } catch (error) {
        throw new Error("Failed to get data");
      }
    },
  },

  Mutation: {
    createUser: async (_, { name, email }, { dataSources }) => {
      try {
        const result = await dataSources.mysql.createUser(name, email);
        return result;
      } catch (error) {
        throw new Error("Failed to get data");
      }
    },

    updateUser: async (_, { id, name, email }, { dataSources }) => {
      try {
        const result = await dataSources.mysql.updateUser(id, name, email);
        return result;
      } catch (error) {
        throw new Error("Failed to get data");
      }
    },

    deleteUser: async (_, { id }, { dataSources }) => {
      try {
        const result = await dataSources.mysql.deleteUser(id);
        return result;
      } catch (error) {
        throw new Error("Failed to get data");
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running at ${url}`);
});

const dbConfig = {
  host: "localhost",
  user: root,
  password: "Masganteng,1605",
  database: "apollo_mysql",
};

const pool = mysql.createPool(dbConfig);
class MySQLDataSource {
  constructor() {
    this.pool = pool;
  }
  async getUsers() {
    return new Promise((resolve, reject) => {
      this.pool.query("SELECT * FROM users", (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  
}

server.dataSources = () => ({
  mysql: new MySQLDataSource(),
});
