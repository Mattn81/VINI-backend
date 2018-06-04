import userDBHelper from "../database/userDBHelper";

/* handles the api call to register the user and insert them into the users table.
  The req body should contain an email and a password. */
function registerUser(req, res){

  console.log("registerUser: req.body is:", req.body);

  userDBHelper.doesUserExist(req.body.email, (doesUserExist) => {

    if (doesUserExist){
      res.status(400);
      res.json({
        "message": "User already exists"
      });

      return;
    }

    userDBHelper.registerUserInDB(req.body.email, req.body.password, result => {

      if(result.length === 0){
        res.status(200);
        res.json({
          "message": "Registration was successful"
        })
      }
      else{
        res.status(500);
        res.json({
          "message": "Failed to register user due to a server error"
        })
      }
    })
  })
}

function login(registerUserQuery, res){

  console.log("User login successful");

}

let app;

//TODO: Das herumreichen der "app" Instanz ist sehr unschön. FIXME!

function isAuthorised(req, res, next){
  const authResult = app.oauth.authorise()(req, res, next);

  if(authResult.bearerToken != null){
    console.log("TOKEN: ", authResult.bearerToken);

    //TODO: Validierung der Nutzerrechte (authorisation Level)
  }
  else{
    console.log("No valid accessToken found");
    res.status(403);
    res.redirect("/");
  }
}

module.exports = {
  "setApp": (expressApp) => {app = expressApp},
  "registerUser": registerUser,
  "login": login,
  "isAuthorised": isAuthorised
};