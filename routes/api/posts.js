const express = require ( 'express' );
// Like using app = express()
const router = express.Router ();
const mongoose = require ( 'mongoose' );
const passport = require ( 'passport' );

// Load models
const Post = require ( '../../models/Post' );
const Profile = require ( '../../models/Profile' );

// Validation
const validatePostInput = require ( '../../validation/post' );

// This serves json
// @route   GET api/posts/test
// @desc    Tests posts route
// @access  Public
router.get ( '/test', ( req, res ) => res.json ( { msg : 'posts works' } ) );

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get ( '/', ( req, res ) => {
    Post.find ()
        .sort ( { date : -1 } )
        .then ( posts => res.json ( posts ) )
        .catch ( err => res.status ( 404 ).json ( { nopostsfound : 'No posts found' } ) );
} );

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get ( '/:id', ( req, res ) => {
    Post.findById ( req.params.id )
        .then ( post => res.json ( post ) )
        .catch ( err =>
            res.status ( 404 ).json ( { nopostfound : 'No post found with that ID' } )
        );
} );

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post (
    '/',
    passport.authenticate ( 'jwt', { session : false } ),
    ( req, res ) => {
        const { errors, isValid } = validatePostInput ( req.body );

        // Check Validation
        if ( !isValid ) {
            return res.status ( 400 ).json ( errors );
        }

        const newPost = new Post ( {
            text : req.body.text,
            name : req.body.name,
            avatar : req.body.avatar,
            user : req.user.id
        } );

        newPost
            .save ()
            .then ( post => res.json ( post ) )
            .catch ();
    }
);

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete (
    '/:id',
    passport.authenticate ( 'jwt', { session : false } ),
    ( req, res ) => {
        Profile.findOne ( { user : req.user.id } ).then ( profile => {
            Post.findById ( req.params.id )
                .then ( post => {
                    // Check for post owner
                    if ( post.user.toString () !== req.user.id ) {
                        return res
                            .status ( 401 )
                            .json ( { notauthorized : 'User not authorized' } ); // Unauthorized
                    }

                    // Delete
                    post.remove ().then ( () => res.json ( { success : true } ) );
                } )
                .catch ( err => res.status ( 404 ).json ( { postnotfound : 'No post found' } ) );
        } );
    }
);

// @route   POST api/posts/like/:id
// @desc    Like a post
// @access  Private
router.post (
    '/like/:id',
    passport.authenticate ( 'jwt', { session : false } ),
    ( req, res ) => {
        Profile.findOne ( { user : req.user.id } ).then ( profile => {
            Post.findById ( req.params.id )
                .then ( post => {
                    // Check if a user has already liked a post (his id exists in likes array)
                    if (
                        post.likes.filter ( like => like.user.toString () === req.user.id )
                            .length > 0
                    ) {
                        return res
                            .status ( 400 )
                            .json ( { alreadyliked : 'User already liked this post' } );
                    }

                    // Add user id to likes array
                    post.likes.unshift ( { user : req.user.id } );

                    // Save the post in Mongo
                    post.save ().then ( post => res.json ( post ) );
                } )
                .catch ( err => res.status ( 404 ).json ( { postnotfound : 'No post found' } ) );
        } );
    }
);

// @route   POST api/posts/unlike/:id
// @desc    Unike a post
// @access  Private
router.post (
    '/unlike/:id',
    passport.authenticate ( 'jwt', { session : false } ),
    ( req, res ) => {
        Profile.findOne ( { user : req.user.id } ).then ( profile => {
            Post.findById ( req.params.id )
                .then ( post => {
                    // Check if a user has already liked a post (his id exists in likes array)
                    if (
                        post.likes.filter ( like => like.user.toString () === req.user.id )
                            .length === 0
                    ) {
                        return res
                            .status ( 400 )
                            .json ( { notliked : 'You have not liked this post' } );
                    }

                    // Get remove index
                    const removeIndex = post.likes
                        .map ( item => item.user.toString () )
                        .indexOf ( req.user.id );

                    // Splice out of the array
                    post.likes.splice ( removeIndex, 1 );

                    // Save to Mongo
                    post.save ().then ( post => res.json ( post ) );
                } )
                .catch ( err => res.status ( 404 ).json ( { postnotfound : 'No post found' } ) );
        } );
    }
);

// @route   POST api/posts/comment/:id
// @desc    Add a comment to a post
// @access  Private
router.post (
    '/comment/:id',
    passport.authenticate ( 'jwt', { session : false } ),
    ( req, res ) => {
        const { errors, isValid } = validatePostInput ( req.body );

        // Check Validation
        if ( !isValid ) {
            return res.status ( 400 ).json ( errors );
        }

        Post.findById ( req.params.id )
            .then ( post => {
                const newComment = {
                    text : req.body.text,
                    name : req.body.name,
                    avatar : req.body.avatar,
                    user : req.user.id
                };

                // Add to comments array
                post.comments.unshift ( newComment );

                // Save to Mongo
                post.save ().then ( post => res.json ( post ) );
            } )
            .catch ( err =>
                res.status ( 404 ).json ( { postnotfound : 'Posts was not found' } )
            );
    }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove a comment from a post
// @access  Private
router.delete (
    '/comment/:id/:comment_id',
    passport.authenticate ( 'jwt', { session : false } ),
    ( req, res ) => {
        Post.findById ( req.params.id )
            .then ( post => {
                // Check to see if comment exists
                if (
                    post.comments.filter (
                        comment => comment._id.toString () === req.params.comment_id
                    ).length === 0
                ) {
                    return res
                        .status ( 404 )
                        .json ( { commentnotexists : 'Comment does not exist' } );
                }

                // Get remove index
                const removeIndex = post.comments
                    .map ( item => item._id.toString )
                    .indexOf ( req.params.comment_id );

                // Splice comment out of array
                post.comments.splice ( removeIndex, 1 );

                // Save to Mongo
                post.save ().then ( post => res.json ( post ) );
            } )
            .catch ( err =>
                res.status ( 404 ).json ( { postnotfound : 'Posts was not found' } )
            );
    }
);

module.exports = router;
