const error_message = document.getElementById('error-message');
var currentUser = "";
var currentTime = 0;
var imageCapture;

// obtain current user from Chrome storage [1]
chrome.storage.local.get(["loggedInUser"])
.then((result) => {
    currentUser = result.loggedInUser;
    console.log("Logged in: " + currentUser);
})
.catch((error) => {
    console.log(error);
});

// log user out, remove from storage [1]
const logOutButton = document.querySelector('.logout');
  logOutButton.addEventListener('click', async () => {
    chrome.storage.local.set({loggedInUser: null})
        .then(() => {
            console.log("Value is set");
            window.location.replace("login.html");
        });
  })


// get video details, build average emotions list
async function videoStats(tab, videoDuration) {
  videoUrl = tab.url;

  // message passing [2]
  videoTitle = await chrome.tabs.sendMessage(tab.id, { action: 'videoDetails' });
 
  // save to database with form data [3]
  const videoData = new FormData;
  videoData.append("url", videoUrl);
  videoData.append("title", videoTitle);
  videoData.append("runtimeSec", videoDuration);

  response = await fetch('https://api-cowatch.onrender.com/newVideo', {
    method: "POST",
    headers: {
      "Content-Type":"application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(videoData).toString()
  })
  const result = await response.json();

  // query database with form data [3]
  const checkData = new FormData;
  checkData.append("videoTitle", videoUrl);
  response = await fetch('https://api-cowatch.onrender.com/existingViews', {
    method: "POST",
    headers: {
      "Content-Type":"application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(checkData).toString()
  })
  // determine if prior emotion logs exist
  const resultBody = await response.json();
  if (resultBody == "none"){
    return null;
  } else {
    return resultBody;
  }
  
}

// calculate most common emotions per second for video
function calcMode(emotionList){
  // cycle through list
  const freq = {};
  emotionList.forEach(emotion => {
    freq[emotion] = (freq[emotion] || 0) + 1;
  });

  let modes = [];
  let highest = 0;

  // calculate mode - code from [4]
  for(const emotion in freq){
    const thisFreq = freq[emotion];
    if (thisFreq > highest){
      highest = thisFreq;
      modes = [emotion];
    }
    else if (thisFreq === highest){
      modes.push(emotion);
    }
  }
  if (modes.length > 1){
    return modes[Math.floor(Math.random() * modes.length)];
  }
  else {
    return modes[0];
  }
}


async function mainLoop(timeStamp, duration, emotions, tab, avgEmotions, avgEmotionIndex){
    
    // 1. Set Defaults
    var calculatedEmotion;
    var prevEmotion = 'Neutral'; // if no previous emotion available return Neutral
    if (emotions.length > 0) {
        prevEmotion = emotions[emotions.length - 1]["emotion"]; // replace Neutral with previous emotion if available
    }

    avgEmotion = null;
    if (avgEmotions == null){ // check if average emotions are requested and available
      document.getElementById("rad2").checked = false;
      document.getElementById("rad1").checked = true;
      document.getElementById("noDataError").innerHTML = "No prior views for this video";
    } else {
      avgEmotion = avgEmotions[avgEmotionIndex];
    }

    const ownEmotions = document.getElementById("rad1").checked;

    // 2. Take Picture [7]
    imageCapture.takePhoto()
    .then(async blob => {
        currentFrame = blob;

        // 3. Save Picture [3]
        const formData = new FormData;
        formData.append("file", blob, "emotionImage.png")

        // 4. get emotion [5]
        try{
            const response = await fetch("http://dcs.gla.ac.uk/lobos/lucas", {
            method: "POST",
            body: formData
            });
            if (!response.ok){
                throw new Error(`Response status: ${response.status}`);
            }

            // append to list
            result = await response.json();
            calculatedEmotion = result["emotion"];
            emotions.push({timestamp: timeStamp, emotion: calculatedEmotion});
            // display on overlay
            displayEmotion(tab, calculatedEmotion, avgEmotion, ownEmotions);

        } catch (error) {
          // no emotion returned - default to previous emotion
            console.error(error.message);
            calculatedEmotion = prevEmotion;
            emotions.push({timestamp: timeStamp, emotion: calculatedEmotion});
            displayEmotion(tab, calculatedEmotion, avgEmotion, ownEmotions);
        }

    })
    // no emotion returned - default to previous emotion
    .catch(error => function () {
      calculatedEmotion = prevEmotion
      emotions.push({timestamp: timeStamp, emotion: calculatedEmotion});
      displayEmotion(tab, calculatedEmotion, avgEmotion, ownEmotions);
    });

    // 5. recursion
    timeStamp += 1 // increase timestamp
    if (timeStamp > duration) { // check if video has ended
        console.log("Done");
        // save to database
        setTimeout(async function () {
          // FormData [3]
          const viewData = new FormData;
          viewData.append("user", currentUser);
          viewData.append("video", tab.url);
          viewData.append("emotions", JSON.stringify(emotions)); // append emotions in JSON-compatible format [6]
          // fetch [5]
          response = await fetch('https://api-cowatch.onrender.com/logEmotion', {
          method: "POST",
          headers: {
            "Content-Type":"application/x-www-form-urlencoded"
          },
          body: new URLSearchParams(viewData).toString()
          })
          confirmation = await response.json();
          console.log(confirmation);
        }, 1000)
    }
    else {
        setTimeout(function () {
          // repeat loop
          let newEmotions = mainLoop(timeStamp, duration, emotions, tab, avgEmotions, avgEmotionIndex + 1);
          return newEmotions;
        }, 1000) // wait one second
        
    }
}

// display emotion to screen
async function displayEmotion(tab, calculatedEmotion, avgEmotion, ownEmotions){

  if (ownEmotions){
    console.log(calculatedEmotion);
    // message passing [2]
    emotionDisplayed = await chrome.tabs.sendMessage(tab.id, { 
      action: 'displayEmotion', 
      emotion: calculatedEmotion
    });
  }
  else{
    console.log(avgEmotion);
    emotionDisplayed = await chrome.tabs.sendMessage(tab.id, { 
    action: 'displayEmotion', 
    emotion: avgEmotion
  });
  }
  
}



function main() {
  var currentFrame;
  var playing = false;
  var loop;
  var emotions = [];
  var started = false;

  // set up camera stream [7]
  navigator.mediaDevices.getUserMedia({video: true})
    .then(mediaStream => {
      const mediaStreamTrack = mediaStream.getVideoTracks()[0];
      imageCapture = new ImageCapture(mediaStreamTrack);
      console.log(imageCapture);
    })
    .catch(error => console.error('getUserMedia() error:', error));

  // action when play clicked
  const playButton = document.querySelector('.playPause');
  playButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true });

    document.getElementById("rad1").disabled = true; // prevent changing of emotion source during video
    document.getElementById("rad2").disabled = true;

    // create overlay [2]
    overlay = await chrome.tabs.sendMessage(tab.id, { action: 'createOverlay'});

    // get video elements and average emotions [2]
    duration = await chrome.tabs.sendMessage(tab.id, { action: 'getDuration' });
    avgEmotions = await videoStats(tab, duration);

    // start loop and play video [2]
    videoStart = await chrome.tabs.sendMessage(tab.id, { action: 'playPause' });
    loggedEmotions = mainLoop(0, duration, emotions, tab, avgEmotions, 0);

    
  })
}
main();

// ---------------------------------------------------------------------------------------------------
// **CODE BIBLIOGRAPHY**

// [1] Chrome API documentation - "chrome.storage" - last updated 2025-12-19
// Available at https://developer.chrome.com/docs/extensions/mv2/reference/storage

// [2] Chrome API documentation - "Message Passing" - last updated 2025-12-03
// Available at https://developer.chrome.com/docs/extensions/develop/concepts/messaging

// [3] Mozilla MDN - "Using FormData Objects" - last updated 2025-06-24
// Available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects

// [4] GeeksForGeeks - "Find Mode of an Array using JavaScript" - last updated 2025-07-23
// Available at https://www.geeksforgeeks.org/javascript/find-mode-of-an-array-using-javascript/

// [5] Mozilla MDN - "Using the Fetch API" - last updated 2025-08-20
// Available at https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

// [6] Mozilla MDN - "JSON.stringify()" - last updated 2025-07-10
// Available at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify

// [7] Casas-Sanchez, M., Dutton, S., Beaufort, F. - "Take photos and control camera settings" - Chrome API documentation blog - last updated 2016-12-05
// Available at https://developer.chrome.com/blog/imagecapture/