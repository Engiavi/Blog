import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './Schema/User.js';
import { nanoid } from 'nanoid';
const server = express();
const PORT = 3000;
import cors from 'cors';
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const formatDatatoSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.secret_key);
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}
//middleware 
server.use(express.json());
server.use(cors());
const generateusername = async (email) => {
    let username = email.split('@')[0];//[avi,gmail.cp]
    let isUsernameNotUnique = await User.exists({ "personal_info.username": username }).then((result) => result)
    isUsernameNotUnique ? username += nanoid().substring(0, 5) : "";
    return username;
}
//mongoose connection
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(process.env.MONGO_PASS, { autoIndex: true });
    console.log("Database connected");
}

//server
server.post('/signup', (req, res) => {
    let { fullname, email, password } = req.body;
    //validating
    if (fullname.length < 3) return res.status(403).json({ "error": "Fullname must be at least 3 letters long" });
    if (!email.length) return res.status(403).json({ "error": "Enter Emailid" });
    if (!emailRegex.test(email)) return res.status(403).json({ "error": "Invalid EmailId" });
    if (!passwordRegex.test(password)) return res.status(403).json({ "error": "Password should be 6 to 20 characters long with a numeric ,1 lowecase and 1 uppercase letters" });

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateusername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        })
        user.save().then((u) => {
            return res.status(200).json(formatDatatoSend(u))
        })
            .catch(err => {
                if (err.code == 11000) {
                    return res.status(500).json({ "error": "Email already exists" });
                }
                return res.status(500).json({ "error": err.message });
            })
        // console.log(hashed_password)
    })
    // return res.status(200).json({ "status": "Okay" });
})

server.post('/signin', (req, res) => {
    let { email, password } = req.body;
    User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ "error": "Email not found" });

            }

            bcrypt.compare(password, user.personal_info.password, (err, result) => {
                if (err)
                    return res.status(403).json({ "error": "Error occured while login" });
                if (!result)
                    return res.status(403).json({ "error": "Incorrect password" });
                else
                    return res.status(200).json(formatDatatoSend(user))

            })
            console.log(user);
            // return res.json({ "status": "user document" });
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ "error": err.message });
        })
})

server.listen(PORT, () => {
    console.log('Server running ->', PORT);
})