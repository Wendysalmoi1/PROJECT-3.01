const express = require('express');
const path = require ('path');
const { Pool } = require('pg'); 
const bodyParser = require('body-parser'); 
const bcrypt = require('bcryptjs');
const session = require('express-session');
const mysql = require('mysql')
const dbconn=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'otdbn1'
})


const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));
const pool = new Pool({
    user: 'yourusername',
    host: 'localhost',
    database: 'yourdatabase',
    password: 'yourpassword',
    port: 5432,
});

app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.use(session({
    secret:'yourencryptionkey',
    resave:false,
    saveUninitialized:true,
    Cookie: {secure:false}
}))

app.set('view engine', 'ejs');




app.use((req,res,next)=>{
    const privateRoutes=['/profile','/borrow','updateprofile']
    const adminRoutes=['/newauthor','/approveuser','/completeorder']
    
    if(req.session && req.session.user){
        res.locals.user=req.session.user
        if(req.session.user.Email !=="johnmwanda@gmail.com" && adminRoutes.includes(req.path)){
            res.status(401).send('unauthorized access.Only admins can access this route')
        }else{
            next ()
        }
    }else if(privateRoutes.includes(req.path)|| adminRoutes.includes(req.path)){
        res.status(401).send('unauthorized access.Log in first')
    }else{ next ()}

   
})

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/signup',(req, res)=>{
    res.render('signup.ejs');
})
app.post("/signup",(req,res)=>{
   
    dbconn.query(`SELECT Email FROM patients WHERE Email ="${req.body.email}"` , (err,result)=>{
        if(err){
            console.log(err);
            res.status(500).send('Server Error')}
            else{
                if (result.length>0){
                    //email found
                    res.render('signup.ejs',{errorMessage:"Email already in use. SignUp"})
                }else{
                    //email not found
                    const hashedPassword = bcrypt.hashSync(req.body.password,5);
                    //now store the data
                    
                    dbconn.query(`INSERT INTO patients(name,email,PASSWORD)VALUES("${req.body.name}","${req.body.email}","${hashedPassword}",1)`,(error)=>{
                        console.log(error);
                        if (error){
                            res.status(500).send('server error')
                        } else{
                            res.redirect('/signin')
                        }
                   })
                 }
                }
            })
        })    
        
app.get('/signin',(req, res)=>{
    res.render('signin.ejs');
})
app.post('/signin',(req,res)=>{
    
    dbconn.query(`SELECT * FROM patients WHERE Email ="${req.body.email}"`, (error,member)=>{
        if(error){
            console.log(error);
            res.status(500).send('Server Error')
        }else{
            console.log(patient);
            if (member.length==0){
                res.render('signin.ejs',{errorMessage:"Email not registered. Sign Up"})
            }else{
                let passwordMatch=bcrypt.compareSync(req.body.password,patient[0].password)
                console.log(passwordMatch);
                if(passwordMatch){
                    //initiate a session\
                    req.session.user=patient[0];
                    res.redirect('/')
                }else{
                    res.render('signin.ejs',{errorMessage:"Password incorrect."})
                } }

        }
    })


})
app.get('/logout',(req,res)=>{
    req.session.destroy(err=>{
        if(err){
            res.status(500).send('server error')}
            else{ 
                res.redirect('/')}
    });
   
})




app.listen(8000,()=> {
    console.log("app is listening on port 8000");
});