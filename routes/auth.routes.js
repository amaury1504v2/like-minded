//auth route

const express = require('express');
const jwt = require('jsonwebtoken');
const authorize = require('../middleware/auth')
const bcrypt = require('bcrypt');
const router = express.Router();
const userSchema = require('../models/user');

//signin

router.post("/signin-user", (req, res, next) => {
    let getUser;
    userSchema.findOne({
        email: req.body.email
    }).then(user => {
        if (!user) {
            return res.status(401).json({
                message: "Auth failed"
            })
        }
        getUser = user;
        return bcrypt.compare(req.body.password, user.password) //on compare le mot de passe qu'on a entré au user password
    })
    .then(response => {
        if (!response) {
            return res.status(401).json({
                messsage: "Auth failed"
            });
        }
        let jwtToken = jwt.sign({
            email: getUser.email,
            userId: getUser._id
        }, "longer-secret-is-better", {
            expiry: "2h"
        });
        res
        .status(200)
        .json({
            token: jwtToken,
            expiresIn: 6600,
            msg: getUser
        })
        .catch((err) => {
            return res.status(401).json({
                message: 'auth failed'
            })
        })
    });
});

//signup

router.post("/register", (req,res,next) => {
    bcrypt.hash(req.body.password, 10).then((hash) => {
        const user = new userSchema({ 
            name: req.body.name, 
            email: req.body.email,
            password: hash
        });
        user.save().then((response) => {
            res.status(201).json({
                message: 'user created',
                result: response
            })
            .catch(error => {
                res.status(500).json({
                    error,
                });
            });
        });
    });
});

router.route(
    '/all-user').get(authorize, (req, res) => {
        userSchema.find(error, response => {
            if (error) {
                return next(error)
            }
            res.status(200).json(response)
        })
    })

module.exports = router