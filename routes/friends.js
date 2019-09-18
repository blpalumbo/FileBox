var express = require('express');
var router = express.Router();
var AWS = require("aws-sdk");
AWS.config.loadFromPath('./dbconfig.json');
AWS.config.update({ region: 'us-east-2' });
var documentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

var successmessage = '';
var errmessage = '';
/* GET Friends Page. */
router.get('/', function (req, res, next) {
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }
  var paramsForFriends = {
    TableName: 'Friends',
    IndexName: "UserID-index",
    KeyConditionExpression: "UserID = :UserID",
    ExpressionAttributeValues: {
      ":UserID": sess.user.UserID,
    }
  };


  var usersFriends = [];
  documentClient.query(paramsForFriends, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      if (data.Items) {
        data.Items.forEach(function (content) {

          usersFriends.push(
            {
              'UserFriendID': content.UserFriendID,
              'UserID': content.UserID,
              'FriendID': content.FriendID,
              'FriendRequestID': content.FriendRequestID,
              'UserSentUname': content.UserSentUname,
              'UserSentEmail': content.UserSentEmail,
              'UserSentFirstName': content.UserSentFirstName,
              'UserSentLastName': content.UserSentLastName,
              'UserSentImageName': content.UserSentImageName,
              'UserReceivedID': content.UserReceivedID,
              'UserReceivedUname': content.UserReceivedUname,
              'UserReceivedEmail': content.UserReceivedEmail,
              'UserReceivedFirstName': content.UserReceivedFirstName,
              'UserReceivedLastName': content.UserReceivedLastName,
              'UserReceivedImageName': content.UserReceivedImageName
            });

        });
      }
    }
  });


  /* Setup Params for User Sent Friend Requests */
  var paramsFRS = {
    TableName: 'FriendRequests',
    IndexName: "UserSentID-index",
    KeyConditionExpression: "UserSentID = :UserSentID",
    ExpressionAttributeValues: {
      ":UserSentID": sess.user.UserID,
    }
  };
  /* Query DynamoDB For Sent Friend Requests */
  var sentFriendRequests = [];
  documentClient.query(paramsFRS, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.render('friends', { resulterrmsg: "There was an unexpected error, please try again or contact a system admin. Thanks!" })
    } else {
      if (data.Items) {
        data.Items.forEach(function (content) {
          sentFriendRequests.push(
            {
              'UserReceivedUname': content.UserReceivedUname,
              'UserReceivedEmail': content.UserReceivedEmail,
              'UserReceivedFirstName': content.UserReceivedFirstName,
              'UserReceivedLastName': content.UserReceivedLastName,
              'UserReceivedImageName': content.UserReceivedImageName,
              'FriendRequestID': content.FriendRequestID
            });

          console.log(sentFriendRequests)
        });
      }
    }
  });

  /* Setup Params for User Received Friend Requests */
  var paramsFRR = {
    TableName: 'FriendRequests',
    IndexName: "UserReceivedID-index",
    KeyConditionExpression: "UserReceivedID = :UserReceivedID",
    ExpressionAttributeValues: {
      ":UserReceivedID": sess.user.UserID,
    }
  };
  /* Query Dynamodb for user Received Friend Requests */
  var receivedFriendRequests = [];
  documentClient.query(paramsFRR, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.end()
    } else {
      if (data.Items) {
        data.Items.forEach(function (content) {
          receivedFriendRequests.push(
            {
              'UserSentUname': content.UserSentUname,
              'UserSentEmail': content.UserSentEmail,
              'UserSentFirstName': content.UserSentFirstName,
              'UserSentLastName': content.UserSentLastName,
              'UserSentImageName': content.UserSentImageName,
              'FriendRequestID': content.FriendRequestID,
              'UserSentID': content.UserSentID,
              'UserReceivedID': content.UserReceivedID,
              'UserReceivedUname': content.UserReceivedUname,
              'UserReceivedEmail': content.UserReceivedEmail,
              'UserReceivedFirstName': content.UserReceivedFirstName,
              'UserReceivedLastName': content.UserReceivedLastName,
              'UserReceivedImageName': content.UserReceivedImageName
            });
        });

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
            res.render('friends', { title: 'Filebox | Friends', user: sess.user, sentFriendRequest: sentFriendRequests, receivedFriendRequests: receivedFriendRequests, friends: usersFriends, successmessage: successmessage, errmessage: errmessage, notifications: notifications });
            successmessage = ''
            errmessage = ''
          }
        });
        //res.render('friends', { title: 'Filebox | Friends', user: sess.user, sentFriendRequest: sentFriendRequests, receivedFriendRequests: receivedFriendRequests, friends : usersFriends, successmessage: successmessage, errmessage: errmessage });

      }
    }
  });


});

/* Add Friend Route, Sends a Friend Request if the User Exists, else displays error */
router.post('/SendFriendRequest', function (req, res, next) {
  successmessage = '';
  errmessage = '';
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  /* Retrieve and store friends username from request, with validation  */
  if (req.body.username) {
    const username = req.body.username;
    var params = {
      TableName: 'UserAccountData',
      IndexName: "username-index",
      KeyConditionExpression: "username = :uname",
      ExpressionAttributeValues: {
        ":uname": username,
      }
    };

    documentClient.query(params, function (err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        res.render('friends', { message: "There was an unexpected error, please try again or contact a system admin. Thanks!" })
      } else {
        if (data.Items) {
          if (data.Items.length == 1) {
            var UID = Math.floor(Math.random() * 100000000)
            /* setup params for friend request */
            var paramsFR = {
              TableName: 'FriendRequests',
              Item: {
                'FriendRequestID': UID,
                'UserSentID': sess.user.UserID,
                'UserReceivedID': data.Items[0].UserID,
                'UserReceivedUname': username,
                'UserReceivedEmail': data.Items[0].email,
                'UserReceivedFirstName': data.Items[0].first_name,
                'UserReceivedLastName': data.Items[0].last_name,
                'UserReceivedImageName': data.Items[0].image_name,
                'UserSentUname': sess.user.username,
                'UserSentEmail': sess.user.email,
                'UserSentFirstName': sess.user.first_name,
                'UserSentLastName': sess.user.last_name,
                'UserSentImageName': sess.user.image_name,
                'status': 0
              }
            };
            /* add friend request to database*/
            documentClient.put(paramsFR, function (err) {
              if (err) {
                console.log("Error", err);
                res.end();
              } else {
                //successmessage = `Request Successfully Sent to '${username}'`
                //res.redirect('/friends')
              }
            });

            var paramsNotifications = {
              TableName: 'Notifications',
              Item: {
                'NotificationID': UID,
                'SentToID': data.Items[0].UserID,
                'SentFromID': sess.user.UserID,
                'Notification': `${sess.user.username} has sent you a Friend Request!`
              }
            };

            /* add friend request notification to database*/
            documentClient.put(paramsNotifications, function (err) {
              if (err) {
                console.log("Error", err);
                res.end();
              } else {
                successmessage = `Request Successfully Sent to '${username}'`
                res.redirect('/friends')
              }
            });

          } else {
            errmessage = `No user with the username '${username}' was found`
            res.redirect('/friends')
          }
        }
      }
    });
  }
});

/* POST requst for canceling friend requests */

router.post('/cancelRequest', function (req, res, next) {
  successmessage = '';
  errmessage = '';
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  const FriendRequestID = parseInt(req.body.FriendRequestID)

  console.log(FriendRequestID)
  var params = {
    TableName: 'FriendRequests',
    Key: {
      'FriendRequestID': FriendRequestID
    }
  };
  documentClient.delete(params, function (err, data) {
    if (err) {
      console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
      errmessage = `Error Canceling Friend Request, Please Contact a System Administrator`
      res.redirect('/friends')
    } else {
      successmessage = `Successfuly Canceled Friend Request`
      console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
      res.redirect('/friends');
    }
  });

});

/* POST requst for Accepting  friend requests */
router.post('/acceptRequest', function (req, res, next) {
  successmessage = '';
  errmessage = '';
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  var UID = Math.floor(Math.random() * 100000000)
  const FriendRequestID = parseInt(req.body.FriendRequestID)
  const UserSentID = parseInt(req.body.UserSentID)
  const UserSentEmail = req.body.UserSentEmail
  const UserSentUname = req.body.UserSentUname
  const UserSentFirstName = req.body.UserSentFirstName
  const UserSentLastName = req.body.UserSentLastName
  const UserSentImageName = req.body.UserSentImageName
  const UserReceivedID = parseInt(req.body.UserReceivedID)
  const UserReceivedEmail = req.body.UserReceivedEmail
  const UserReceivedUname = req.body.UserReceivedUname
  const UserReceivedFirstName = req.body.UserReceivedFirstName
  const UserReceivedLastName = req.body.UserReceivedLastName
  const UserReceivedImageName = req.body.UserReceivedImageName
  /* setup params for friend request */
  var params = {
    TableName: 'Friends',
    Item: {
      'UserFriendID': UID,
      'UserID': sess.user.UserID,
      'FriendID': UserSentID,
      'FriendRequestID': FriendRequestID,
      'UserSentUname': UserSentUname,
      'UserSentEmail': UserSentEmail,
      'UserSentFirstName': UserSentFirstName,
      'UserSentLastName': UserSentLastName,
      'UserSentImageName': UserSentImageName,
      'UserReceivedID': UserReceivedID,
      'UserReceivedUname': UserReceivedUname,
      'UserReceivedEmail': UserReceivedEmail,
      'UserReceivedFirstName': UserReceivedFirstName,
      'UserReceivedLastName': UserReceivedLastName,
      'UserReceivedImageName': UserReceivedImageName
    }
  };
  UID = Math.floor(Math.random() * 100000000)
  var params2 = {
    TableName: 'Friends',
    Item: {
      'UserFriendID': UID,
      'UserID': UserSentID,
      'FriendID': sess.user.UserID,
      'FriendRequestID': FriendRequestID,
      'UserSentUname': UserReceivedUname,
      'UserSentEmail': UserReceivedEmail,
      'UserSentFirstName': UserReceivedFirstName,
      'UserSentLastName': UserReceivedLastName,
      'UserSentImageName': UserReceivedImageName,
      'UserReceivedID': UserSentID,
      'UserReceivedUname': UserSentUname,
      'UserReceivedEmail': UserSentEmail,
      'UserReceivedFirstName': UserSentFirstName,
      'UserReceivedLastName': UserReceivedLastName,
      'UserReceivedImageName': UserSentImageName
    }
  };

  /* add friend to database*/
  documentClient.put(params, function (err) {
    if (err) {
      console.log("Error", err);
      res.redirect('/friends');
    } else {
      var params = {
        TableName: 'FriendRequests',
        Key: {
          'FriendRequestID': FriendRequestID
        }
      };
      /* Delete Request From The Database */
      documentClient.delete(params, function (err, data) {
        if (err) {
          console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
          console.log("DeleteItem for friends request after acceptence succeeded:", JSON.stringify(data, null, 2));
        }
      });
    }
  });

  documentClient.put(params2, function (err) {
    if (err) {
      console.log("Error", err);
      errmessage = `Error Accepting Request`
      res.redirect('/friends');
    } else {
      successmessage = `Successfully Added User To Your Friends List`
      res.redirect('/friends');
    }
  });

});

router.post('/deleteFriend', function (req, res, next) {
  successmessage = '';
  errmessage = '';
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  const UserFriendID = req.body.UserFriendID

  var params = {
    TableName: 'Friends',
    Key: {
      'UserFriendID': parseInt(UserFriendID)
    }
  };

  documentClient.delete(params, function (err) {
    if (err) {
      errmessage = `Error Deleting Request`
      console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
      res.redirect('/friends');
    } else {
      successmessage = `Successfully Deleted User From Your Friends List`
      res.redirect('/friends');
    }
  });
});


module.exports = router;