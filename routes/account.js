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
const S3_BUCKET = 'filebox-file-storage'

/* Used for Hashing Passwords */
sha1 = require('js-sha1');

successmsg = ''
errmsg = ''

/* GET home page. */
router.get('/', function (req, res, next) {
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
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
      res.render('account', { title: 'FileBox | Account', user: sess.user, successmsg: successmsg, errmsg: errmsg, notifications: notifications });
      successmsg = ''
      errmsg - ''
    }
  });
});

router.post('/updateAccount', (req, res) => {
  /* Check If User is Still in the Session */
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  var first_name = req.body.first_name
  var last_name = req.body.last_name
  var phone_number = req.body.phone
  var email = req.body.email
  var newPassword = req.body.password
  var confirm_newPassword = req.body.password2
  var pw = ""

  if (!first_name) {
    first_name = sess.user.first_name
  }
  if (!last_name) {
    last_name = sess.user.last_name
  }
  if (!phone_number) {
    phone_number = sess.user.phone_number
  }
  if (!email) {
    email = sess.user.email
  }
  if (newPassword) {
    if (newPassword == confirm_newPassword) {
      pw = sha1(newPassword)
    } else {
      errmsg = "Passwords Do Not Match!"
      res.redirect('/account')
    }
  } else {
    pw = sess.user.pw
  }

  var params = {
    TableName: 'UserAccountData',
    Key: {
      "UserID": parseInt(sess.user.UserID)
    },
    UpdateExpression: "set first_name=:fn, last_name=:ln, phone_number=:pn, email=:e, pw=:pw",
    ExpressionAttributeValues: {
      ":fn": first_name,
      ":ln": last_name,
      ":pn": phone_number,
      ":e": email,
      ":pw": pw
    },
    ReturnValues: "UPDATED_NEW"
  };

  documentClient.update(params, function (err, data) {
    if (err) {
      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      errmsg = "There was an error updating your info, please try again. If that does not work, contact a system admin. Thanks!"
      res.redirect('/account')
    } else {
      console.log("UpdateItem:user Account succeeded:", JSON.stringify(data, null, 2));
      successmsg = "Success! Your Data has Been Updated!"
      res.redirect('/account')
    }
  });
})

router.get('/uploadImage', (req, res) => {
  console.log(1, "we got here")
  /* Check If User is Still in the Session */
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  /* Get File Name and File Type From the XMLhttp Request */
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];

  var params = {
    TableName: 'UserAccountData',
    Key: {
      "UserID": parseInt(sess.user.UserID)
    },
    UpdateExpression: "set image_name=:ip",
    ExpressionAttributeValues: {
      //":ip": `https://filebox-file-storage.s3.us-east-1.amazonaws.com/${sess.user.UserID}/${fileName}`
      ":ip": `https://filebox-file-storage.s3.us-east-1.amazonaws.com/profileimages/${sess.user.UserID}_${fileName}`

    },
    ReturnValues: "UPDATED_NEW"
  };

  documentClient.update(params, function (err, data) {
    if (err) {
      console.error("Unable to update profile iamge. Error JSON:", JSON.stringify(err, null, 2));

    } else {
      console.log("UpdateItem:Profile Image Upload succeeded:", JSON.stringify(data, null, 2));
    }
  });


  /* Setup Parameters for Where to Store File, and Permissions */
  const s3Params = {
    Bucket: `${S3_BUCKET}/profileimages`,
    Key: `${sess.user.UserID}_${fileName}`,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  /* Creates a Signed URL for AWS S3 */
  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      "content-disposition": 'attachment',
      url: `https://${S3_BUCKET}.s3.us-east-1.amazonaws.com/profileimages/${sess.user.UserID}_${fileName}`
    };
    console.log(returnData)
    res.write(JSON.stringify(returnData));
    res.end();
  });
})


module.exports = router;