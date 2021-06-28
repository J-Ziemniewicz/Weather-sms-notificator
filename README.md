# SMS weather notificatior
## Aplication description
Serverless application which uses Pulumi IaaC with Google Cloud Platform to host simple application responsible for sending SMS notification containing choosen city and current temperature in this city. This app uses Twilio for sending SMS and OpenWeather API for weather information.

## Infrastructure
Project is divided into Backend and Frontend directories. Backend directory is the main part of the project containing Pulumi project which deploy two GCP Functions and one PubSub. PubSub is responsible for storing information inserted by WeatherNotifierFn with phone number, city name, latitude and longitude of chosen city. On insert event second GCP Function SendSmsFn fetches temperature for provided coordinates and sends SMS with Twilio.

Frontend directory contains example usage of created API (Backend project). Example app is dockerized Angular project which is deployed with Pulumi to GCP Cloud Run.

## Example call to API

POST request with example json presented below:
```
{"phone_nb":"+48*********", "city":"Poznań"}
```
to below url:
```
https:/{URL_TO_GC_FUNCTION}/sms-notification
```