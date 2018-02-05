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
//require('sinon-as-promised')
var sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);
 
 
 
 describe('/user/socialLogin', function () {
    var userModule = {},
        userStub={},
        authStub ={},
        utilityStub={},
        requestStub={},
        indexStub = {};
        var db = mongooseMock;
      //   getMongoDB: function() {
      //   return db;
      // }



    var getRequest = proxyquire('../../routes/common/getRequest.js',{
        	"../../../modules/user": userStub,
            "../../../modules/auth" : authStub,
        	"../../../lib/utility" : utilityStub,
            "../../../modules/request": requestStub
     });
    
        var promise;
        beforeEach(function() {
            promise = sinon.stub().returnsPromise();
          });   
   
    
        it('should login, find user',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.params = {
                 "_id":"",
                 "requestType":"travel"
            }
 
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }

            var response = {statusCode: 200, message: "Request result", data: {}}

            var spy = sinon.spy();
            var FirstMiddleware = getRequest.middlewares[0];
            requestStub.doc = sinon.stub().returns(mock.then(response));
            db.FirstMiddleware = sinon.stub().callsArgWith(2, null, req);
            
             FirstMiddleware(req,spy)
             expect(db.FirstMiddleware).calledOnce;
             expect(spy).calledWith;
        })


        it('should login, find user',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.params = {
                 "_id":"",
                 "requestType":"travel"
            }
 
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }

            var spy = sinon.spy();
            var FirstMiddleware = getRequest.middlewares[0];
            requestStub.doc = sinon.stub().returns(mock.then(null));
            db.FirstMiddleware = sinon.stub().callsArgWith(2, null, req);
            
             FirstMiddleware(req,spy)
             expect(db.FirstMiddleware).calledOnce;
             expect(spy).calledWith;
        })
    });