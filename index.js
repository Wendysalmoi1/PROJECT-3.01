const express = require('express');
const path = require ('path');
const { Pool } = require('pg'); 
const bodyParser = require('body-parser'); 
const bcrypt = require('bcryptjs');
const session = require('express-session');


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



app.set('view engine' , 'ejs' );

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});


const users = [
    { id: 1, username: 'user1', passwordHash: bcrypt.hashSync('password1', 10) }
];

// Routes
app.get('/', (req, res) => {
    res.redirect('/signin');
});

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.post('/signin', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && bcrypt.compareSync(password, user.passwordHash)) {
        req.session.userId = user.id;
        return res.redirect('/dashboard');
    }

    res.render('signin', { error: 'Invalid username or password' });
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/signin');
    }

    res.render('dashboard', { user: users.find(u => u.id === req.session.userId) });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }

        res.redirect('/signin');
    });
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

// Handle the sign-up form submission
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length > 0) {
            // Username already exists
            return res.render('signup', { error: 'Username already taken' });
        }

        // Hash the password
        const passwordHash = bcrypt.hashSync(password, 10);

        // Insert the new user into the database
        await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, passwordHash]);

        // Redirect to sign-in page or a success page
        res.redirect('/signin');
    } catch (error) {
        console.error('Error during sign-up:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Serve the sign-in form
app.get('/signin', (req, res) => {
    res.render('signin');
});








app.listen(8000,()=> {
    console.log("app is listening on port 8000");
});