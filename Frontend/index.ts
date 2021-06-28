import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

const location = gcp.config.region || "europe-central2";

const config = new pulumi.Config();
config.requireSecret("weatherApi");
const WEATHER_API = config.get("weatherApi");

const enableCloudRun = new gcp.projects.Service("EnableCloudRun", {
    service: "run.googleapis.com",
});


const myImage = new docker.Image("weather-app-image", {
    imageName: pulumi.interpolate`gcr.io/${gcp.config.project}/weather-app:v1.0.0`,
    build: {
        env: {'WEATHER_API':WEATHER_API!},
        context: "./weather-app-frontend/",
    },
});

const frontendService = new gcp.cloudrun.Service("weather-app", {
    location,
    template: {
        spec: {
            containers: [{
                image: myImage.imageName,
                ports: [{
                    containerPort: 8080,
                }],
                resources: {
                    limits: {
                        memory: "1Gi",
                    },
                },
            }],
            containerConcurrency: 5,
        },
    },
}, { dependsOn: enableCloudRun });

const iamWeatherApp = new gcp.cloudrun.IamMember("weather-app-open-all", {
    service: frontendService.name,
    location,
    role: "roles/run.invoker",
    member: "allUsers",
});

export const frontendUrl = frontendService.statuses[0].url;
