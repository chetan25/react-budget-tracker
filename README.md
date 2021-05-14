---
title: Simple Budget Tracking with some Voice control.
excerpt: This is a simple add that uses firebase, react and browser speechRecognition to build a simple prototype.
Tools: ['NEXT JS', 'React', 'Recoil', 'Typescript', 'Firebase']
---


# react-budget-tracker
<p>This is a basic implementation of React + Firebase + Google Speech API. Login and Registration is done through using firebase api and uses firebase credentials to connect.
The Credentials are stored in a environment file for security purposes and read in the firebase setting service. Home page has some basic integrating with Google speech api, to make a voice control section. The voice control can be started using the button in the header and there are few basic commands build in for now.
</p>

#### To run it locally, follow the following steps
<ul>
   <li>Clone repository locally.</li>
   <li>Run npm install to install all the dependencies.</li>
   <li>Create a .env file in the root directory and add you credentials for the firebase console here.</li>
      <ul>
         <li>API_KEY -- Your Firebase Key</li>
         <li>AUTH_DOMAIN -- Your Firebase Domain</li>
         <li>DATABASE_URL -- Your Firebase DB Url</li>
         <li>PROJECT_ID --  Your Firebase Project Id</li>
      </ul>
</ul>

#### Tech Stack
<ul>
  <li>Next JS - A wrapper over React Js, that provides easy setup and maintenance for files.</li>
  <li>React Js - Front end ui library.</li>
  <li>Firebase - Google Firebase to handle authentication and database.</li>
  <li>Google SpeechRecognition - This is out of the box browser feature for speech synthesis.</li>
</ul>
