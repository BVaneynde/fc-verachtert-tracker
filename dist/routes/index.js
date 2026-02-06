"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRoutes = setRoutes;
const express_1 = require("express");
const matchRoutes_1 = require("./matchRoutes");
const playerRoutes_1 = require("./playerRoutes");
function setRoutes(app) {
    const router = (0, express_1.Router)();
    (0, matchRoutes_1.setMatchRoutes)(router);
    (0, playerRoutes_1.setPlayerRoutes)(router);
    app.use('/api', router);
}
