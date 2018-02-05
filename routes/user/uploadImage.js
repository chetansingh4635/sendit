//Route for uploading mage file for profile picture

var Route = require('../../lib/Route'),
    Promise = require("bluebird"),
    errors = require('../../lib/errors'),
    resources = require('../../resources/resources'),
    querystring=require('querystring'),
    logger = require('../../lib/logger'),
    crypto = require('crypto'),
    fs = require('fs');

var route = new Route('post', '/user/imageUpload');

module.exports = route;

// public route
route.setPublic();

// route.validateInputQuery({
//     type: 'object',
//     prope
// })

/**
 * Midlleware to check the body and content type
 * Responce of the middle ware will be the fullData from body
 * notify error in case no image is uploaded
**/
route.use(function (req, res, next) {
    req.setEncoding('binary');
    body = '';

    req.on('data', function(data) { 
        body += data;
    });

   
    req.on('end', function() {      

        var note = querystring.parse(body, '\r\n', ':')  
        //var fetchContentType = note['Content-Type'].split('/')

        console.log(note['Content-Disposition']);
     
        if(note && note['Content-Type']){   

            var fileInfo = Array.isArray(note['Content-Disposition']) ? note['Content-Disposition'][0].split('; ') : note['Content-Disposition'].split('; ');
            var fileExt = ''
            for (value in fileInfo){
                if (fileInfo[value].indexOf("filename=") != -1){
                    fileName = fileInfo[value].substring(10, fileInfo[value].length-1);
                    fileExt = fileName.substring(fileName.lastIndexOf('.'), fileName.length);
                }   
            }
                
            res.locals.fullData = body.toString();
            res.locals.contentType = note['Content-Type'].trim();
            res.locals.fileExt = fileExt;
            next();
        }else
            res.send(resources.no_image_found());
})


});

/**
 * Midlleware to saving the image in file system
 * Responce of the middle ware will success message if file saved successfully
 * notify error in case no image is not saved
**/
route.use(function(req, res, next){
    var contentType = res.locals.contentType;
    var fullData = res.locals.fullData;
    var fileName = crypto.randomBytes(20)
                    .toString('hex') // convert to hexadecimal format
                     + res.locals.fileExt;
    var upperBoundary = fullData.indexOf(contentType) + contentType.length; 

    var modifiedData = fullData.substring(upperBoundary); 
             
    var lastBinaryData = modifiedData.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
 	//specify the path to folder where we want to save our file. 
     if (!fs.existsSync('./public/images')){
        fs.mkdirSync('./public/images');
    }      
    fs.writeFile('./public/images/' + fileName  , lastBinaryData, 'binary', function(err){
             if(err){
                 return res.send(err);
             }else{
                 var responce =  resources.image_uploaded();
                 responce.fileName = fileName;
                 return res.send(responce);
             }
        });
})
 