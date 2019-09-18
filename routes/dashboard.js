var express = require('express');
var router = express.Router();
const AWS = require('aws-sdk');
const S3AWS = require('aws-sdk');
AWS.config.loadFromPath('./dbconfig.json');
var documentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
S3AWS.config.update({ region: 'us-east-1' });
const http = require('http');
const fs = require('fs');



var s3 = new S3AWS.S3();

/* Used for creating signed request for S3 */
const S3_BUCKET = 'filebox-file-storage'

/* GET Dashboard page. */
router.get('/', function (req, res, next) {
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  /* Get File Data From AWS S3 and Store in Array */
  var params = {
    Bucket: `filebox-file-storage`,
    Prefix: `${sess.user.UserID}`
  };

  var fileData = [];
  listAllKeys();
  function listAllKeys() {
    s3.listObjectsV2(params, function (err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
      } else {
        var contents = data.Contents;
        contents.forEach(function (content) {
          fileData.push(
            {
              'Key': content.Key,
              'LastModified': content.LastModified.toDateString(),
              'ETag': content.ETag,
              'Size': formatBytes(content.Size)
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
                    'SentToID': content.SentToID,
                    'NotificationID': content.NotificationID,
                    'notification': content.Notification
                  });

              });
            }
            res.render("dashboard", { user: sess.user, file: fileData, notifications: notifications });
          }
        });

        if (data.IsTruncated) {
          params.ContinuationToken = data.NextContinuationToken;
          console.log("get further list...");
          listAllKeys();
        }
      }
    });
  }
});

router.get('/upload', (req, res) => {
  /* Check If User is Still in the Session */
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  /* Get File Name and File Type From the XMLhttp Request */
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  var contentDisposition = 'attachment; filename="YourFile"';
  /* Setup Parameters for Where to Store File, and Permissions */
  const s3Params = {
    Bucket: `${S3_BUCKET}/${sess.user.UserID}`,
    Key: fileName,
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
      url: `https://${S3_BUCKET}.s3.us-east-1.amazonaws.com/${sess.user.UserID}/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
})

router.post('/delete', (req, res) => {
  /* Check If User is Still in the Session */
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }

  /* Get File Name and File Type From the XMLhttp Request */
  const fileKey = req.body.fileKey

  var params = { Bucket: S3_BUCKET, Key: fileKey };
  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);  // error
    else res.redirect('/dashboard')                // deleted
  });

})

router.post('/download', function (req, res) {
  var sess = req.session;
  if (!sess.user) {
    return res.status(401).render("unauthenticated");
  }
  const fileKey = req.body.fileKey;


  var contentDisposition = `attachment; filename="${fileKey}"`;
  var params = {
    Bucket: S3_BUCKET,
    ResponseContentDisposition: contentDisposition,
    Key: fileKey
  };
  var url = `https://filebox-file-storage.s3.amazonaws.com/${fileKey}`;
  s3.getSignedUrl('getObject', params, function (err, url) {
    console.log('Download Success')
    console.log(url)
    res.redirect(url);
  });
});

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " Bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MB";
  else return (bytes / 1073741824).toFixed(3) + " GB";
};

module.exports = router;