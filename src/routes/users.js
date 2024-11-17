const express = require('express');
const router = express.Router();
const {register, login, profile, logout, getall, getbyid, update, deleteUser} = require('@controllersUsers');
const {restrict} = require('@restrict');
const isAuthenticated = require('@isAuthenticated');

router.post("/register", register);
router.post("/login", login);
router.get("/profile", isAuthenticated, profile);
router.post("/logout", isAuthenticated, logout);
router.get("/getall", restrict('admin'), getall);
router.get("/getbyid", isAuthenticated, restrict('admin'), getbyid);
router.put("/update", isAuthenticated, restrict('admin'), update);
router.delete("/deleteUser", isAuthenticated, restrict('admin'), deleteUser);

module.exports = router;