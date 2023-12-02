const express = require('express');
const router = express.Router();
const User = require('../model/userModel');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwtToken');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    try {
        const { name, username, bio, age, password } = req.body;
        const usernameRegex = /^[a-zA-Z0-9]{6,16}$/;
        if (!usernameRegex.test(username)) {
            return res.json({
                status: false,
                data: null,
                msg: "Invalid username. It must be between 6 and 16 characters, alphanumeric only.",
            });
        }

        const passwordRegex = /^.{8,16}$/;
        if (!passwordRegex.test(password)) {
            return res.json({
                status: false,
                data: null,
                msg: "Invalid password. It must be between 8 and 32 characters.",
            });
        }
        const findUser = await User.findOne({ username });
        if (findUser) {
            res.json({
                status: false,
                data: null,
                msg: "user already exist",
            })
        }
        if (!findUser) {
            const newUser = new User({
                name: name,
                username: username,
                bio: bio,
                age: age,
                password: password,
            });
            await newUser.save();
            res.json({
                status: true,
                data: newUser,
                msg: "user created sucessfuuly"
            });
        }
    }
    catch {
        res.json({
            status: false,
            data: null,
            msg: "some error occured"
        })
    }
});

//login a user 

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const findUser = await User.findOne({ username: username });

        if (!findUser) {
            return res.json({
                status: false,
                data: null,
                msg: "User not found"
            });
        }

        const isPasswordMatch = await findUser.isPasswordMatched(password);

        if (!isPasswordMatch) {
            return res.json({
                status: false,
                data: null,
                msg: "Incorrect password"
            });
        }

        const refreshToken = await generateRefreshToken(findUser?._id);

        const updateuser = await User.findByIdAndUpdate(
            findUser?.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true,
            }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });

        return res.json({
            status: true,
            data: updateuser,
            message: "User login successful"
        });
    } catch (error) {
        console.error(error);
        return res.json({
            status: false,
            data: null,
            message: "Some error occurred",
        });
    }


});

// getUser details

router.get('/details', async (req, res) => {
    try {
        const token = req?.headers?.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                status: false,
                data: null,
                msg: 'Unauthorized - Token not provided'
            });
        }
        const user = await User.findOne({ refreshToken: token });
        if (!user) {
            return res.status(404).json({
                status: false,
                data: null,
                msg: 'User not found'
            });
        }
        return res.status(200).json({
            status: true,
            data: user,
            msg: 'User details retrieved successfully'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            data: null,
            msg: 'Internal Server Error'
        });
    }
});

//update a user





router.put('/update', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                status: false,
                data: null,
                msg: 'Unauthorized - Token not provided'
            });
        }

        const user = await User.findOne({ refreshToken: token });

        if (!user) {
            return res.status(404).json({
                status: false,
                data: null,
                msg: 'User not found'
            });
        }

        const { password, newPassword } = req.body;

        if (password && newPassword) {
            const isPasswordMatch = await user.isPasswordMatched(password);

            if (!isPasswordMatch) {
                return res.json({
                    status: false,
                    data: null,
                    msg: "Incorrect password. User details not updated."
                });
            }

            const salt = bcrypt.genSaltSync(10);
            const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

            const updatedUser = await User.findByIdAndUpdate(
                user._id,
                {
                    name: req.body.name !== "" ? req.body.name : user.name,
                    username: req.body.username !== "" ? req.body.username : user.username,
                    bio: req.body.bio !== "" ? req.body.bio : user.bio,
                    age: req.body.age !== "" ? req.body.age : user.age,
                    password: hashedNewPassword,
                },
                {
                    new: true,
                }
            );

            if (updatedUser) {
                return res.json({
                    status: true,
                    data: updatedUser,
                    msg: "User details updated successfully"
                });
            }
        } else {
            // If neither password nor newPassword is provided, update other fields except for password
            const updatedUser = await User.findByIdAndUpdate(
                user._id,
                {
                    name: req.body.name !== "" ? req.body.name : user.name,
                    username: req.body.username !== "" ? req.body.username : user.username,
                    bio: req.body.bio !== "" ? req.body.bio : user.bio,
                    age: req.body.age !== "" ? req.body.age : user.age,
                },
                {
                    new: true,
                }
            );

            if (updatedUser) {
                return res.json({
                    status: true,
                    data: updatedUser,
                    msg: "User details updated successfully"
                });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            data: null,
            msg: "Something bad happened"
        });
    }
});

// delete a user 

router.delete('/delete', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                status: false,
                data: null,
                msg: 'Unauthorized - Token not provided'
            });
        }

        const user = await User.findOne({ refreshToken: token });

        if (!user) {
            return res.json({
                status: false,
                data: null,
                msg: "User not found"
            });
        }
        const { password } = req.body;
        const isPasswordMatch = await user.isPasswordMatched(password);
        if (!isPasswordMatch) {
            return res.json({
                status: false,
                data: null,
                msg: "Incorrect password. Account not deleted."
            });
        }
        const deletedUser = await User.findByIdAndDelete(user._id);
        if (deletedUser) {
            res.json({
                status: true,
                data: deletedUser,
                msg: "User deleted successfully"
            });
        }
    } catch (error) {
        console.error(error);
        res.json({
            status: false,
            data: null,
            msg: "Something bad happened"
        });
    }
});


/// logout a user

router.post('/logout', async (req, res) => {
    try {
        const cookies = req.cookies;

        if (!cookies || !cookies.refreshToken) {
            return res.status(400).json({
                status: false,
                data: null,
                msg: "No refreshToken in cookies"
            });
        }

        const refreshToken = cookies.refreshToken;
        const user = await User.findOne({ refreshToken });

        if (!user) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true
            });

            return res.status(401).json({
                status: false,
                data: null,
                msg: "User is not logged in"
            });
        }

        await User.findOneAndUpdate(
            { refreshToken },
            { refreshToken: "" }
        );

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
        });

        res.json({
            status: true,
            data: user,
            msg: "User logout successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            data: null,
            msg: "Something went wrong during logout",
        });
    }
});





module.exports = router;