var express = require('express');
var router = express.Router();

var db = require('../queries');


//router.get('/api/user/profile', db.getOneUser);
//router.get('/api/user/:id', db.getSingleUser);
router.post('/api/user/', db.Login);
router.post('/api/user/update/', db.updateUser);
router.delete('/api/user/:id', db.removeUser);
router.post('/api/user/location/', db.updateLocation);
router.post('api/user/addGroupMember', db.addGroupMember);
router.post('/api/group', db.createGroup);
router.post('/api/contact/', db.CheckContacts);

module.exports = router;
