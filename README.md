# SMS weather notificatior
## Aplication description
Serverless application which uses Pulumi IaaC with Google Cloud Platform to host simple application responsible for sending SMS notification containing choosen city and current temperature in this city. This app uses Twilio for sending SMS and OpenWeather API for weather information.

## Infrastructure
Project is divided into Backend and Frontend directories. Backend directory is the main part of the project containing Pulumi project which deploy two GCP Functions and one PubSub. PubSub is responsible for storing information inserted by WeatherNotifierFn with phone number, city name, latitude and longitude of chosen city. On insert event second GCP Function SendSmsFn fetches temperature for provided coordinates and sends SMS with Twilio.

Frontend directory contains example usage of created API (Backend project). Example app is dockerized Angular project which is deployed with Pulumi to GCP Cloud Run.

## Pulumi configuration and running Backend project

1.  Restore NPM dependencies:

    ```
    $ npm install
    ```

2.  Create a new stack:

    ```
    $ pulumi stack init sms-notifier-fn
    ```

3.  Configure your GCP project, region and secrets:

    ```
    $ pulumi config set gcp:project <projectname> 
    $ pulumi config set gcp:region <region>
    $ pulumi config set --secret twillioAccessToken <token>
    $ pulumi config set --secret twillioAccountSID <SID>
    $ pulumi config set --secret fromPhoneNumber <phone_nb>
    $ pulumi config set --secret openweatherApiKey <api_key>
    ```

4.  Run `pulumi up` to preview and deploy changes:

    ``` 
    $ pulumi up
    Previewing changes:
    ...

    Performing changes:
    ...
    info: 6 changes performed:
        + 6 resources created
    Update duration: 39.65130324s
    ```
## Pulumi configuration and running Frontend project

1.  Restore NPM dependencies:

    ```
    $ npm install
    ```

2.  Create a new stack:

    ```
    $ pulumi stack init sms-notifier-app
    ```

3.  Configure your GCP project, region and secrets:

    ```
    $ pulumi config set gcp:project <projectname> 
    $ pulumi config set gcp:region <region>
    $ pulumi config set --secret weatherApi <api_key>
    ```

4.  Run `pulumi up` to preview and deploy changes:

    ``` 
    $ pulumi up
    Previewing changes:
    ...

    Performing changes:
    ...
    info: 6 changes performed:
        + 6 resources created
    Update duration: 39.65130324s
    ```

## Example call to API

POST request with example json presented below:
```
{"phone_nb":"+48*********", "city":"Poznań"}
```
to below url:
```
https:/{URL_TO_GC_FUNCTION}/sms-notification
```
