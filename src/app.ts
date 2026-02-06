import 'dotenv/config';
import express, { Application } from 'express';
import path from 'path';
import { setMatchRoutes } from './routes/matchRoutes';
import { setPlayerRoutes } from './routes/playerRoutes';
import { connectDatabase } from './config/database';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDatabase().catch(console.error);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../src/public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/views/index.html'));
});

app.get('/matches.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/views/matches.html'));
});

app.get('/players.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/views/players.html'));
});

app.get('/season-overview.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/views/season-overview.html'));
});

app.get('/match-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/views/match-details.html'));
});

app.get('/topscorers.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/views/topscorers.html'));
});

setMatchRoutes(app);
setPlayerRoutes(app);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});