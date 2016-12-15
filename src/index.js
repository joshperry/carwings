import { createCipheriv } from 'crypto';
import _ from 'lodash/fp';
import axios from 'axios';
import querystring from 'querystring';

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.baseURL = 'https://gdcportalgw.its-mo.com';

process.on('unhandledRejection', r => console.log(r));

const initial_app_strings = 'geORNtsZe5I4lRGjG9GZiA';
const RegionCode = 'NNA';
const lg = 'en-US';
const tz = 'America/Denver';

const tlog = t => _.thru(d => console.log(t, d));

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

async function oauthenticate(api, email, password) {
  let key = await api('InitialApp', {
    initial_app_strings
  }).baseprm;

  let profile = await api('UserLoginRequest', {
    RegionCode,
    UserId: email,
    Password: blowpassword(key, password),
    initial_app_strings
  });

  const custom_sessionid = getsessionid(profile);

  let session = async (action, data) => {
    return await api(action, { RegionCode, ...data, custom_sessionid });
  };

  return { profile, session };
}

export async function api(action, data) {
  let resp = await axios.post(`/gworchest_160803A/gdc/${action}.php`, querystring.stringify(data));

  if(resp.data.status === 200) {
    console.log(`api ${action} 👍`);
    return resp.data;
  } else {
    console.log(`api ${action} 👎\r\n`, resp);
    throw new Error(resp.data.ErrorMessage);
  }
}

let blowpassword = _.curry((key, plainpass) => {
  let cipher = createCipheriv('bf-ecb', key, '');

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

const acompose  = (fn, ...rest) =>
  rest.length
    ? async (...args) =>
        fn(await acompose(...rest)(...args))
    : fn;

let challenge = acompose(
  r => r.baseprm,
  () => api('InitialApp', { initial_app_strings }),
);

// rawCredentials => apiCredentials
let genCredentials = async (UserId, password) => {
  return _.compose(
    Password => ({ UserId, Password }),
    blowpassword(await challenge()),
  )(password);
};

// apiCredentials => profile
let userLogin = async (credentials) => {
  return await api('UserLoginRequest', {
    RegionCode,
    initial_app_strings,
    ...credentials
  });
};

// rawCredentials => profile
let authenticate = acompose(userLogin, genCredentials);

// rawCredentials => (apioperation => apiresults)
let loginSession = acompose(
  s => async (action, data) => await api(action, { ...s, ...data }),
  p => ({ custom_sessionid: getsessionid(p), VIN: getvin(p) }),
  authenticate,
);

(async function() {
  let session = await loginSession('bobbytables@gmail.com', 'Tr0ub4dor&3');

  let data = await session('BatteryStatusRecordsRequest', { RegionCode });

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
}());
