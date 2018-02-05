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


 describe('/admin/payments', function () {
    var userModule = {},
        adminStub={},
        authStub ={},
        requestStub={},
        utilityStub={},
        indexStub = {};
        var db = mongooseMock;
      //   getMongoDB: function() {
      //   return db;
      // }



    var allPayments = proxyquire('../../routes/admin/allPayments.js',{
        	"../../../modules/admin": adminStub,
            "../../../modules/request":requestStub,
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
                 
             }

             var res = {
                locals:{}    
            };
 
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }

            var spy = sinon.spy();
            var FirstMiddleware = allPayments.middlewares[0];
            //adminStub.findUser = sinon.stub().returns(mock.then({id:"fds"}));
            db.FirstMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             FirstMiddleware(req,res,spy)
             expect(db.FirstMiddleware).calledOnce;
             expect(spy).calledWith;
        });

        it('should login, admin',function(){
            
            promise.resolves('resolve value')
            
            var req={};
             req.body = {
                 limit: 5
             }
             var res = {
                locals:{}    
            };
 
            var mock =  {
                then: function(){
                     return new Promise(function(resolve){
                    resolve({id :"ok"})
                })
                }
            }
            var response = {};

            var spy = sinon.spy();
            var SecondMiddleware = allPayments.middlewares[1];
            requestStub.aggregateResult = sinon.stub().returns(mock.then(response));
            db.SecondMiddleware = sinon.stub().callsArgWith(3, null, req, res);
            
             SecondMiddleware(req,res,spy)
             expect(db.SecondMiddleware).calledOnce;
             expect(spy).calledWith;
        });
    });