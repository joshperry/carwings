# Carwings JSON API Protocol

This protocol is a much simpler interface to the Carwings telematics information.
The original protocol was an XML SOAP API and was a bit of a pain to work with. Requests to this protocol began failing in February 2016 signaling its decomissioning.

Every operation is executed as a simple HTTP GET request and responds with a JSON document.
Parameters for the operation are encoded on the querystring, and for simple testing/scripting,
most of these operations will work by simply pasting the URI into your browser address bar.

The only operation that requires any kind of credentials is the *User Login* operation.
All other operations take a `custom_sessionid` that is negotiate during a two-phase authentication exchange.

All of the response documents have a `message` and `status` property to signal operation success/failure.
The `status` is a numerical value that is `200` on success, and `message` is a string that is "success" for successful operations.

## Long Polled Operations

Operations that dispatch a request to the vehicle follow a long polling pattern. There are a pair of operations for these types of requests.
The first is an operation to initiate the vehicle request. The result of these initiating operations is a `resultKey`.
The value of this key can be used as a parameter to the matching `*Result` operation to poll for the operation completion and result.

These result operations return a document that contains a `responseFlag` property.
When this property comes back `0`, the vehicle response is still pending. When it returns `1`, the vehicle request has been completed and the document contains the operation result properties.

## Security Compromise

In February of 2016 it was found that the API actually ignored the assumed requirement to privide the proper `DCMID` in requests after the initial login.
This resulted in the ability to send operations to any target vehicle having only its VIN.
An update was subsequently released in March of the same year that resulted in the auth scheme described in the current version of this document.

In the update, the base path of the URI for API calls was changed from `orchestration_1111` to `gworchest_0307C`.
This is most likely a versioning scheme similar to other JSON APIs that use something like `v1` to `v2` to allow concurrent usage of different API versions.
In the case of the Carwings API, the old version has been completely replaced by this new revision.

Finally, in the face of this compromise was that the requests were changed to use the HTTP `POST` method when previously they exclusively used `GET`.

## User Login

> ### Security Changes
>
> After the security flaw discovery there was a major change to the way API auth works. I think it is interesting to consider the changes that were made in the name of security.
>
> Even though the API interactions are already covered by transport security, Nissan felt the need to obfuscate the user password using a two-phase exchange that involves encrypting the user's password using a key provide in phase 1.
> 
> Since the encryption key is provided in the same communication channel, this provides no additional security against MITM, downgrade, or data compromise attacks.
> As such I think we can only consider this particular dance to be, at the best, obfuscation.
>
> We might also consider the inclusion of sensitive data in querystring as an unnecessary security risk. Though this is not uncommon, it is still against many recommendations as the URI is often logged by applications, servers, and proxys.
> 
> However, the fact that it now *seems* to use unique cryptographically secure session keys and has moved to using `POST` are both definite wins for the security of the Carwings API and all of our vehicles.

The authentication scheme used by the API happens in two phases.

In addition to the steps described here, the auth system also requires an additional parameter to be included in all requests.
This parameter is currently: `initial_app_strings=geORNtsZe5I4lRGjG9GZiA`.

### Phase 1

The first phase of the exchange is to call the `InitialApp` operation and retrieve the `baseprm` value from the response. This value is the encryption key used to derive credentials for phase 2.

url: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/InitialApp.php?RegionCode=NNA&lg=en-US&DCMID=&VIN=&custom_sessionid=&VIN=&tz=&UserId=<email>&Password=<base64_cipher_password>&initial_app_strings=geORNtsZe5I4lRGjG9GZiA`

response:
```
{
    "status":200,
    "message":"success",
    "baseprm":"uyI5Dj9g8VCOFDnBRUbr3g"
}
```

*NB*: This operation's response currently specifies an incorrect `Content-Type: text/html; charset=UTF8`.

### Phase 2

To call the phase 2 `UserLoginRequest` operation, the `baseprm` value is used to encrypt the user's password with Blowfish ECB encryption and PKCS5 padding.
The resultant ciphertext is then provided as the `Password` parameter of the login operation in a base64 encoded format.

The owner's profile is included in response and has a list of their vehicles, each of their VINs and DCMIDs which you'll need to make requests directed at a specific vehicle.

The response list (`vehicleInfo` note the lowercase "v") also includes the `custom_sessionid` which is used for authorization and must be included as a parameter in all subsequent requests.

url: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/UserLoginRequest.php?RegionCode=NNA&lg=en-US&DCMID=&VIN=&custom_sessionid=&tz=&UserId=<email>&Password=<base64_cipher_password>&initial_app_strings=geORNtsZe5I4lRGjG9GZiA`

response:
```
{
    "CustomerInfo": {
        "Country": "US",
        "Language": "en-US",
        "Nickname": "<userid>",
        "OwnerId": "<redacted>",
        "RegionCode": "NNA",
        "Timezone": "America/Denver",
        "UserId": "<userid>",
        "UserVehicleBoundDurationSec": "946771200",
        "VehicleImage": "/content/language/default/images/img/ph_car.jpg",
        "VehicleInfo": {
            "DCMID": "<dcmid>",
            "EncryptedNAVIID": "<redacted>",
            "LastDCMUseTime": "Dec 12, 2016 05:26 PM",
            "LastVehicleLoginTime": "",
            "MSN": "<redacted>",
            "NAVIID": "<redacted>",
            "SIMID": "<redacted>",
            "UserVehicleBoundTime": "2014-07-04T20:42:40Z",
            "VIN": "<vin>"
        }
    },
    "EncAuthToken": "<redacted>",
    "UserInfoRevisionNo": "2",
    "VehicleInfoList": {
        "VehicleInfo": [
            {
                "charger20066": "false",
                "nickname": "<carName>",
                "telematicsEnabled": "true",
                "vin": "<vin>"
            }
        ],
        "vehicleInfo": [
            {
                "charger20066": "false",
                "custom_sessionid": "<custom_sessionid>",
                "nickname": "<carName>",
                "telematicsEnabled": "true",
                "vin": "<vin>"
            }
        ]
    },
    "sessionId": "<redacted>",
    "status": 200,
    "vehicle": {
        "profile": {
            "dcmId": "<dcmid>",
            "encAuthToken": "<redacted>",
            "gdcPassword": "",
            "gdcUserId": "",
            "nickname": "<userid>",
            "status": "ACCEPTED",
            "statusDate": "Jul  4, 2014 12:00 AM",
            "vin": "<vin>"
        }
    }
}
```

## Get Cached Vehicle Status

This operation returns the status information that the service currently has cached for the requested vehicle, without dispatching a status update request.

url: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/BatteryStatusRecordsRequest.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>&VIN=<vin>&custom_sessionid=<custom_sessionid>&tz=America/Denver&TimeFrom=2014-07-04T20:42:40`

response:
```
{
    "BatteryStatusRecords": {
        "BatteryStatus": {
            "BatteryCapacity": "12",
            "BatteryChargingStatus": "NORMAL_CHARGING",
            "BatteryRemainingAmount": "9",
            "BatteryRemainingAmountWH": "",
            "BatteryRemainingAmountkWH": ""
        },
        "CruisingRangeAcOff": "101904.0",
        "CruisingRangeAcOn": "94184.0",
        "NotificationDateAndTime": "2016/01/08 21:26",
        "OperationDateAndTime": "Jan  8, 2016 02:26 PM",
        "OperationResult": "START",
        "PluginState": "CONNECTED",
        "TargetDate": "2016/01/08 21:26",
        "TimeRequiredToFull200_6kW": {
            "HourRequiredToFull": "2",
            "MinutesRequiredToFull": "30"
        }
    },
    "message": "success",
    "status": 200
}
```

## Initiate Status Update

The status data retreived for a vehicle is cached by the service.
Call this operation to initiate a refresh of the vehicle's status.

*long-poll request*
Use the Status Update Result operation to poll for results.

url: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/BatteryStatusCheckRequest.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>&VIN=<vin>&custom_sessionid=<custom_sessionid>&tz=America/Denver&UserId=<userid>`

response:
```
{
    "message": "success",
    "resultKey": "<key>", // Key can be used with update result check operation
    "status": 200,
    "userId": "<email>",
    "vin": "<vin>"
}
```

## Status Update Result

As long as the `responseFlag` property is `0` in the response, the update request is still awaiting a response from the vehicle.
When this value comes back `1`, then the document will also be filled with the vehicle status properties.

url: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/BatteryStatusCheckResultRequest.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>&VIN=<vin>&custom_sessionid=<custom_sessionid>&tz=America/Denver&resultKey=<key>&UserId=<userid>`

pending response:
```
{
    "message": "success",
    "responseFlag": "0",
    "status": 200
}
```

completed response:
```
{
    "batteryCapacity": "12",
    "batteryDegradation": "1",
    "chargeMode": "NOT_CHARGING",
    "chargeStatus": "CT",
    "charging": "NO",
    "cruisingRangeAcOff": "18104.0",
    "cruisingRangeAcOn": "17112.0",
    "currentChargeLevel": "0",
    "message": "success",
    "operationResult": "START",
    "pluginState": "NOT_CONNECTED",
    "responseFlag": "1",
    "status": 200,
    "timeRequiredToFull": {
        "hours": "",
        "minutes": ""
    },
    "timeRequiredToFull200": {
        "hours": "",
        "minutes": ""
    },
    "timeRequiredToFull200_6kW": {
        "hours": "",
        "minutes": ""
    },
    "timeStamp": "2016-02-07 21:58:21"
}
```

## HVAC Status

To get the status of the HVAC (Climate Control), use the following request.

url: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/RemoteACRecordsRequest.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>&VIN=<vin>&custom_sessionid=<custom_sessionid>&tz=America/Denver&TimeFrom=2014-07-04T20:42:40`

Response (when Climate Control is ON):
```
{
	"status": 200,
	"message": "success",
	"RemoteACRecords": {
		"OperationResult": "START",
		"OperationDateAndTime": "Feb 20, 2016 05:51 PM",
		"RemoteACOperation": "START",
		"ACStartStopDateAndTime": "Feb 20, 2016 05:52 PM",
		"CruisingRangeAcOn": "65520.0",
		"CruisingRangeAcOff": "90480.0",
		"ACStartStopURL": "",
		"PluginState": "CONNECTED",
		"ACDurationBatterySec": "900",
		"ACDurationPluggedSec": "7200"
	},
	"OperationDateAndTime": ""
}
```

Response (when Climate Control is OFF):
```
{
	"status": 200,
	"message": "success",
	"RemoteACRecords": {
		"OperationResult": "START",
		"OperationDateAndTime": "Feb 20, 2016 05:54 PM",
		"RemoteACOperation": "STOP",
		"ACStartStopDateAndTime": "Feb 20, 2016 05:55 PM",
		"CruisingRangeAcOn": "68880.0",
		"CruisingRangeAcOff": "95120.0",
		"ACStartStopURL": "",
		"PluginState": "CONNECTED",
		"ACDurationBatterySec": "900",
		"ACDurationPluggedSec": "7200"
	},
	"OperationDateAndTime": ""
}
```

Also available: get Climate Control timer settings: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/GetScheduledACRemoteRequest.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>VIN=<vin>&custom_sessionid=<custom_sessionid>&tz=America/Denver`

## HVAC Remote Activate

This operation sends a command to turn the HVAC system on in the car.

*long-poll operation*
Use the HVAC Remote Activate Result operation to poll for results.

url: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/ACRemoteRequest.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>&VIN=<vin>&custom_sessionid=<custom_sessionid>&tz=America/Denver`

response:
```
{
    "message": "success",
    "resultKey": "<key>",
    "status": 200,
    "userId": "<email>",
    "vin": "<vin>"
}
```

## HVAC Remote Activate Result

url: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/ACRemoteResult.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>&VIN=<vin>&custom_sessionid=<custom_sessionid>&tz=America/Denver&resultKey=<key>&UserId=<userid>`

pending response:
```
{
    "message": "success",
    "responseFlag": "0",
    "status": 200
}
```

completed response (with battery too low to activate):
```
{
    "hvacStatus": "0",
    "message": "success",
    "operationResult": "NG",
    "responseFlag": "1",
    "status": 200,
    "timeStamp": "2016-02-07 21:35:34"
}
```

## HVAC Remote Deactivate

The URLs used to turn the HVAC off:

- Request: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/ACRemoteOffRequest.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>VIN=<vin>&custom_sessionid=<custom_sessionid>&tz=America/Denver`
- Long-polling (result): `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/ACRemoteOffResult.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>&VIN=<vin>&custom_sessionid=<custom_sessionid>&tz=America/Denver&resultKey=<key>&UserId=<userid>`

## Start Charging

url: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/BatteryRemoteChargingRequest.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>VIN=<vin>&custom_sessionid=<custom_sessionid>&tz=America/Denver&ExecuteTime=2016-02-20`

Value for `ExecuteTime` seems to be today's date.

## RegionCode

For different regions you must use the proper `regionCode`. For example, in Canada the region code is `NCI`.

Example URI: `https://gdcportalgw.its-mo.com/gworchest_0307C/gdc/ACRemoteRequest.php?RegionCode=NCI&lg=en-US&DCMID=<dcmid>&VIN=<vin>&custom_sessionid=<custom_sessionid>&tz=America/Montreal`
