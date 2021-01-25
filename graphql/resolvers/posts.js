const { AuthenticationError } = require('apollo-server');
const { UserInputError } = require('apollo-server');

const Post = require('../../models/Post'); //post model schema
const checkAuth = require('../../util/check-auth');

const ISOdate = () => {
    return new Date().toISOString();
};

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts;
            }
            catch (err) {
                throw new Error;
            }
        },
        async getPost(_, { postId }) {
            try {
                const post = await Post.findById(postId);
                if (post) {
                    return post;
                } else {
                    throw new Error('post not found');
                }
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createPost(_, { body }, context) {
            const user = checkAuth(context);
            if (body.trim() !== '') {
                const newPost = new Post({
                    body,
                    user: user.id,
                    username: user.username,
                    createdAt: ISOdate()
                });
                const post = await newPost.save();
                return post;
            } else throw new UserInputError('empty comments not allowed');
        },

        async deletePost(_, { postId }, context) {
            const user = checkAuth(context);
            try {
                const post = await Post.findById(postId);
                if (user.username === post.username) {
                    await post.delete();
                    return 'post deleted successfully';
                } else {
                    throw new AuthenticationError('this post dont belong to you');
                }
            } catch (err) {
                throw new Error('post dont exist');
            }
        },

        async createComment(_, { postId, body }, context) {
            const user = checkAuth(context);
            if (body.trim() === '') {
                throw new UserInputError('empty comment',
                    {
                        errors: {
                            body: 'empty comment not allowed'
                        }
                    });
            }
            const post = await Post.findById(postId);
            if (post) {
                const comment = {
                    body,
                    username: user.username,
                    createdAt: ISOdate()
                };
                post.comments.unshift(comment);
                await post.save();
                return post;
            } else {
                throw new UserInputError('post not found');
            }
        },

        async deleteComment(_, { postId, commentId }, context) {
            const user = checkAuth(context);
            try {
                const post = await Post.findById(postId);
                const commentIndex = post.comments.findIndex(c => c.id === commentId);
                if (user.username === post.comments[commentIndex].username) {
                    post.comments.splice(commentIndex, 1);
                    await post.save();
                } else {
                    throw new AuthenticationError('this comment dont belong to you');
                }
            } catch (err) {
                throw new UserInputError('comment dont exist');
            }
        },

        async likeComment(_, { postId, commentId }, context) {
            const user = checkAuth(context);
            try {
                const post = await Post.findById(postId);
                const commentIndex = await post.comments.findIndex(c => c.id === commentId);
                if (post.comments[commentIndex].likes.find(like => like.username === user.username)) {
                    post.comments[commentIndex].likes = post.comments[commentIndex].likes.filter(like => like.username !== user.username);
                } else {
                    post.comments[commentIndex].likes.unshift({
                        username: user.username,
                        createdAt: ISOdate()
                    });
                }
                await post.save();
                return post;
            } catch (err) {
                throw new UserInputError('post/comment dont exist');
            }
        },

        async likePost(_, { postId }, context) {
            const user = checkAuth(context);
            try {
                const post = await Post.findById(postId);
                if (post) {
                    if (post.likes.find(like => like.username === user.username)) {
                        post.likes = post.likes.filter(like => like.username !== user.username);
                    } else {
                        post.likes.unshift({
                            username: user.username,
                            createdAt: ISOdate()
                        });
                    }
                    await post.save();
                    return post;
                } else throw new UserInputError('post dont exist');
            } catch (err) {
                throw new Error(err);
            }
        }

    }
};