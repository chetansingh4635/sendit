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
 var MockExpressResponse = require('mock-express-response');
 var Admin = require('../../modules/admin/models/AdminModel')
 chai.use(chaiAsPromised);
//require('sinon-as-promised')
var sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);


 describe('/admin/login', function () {
    var userModule = {},
        adminStub={},
        authStub ={},
        utilityStub={},
        indexStub = {};
        var db = mongooseMock;



    var adminLogin = proxyquire('../../routes/admin/loginUser.js',{
        	"../../../modules/admin": adminStub,
            "../../../modules/auth" : authStub,
        	"../../../lib/utility" : utilityStub
     });
    
        var promise;
        beforeEach(function() {
            promise = sinon.stub().returnsPromise();
          });   
   
    
        it('should login, admin',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.body = {
                 password: "testPassword",
                 email: "test_email@test.com",
                 remberMe: true
             }

 
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }

            var spy = sinon.spy();
            var FirstMiddleware = adminLogin.middlewares[0];
            adminStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.FirstMiddleware = sinon.stub().callsArgWith(2, null, req);
            
             FirstMiddleware(req,spy)
             expect(db.FirstMiddleware).calledOnce;
             expect(spy).calledWith;
        });

        it('should match, password',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.body = {
                 password: "testPassword",
                 email: "test_email@test.com",
                 remberMe: true
             }

             var res = new MockExpressResponse();
             res.locals = {
                 user:{
                        'password':'testPassword'
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
            var SecondMiddleware = adminLogin.middlewares[1];
            adminStub.findOne = sinon.stub().returns(mock.then({id:"fds"}));
            db.SecondMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             SecondMiddleware(req,res,spy)
             expect(db.SecondMiddleware).calledOnce;
             expect(spy).calledWith;
        });



           it('should not match, password',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.body = {
                 password: "testPassword",
                 email: "test_email@test.com",
                 remberMe: true
             }

             var res = new MockExpressResponse();
             res.locals = {
                 user:{
                        'password':'invalidPassword'
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
            var SecondMiddleware = adminLogin.middlewares[1];
            adminStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.SecondMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             SecondMiddleware(req,res,spy)
             expect(db.SecondMiddleware).calledOnce;
             expect(spy).calledWith;
        });


        it('should create auth, send responce',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.body = {
                 password: "testPassword",
                 email: "test_email@test.com",
                 remberMe: true
             }

             var res = new MockExpressResponse();
             res.locals = {
                 user:new Admin({
                        'password':'testPassword'
                    })
             }
 
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }

            var spy = sinon.spy();
            var ThirdMiddleware = adminLogin.middlewares[2];
            adminStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.ThirdMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             ThirdMiddleware(req,res,spy)
             expect(db.ThirdMiddleware).calledOnce;
             expect(spy).calledWith;
        });
    });