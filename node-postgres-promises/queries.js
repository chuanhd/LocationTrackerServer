var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};
//pg://postgres:Thutrang91@localhost:5432/template_postgis
var pgp = require('pg-promise')(options);
var connectionString = 'postgres://postgres:1@localhost:5432/LocationTracker';
var db = pgp(connectionString);

/*function getOneUser(req, res, next) {
  db.any('select * from userprofile where deviceid = $1', [req.body.deviceid])
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
        });
    })
    .catch(function (err) {
      return next(err);
    });
}*/

function CheckContacts(req, res, next){
      db.one('select username, phonenumber, email from userprofile where email=$1 or phonenumber=$2', [req.body.email, req.body.phonenumber])
        .then(function (data){
          res.status(200)
            .json({
              status: 'have contact',
              data: data,
            });
        })
        .catch(function (err) {
          return next(err);
        });
}

//Login using deviceid
function Login(req, res, next) {
    //var userID = req.params.id;
    console.log(req.body.deviceid);
    db.one('select * from userprofile where deviceid = $1', [req.body.deviceid])
      .then(function (data){
        res.status(200)
          .json({
            status: 'success',
            data: data
          });
      })
      .catch(function (err) {
        db.query('insert into userprofile(deviceid) values($1)', [req.body.deviceid])
          .then(function(data){
              res.status(200)
                .json({
                    status: 'User not exists',
                    data: data
                });
              });
        });
}

function createGroup(req, res, next) {
  console.log(req.body.groupname)
  //db.query('insert into grouplist(groupname, description, usercreate) value($1,$2,$3)',[req.body.groupname,
  //req.body.description, req.body.usercreate])
  db.none('insert into grouplist(groupname, description, usercreate)' +
      'values(${groupname}, ${description}, ${usercreate})',req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Created group'
        });
    })
    .catch(function (err) {
      return next(err);
    });

}

function addGroupMember(req, res, next) {
  db.one(INSERT INTO groupmember (groupid, userid) SELECT grouplist.groupid, userprofile.userid
     FROM grouplist, userprofile
     WHERE grouplist.groupname=$1
     AND userprofile.phonenumber=$2;),[req.body.groupname, req.body.phonenumber])
    .then(function () {
        res.status(200)
          .json({
            status: 'success',
            message: 'inserted'
          });
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateUser(req, res, next) {
  db.query('update userprofile set username=$1, userimage=$2, email=$3, lat=$4, lon=$5, phonenumber=$6 where deviceid=$7',
    [req.body.username, req.body.userimage, req.body.email, req.body.lat, req.body.lon,
      req.body.phonenumber, req.body.deviceid])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated user'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateLocation(req, res, next) {
  db.query('update userprofile set lat=$1, lon=$2 where deviceid=$3',
    [req.body.lat, req.body.lon,req.body.deviceid])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated location'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeUser(req, res, next) {
  var userID = req.params.id;
  db.result('delete from userprofile where deviceid = $1', userID)
    .then(function (result) {
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} user`
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

//CIRCLE
//function createCircle

module.exports = {
  //getAllUser: getAllUser,
  updateUser: updateUser,
  removeUser: removeUser,
  updateLocation: updateLocation,
  Login: Login,
  createGroup: createGroup,
  addGroupMember: addGroupMember,
  CheckContacts: CheckContacts
};
