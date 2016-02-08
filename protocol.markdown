# Carwings JSON API Protocol

This protocol is a much simpler interface to the Carwings telematics information.
The original protocol was an XML SOAP API and was a bit of a pain to work with.

Every operation is executed as a simple HTTP GET request and responds with JSON documents.
Parameters for the operation are encoded on the querystring. For simple testing/scripting,
most of these operations will work by simply pasting the URI into your browser address bar.

The only operation that requires any kind of credentials is the User Login operation.
All other operations take the `DCMID` and the `VIN` of your vehicle as parameters for authorizing the requested operation.

All of the responses documents have a `message` and `status` property to signal operation success/failure messages and status.
The `status` seems to mirror the HTTP reponse code and `message` seems to be "success" for successful operations.

## Long Polled Operations

Operations that dispatch a request to the vehicle follow a long polling pattern. For these long poll operations, there is an operation to initiate the vehicle request and returns a `resultKey` property.
The value of this key can be used as a parameter to a matching `*Result` operation to poll for the operation results.

These result operations return a document that contains a `responseFlag` property.
When this property comes back `0`, the vehicle response is still pending. When it returns `1`, the vehicle request has been completed and the document contains the response properties.

## User Login

This operation will allow you to authenticate, view the owner's profile information.
This profile includes a list of the owner's vehicles and each of their VIN and DCMID values--which you'll need to make requests directed at a specific vehicle.

url: `https://gdcportalgw.its-mo.com/orchestration_1111/gdc/UserLoginRequest.php?RegionCode=NNA&lg=en-US&DCMID=&VIN=&tz=&UserId=<email>&Password=<password>`

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
            "LastDCMUseTime": "Feb  7, 2016 02:58 PM",
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
                "nickname": "<carName>",
                "telematicsEnabled": "true",
                "vin": "<vin>"
            }
        ]
    },
    "message": "success",
    "sessionId": "<redacted>",
    "status": 200,
    "vehicle": {
        "profile": {
            "dcmId": "<dcmid>",
            "encAuthToken": "<redacted>",
            "gdcPassword": "<redacted>",
            "gdcUserId": "<userid>",
            "nickname": "userid",
            "status": "ACCEPTED",
            "statusDate": "Jul  3, 2014 06:00 PM",
            "vin": "<vin>"
        }
    }
}
```

## Get Cached Vehicle Status

## Initiate Status Update

The status data retreived for a vehicle is cached by the service.
Call this operation to initiate a refresh of the vehicle's status.

*long-poll request*
Use the Status Update Result operation to poll for results.

url: `https://gdcportalgw.its-mo.com/orchestration_1111/gdc/BatteryStatusCheckRequest.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>&VIN=<vin>&tz=America/Denver&UserId=<userid>`

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

url: `https://gdcportalgw.its-mo.com/orchestration_1111/gdc/BatteryStatusCheckResultRequest.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>&VIN=<vin>&tz=America/Denver&resultKey=<key>&UserId=<userid>`

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

## HVAC Remote Activate

This operation sends a command to turn the HVAC system on in the car.

*long-poll operation*
Use the HVAC Remote Activate Result operation to poll for results.

url: `https://gdcportalgw.its-mo.com/orchestration_1111/gdc/ACRemoteRequest.php?RegionCode=NNA&lg=en-US&DCMID=<dcmid>&VIN=<vin>&tz=America/Denver`

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
