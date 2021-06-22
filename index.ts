import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as gpubsub from "@google-cloud/pubsub";
import * as express from "express";
import * as bodyParser from "body-parser";
import { ConsentStoreIamPolicy } from "@pulumi/gcp/healthcare";
import { Console } from "console";


const runtime = "nodejs14"; 

const messageTopic = new gcp.pubsub.Topic("weatherQueue");

const endpoint = new gcp.cloudfunctions.HttpCallbackFunction("weather-notifier",{
    runtime: runtime,
    callbackFactory: () => {
        const app = express();
        app.use(bodyParser.json());
        app.post("/events", (req, res) => {
            console.log("first function");
            const body = req.body;
            console.log(body);
            const pubSub: gpubsub.PubSub =  new gpubsub.PubSub();
            const topic = pubSub.topic(messageTopic.name.get());
            topic.publish(Buffer.from(JSON.stringify(body)));

            res.status(200).end();
        });

        return app;
    }
})

messageTopic.onMessagePublished("processNewInput",{
    runtime: runtime, 
    callback: async (data) => {
    try {
        console.log("Second function");
        console.log(Buffer.from(data.data, "base64").toString());
    }
    catch (err){
        console.log("Error: " + (err.stack || err.message));
    }
    }
})

export const url = endpoint.httpsTriggerUrl;
