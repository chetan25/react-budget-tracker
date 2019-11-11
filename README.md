# react-budget-tracker
<p>This is a basic implementation of React + Firebase + Google Speech Api. Login and Registration is done through using firebase apis and uses firebase credentilas to connect.
The Credentilas are stored in a environment file for security puposes and read in the firebase setting service. Home page has some basic integratin with Google speech apis, to make a voice control section. The voice control can be started using the button in the header and there are few basic commands build in for now.
</p>

<h4>To run it locally, follow the following steps</h4>
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
   <li>Then you can run npm run local, this will run a local nodemon server and refresh automatically on changes.</li>
</ul>

<h4>Tech Stack</h4>
<ul>
  <li>Next JS - A wrapper over React Js, that provides easy setup and maintanence for files.</li>
  <li>React Js - Front end ui library.</li>
  <li>Firebase - Google Firebase to handle authentication and database.</li>
  <li>Google SpeechRecognition - This is out of the box browser feature for speech synthesis.</li>
</ul>
