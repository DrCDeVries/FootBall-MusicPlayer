const appLogName = 'VicksburgAudioStream';
const defaultConfig = require('./config/defaultConfig.json');
const http = require('http');
const https = require('https');
const path = require('path');
const extend = require('extend');
const express = require('express');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const packagejson = require('./package.json');
const version = packagejson.version;
const fs = require('fs');
const ConfigHandler = require("@andrewiski/confighandler");
const LogUtilHelper = require("@andrewiski/logutilhelper");
const multer = require('multer');
const zip = require('express-zip');
const { send } = require('process');
const FFplay = require('./modules/ffplay.js');
var app = express();
const usb = require('usb');

const audioFileDirectory = path.join("\data/songs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '\data/songs')
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname)
  },
   fileFilter: function (req, file, cb) {

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted
  
    // To reject this file pass `false`, like so:
    if(['.mp3', '.m4a', '.wav'].includes(path.extname(file.originalname).toLowerCase())){
      cb(null, true)
    }else{cb(null, false)}

  
    // To accept the file pass `true`, like so:

  
    // You can always pass an error if something goes wrong:
  }
  
})

const upload = multer({ storage: storage })

var configFileOptions = {
  "configDirectory": "config",
  "configFileName": "config.json"
}

var localDebug = false;

var configHandler = new ConfigHandler(configFileOptions, defaultConfig);

var objOptions = configHandler.config;


let logUtilHelper = new LogUtilHelper({
  appLogLevels: objOptions.appLogLevels,
  logEventHandler: null,
  logUnfilteredEventHandler: null,
  logFolder: objOptions.logDirectory,
  logName: appLogName,
  debugUtilEnabled: (process.env.DEBUG ? true : undefined) || false,
  debugUtilName:appLogName,
  debugUtilUseUtilName: false,
  debugUtilUseAppName: true,
  debugUtilUseAppSubName: false,
  includeErrorStackTrace: localDebug,
  logToFile: !localDebug,
  logToFileLogLevel: objOptions.logLevel,
  logToMemoryObject: true,
  logToMemoryObjectMaxLogLength: objOptions.maxLogLength,
  logRequestsName: "access"

})









app.use(express.static(path.join(__dirname, 'public')));
// disable the x-power-by express message in the header
app.disable('x-powered-by');


// not needed already served up by io app.use('/javascript/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'node_modules', 'socket.io-client', 'dist')));
app.use('/audio', express.static(audioFileDirectory));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/javascript/fontawesome', express.static(path.join(__dirname, 'node_modules', 'font-awesome')));
app.use('/javascript/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use('/javascript/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));
app.use('/javascript/moment', express.static(path.join(__dirname, 'node_modules', 'moment', 'min')));
app.use('/javascript/bootstrap-notify', express.static(path.join(__dirname, 'node_modules', 'bootstrap-notify')));
app.use('/javascript/animate-css', express.static(path.join(__dirname, 'node_modules', 'animate.css')));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

var routes = express.Router();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var handlePublicFileRequest = function (req, res) {
    var filePath = req.path;

    if (filePath === "/") {
        filePath = "/index.htm";
    }
    console.log('handlePublicFileRequest ' + filePath + ' ...');

    if (fs.existsSync(path.join(__dirname, 'public',filePath)) === true) {
        res.sendFile(filePath, { root: path.join(__dirname, 'public') });  
    }else if (filePath.startsWith("/page/") == true || filePath == "/" ) {
        filePath = "/index.htm";
        res.sendFile(filePath, { root: path.join(__dirname, 'public') });
        
    }else if(filePath.startsWith("/data") == true ){
      if(filePath === "/data/musicList"){

        fs.readdir(audioFileDirectory, (err, fileNames) => {

          if (err) {
            console.error('Error reading directory:', err);
            res.status(500).send({ error: 'Failed to read directory' });
            return;
          }
           const files = [];
          for (let i in fileNames) {
            const file = fileNames[i];
            const filePath = path.join(audioFileDirectory, file);
            const fileName = path.basename(filePath);
            const fileObj ={name : fileName};

            files.push(fileObj);


        }
        console.log(files);
          res.send(files);
        });
      
      }else if(filePath === "/data/usbCheck"){

       const devices = usb.getDeviceList();
        console.log(devices);
        res.send(devices);
      }
    }
    else {
        res.sendStatus(404);
    }
       
};

    routes.get('/*', function (req, res) {
        handlePublicFileRequest(req, res);
    });

    app.use('/', routes);

    var audioFilePlayer = null;
    routes.post('/songControl', (req, res) => {
      const command = req.body.command;
      const startTime = req.body.startTime;


      var audioFilePlay = function (audioFolder, audioFile, options,startTime) {

        if (audioFilePlayer !== null) {
            audioFilePlayer.stop();
            audioFilePlayer = null;
        }
        audioFilePlayer = new FFplay(audioFolder, audioFile, options, logUtilHelper,startTime);
        
    }
    var audioFileStop = function () {
      if (audioFilePlayer !== null) {
          audioFilePlayer.stop();
          audioFilePlayer = null;
      }
  }
  const responseString =  JSON.stringify(req.body.filepath);
      switch (command) {
        
        case "start":
          console.log(audioFileDirectory+"/"+req.body.filepath);
          audioFilePlay(audioFileDirectory , req.body.filepath, ['-hide_banner', '-nodisp', '-autoexit'],startTime);
        res.send(`playing:${responseString}`);
          break;
        case "stop":
          console.log("It's Monday");
          break;
        case "seek":
          console.log("It's Tuesday");
          break;
          case "pause":
            audioFileStop();
            res.send("Stopped:"+responseString);
            break;
        default:
          console.log("Invalid Command");
      }




      // Function to stop audio


  });

  routes.post('/upload', upload.single('file',100,true), (req, res) => {
    if (!fs.existsSync(directoryName)) {
      fs.mkdir(directoryName, (err) => {
        if (err) {
          console.error('Error creating directory:', err);
        } else {
          console.log('Directory created successfully.');
        }
      });
    } else {
      console.log('Directory already exists.');
    }
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
      // File uploaded successfully, you can access it using req.file
    console.log('File uploaded:', req.file);

    // Send a response to the client
    res.send('File uploaded successfully.');
});







    http.createServer(app).listen(1337, () => {
        console.log('Express server listening on port 1337');
      });