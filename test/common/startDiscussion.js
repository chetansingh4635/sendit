var mocha = require('mocha');
 var chai = require('chai');
 var sinon = require('sinon');
 var proxyquire = require('proxyquire')/*.noCallThru().noPreserveCache()*/;
 //var describe = mocha.describe;
 var before = mocha.before;
 var after = mocha.after;
 var expect = chai.expect;
 var should = chai.should();
 var config = require('config');
 var chaiAsPromised = require('chai-as-promised');
var mongooseMock = require('mongoose-mock');
 chai.use(chaiAsPromised);

 var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
 
var User = new Schema({});
//require('sinon-as-promised')
var sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);
 
 
 
 describe('/common/startDiscussion', function () {
    var userModule = {},
        userStub={},
        authStub ={},
        utilityStub={},
        indexStub = {};
        var db = mongooseMock;
      //   getMongoDB: function() {
      //   return db;
      // }



    var startADissussion = proxyquire('../../routes/common/startDiscussion.js',{
        	"../../../modules/user": userStub,
            "../../../modules/auth" : authStub,
        	"../../../lib/utility" : utilityStub
     });
    
        var promise;
        beforeEach(function() {
            promise = sinon.stub().returnsPromise();
          });   
   
    
    it('Find email of intrested user',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.body = {
                 "userId":"58245a7ac6292f6896d62f74",
                "disscussionTitle": "Title",
                "disscussionTopic":"Topic" 
            }

            req.user = {
                emailId: "tempmail@sendit.com"
            }
            var res ={};
            res.locals = {};
 
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }

            var spy = sinon.spy();
            var FirstMiddleware = startADissussion.middlewares[0];
            userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.FirstMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             FirstMiddleware(req,res,spy)
             expect(db.FirstMiddleware).calledOnce;
             expect(spy).calledWith;
        });



        it('Check if discource user exist',function(){
            
            promise.resolves('resolve value')

            var req={};
             req.body = {
                 "userId":"58245a7ac6292f6896d62f74",
                "disscussionTitle": "Title",
                "disscussionTopic":"Topic" 
            }

            req.user = {
                emailId: "tempmail@sendit.com"
            }

            var res = {};

            res.locals = {
                intrestedUser:{
                    emailId: 'gourav.arora@daffodilsw.com'
                }
            }
 
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }

            var spy = sinon.spy();
            var SecondMiddleware = startADissussion.middlewares[3];
            userStub.signUp = sinon.stub().returns(mock.then({id:"fds"}));
            db.SecondMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             SecondMiddleware(req,res,spy)
             expect(db.SecondMiddleware).calledOnce;
             expect(spy).calledWith;
        });


        it('Registere if user not exist',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.body = {
                "userId":"58245a7ac6292f6896d62f74",
                "disscussionTitle": "Title",
                "disscussionTopic":"Topic" 
            }

            req.user = {
                emailId: "tempmail@sendit.com"
            }
            var res ={};
            res.locals = {
                intrestedUser:{
                    firstName: "Gourav",
                    emailId: "gourav.arora@daffodilsw.com"
                }
            }
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }

            var spy = sinon.spy();
            var ThirdMiddleware = startADissussion.middlewares[2];
            userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.ThirdMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             ThirdMiddleware(req,res,spy)
             expect(db.ThirdMiddleware).calledOnce;
             expect(spy).calledWith;
        });



        it('Check the creator user exist at discource',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.body = {
                 "userId":"58245a7ac6292f6896d62f74",
                "disscussionTitle": "Title",
                "disscussionTopic":"Topic" 
            }

            req.user = {
                emailId: "tempmail@sendit.com"
            }
            var res ={};
            res.locals = {
                intrestedUser:{
                    firstName: "Gourav",
                    emailId: "gourav.arora@daffodilsw.com"
                }
            }
 
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }

            var spy = sinon.spy();
            var ForthMiddleware = startADissussion.middlewares[3];
            userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.ForthMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             ForthMiddleware(req,res,spy)
             expect(db.ForthMiddleware).calledOnce;
             expect(spy).calledWith;
        });



        it('register user if not exist',function(){
            
            promise.resolves('resolve value')
            var req={};
             req.body = {
                 "userId":"58245a7ac6292f6896d62f74",
                "disscussionTitle": "Title",
                "disscussionTopic":"Topic" 
            }

            req.user = {
                emailId: "tempmail@sendit.com"
            }
            var res ={};
            res.locals = {
                intrestedUser:{
                    firstName: "Gourav",
                    emailId: "gourav.arora@daffodilsw.com"
                },
                discourseCreator:{

                }
            }
 
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }

            var spy = sinon.spy();
            var FifthMiddleware = startADissussion.middlewares[4];
            userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.FifthMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             FifthMiddleware(req,res,spy)
             expect(db.FifthMiddleware).calledOnce;
             expect(spy).calledWith;
        });


        // it('creating a new topic at discource',function(){
            
        //     promise.resolves('resolve value')
            
        //     var req={};
        //      req.body = {
        //         "userId":"58245a7ac6292f6896d62f74",
        //         "disscussionTitle": "Title",
        //         "disscussionTopic":"Topic" 
        //     }

        //     req.user = {
        //         emailId: "tempmail@sendit.com"
        //     }
        //     var res ={};
        //     res.locals = {
        //         creatordiscourse:{
        //             username: "gouravarora"
        //         }
        //     }
 
        //     var mock =  {
        //         then: function(){
        //              return new Promise(function(resolve){
        //             resolve({id :"ok"})
        //         })
        //         }
        //     }

        //     var spy = sinon.spy();
        //     var SixthMiddleware = startADissussion.middlewares[8];
        //     userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
        //     db.SixthMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
        //      SixthMiddleware(req,res,spy)
        //      expect(db.SixthMiddleware).calledOnce;
        //      expect(spy).calledWith;
        // });

        // it('Sending mail using spark post',function(){
            
        //     promise.resolves('resolve value')
            
        //     var req={};
        //      req.body = {
        //         "userId":"58245a7ac6292f6896d62f74",
        //         "disscussionTitle": "Title",
        //         "disscussionTopic":"Topic" 
        //     }

        //     req.user = new User({
        //         emailId: "tempmail@sendit.com"
        //     })
        //     var res ={};
        //     res.locals = {}
 
        //     var mock =  {
        //         then: function(){
        //              return new Promise(function(resolve){
        //             resolve({id :"ok"})
        //         })
        //         }
        //     }

        //     var spy = sinon.spy();
        //     var SeventhMiddleware = startADissussion.middlewares[6];
        //     userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
        //     db.SeventhMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
        //      SeventhMiddleware(req,res,spy)
        //      expect(db.SeventhMiddleware).calledOnce;
        //      expect(spy).calledWith;
        // });

        // it('Sending responce',function(){
            
        //     promise.resolves('resolve value')
            
        //     var req={};
        //      req.body = {
        //         "userId":"58245a7ac6292f6896d62f74",
        //         "disscussionTitle": "Title",
        //         "disscussionTopic":"Topic" 
        //     }

        //     req.user = {
        //         emailId: "tempmail@sendit.com"
        //     }
        //     var res ={};
        //     res.locals = {
        //         topicInfo:{
        //             topic_id: 20
        //         }
        //     }
 
        //     var mock =  {
        //         then: function(){
        //              return new Promise(function(resolve){
        //             resolve({id :"ok"})
        //         })
        //         }
        //     }

        //     var spy = sinon.spy();
        //     var EightsMiddleware = startADissussion.middlewares[7];
        //     userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
        //     db.EightsMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
        //      EightsMiddleware(req,res,spy)
        //      expect(db.EightsMiddleware).calledOnce;
        //      expect(spy).calledWith;
        // });

    });