const { ApolloServer, gql } = require("apollo-server");
const mysql = require("mysql");

// Konfigurasi koneksi MySQL
const dbConfig = {
  host: "127.0.0.1",
  user: "root",
  password: "Masganteng,1605",
  database: "apollo_mysql",
};

// Buat koneksi pool MySQL
const pool = mysql.createPool(dbConfig);

// Schema untuk GraphQL
const typeDefs = gql`
  type User {
    id: ID!
    name: String
    email: String
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  type Mutation {
    createUser(input: CreateUserInput!): ID!
    updateUser(id: ID!, name: String, email: String): Boolean
    deleteUser(id: ID!): Boolean
  }
`;

// buat Resolvers
const resolvers = {
  // Query untuk retrieve
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
  // Mutation untuk create, update, delete
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

// Buat data source Apollo untuk MySQL
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

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        "SELECT * FROM users WHERE id = ?",
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        }
      );
    });
  }

  async createUser(name, email) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [name, email],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results.insertId);
          }
        }
      );
    });
  }

  async updateUser(id, name, email) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results.affectedRows > 0);
          }
        }
      );
    });
  }

  async deleteUser(id) {
    return new Promise((resolve, reject) => {
      this.pool.query(
        "DELETE FROM users WHERE id = ?",
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results.affectedRows > 0);
          }
        }
      );
    });
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    mysql: new MySQLDataSource(),
  }),
});

server.listen().then(({ url }) => {
  console.log(`Running at ${url}`);
});

// Tambahkan data source ke server Apollo
