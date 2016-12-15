'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.api = undefined;

let oauthenticate = (() => {
  var _ref = _asyncToGenerator(function* (api, email, password) {
    let key = yield api('InitialApp', {
      initial_app_strings
    }).baseprm;

    let profile = yield api('UserLoginRequest', {
      RegionCode,
      UserId: email,
      Password: blowpassword(key, password),
      initial_app_strings
    });

    const custom_sessionid = getsessionid(profile);

    let session = (() => {
      var _ref2 = _asyncToGenerator(function* (action, data) {
        return yield api(action, Object.assign({ RegionCode }, data, { custom_sessionid }));
      });

      return function session(_x4, _x5) {
        return _ref2.apply(this, arguments);
      };
    })();

    return { profile, session };
  });

  return function oauthenticate(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

let api = exports.api = (() => {
  var _ref3 = _asyncToGenerator(function* (action, data) {
    let resp = yield _axios2.default.post(`/gworchest_160803A/gdc/${ action }.php`, _querystring2.default.stringify(data));

    if (resp.data.status === 200) {
      console.log(`api ${ action } 👍`);
      return resp.data;
    } else {
      console.log(`api ${ action } 👎\r\n`, resp);
      throw new Error(resp.data.ErrorMessage);
    }
  });

  return function api(_x6, _x7) {
    return _ref3.apply(this, arguments);
  };
})();

var _crypto = require('crypto');

var _fp = require('lodash/fp');

var _fp2 = _interopRequireDefault(_fp);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

_axios2.default.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
_axios2.default.defaults.baseURL = 'https://gdcportalgw.its-mo.com';

process.on('unhandledRejection', r => console.log(r));

const initial_app_strings = 'geORNtsZe5I4lRGjG9GZiA';
const RegionCode = 'NNA';
const lg = 'en-US';
const tz = 'America/Denver';

const tlog = t => _fp2.default.thru(d => console.log(t, d));

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

let blowpassword = _fp2.default.curry((key, plainpass) => {
  let cipher = (0, _crypto.createCipheriv)('bf-ecb', key, '');

  let encpass = cipher.update(plainpass, 'utf8', 'base64');
  encpass += cipher.final('base64');

  return encpass;
});

function getsessionid(profile) {
  return profile.VehicleInfoList.vehicleInfo[0].custom_sessionid;
}

function getvin(profile) {
  return profile.VehicleInfoList.vehicleInfo[0].vin;
}

const acompose = (fn, ...rest) => rest.length ? (() => {
  var _ref4 = _asyncToGenerator(function* (...args) {
    return fn((yield acompose(...rest)(...args)));
  });

  return function () {
    return _ref4.apply(this, arguments);
  };
})() : fn;

let challenge = acompose(r => r.baseprm, () => api('InitialApp', { initial_app_strings }));

// rawCredentials => apiCredentials
let genCredentials = (() => {
  var _ref5 = _asyncToGenerator(function* (UserId, password) {
    return _fp2.default.compose(function (Password) {
      return { UserId, Password };
    }, blowpassword((yield challenge())))(password);
  });

  return function genCredentials(_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
})();

// apiCredentials => profile
let userLogin = (() => {
  var _ref6 = _asyncToGenerator(function* (credentials) {
    return yield api('UserLoginRequest', Object.assign({
      RegionCode,
      initial_app_strings
    }, credentials));
  });

  return function userLogin(_x10) {
    return _ref6.apply(this, arguments);
  };
})();

// rawCredentials => profile
let authenticate = acompose(userLogin, genCredentials);

// rawCredentials => (apioperation => apiresults)
let loginSession = acompose(s => (() => {
  var _ref7 = _asyncToGenerator(function* (action, data) {
    return yield api(action, Object.assign({}, s, data));
  });

  return function (_x11, _x12) {
    return _ref7.apply(this, arguments);
  };
})(), p => ({ custom_sessionid: getsessionid(p), VIN: getvin(p) }), authenticate);

_asyncToGenerator(function* () {
  let session = yield loginSession('bobbytables@gmail.com', 'Tr0ub4dor&3');

  let data = yield session('BatteryStatusRecordsRequest', { RegionCode });

  //let carsession = data => session({ ...data, profile.VehicleInfoList.vehicleInfo[0].vin });

  /*
  data = await api('InitialApp', {
    initial_app_strings
  });
  const key = data.baseprm;
   data = await api('UserLoginRequest', {
    RegionCode,
    UserId: 'email@example.com',
    Password: blowpassword('Tr0ub4dor&3', key),
    initial_app_strings
  });
  */

  /*
  data = await api('BatteryStatusRecordsRequest', {
    RegionCode,
    VIN,
    custom_sessionid
  });
  */

  /*
  data = await api('BatteryStatusCheckRequest', {
    RegionCode,
    VIN,
    custom_sessionid
  });
  */

  /*
  data = await api('BatteryStatusCheckResultRequest', {
    RegionCode,
    VIN,
    resultKey: '5fF06yLeE2U5ENi06AAr5LqO285oMuWrzCIWb3aFVVkAItapUA',
    custom_sessionid
  });
  */

  /*
  data = await api('RemoteACRecordsRequest', {
    RegionCode,
    VIN,
    custom_sessionid,
    tz
  });
  */

  /*
  data = await api('GetScheduledACRemoteRequest', {
    RegionCode,
    VIN,
    custom_sessionid,
    tz // untested
  });
  */

  /*
  data = await api('ACRemoteRequest', {
    RegionCode,
    VIN,
    custom_sessionid
  });
  let resultKey = data.resultKey;
  console.log(`start dispatched ${resultKey}`);
   do {
    await sleep(5000);
    console.log(`polling for start`);
     data = await api('ACRemoteResult', {
      RegionCode,
      VIN,
      custom_sessionid,
      resultKey
    });
  } while(data.responseFlag !== '1')
  */

  /*
  data = await api('ACRemoteOffRequest', {
    RegionCode,
    VIN,
    custom_sessionid
  });
  let resultKey = data.resultKey;
  console.log(`stop dispatched ${resultKey}`);
   do {
    await sleep(5000);
    console.log(`polling for stop`);
     data = await api('ACRemoteOffResult', {
      RegionCode,
      VIN,
      custom_sessionid,
      resultKey
    });
  } while(data.responseFlag !== '1')
  */

  console.log(data);
})();