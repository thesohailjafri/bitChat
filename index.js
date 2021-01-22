//dependencies 
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

//relative
const { MONGODB_key } = require('./config.js');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers/index');

const server = new ApolloServer({
    typeDefs,
    resolvers
});
mongoose.connect(MONGODB_key, { useNewUrlParser: true, useUnifiedTopology: true }).then(
    () => {
        return server.listen({ port: 5000 }).then(
            res => {
                console.log(`server rolling @ ${res.url}`);
            }
        );
    }
);