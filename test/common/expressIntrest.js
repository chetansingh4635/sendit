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
 var MockExpressResponse = require('mock-express-response');
 var chaiAsPromised = require('chai-as-promised');
var mongooseMock = require('mongoose-mock');
 chai.use(chaiAsPromised);
//require('sinon-as-promised')
var sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon),
mongoose = require('mongoose');

 describe('/secure/expressIntrest', function () {
    var userModule = {},
        userStub={},
        authStub ={},
        utilityStub={},
        indexStub = {};
        var db = mongooseMock;
      //   getMongoDB: function() {
      //   return db;
      // }



    var expressIntrest = proxyquire('../../routes/common/expressIntrest.js',{
        	"../../../modules/user": userStub,
            "../../../modules/auth" : authStub,
        	"../../../lib/utility" : utilityStub
     });
    
    var promise;
    beforeEach(function() {
            promise = sinon.stub().returnsPromise();
    }); 

            it('should find the request, No partners',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.body = {
                "requestId":mongoose.Types.ObjectId("58245a7ac6292f6896d62f76")
            }
            req.user = {
                "_id":mongoose.Types.ObjectId("58245a7ac6292f6896d62f75")
            }
             var res = new MockExpressResponse();
 
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }

            var spy = sinon.spy();
            var FirstMiddleware = expressIntrest.middlewares[0];
            userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.FirstMiddleware = sinon.stub().callsArgWith(2, null, req);
            
             FirstMiddleware(req,spy)
             expect(db.FirstMiddleware).calledOnce;
             expect(spy).calledWith;
        });


            it('should not the same user, Find user',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.body = {
                "requestId":mongoose.Types.ObjectId("58245a7ac6292f6896d62f76")
            }
            req.user = {
                "_id":mongoose.Types.ObjectId("58245a7ac6292f6896d62f75")
            }
             var res = new MockExpressResponse();
             res.locals = {
                 intrestedRequest :{
                     "createdBy" :{"_id": mongoose.Types.ObjectId("58245a7ac6292f6896d62f76")}
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
            var SecondMiddleware = expressIntrest.middlewares[1];
            userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.SecondMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             SecondMiddleware(req,res,spy)
             expect(db.SecondMiddleware).calledOnce;
             expect(spy).calledWith;
        });


            it('should match the compatible request, Find user',function(){
            
            promise.resolves('resolve value')
            
            var req={};
            req.body = {
                "requestId":mongoose.Types.ObjectId("58245a7ac6292f6896d62f76"),
                "requestType": 1,
                "arrivingAirpoart": "arrivingAirpoart",
                "departingAirpoart": "departingAirpoart"
            }
            req.user = {
                "_id":mongoose.Types.ObjectId("58245a7ac6292f6896d62f75")
            }
             var res = new MockExpressResponse();
             res.locals = {
                 intrestedRequest :{
                     "createdBy" :{"_id": mongoose.Types.ObjectId("58245a7ac6292f6896d62f76")},
                     "requestType": 1,
                     "arrivingAirpoart": "arrivingAirpoart",
                     "departingAirpoart": "departingAirpoart"
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
            var ThirdMiddleware = expressIntrest.middlewares[2];
            userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.ThirdMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             ThirdMiddleware(req,res,spy)
             expect(db.ThirdMiddleware).calledOnce;
             expect(spy).calledWith;
        });



            it('should match the compatible request, Find user',function(){
            
            promise.resolves('resolve value')
            
            var req={};
            req.body = {
                "requestId":mongoose.Types.ObjectId("58245a7ac6292f6896d62f76"),
                "requestType": 1,
                "arrivingAirpoart": "arrivingAirpoart",
                "departingAirpoart": "departingAirpoart"
            }
            req.user = {
                "_id":mongoose.Types.ObjectId("58245a7ac6292f6896d62f75")
            }
             var res = new MockExpressResponse();
             res.locals = {
                 intrestedRequest :{
                     "createdBy" :{"_id": mongoose.Types.ObjectId("58245a7ac6292f6896d62f76")},
                     "requestType": 2,
                     "arrivingAirpoart": "arrivingAirpoart",
                     "departingAirpoart": "departingAirpoart"
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
            var ThirdMiddleware = expressIntrest.middlewares[2];
            userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.ThirdMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             ThirdMiddleware(req,res,spy)
             expect(db.ThirdMiddleware).calledOnce;
             expect(spy).calledWith;
        });


           it('should match the compatible request, Find user',function(){
            
            promise.resolves('resolve value')
            
            var req={};
            req.body = {
                "requestId":mongoose.Types.ObjectId("58245a7ac6292f6896d62f76"),
                "requestType": 1,
                "arrivingAirpoart": "arrivingAirpoart",
                "departingAirpoart": "departingAirpoart"
            }
            req.user = {
                "_id":mongoose.Types.ObjectId("58245a7ac6292f6896d62f75")
            }
             var res = new MockExpressResponse();
             res.locals = {
                 intrestedRequest :{
                     "createdBy" :{"_id": mongoose.Types.ObjectId("58245a7ac6292f6896d62f76")},
                     "requestType": 3,
                     "arrivingAirpoart": "arrivingAirpoart",
                     "departingAirpoart": "departingAirpoart"
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
            var ThirdMiddleware = expressIntrest.middlewares[2];
            userStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.ThirdMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             ThirdMiddleware(req,res,spy)
             expect(db.ThirdMiddleware).calledOnce;
             expect(spy).calledWith;
        });

 });