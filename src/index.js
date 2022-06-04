import express from "express";
import sessions from "express-session";
import bodyParser from "body-parser";
import cors from 'cors';
import fs from "fs";
import cookieParser from "cookie-parser";

const app = express();
const port = 8001;
const oneDay = 1000 * 60 * 60 * 24;
var session;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));
app.use(cookieParser());
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('user');
    session = req.session;
    res.redirect('/');
});
app.get('/', (req, res) => {
    session = req.session;
    if (session.name) {
        res.sendFile('library.html', { root: 'src' });
    }
    else
        res.sendFile('index.html', { root: 'src' });
});
app.get('/library', (req, res) => {
    res.sendFile('library.html', { root: 'src' });
});
app.post('/profile', (req, res) => {
    const reject = () => {
        res.setHeader('www-authenticate', 'Basic')
        res.sendStatus(401)
    }
    const authorization = req.headers.authorization
    if (!authorization) {
        return reject()
    }
    const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')
    if (!(username === 'ben' && password === 'pwd')) {
        return reject()
    }
    session = req.session;
    const profile = req.body;
    const user = {
        uuid: generate_uuid(),
        ...profile
    };
    session.name = profile.name;
    updateUsers(user);
    res.status(200).redirect('/library');
});

app.post('/library', (req, res) => {
    session = req.session;
    const newCard = req.body;
    const businessCard = {
        uuid: generate_uuid(),
        userName: session.name,
        ...newCard,
    }
    updateBusinessCards(businessCard);
    res.status(200).send('OK');
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const generate_uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const updateUsers = (user) => {
    let users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
    users.push(user);
    fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
}

const updateBusinessCards = (businessCard) => {
    let businessCards = JSON.parse(fs.readFileSync('./data/library.json', 'utf8'));
    businessCards.push(businessCard);
    fs.writeFileSync('./data/library.json', JSON.stringify(businessCards, null, 2));
}