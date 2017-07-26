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
router.post('/api/getgroup/', db.selectGroup);
router.post('/api/listgroup/', db.listGroup);
router.delete('/api/deletemember/:userid', db.deleteGroupMember);
router.post('/api/memberlocation', db.selectMemberLocation);
router.post('/api/memberinfo', db.memberInfo);

var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.jpg')
  }
});

var upload = multer({ storage: storage });
router.post('/upload/avatar', upload.single('image'), db.uploadAvatar)
router.post('/upload', upload.single('image'), db.uploadImage)

module.exports = router;
