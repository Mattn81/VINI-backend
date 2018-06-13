import createError from 'http-errors';
import express from "express";
import logger from "morgan";
import oAuth2Server from "node-oauth2-server";
import oAuthModel from "./authorisation/accessTokenModel";
import userRoutes from "./routes/api/users";
import {isAuthorised} from "./authorisation/routeMethods";

import ethNodeCon from "./blockchain/ethNode";
import fs from 'fs';
import https from 'https';
import cors from 'cors';

const port = process.env.port || 4711;
const httpsPort = (process.env.port + 1) || 4712;
const app = express();


// TODO: Key + Certificate direkt auf den Server packen und evtl kein Self-Signed Zertifikat nehmen
const privateKey = fs.readFileSync('../sslcert/server.key', 'utf8');
const certificate = fs.readFileSync('../sslcert/server.crt', 'utf8');

const credentials = {key: privateKey, cert: certificate};
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(httpsPort);
console.log("HTTPS-Server is running on", "https://localhost:" + httpsPort, " or", "<TODO>");

// Allow Cross-Origin Header
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.oauth = oAuth2Server({
  model: oAuthModel,
  grants: ['password'],
  debug: true
});
userRoutes.initRoutes(app);

app.use(cors());

/* Setup the oAuth error handling */
app.use(app.oauth.errorHandler());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/*TODO: "isAuthorised" passend einbauen
Bei einer Route, die als 2. Parameter "isAuthorised" erhält, kann geprüft werden, ob der
Zugriff legitim ist. Und außerdem greift dies bei alles unter Routen.
Das heißt es kann beispielsweise für /api "isAuthorised" hinterlegt werden und dann werden bei allen
Pfaden die mit /api beginnen die Rechte geprüft.
*/

//TODO: Routen zusammenlegen (z.B. /api/car Unterpfade in eine Datei zusammenführen)?
//rest API routes
app.use('/', require("./routes/root"));
app.use("/restricted", isAuthorised, require("./routes/root"));
app.use('/api/car', require('./routes/api/car'));
app.use('/api/users', userRoutes.router); // This can't be required directly, because of the oAuthServer

// catch 404 and forward to error handler
app.use((req, res, next) => {
  req.next(createError(404));
});

app.listen(port);
console.log("HTTP-Server is running on", "http://localhost:" + port, " or", "http://vini-ethereum.westeurope.cloudapp.azure.com/\n");


ethNodeCon.connectToNode();


module.exports = app;
