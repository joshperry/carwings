'use strict';

import { createCipheriv } from 'crypto';
import _ from 'lodash/fp';
import axios from 'axios';
import querystring from 'querystring';

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.baseURL = 'https://gdcportalgw.its-mo.com';

const initial_app_strings = 'geORNtsZe5I4lRGjG9GZiA';
const RegionCode = 'NNA';
const lg = 'en-US';
const tz = 'America/Denver';

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

function blowpassword(plainpass, key) {
  let cipher = createCipheriv('bf-ecb', key, '');

  let encpass = cipher.update(plainpass, 'utf8', 'base64');
  encpass += cipher.final('base64');

  return encpass;
}

async function api(action, data) {
  let resp = await axios.post(`/gworchest_160803A/gdc/${action}.php`, querystring.stringify(data));

  if(resp.data.status === 200) {
    return resp.data;
  } else {
    throw new Error(resp.data.ErrorMessage);
  }
}

async function authenticate(email, password) {
  data = await api('InitialApp', {
    initial_app_strings
  });
  const key = data.baseprm;

  data = await api('UserLoginRequest', {
    RegionCode,
    UserId: email,
    Password: blowpassword(password, key),
    initial_app_strings
  });

  return {
    custom_sessionid: data.VehicleInfoList.vehicleInfo[0].custom_sessionid,
    VIN: data.VehicleInfoList.vehicleInfo[0].vin
  };
}

(async function() {
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
}());
