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

app.get('/therapists', (req, res) => {
    // Fetch therapists from the database or perform any action you want
    res.send('List of therapists');
});


app.get('/therapist/:id', async (req, res) => {
    const therapistId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM therapists WHERE id = $1', [therapistId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Therapist not found');
        }

        const therapist = result.rows[0];
        res.render('therapist-profile', { therapist });
    } catch (error) {
        console.error('Error retrieving therapist profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to update a therapist's profile
app.post('/therapist/:id/update', async (req, res) => {
    const therapistId = req.params.id;
    const { name, specialization, email, bio } = req.body;

    try {
        await pool.query(
            'UPDATE therapists SET name = $1, specialization = $2, email = $3, bio = $4 WHERE id = $5',
            [name, specialization, email, bio, therapistId]
        );
        res.redirect(`/therapist/${therapistId}`);
    } catch (error) {
        console.error('Error updating therapist profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to view a patient's profile
app.get('/patient/:id', async (req, res) => {
    const patientId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM patients WHERE id = $1', [patientId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Patient not found');
        }

        const patient = result.rows[0];
        res.render('patient-profile', { patient });
    } catch (error) {
        console.error('Error retrieving patient profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to update a patient's profile
app.post('/patient/:id/update', async (req, res) => {
    const patientId = req.params.id;
    const { name, date_of_birth, medical_history, email } = req.body;

    try {
        await pool.query(
            'UPDATE patients SET name = $1, date_of_birth = $2, medical_history = $3, email = $4 WHERE id = $5',
            [name, date_of_birth, medical_history, email, patientId]
        );
        res.redirect(`/patient/${patientId}`);
    } catch (error) {
        console.error('Error updating patient profile:', error);
        res.status(500).send('Internal Server Error');
    }
});






app.listen(8000,()=> {
    console.log("app is listening on port 8000");
});