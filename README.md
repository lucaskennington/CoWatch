Lucas Kennington - 2726022K - Level 4 Individual Project "EmoFeedback"



# Code Description and Structure
This code builds a prototype EmoFeedback, a Chrome extension which uses FER on a pre-existing external server to determine the emotions of users while they watch online videos and displays these emotions back in real-time, before storing the emotions in a database to be retrieved later.
The code is structured as follows:
- The ext folder contains code that manages the extension popup itself.
    - login.html and signup.html create the extension's login and signup menus
    - style.css, which styles the login and signup menus
    - validation.css, which scripts the login and signup menus
    - emofeedbackMenu.html creates the main menu of the popup
    - style2.css, which styles the main menu
    - validation.js, which scripts the main menu
    - two svg files, obtained from Google Fonts, which are used in the stylesheets

- The rest of the folder defines backend files
    - Content.js, the content script which interacts with the web page over which the extension operates
    - manifest.json, which allows the extension to be recognised and used by a Chrome browser
    - server.js, which receives calls from the extension to save data to the database

- The other files, including the models folder, were auto-generated when the Node.js Mongodb database driver was connected
- Where relevant, a bibliography of sources has been included at the bottom of code files.

## Build Instructions
- Open Chrome browser
- Go to 'extensions' -> 'manage extensions' and switch on 'developer mode'
- Click 'load unpacked' and import the file
- (The server should be already running on Render; if in the future this is not the case change any Render URLs in menu.js to a new server location)

##Requirements
- Chrome browser desktop
- Front-facing camera
- HTML-based video watching website

## Test Steps
- Navigate to a video hosting website
- Ensure a video is paused and at timecode 00:00
- Open EmoFeedback from the extension menu
- Login / signup as necessary
- Click play
- The video should play and the colours around the video should start to change to reflect your perceived emotions

# PRIVACY NOTICE
The nature of this project means that it will take pictures of you using your computer's camera. These pictures are sent to a server running on the University of Glasgow server space, where they are fed into the LibreFace model to determine what emotion they convey. Following this, they are deleted. No facial images are stored in permanent storage at any point in the process.
The database logs your username, the URL of the video you have watched and a list of calculated emotions. No other identifiable information is stored and you are free to use false usernames / display names when signing up.

# For users in user study
1. Use of this software does not incur any risks greater than normal working activity.
2. The software can be run on standard hardware (laptop with camera).
3. You have been directed to this repository only after explicitly consenting to take part in this study and share relevant research data, and after being given my contact details.
4. You have not been offered any incentive to participate in the study.
5. The information outlined in the privacy notice explains what data is collected and how. No other data is collected and the program performs no other purpose beyond that which you have been shown.
6. Participants have the right to withdraw and have their research data daleted at any time.
7. All data is stored in the database under the username you have created for the system, but the data analysed and published in the user study is completely anonymised.