import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';

const app = express();
const port = 8001;
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.get('/', (_req, res) => {
    res.sendFile('index.html', { root: 'dist' });
});
app.get('/library', (req, res) => {
    res.sendFile('library.html', { root: 'dist' });
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
    const profile = req.body;
    console.log(profile);
    res.status(200).redirect('/library');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});