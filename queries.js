var promise = require('bluebird');
var app = require('express')();
var http = require('http');
var io = require('socket.io')(http);
var userList = [];
var typingUsers = {};

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);

const cn = {
    host: 'ec2-50-17-217-166.compute-1.amazonaws.com',
    port: 5432,
    database: 'd217k12g72omjh',
    user: 'jysdlhdxloiocr',
    password: '5ce84a7775db9e4d22de94f70403d916567ca3c1c7a9f0be6134d80fb5178703'
};

pgp.pg.defaults.ssl = true;
const db = pgp(cn);

var server = http.createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};
//var userID;
// rooms which are currently available in chat
//var rooms = ['room1','room2','room3'];
var rooms = {};
var results = [];

io.sockets.on('connection', function (socket) {

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(deviceid, groupname){
		// store the username in the socket session for this client
		socket.deviceid = deviceid;
		// store the room name in the socket session for this client
		socket.groupname = groupname;
		// add the client's username to the global list
		usernames[deviceid] = deviceid;
		// send client to room 1
		socket.join(groupname);
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to ' + groupname);
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(groupname).emit('updatechat', 'SERVER', deviceid + ' has connected to this room');
		socket.emit('updaterooms', rooms, groupname);
	});

  socket.on('sendimg', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		//io.sockets.in(socket.groupname).emit('updatechat', socket.deviceid, data.content);
    var query = db.query('select url, lat, lon from imagesupload where usercreate=$1',[socket.deviceid])
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      socket.broadcast.to(groupname).emit('updatechat', socket.deviceid, JSON.stringify(results.rows, null, "    "));;
    });

	});
  // when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.deviceid];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.deviceid + ' has disconnected');
		socket.leave(socket.groupname);
	});
});

function CheckContacts(req, res, next){
      db.one('select userid from userprofile where email=$1 or phonenumber=$2', [req.query.email, req.query.phonenumber])
        .then(function (data){
          res.status(200)
            .json({
              status: 'have contact',
              data: datas
            });
        })
        .catch(function (err) {
          return next(err);
        });
}

//Login using deviceid
function Login(req, res, next) {
    //userID = req.params.id;
    console.log(req.body.userid);
    db.one('select * from userprofile where userid = $1', [req.body.userid])
      .then(function (data){
        res.status(200)
          .json({
            status: 'Login success',
            code: 'SUCCESS',
            data: data
          });
      })
      .catch(function (err) {
        db.query('insert into userprofile(userid) values($1)', [req.body.userid])
          .then(function(data){
              res.status(200)
                .json({
                    status: 'User not exists and created in database',
                    code: 'USER_NOT_EXISTS',
                    data: data
                });
              });
        });
}



function createGroup(req, res, next) {
  //console.log(req.body.groupname)
  function IDGenerator() {
	 
		 this.length = 8;
		 this.timestamp = +new Date;
		 
		 var _getRandomInt = function( min, max ) {
			return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
		 }
		 
		 this.generate = function() {
			 var ts = this.timestamp.toString();
			 var parts = ts.split( "" ).reverse();
			 var id = "";
			 
			 for( var i = 0; i < this.length; ++i ) {
				var index = _getRandomInt( 0, parts.length - 1 );
				id += parts[index];	 
			 }
			 
			 return id;
    }
  }
  var insertCreator = function(_groupId, _deviceId, _callback) {
    
  }
  var generator = new IDGenerator();
  var numberGenerate = generator.generate();
  console.log(numberGenerate)
  db.one('select * from grouplist where groupid=$1',[numberGenerate])
  .then(function(){
    //generate fail
  })
  .catch(function(err){
    db.query('insert into grouplist(groupid, groupname, description, userid) values($1,$2,$3,$4) returning groupid',[numberGenerate, req.body.groupname,
  req.body.description, req.body.userid])
  
  //db.none('insert into grouplist(groupname, description, usercreate)' +
    //  'values(${groupname}, ${description}, ${usercreate})',req.body)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'Create group success',
          code: 'SUCCESS',
          data: data
        });
        db.query('INSERT INTO groupmember (groupid, userid, master) values($1, $2, TRUE)',[data[0].groupid, req.body.userid])
        .then(function(data){
          console.log('runrun')
        })
    })
  })
}
function listGroup(req, res, next){
  console.log(req.query.userid)
  db.any('select groupname, grouplist.groupid, grouplist.lat, grouplist.lon from groupmember, grouplist where grouplist.groupid=groupmember.groupid and groupmember.userid=$1', [req.query.userid])
    .then(function (data) {
      if (data != null && data != '')  {
        res.status(200)
          .json({
            status: 'Get group of user success',
            code: 'SUCCESS',
            data: data
          });
        } else {
          res.status(200)
          .json({
              status: 'Group not exists',
              code: 'GROUP_NOT_EXISTS'
          });
        }
    })
    .catch(function (err) {
      res.status(200)
        .json({
            status: 'Failure. Something wrongs',
            code: 'FAILURE'
        });
    });
}
function selectGroup(req, res, next){
  console.log("group: " + req.query.groupid)
  db.any('select groupmember.userid, username, userimage, userprofile.lat, userprofile.lon, groupmember.master from userprofile, groupmember, grouplist where groupmember.userid=userprofile.userid and grouplist.groupid=groupmember.groupid and grouplist.groupid= $1', [req.query.groupid])
    .then(function (data) {
      if (data != null && data != '')  {
      res.status(200)
          .json({
            status: 'Get information of group success',
            code: 'SUCCESS',
            data: data
          });
      }
      else{
        res.status(200)
        .json({
            status: 'Group dont have any members :(',
            code: 'GROUP_NOT_EXISTS'
        });
      }
    })
    .catch(function (err) {
      return next(err);
    });
}

function searchUsers(req, res, next){
  console.log("search string: " + req.query.search_string)
  // console.log("query string: " + )
  db.any('select userid, username, userimage from userprofile where email like $1 or phonenumber like $2',['%'+req.query.search_string+'%', '%'+req.query.search_string+'%'])
  .then(function(data){
    if (data!= null && data != ''){
    res.status(200)
          .json({
            status: 'Searching success',
            code: 'SUCCESS',
            data: data
          });
        }else{
          res.status(200)
          .json({
              status: 'No matching user',
              code: 'USER_NOT_EXISTS'
          });
        }
  })
  .catch(function(err){
    return next(err);
  });
}

function addGroupMember(req, res, next) {
  db.one('select * from groupmember where groupid = $1 and userid = $2', [req.body.groupid, req.body.userid])
  .then(function (){
    res.status(200)
      .json({
        status: 'User is already in group',
        code: 'USER_IN_GROUP'
      });
  })
  .catch(function (err) {
    db.query('INSERT INTO groupmember(groupid, userid, master) values($1,$2, FALSE)',[req.body.groupid, req.body.userid])
    .then(function(data) {
        res.status(200)
          .json({
              status: 'Add new member success',
              code: 'SUCCESS'
          });
      })
      .catch(function (err) {
        return next(err);
      });
    });
}

function deleteGroupMember(req, res, next) {
  var userID = req.params.userid;
  db.result('delete from groupmember where userid = $1', userID)
    .then(function (result) {
      res.status(200)
        .json({
          status: 'Delete success',
          code: 'SUCCESS',
          message: `Removed ${result.rowCount} user`
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function selectMemberLocation(req, res, next){
  db.one('select userprofile.lat, userprofile.lon from userprofile, groupmember, grouplist where groupmember.userid=userprofile.userid and grouplist.groupid=groupmember.groupid and grouplist.groupid= $1 and groupmember.userid=$2',
  [req.query.groupid, req.query.userid])
    .then(function (data) {
        res.status(200)
          .json({
            status: 'Get member location success',
            code: 'SUCCESS',
            data: data
          });
    })
    .catch(function (err) {
      return next(err);
    });
}

function memberInfo(req, res, next){
  db.one('select username, userimage, email, phonenumber from userprofile where userprofile.userid=$1',
  [req.query.userid])
    .then(function (data) {
        res.status(200)
          .json({
            status: 'Get member info success',
            code: 'SUCCESS',
            data: data
          });
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateUser(req, res, next) {
  db.query('update userprofile set username=$1, userimage=$2, email=$3, lat=$4, lon=$5, phonenumber=$6 where userid=$7',
    [req.body.username, req.body.userimage, req.body.email, req.body.lat, req.body.lon,
      req.body.phonenumber, req.body.userid])
    .then(function () {
      res.status(200)
        .json({
          status: 'Updated information',
          code: 'SUCCESS'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateLocation(req, res, next) {
  db.query('update userprofile set lat=$1, lon=$2 where userid=$3',
    [req.body.lat, req.body.lon,req.body.userid])
    .then(function () {
      res.status(200)
        .json({
          status: 'Updated current location',
          code: 'SUCCESS'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeUser(req, res, next) {
  var userID = req.params.id;
  db.result('delete from userprofile where userid = $1', userID)
    .then(function (result) {
      res.status(200)
        .json({
          status: 'Deleted user',
          code: 'SUCCESS',
          message: `Removed ${result.rowCount} user`
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function locationPick(req, res, next){
db.query('UPDATE grouplist set lat=$1, lon=$2 where groupid=$3',
[req.body.lat, req.body.lon, req.body.groupid])
  .then(function () {
    res.status(200)
      .json({
        status: 'Updated destination',
        code: 'SUCCESS'
      });
    })
    .catch(function (err) {
      return next(err);
    });
    console.log(req.file);
}

function uploadImage(req, res, next){
  console.log('req.body.userid: ' + req.body.userid);
db.query('INSERT INTO imagesupload(url, lat, lon, userid, groupid) values($1,$2,$3,$4, $5);',
[req.body.image, req.body.lat, req.body.lon, req.body.userid, req.body.groupid])
  .then(function () {
    res.status(200)
      .json({
        status: 'Inserted image',
        code: 'SUCCESS'
      });
    })
    .catch(function (err) {
      return next(err);
    });
    console.log(req.file);
}

function uploadAvatar(req, res, next){
  console.log('req url: ' + req.file.path);
  db.query('update userprofile set userimage=$1 where userid=$2',
[req.body.userimage, req.body.userid])
  .then(function () {
    res.status(200)
      .json({
        status: 'Inserted avatar',
        code: 'SUCCESS'
      });
    })
    .catch(function (err) {
      return next(err);
    });
    console.log(req.file);
}

function getImage(req, res, next){
  db.any('select * from imagesupload where groupid=$1', [req.body.groupid])
    .then(function (data) {
        res.status(200)
          .json({
            status: 'Get images success',
            code: 'SUCCESS',
            data: data
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
  CheckContacts: CheckContacts,
  selectGroup: selectGroup,
  uploadImage: uploadImage,
  listGroup: listGroup,
  deleteGroupMember: deleteGroupMember,
  uploadAvatar: uploadAvatar,
  uploadImage: uploadImage,
  selectMemberLocation: selectMemberLocation,
  memberInfo: memberInfo,
  searchUsers: searchUsers, 
  locationPick: locationPick,
  getImage: getImage
};
