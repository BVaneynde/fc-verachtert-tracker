"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const matchRoutes_1 = require("./routes/matchRoutes");
const playerRoutes_1 = require("./routes/playerRoutes");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, '../src/public')));
// Routes
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../src/views/index.html'));
});
app.get('/matches.html', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../src/views/matches.html'));
});
app.get('/players.html', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../src/views/players.html'));
});
app.get('/season-overview.html', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../src/views/season-overview.html'));
});
app.get('/match-details.html', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../src/views/match-details.html'));
});
app.get('/topscorers.html', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../src/views/topscorers.html'));
});
(0, matchRoutes_1.setMatchRoutes)(app);
(0, playerRoutes_1.setPlayerRoutes)(app);
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
