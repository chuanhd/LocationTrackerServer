var express = require('express');
var aws  = require('aws-sdk');
var router = express.Router();

var db = require('../queries');
var multer  = require('multer');
var multerS3 = require('multer-s3');

//router.get('/api/user/profile', db.getOneUser);
//router.get('/api/user/:id', db.getSingleUser);
router.post('/api/user/', db.Login);
router.post('/api/user/update/', db.updateUser);
router.delete('/api/user/:id', db.removeUser);
router.post('/api/user/location/', db.updateLocation);
router.post('/api/addGroupMember', db.addGroupMember);
router.post('/api/group/', db.createGroup);
router.get('/api/checkcontacts/', db.CheckContacts);
router.get('/api/getgroup', db.selectGroup); 
router.get('/api/listgroup/', db.listGroup);
router.delete('/api/deletemember', db.deleteGroupMember);
router.get('/api/memberlocation', db.selectMemberLocation);
router.get('/api/getimages/', db.getImage);
router.get('/api/memberinfo/', db.memberInfo);
router.get('/api/searchuser/', db.searchUsers);
router.post('/api/locationPick/', db.locationPick);
router.post('/api/imageupload/', db.uploadImage);

console.log(process.env.PORT)

const app = express();
app.use(express.static('./public/images'));
app.engine('html', require('ejs').renderFile)
// app.listen(3000);

/*
 * Load the S3 information from the environment variables.
 */
const S3_BUCKET = process.env.S3_BUCKET;

console.log("s3_bucket: " + S3_BUCKET);

function uploadImage(req, res, next){
  // const s3 = new aws.S3();
  // // const fileType = req.query['file-type'];
  // // const fileName = req.query['file-name'] + '_' + Date.now() + fileType;
  // const fileType = '.png';
  // const fileName = Date.now() + fileType;

  // console.log("s3_bucket: " + S3_BUCKET);

  // const s3Params = {
  //   Bucket: S3_BUCKET,
  //   Key: fileName,
  //   Expires: 60,
  //   ContentType: fileType,
  //   ACL: 'public-read'
  // };

  // s3.getSignedUrl('putObject', s3Params, (err, data) => {
  //   if(err){
  //     console.log(err);
  //     return res.end();
  //   }
  //   const returnData = {
  //     signedRequest: data,
  //     url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
  //   };
  //   // res.write(JSON.stringify(returnData));
  //   // res.end();
  //   console.log("imgurl " + returnData.url);

  //   db.uploadAvatar(req, returnData.url, res, next)

  // });
  console.log("req.body deviceid: " + req.body.deviceid);
  console.dir(req.params);
}


// var multer  = require('multer');
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/images')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now()+'.jpg')
//   }
// });

// router.post('/upload/avatar', upload.single('image'), db.uploadAvatar)
// router.post('/upload', upload.single('image'), db.uploadImage)

router.post('/upload/avatar', db.uploadAvatar)
router.post('/upload', db.uploadImage)

module.exports = router;
