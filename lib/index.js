'use strict';

let api = (() => {
  var _ref = _asyncToGenerator(function* (action, data) {
    let resp = yield _axios2.default.post(`/gworchest_160803A/gdc/${ action }.php`, _querystring2.default.stringify(data));

    if (resp.data.status === 200) {
      return resp.data;
    } else {
      throw new Error(resp.data.ErrorMessage);
    }
  });

  return function api(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let authenticate = (() => {
  var _ref2 = _asyncToGenerator(function* (email, password) {
    data = yield api('InitialApp', {
      initial_app_strings
    });
    const key = data.baseprm;

    data = yield api('UserLoginRequest', {
      RegionCode,
      UserId: email,
      Password: blowpassword(password, key),
      initial_app_strings
    });

    return {
      custom_sessionid: data.VehicleInfoList.vehicleInfo[0].custom_sessionid,
      VIN: data.VehicleInfoList.vehicleInfo[0].vin
    };
  });

  return function authenticate(_x3, _x4) {
    return _ref2.apply(this, arguments);
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

const initial_app_strings = 'geORNtsZe5I4lRGjG9GZiA';
const RegionCode = 'NNA';
const lg = 'en-US';
const tz = 'America/Denver';

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

function blowpassword(plainpass, key) {
  let cipher = (0, _crypto.createCipheriv)('bf-ecb', key, '');

  let encpass = cipher.update(plainpass, 'utf8', 'base64');
  encpass += cipher.final('base64');

  return encpass;
}

_asyncToGenerator(function* () {
  let data;

  //TMP
  const custom_sessionid = 'blah';
  const VIN = 'blah';

  /*
  data = await api('InitialApp', {
    initial_app_strings
  });
  const key = data.baseprm;
   data = await api('UserLoginRequest', {
    RegionCode,
    UserId: 'blah',
    Password: blowpassword('blah', key),
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