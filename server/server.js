import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
import { nanoid } from 'nanoid';
import cors from 'cors';
import admin from "firebase-admin";
import serviceAccountKey from "./adminsdk.json" assert { type: 'json' };
import { getAuth } from "firebase-admin/auth";
import aws from "aws-sdk";

const server = express();
const PORT = 3000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.status(401).json({ error: "No access token" });
    }
    jwt.verify(token, process.env.secret_key, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Access token is invalid" });
        }
        req.user = user.id;
        next();
    })
}
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

const s3 = new aws.S3({
    region: 'ap-south-1',
    accessKeyId: process.env.Aws_Access_key,
    secretAccessKey: process.env.Aws_secret_key
})

const generateUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;
    return await s3.getSignedUrlPromise('putObject', {
        Bucket: "advance-blog-website",
        Key: imageName,
        Expires: 1000,
        ContentType: "image/jpeg"
    })
}
//server

//upload image url
server.get("/get-upload-url", (req, res) => {
    generateUploadURL().then(url => res.status(200).json({ uploadUrl: url }))
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message })
        })
})

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
            if (!user.google_auth) {
                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err)
                        return res.status(403).json({ "error": "Error occured while login" });
                    if (!result)
                        return res.status(403).json({ "error": "Incorrect password" });
                    else
                        return res.status(200).json(formatDatatoSend(user))

                })
            }
            else {
                return res.status(403).json({ "error": "Account was created with google. Try to login with google" })
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ "error": err.message });
        })
})

server.post("/google-auth", async (req, res) => {
    let { access_token } = req.body;
    getAuth()
        .verifyIdToken(access_token)
        .then(async (decodeUser) => {

            let { email, name, picture } = decodeUser;

            picture = picture.replace("s96-c", "s384-c");
            let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth").then((u) => {
                return u || null
            })
                .catch((err) => {
                    return res.status(500).json({ "error": err.message });
                })

            if (user) {
                if (!user.google_auth) {
                    return res.status(403).json({ "error": "This email was signed up without google. PLease log in with password to access the account" });
                }
            }
            else {
                let username = await generateusername(email);
                user = new User({
                    personal_info: {
                        fullname: name,
                        email,
                        profile_img: picture,
                        username
                    },
                    google_auth: true
                })
                await user.save().then((u) => {
                    user = u;
                })
                    .catch(err => {
                        return res.status(500).json({ "error": err.message })
                    })
            }
            return res.status(200).json(formatDatatoSend(user));
        })
        .catch(err => {
            return res.status(500).json({ "error": "Failed to authenticate you with google. Try with some other google account" })
        })
})

server.post('/latest-blogs', (req, res) => {
    let { page } = req.body;
    let maximumLimit = 5;
    Blog.find({ draft: false })
        .populate('author', "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maximumLimit)
        .limit(maximumLimit)
        .then(blogs => {
            return res.status(200).json({ blogs: blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

server.post("/all-latest-blogs-count",(req,res)=>{
    Blog.countDocuments({draft:false})
    .then(count=>{
        return res.status(200).json({totalDocs:count})
    })
    .catch(err=>{
        console.log(err.message);
        return res.status(500).json({error:err.message});
    })
})

server.get("/trending-blogs", (req, res) => {
    Blog.find({ draft: false })
        .populate('author', "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1 })
        .select("blog_id title activity publishedAt -_id")
        .limit(5)
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

server.post("/search-blogs", (req, res) => {
    let { tag,query,author, page } = req.body;
    let findQuery ;
    if(tag){
         findQuery = { tags: tag, draft: false };
    }
    else if(query){
        findQuery={draft:false, $or: [
            { title: new RegExp(query, "i") },
            { tags: new RegExp(query, "i") }  // Assuming tags is an array field
        ]}
    }
    else if(author) {
        findQuery = { author, draft: false }
        }
    let maximumLimit = 2;
    Blog.find(findQuery)
        .populate('author', "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maximumLimit)
        .limit(maximumLimit)
        .then(blogs => {
            return res.status(200).json({ blogs: blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

server.post("/search-blogs-count",(req,res)=>{
    let {tag,query,author} = req.body;
    let findQuery ;
    if(tag){
         findQuery = { tags: tag, draft: false };
    }
    else if(query){
        findQuery={draft:false,title:new RegExp(query,"i")}
    }
    else if(author) {
        findQuery = { author, draft: false }
        }
    Blog.countDocuments(findQuery)
    .then(count=>{
        return res.status(200).json({totalDocs:count})
    })
    .catch(err=>{
        console.log(err.message);
        return res.status(500).json({error:err.message});
    })
})

server.post("/search-users",(req,res)=>{
    let {query} = req.body;
    User.find({"personal_info.username":new RegExp(query,"i")})
    .limit(50)
    .select("personal_info.fullname personal_info.username personal_info.profile_img -_id ")
    .then(users=>{
        return res.status(200).json({users})
    })
    .catch(err=>{
        return res.status(500).json({err:err.message})
    })
})

server.post("/get-profile",(req,res)=>{
    let {username} = req.body;
    User.findOne({"personal_info.username":username})
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then( user =>{
        return res.status(200).json(user)
    })
    .catch(err=>{
        console.log(err);
        return res.status(500).json({error:err.message});

    })
})

server.post('/create-blog', verifyJWT, (req, res) => {
    let authorId = req.user;
    let { title, des, banner, tags, content, draft } = req.body;
    if (!title.length) {
        return res.status(403).json({ error: "you must provide a title" });
    }
    if (!draft) {
        if (!des.length || des.length > 200) {
            return res.status(403).json({ error: "you must provide a description in 200 letters to publish the blog" });
        }
        if (!banner.length) {
            return res.status(403).json({ error: "you must provide a banner to publish the blog" });
        }

        if (!content.blocks.length) {
            return res.status(403).json({ error: "There must be some blog content to publish it" });
        }
        if (!tags.length || tags.length > 10) {
            return res.status(403).json({ error: "you must provide only 10 tag to publish the blog" });
        }
    }
    if (!title.length) {
        return res.status(403).json({ error: "you must provide a title to publish the blog" });
    }

    tags = tags.map(tag => tag.toLowerCase());
    let blog_id = title.replace(/[^a-zA-Z0-9]/g, '').replace(/\s+/g, '-').trim() + nanoid();
    let blog = new Blog(
        {
            title,
            des,
            banner,
            content,
            tags,
            author: authorId,
            blog_id,
            draft: Boolean(draft)
        }
    );
    blog.save()
        .then(blog => {
            let incrementVal = draft ? 0 : 1;
            User.findOneAndUpdate(
                { _id: authorId },
                {
                    $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id }
                }
            )
                .then(user => {
                    return res.status(200).json({ id: blog.blog_id })
                }
                )
                .catch(err => {
                    // console.log(err)
                    return res.status(500).json({ "error": err.message })
                }
                )
        }
        ).catch(err => {
            return res.status(500).json({ "error": err.message });
        }
        )
})
server.listen(PORT, () => {
    console.log('Server running ->', PORT);
})
