import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as gpubsub from "@google-cloud/pubsub";
import * as express from "express";
import { body, validationResult } from 'express-validator';
import { ConsentStoreIamPolicy } from "@pulumi/gcp/healthcare";
import { Console } from "console";

// TODO: Add credential from pulumi

interface WeatherSmsNotifier {
    phone_nb: string;
    latLong: string;
}


const runtime = "nodejs14"; 

const messageTopic = new gcp.pubsub.Topic("weatherQueue");

const endpoint = new gcp.cloudfunctions.HttpCallbackFunction("weather-notifier",
{
    runtime: runtime,
    callbackFactory: () => {
        const app = express();
        app.use(express.json());
        app.post("/sms-notification", 
        body('phone_nb').isMobilePhone(['pl-PL']),
        body('latLong').isLatLong(),
        (req, res) => {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            console.log("first function");
            const body = req.body;
            console.log(body);
            const pubSub: gpubsub.PubSub =  new gpubsub.PubSub();
            const topic = pubSub.topic(messageTopic.name.get());
            topic.publish(Buffer.from(JSON.stringify(body)));

            // TODO: Change for res.status(200).send();
            res.status(200).end();
        });

        return app;
    }
})

messageTopic.onMessagePublished("processNewInput",{
    runtime: runtime, 
    callback: async (data) => {
    try {
        const request = <WeatherSmsNotifier>JSON.parse(Buffer.from(data.data, "base64").toString());
        console.log("Second function");
        console.log(request.phone_nb);
        console.log(request.latLong);
    }
    catch (err){
        console.log("Error: " + (err.stack || err.message));
    }
    }
})

export const url = endpoint.httpsTriggerUrl;
