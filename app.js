const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require("./models/user");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(cookieParser())
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res)=>{
    res.render('home')
})

app.get('/home', isLoggedIn, async (req, res) =>{
    let user = await userModel.findOne({email: req.user.email})
    res.render("home", {user})
    // console.log(user);
})

app.get("/login", (req, res)=>{
    res.render("login", {error:null})
})

app.get("/logout", (req, res)=>{
    res.cookie("token", "")
    res.redirect("/")
})


app.get('/register', (req, res)=>{
    res.render('register');
})

app.get('/nonveg', (req, res)=>{
    res.render('nonveg');
})

app.get('/veg', (req, res)=>{
    res.render('veg');
})

app.get('/jain', (req, res)=>{
    res.render('jain');
})

app.get('/gift', (req, res)=>{
    res.render('gift')
})

app.get('/meal1', isLoggedIn, (req, res)=>{
    res.render('meal1')
})
app.get('/meal2', isLoggedIn, (req, res)=>{
    res.render('meal2')
})
app.get('/meal3', isLoggedIn, (req, res)=>{
    res.render('meal3')
})

app.post("/register", (req, res)=>{
    let {username,  email, password} = req.body;
    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash)=>{
            

            if(err) res.render("register");
            
            else{

                let createdUser = await userModel.create({
                    username,
                    email,
                    password: hash,
                });
                console.log(createdUser); 
    
                let token = jwt.sign({email}, "secretKey");
                res.cookie("token", token);
    
                res.redirect("/");
            }
        })
    })
})

app.post("/login", async (req, res)=>{
    let {email, password} = req.body;
    let user = await userModel.findOne({email});

    if(!user){
        res.render("login", {error:"user not found"})
    }

    else{
        bcrypt.compare(password, user.password, (err, result)=>{
            if(result){
                let token = jwt.sign({email}, "secretKey");
                res.cookie("token", token);
                res.redirect("home");
            }
            else res.redirect("/");
        })
    }
    
})


function isLoggedIn(req, res, next){

    if(req.cookies.token == "") res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token, "secretKey");
        req.user = data;
        next();
    }
}

app.listen(port, ()=>{
    console.log(`Server listening at port ${port}`)
})