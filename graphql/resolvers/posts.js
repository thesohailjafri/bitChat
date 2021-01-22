const Post = require('../../models/Post'); //post model schema

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find();
                return posts;
            }
            catch (err) {
                throw new Error;
            }
        }
    }
};