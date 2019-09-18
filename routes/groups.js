var express = require('express');
var router = express.Router();
/* AWS Configuration, AWS DocumentClient api Config */
const AWS = require("aws-sdk");
const S3AWS = require('aws-sdk');
AWS.config.loadFromPath('./dbconfig.json');
AWS.config.update({ region: 'us-east-2' });
var documentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
S3AWS.config.update({ region: 'us-east-1' });
const s3 = new S3AWS.S3();
var successmessage = '';
var errmessage = '';

/* GET home page. */
router.get('/', function (req, res, next) {
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  var groupsParams = {
    TableName: 'Groups',
    IndexName: "GroupCreator-index",
    KeyConditionExpression: "GroupCreator = :GroupCreator",
    ExpressionAttributeValues: {
      ":GroupCreator": parseInt(sess.user.UserID)
    }
  };

  var myGroups = [];
  var myJoinedGroups = [];

  documentClient.query(groupsParams, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log('successfully retrieved my user groups')
      if (data.Items) {
        data.Items.forEach(function (content) {

          var uname1 = content.GroupUser1UName
          var uname2 = content.GroupUser2UName
          var uname3 = content.GroupUser3UName
          var uname4 = content.GroupUser4UName
          myGroups.push(
            {
              'CurrentUserCount': content.CurrentUserCount,
              'GroupCreator': content.GroupCreator,
              'GroupID': content.GroupID,
              'GroupName': content.GroupName,
              'GroupUser1': content.GroupUser1,
              'GroupUser1UName': uname1.charAt(0).toUpperCase() + uname1.slice(1),
              'GroupUser1ImageName': content.GroupUser1ImageName,

              'GroupUser2': content.GroupUser2,
              'GroupUser2ID': content.GroupUser2ID,
              'GroupUser2UName': uname2.charAt(0).toUpperCase() + uname2.slice(1),
              'GroupUser2ImageName': content.GroupUser2ImageName,

              'GroupUser3': content.GroupUser3,
              'GroupUser3ID': content.GroupUser3ID,
              'GroupUser3UName': uname3.charAt(0).toUpperCase() + uname3.slice(1),
              'GroupUser3ImageName': content.GroupUser3ImageName,

              'GroupUser4': content.GroupUser4,
              'GroupUser4ID': content.GroupUser4ID,
              'GroupUser4UName': uname4.charAt(0).toUpperCase() + uname4.slice(1),
              'GroupUser4ImageName': content.GroupUser4ImageName,

              'created_on': content.created_on
            });
        });
        //

      }
    }
  });



  var checkUser2params = {
    TableName: 'Groups',
    IndexName: 'GroupUser2-index',
    KeyConditionExpression: "GroupUser2 = :gu2ID",
    ExpressionAttributeValues: {
      ":gu2ID": `${sess.user.UserID}`,
    }
  };

  console.log('querying joined groups from groups table')
  documentClient.query(checkUser2params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log('successfully retrieved check user2 user groups')
      if (data.Items) {
        data.Items.forEach(function (content) {

          var uname1 = content.GroupUser1UName
          var uname2 = content.GroupUser2UName
          var uname3 = content.GroupUser3UName
          var uname4 = content.GroupUser4UName
          myJoinedGroups.push(
            {
              'CurrentUserCount': content.CurrentUserCount,
              'GroupCreator': content.GroupCreator,
              'GroupID': content.GroupID,
              'GroupName': content.GroupName,
              'GroupUser1': content.GroupUser1,
              'GroupUser1UName': uname1.charAt(0).toUpperCase() + uname1.slice(1),
              'GroupUser1ImageName': content.GroupUser1ImageName,

              'GroupUser2': content.GroupUser2,
              'GroupUser2ID': content.GroupUser2ID,
              'GroupUser2UName': uname2.charAt(0).toUpperCase() + uname2.slice(1),
              'GroupUser2ImageName': content.GroupUser2ImageName,

              'GroupUser3': content.GroupUser3,
              'GroupUser3ID': content.GroupUser3ID,
              'GroupUser3UName': uname3.charAt(0).toUpperCase() + uname3.slice(1),
              'GroupUser3ImageName': content.GroupUser3ImageName,

              'GroupUser4': content.GroupUser4,
              'GroupUser4ID': content.GroupUser4ID,
              'GroupUser4UName': uname4.charAt(0).toUpperCase() + uname4.slice(1),
              'GroupUser4ImageName': content.GroupUser4ImageName,

              'created_on': content.created_on
            });

        });
      }
    }
  });

  var checkUser3params = {
    TableName: 'Groups',
    IndexName: 'GroupUser3-index',
    KeyConditionExpression: "GroupUser3 = :gu3ID",
    ExpressionAttributeValues: {
      ":gu3ID": `${sess.user.UserID}`,
    }
  };

  console.log('querying joined groups from groups table')
  documentClient.query(checkUser3params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log('successfully retrieved check user3 user groups')
      if (data.Items) {
        data.Items.forEach(function (content) {

          var uname1 = content.GroupUser1UName
          var uname2 = content.GroupUser2UName
          var uname3 = content.GroupUser3UName
          var uname4 = content.GroupUser4UName
          myJoinedGroups.push(
            {
              'CurrentUserCount': content.CurrentUserCount,
              'GroupCreator': content.GroupCreator,
              'GroupID': content.GroupID,
              'GroupName': content.GroupName,
              'GroupUser1': content.GroupUser1,
              'GroupUser1UName': uname1.charAt(0).toUpperCase() + uname1.slice(1),
              'GroupUser1ImageName': content.GroupUser1ImageName,

              'GroupUser2': content.GroupUser2,
              'GroupUser2ID': content.GroupUser2ID,
              'GroupUser2UName': uname2.charAt(0).toUpperCase() + uname2.slice(1),
              'GroupUser2ImageName': content.GroupUser2ImageName,

              'GroupUser3': content.GroupUser3,
              'GroupUser3ID': content.GroupUser3ID,
              'GroupUser3UName': uname3.charAt(0).toUpperCase() + uname3.slice(1),
              'GroupUser3ImageName': content.GroupUser3ImageName,

              'GroupUser4': content.GroupUser4,
              'GroupUser4ID': content.GroupUser4ID,
              'GroupUser4UName': uname4.charAt(0).toUpperCase() + uname4.slice(1),
              'GroupUser4ImageName': content.GroupUser4ImageName,

              'created_on': content.created_on
            });
        });
      }
    }
  });

  var checkUser4params = {
    TableName: 'Groups',
    IndexName: 'GroupUser4-index',
    KeyConditionExpression: "GroupUser4 = :gu4ID",
    ExpressionAttributeValues: {
      ":gu4ID": `${sess.user.UserID}`,
    }
  };

  console.log('querying joined groups from groups table')
  documentClient.query(checkUser4params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log('successfully retrieved  check user4 user groups')
      if (data.Items) {
        data.Items.forEach(function (content) {

          var uname1 = content.GroupUser1UName
          var uname2 = content.GroupUser2UName
          var uname3 = content.GroupUser3UName
          var uname4 = content.GroupUser4UName
          myJoinedGroups.push(
            {
              'CurrentUserCount': content.CurrentUserCount,
              'GroupCreator': content.GroupCreator,
              'GroupID': content.GroupID,
              'GroupName': content.GroupName,
              'GroupUser1': content.GroupUser1,
              'GroupUser1UName': uname1.charAt(0).toUpperCase() + uname1.slice(1),
              'GroupUser1ImageName': content.GroupUser1ImageName,

              'GroupUser2': content.GroupUser2,
              'GroupUser2ID': content.GroupUser2ID,
              'GroupUser2UName': uname2.charAt(0).toUpperCase() + uname2.slice(1),
              'GroupUser2ImageName': content.GroupUser2ImageName,

              'GroupUser3': content.GroupUser3,
              'GroupUser3ID': content.GroupUser3ID,
              'GroupUser3UName': uname3.charAt(0).toUpperCase() + uname3.slice(1),
              'GroupUser3ImageName': content.GroupUser3ImageName,

              'GroupUser4': content.GroupUser4,
              'GroupUser4ID': content.GroupUser4ID,
              'GroupUser4UName': uname4.charAt(0).toUpperCase() + uname4.slice(1),
              'GroupUser4ImageName': content.GroupUser4ImageName,

              'created_on': content.created_on
            });
        });
      }

      var paramsForNotifications = {
        TableName: 'Notifications',
        IndexName: 'SentToID-index',
        KeyConditionExpression: 'SentToID = :id',
        ExpressionAttributeValues: {
          ':id': parseInt(sess.user.UserID)
        }
      };

      var notifications = [];
      documentClient.query(paramsForNotifications, function (err, data2) {
        if (err) {
          console.error("Unable to query. Error: No Notifications Found", JSON.stringify(err, null, 2));
        } else {

          if (data2.Items) {
            data2.Items.forEach(function (content) {


              notifications.push(
                {
                  'notification': content.NotificationID,
                  'notification': content.Notification
                });

            });
          }
          res.render('groups', { title: 'Filebox | Groups', user: sess.user, myGroups: myGroups, successmessage: successmessage, errmessage: errmessage, JoinedGroups: myJoinedGroups, notifications: notifications });
          successmessage = ''
          errmessage = ''
        }
      });

      //res.render('groups', { title: 'Filebox | Groups', user: sess.user, myGroups: myGroups, successmessage: successmessage, errmessage: errmessage, JoinedGroups: myJoinedGroups });

    }
  });
});

router.post('/deleteGroup', function (req, res, next) {
  var GroupID = req.body.GroupID
  var params = {
    TableName: 'Groups',
    Key: {
      'GroupID': parseInt(GroupID)
    }
  };
  documentClient.delete(params, function (err, data) {
    if (err) {
      console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
      errmessage = `Error Deleting Your Group, Please Contact a System Administrator`
      res.redirect('/groups')
    } else {
      successmessage = `Successfuly Disbanded Your Group`
      console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
      res.redirect('/groups');
    }
  });

});

router.post('/createGroup', function (req, res, next) {
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  var groupName = req.body.groupName

  /* Get and format current date*/
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + '/' + dd + '/' + yyyy;

  var UID = Math.floor(Math.random() * 100000000)
  /* PutItem Request Params for New User */
  var params = {
    TableName: 'Groups',
    Item: {
      'GroupID': parseInt(UID),
      'GroupCreator': sess.user.UserID,
      'GroupName': groupName,
      'GroupUser1': sess.user.UserID,
      'GroupUser1UName': sess.user.username,
      'GroupUser1ImageName': sess.user.image_name,
      'GroupUser2': '0',
      'GroupUser2ID': false,
      'GroupUser2UName': 'No Second User',
      'GroupUser2ImageName': 'https://filebox-file-storage.s3.amazonaws.com/defaultimages/noimage.gif',
      'GroupUser3': '0',
      'GroupUser3ID': false,
      'GroupUser3UName': 'No Third User',
      'GroupUser3ImageName': 'https://filebox-file-storage.s3.amazonaws.com/defaultimages/noimage.gif',
      'GroupUser4': '0',
      'GroupUser4ID': false,
      'GroupUser4UName': 'No Fourth User',
      'GroupUser4ImageName': 'https://filebox-file-storage.s3.amazonaws.com/defaultimages/noimage.gif',
      'CurrentUserCount': 1,
      'created_on': today
    }
  };

  /* AWS Document Client sends put request for new item based on previously set params */
  documentClient.put(params, function (err) {
    if (err) {
      console.log("Error", err);
      errmessage = "Error Creating Group, Please Contact a System Administrator"
      res.redirect('/groups')
    } else {
      var s3bucket = new S3AWS.S3();
      s3bucket.createBucket(function () {
        var params = { Bucket: `filebox-file-storage/${UID}`, Key: `${groupName}-FileBoxGroup.txt`, Body: 'New Group Filebox Account' };
        s3bucket.putObject(params, function (err, data) {
          if (err) {
            console.log("Error uploading data: ", err);
          } else {
            console.log("Success Creating Groups");
            successmessage = `Successfully Created Group: '${groupName}', Other Users Can Now Join Your Group and Share Files`
            res.redirect('/groups')
          }
        });
      });
    }
  });
});

/* Join Group Functionality */
router.post('/joinGroup', function (req, res, next) {
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  var groupName = req.body.groupName

  var params = {
    TableName: 'Groups',
    IndexName: "GroupName-index",
    KeyConditionExpression: "GroupName = :GroupName",
    ExpressionAttributeValues: {
      ":GroupName": groupName
    }
  };

  documentClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      errmessage = `No Group Found With Name ' ${groupName} '`
      res.redirect('/groups')
    } else {
      if (data.Items[0]) {
        var group = data.Items[0]
        const GroupID = group.GroupID
        var count = parseInt(group.CurrentUserCount)
        var placementID = '';
        var placementUName = '';
        var placementImageName = '';

        if (count == 1) {
          placementID = 'GroupUser2'
          placementUName = 'GroupUser2UName'
          placementImageName = 'GroupUser2ImageName'
        } else if (count = 2) {
          placementID = 'GroupUser3'
          placementUName = 'GroupUser3UName'
          placementImageName = 'GroupUser3ImageName'
        } else if (count = 3) {
          placementID = 'GroupUser4'
          placementIDx = 'GroupUser4ID'
          placementUName = 'GroupUser4UName'
          placementImageName = 'GroupUser4ImageName'
        } else if (count = 4) {

        } else {

        }

        var newCount = count + 1;
        console.log(sess)

        var paramsG = {
          TableName: 'Groups',
          Key: {
            "GroupID": GroupID
          },
          UpdateExpression: `set ${placementID}=:pid, ${placementImageName}=:pin, ${placementUName}=:pun, CurrentUserCount=:count`,
          ExpressionAttributeValues: {
            ":pid": `${sess.user.UserID}`,
            ":pin": `${sess.user.image_name}`,
            ":pun": `${sess.user.username}`,
            ":count": newCount
          },
          ReturnValues: "UPDATED_NEW"
        };

        console.log("Updating the item...");
        documentClient.update(paramsG, function (err, data) {
          if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
            errmessage = 'Could Not Join Group, Please Contact a System Admin'
            res.redirect(req.get('referer'));
          } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            successmessage = `Successfully Joined Group '${groupName}'`
            res.redirect(req.get('referer'));
          }
        });

      }else{
        errmessage = `No Group Found With Name ' ${groupName} '`
        res.redirect('/groups')
      }
    }
  });
});


module.exports = router;