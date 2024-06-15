**Agora RTC Application with Muted Audio Capture and Download**
This repository contains a web-based real-time communication (RTC) application built using Agora SDK, allowing users to join a video call and mute/unmute their audio. Additionally, the application captures muted audio streams and provides functionality to download them.

**Features**
Join Video Call: Users can join a video call by entering a username.
Mute/Unmute Audio: Toggle to mute/unmute your microphone during the call.
Capture Muted Audio: Automatically captures muted audio streams locally.
Download Muted Audio: Provides a download link to download captured muted audio as a WAV file.
Technologies Used
Agora SDK: Integrates real-time audio and video communication capabilities.
JavaScript: Language used for frontend development.
HTML/CSS: Structure and styling of the web application.
Blob API: Used to handle binary data, including captured audio.
Usage
**Clone the repository:**
_**https://github.com/arvind52-boop/videocall_**
bash
Copy code
git clone https://github.com/arvind52-boop/videocall
cd repository-directory
Open index.html in a web browser.

Enter a username and click "Join" to start the application.

Use the microphone button to mute/unmute your audio.

When muted, the application starts capturing audio data. Click the "Download Muted Audio" button/link to download the captured muted audio stream as a WAV file.

File Structure
index.html: Main HTML file containing the UI elements and script integration.
style.css: Stylesheet for defining the visual appearance of the application.
script.js: JavaScript file containing application logic, including Agora SDK integration, mute/unmute functionality, and audio capture/download.



**REQUIREMENT**
API REQUEST 
WEBSITE :---agora.io----
SIGNIN--->CONSOLE--->CREAATE A NEW PROJECT --->APP-ID ---->
NOW VISIT THIS WEBSITE 
https://console.agora.io/v2/project-management
GENERATE TEMP TOKEN
ADD APPID --IN APPID
ADD TOKENID ---IN TOKEN ID
