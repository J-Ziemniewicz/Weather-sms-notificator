import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as gpubsub from "@google-cloud/pubsub";
import * as express from "express";
import { body, validationResult } from 'express-validator';
import fetch from "node-fetch";
import { Twilio } from "twilio";


// Interfaces

interface WeatherSmsNotifier {
    phone_nb: string;
    city: string;
    lat: string;
    long: string;
}

interface CityInterface {
    name: string,
    local_names: any,
    lat: string,
    lon: string,
    country: string,
}


// Secrets

const config = new pulumi.Config();
config.requireSecret("twillioAccessToken");
config.requireSecret("twillioAccountSID");
config.requireSecret("fromPhoneNumber");
config.requireSecret("openweatherApiKey");
const TWILLIO_ACCESS_TOKEN = config.get("twillioAccessToken");
const TWILLIO_ACCOUNT_SID = config.get("twillioAccountSID");
const FROM_PHONE_NUMBER = config.get("fromPhoneNumber");
const OPENWEATHER_API_KEY = config.get("openweatherApiKey");


// Config, PubSub and Cloud Functions

const runtime = "nodejs14"; 

const messageTopic = new gcp.pubsub.Topic("weatherQueue");

const endpoint = new gcp.cloudfunctions.HttpCallbackFunction("weather-notifier",
{
    runtime: runtime,
    callbackFactory: () => {
        const app = express();
        app.use(express.json());
        app.post("/sms-notification",
        body('phone_nb').isMobilePhone(['pl-PL','es-ES']),
        body('phone_nb').not().isEmpty(),
        body('city').isString(),
        body('city').not().isEmpty(),
        async (req, res) => {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const body = req.body;

            const url = 'http://api.openweathermap.org/geo/1.0/direct?q='+body['city']+'&limit=1&appid='+OPENWEATHER_API_KEY;
            console.log(url);
            try{
                const response = await fetch(encodeURI(url));
                if(!response.ok){
                    return res.status(503).send({error: "OpenWeatherMap API doesn't respond, please try later"});
                }
                const jsonResp = await response.json();
                // console.log(jsonResp);
                const smsData : WeatherSmsNotifier = {
                    phone_nb: body['phone_nb'],
                    city: body['city'],
                    lat: jsonResp.lat,
                    long: jsonResp.lon}
                const pubSub: gpubsub.PubSub =  new gpubsub.PubSub();
                const topic = pubSub.topic(messageTopic.name.get());
                topic.publish(Buffer.from(JSON.stringify(smsData)));
    
                // TODO: Change for res.status(200).send();
                res.status(200).send("Sending SMS with temperature");
            }catch (err){
                console.log("Error: " + (err.stack || err.message));
            }
            
            
        });

        return app;
    }
})

messageTopic.onMessagePublished("processNewInput",{
    runtime: runtime, 

    callback: async (data) => {
    try {
        const smsData = <WeatherSmsNotifier>JSON.parse(Buffer.from(data.data, "base64").toString());
        console.log("Second function");
        const url = 'https://api.openweathermap.org/data/2.5/onecall?lat='+smsData.lat+'&lon='+smsData.long+'&exclude=hourly,daily,minutely,alerts&units=metric&appid='+OPENWEATHER_API_KEY;
        console.log(url);
        // ERROR
        const response = await fetch(url);
        const {respData, errors} = await response.json()

        if (response.ok) {
            console.log(response.status);
            console.log(response.body);
            console.log(respData.current.temp);
            // const client = new Twilio(TWILLIO_ACCOUNT_SID!, TWILLIO_ACCESS_TOKEN!);
            // client.messages.create({
            //     from:FROM_PHONE_NUMBER,
            //     to: smsData.phone_nb,
            //     body: "Current temperature in "+smsData.city+" is "+respData['current']['temp']+" Celsius.",
            // }).then((message) => console.log(message.sid));
        } else {
            console.log("Error: "+errors);
        }
        
    }
    catch (err){
        console.log("Error: " + (err.stack || err.message));
    }
    }
})

export const url = endpoint.httpsTriggerUrl;
