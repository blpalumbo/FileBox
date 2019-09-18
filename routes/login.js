var express = require('express');
var router = express.Router();
var cookieParser = require("cookie-parser");

/* AWS Configuration, AWS DocumentClient api Config */
var AWS = require("aws-sdk");
AWS.config.loadFromPath('./dbconfig.json');
AWS.config.update({ region: 'us-east-2' });
var documentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/* Used for Hashing Passwords */
sha1 = require('js-sha1');


/* GET Login Page. */
router.get('/', function (req, res, next) {
  /* Checks for Any Programatically Added Errors Messages */
  if(req.cookies['resulterrmsg']){
    var msg = req.cookies['resulterrmsg']
    res.clearCookie("resulterrmsg", { httpOnly: true })
    res.render('login', { title: 'Filebox | Login', resulterrmsg: msg });
  }
  res.render('login', { title: 'Filebox | Login' });
});

router.post('/submit', (req, res, next) => {
  console.log("login Form Submitted")
  var sess = req.session;
  const userName = req.body.username
  const pw = sha1(req.body.pw)
console.log(pw)
  var params = {
    TableName: 'UserAccountData',
    IndexName: "username-pw-index",
    KeyConditionExpression: "username = :uname and pw = :pw",
    ExpressionAttributeValues: {
      ":uname": userName,
      ":pw": pw
    }
  };

  documentClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.render('login', { resulterrmsg: "Login Unsuccessful, Please Try Again" })
    } else {
      console.log("Query succeeded.");

      console.log(data.Items[0])

      if(data.Items.length){
        if(data.Items.length == 1){
          sess.user = data.Items[0]
          if(sess.user){
            console.log(data.Items[0].username)
            res.redirect("/dashboard")
          }
        }
      }else{
        res.cookie("resulterrmsg", "Invalid Credentials, Please Try Again", { httpOnly: true });
        res.redirect('/login')
        
      }



    }
  });

});

module.exports = router;