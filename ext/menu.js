const error_message = document.getElementById('error-message');
var currentUser = "";
var currentTime = 0;
var imageCapture;

chrome.storage.local.get(["loggedInUser"])
.then((result) => {
    currentUser = result.loggedInUser;
    error_message.innerText = currentUser;
    console.log("Value is " + currentUser);
})
.catch((error) => {
    console.log(error);
});

const logOutButton = document.querySelector('.logout');
  logOutButton.addEventListener('click', async () => {
    chrome.storage.local.set({loggedInUser: null})
        .then(() => {
            console.log("Value is set");
            window.location.replace("login.html");
        });
  })



async function videoStats(tab, videoDuration) {
  videoUrl = tab.url;
  videoTitle = await chrome.tabs.sendMessage(tab.id, { action: 'videoDetails' });
 

  const videoData = new FormData;
  videoData.append("url", videoUrl);
  videoData.append("title", videoTitle);
  videoData.append("runtimeSec", videoDuration);

  response = await fetch('http://localhost:3000/newVideo', {
    method: "POST",
    headers: {
      "Content-Type":"application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(videoData).toString()
  })
  const result = await response.json();
    if (result.success){
      console.log(result.title)
    } else {
      console.log(result.title)
    }
}



async function mainLoop(timeStamp, duration, emotions, tab){
    // 1. Set Defaults
    var calculatedEmotion;
    var prevEmotion = 'Neutral';
    if (emotions.length > 0) {
        prevEmotion = emotions[emotions.length - 1]["emotion"];
    }

    // 2. Take Picture
    imageCapture.takePhoto()
    .then(async blob => {
        currentFrame = blob;

        // 3. Save Picture
        const formData = new FormData;
        formData.append("file", blob, "emotionImage.png")

        // 4. get emotion
        try{
            const response = await fetch("http://dcs.gla.ac.uk/lobos/lucas", {
            method: "POST",
            body: formData
            });
            if (!response.ok){
                throw new Error(`Response status: ${response.status}`);
            }
            result = await response.json();
            calculatedEmotion = result["emotion"];
            emotions.push({timestamp: timeStamp, emotion: calculatedEmotion});
            console.log(calculatedEmotion);

        } catch (error) {
            console.error(error.message);
            calculatedEmotion = prevEmotion;
            emotions.push({timestamp: timeStamp, emotion: calculatedEmotion});
        }

        console.log(calculatedEmotion);


    })
    .catch(error => function () {
      calculatedEmotion = prevEmotion
      emotions.push({timestamp: timeStamp, emotion: calculatedEmotion});
    });

    console.log(calculatedEmotion);

    // 5. save and display emotion
    
    console.log("success")
    emotionDisplayed = await chrome.tabs.sendMessage(tab.id, { action: 'displayEmotion', emotion: calculatedEmotion });

    // 6. recursion
    timeStamp += 1
    if (timeStamp > duration) {
        console.log("Done");
        setTimeout(async function () {
          const viewData = new FormData;
          viewData.append("user", currentUser);
          viewData.append("video", tab.url);
          viewData.append("emotions", JSON.stringify(emotions));

          response = await fetch('http://localhost:3000/logEmotion', {
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
          let newEmotions = mainLoop(timeStamp, duration, emotions, tab);
          return newEmotions;
        }, 1000)
        
    }
}



function main() {
  var currentFrame;
  var playing = false;
  var loop;
  var emotions = [];
  var started = false;

  navigator.mediaDevices.getUserMedia({video: true})
    .then(mediaStream => {
      const mediaStreamTrack = mediaStream.getVideoTracks()[0];
      imageCapture = new ImageCapture(mediaStreamTrack);
      console.log(imageCapture);
    })
    .catch(error => console.error('getUserMedia() error:', error));


  const playButton = document.querySelector('.playPause');
  playButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true });

    duration = await chrome.tabs.sendMessage(tab.id, { action: 'getDuration' });
    videoStats(tab, duration);
    
    videoStart = await chrome.tabs.sendMessage(tab.id, { action: 'playPause' });
    loggedEmotions = mainLoop(0, duration, emotions, tab);
    console.log("Test")
    console.log(loggedEmotions);

    
  })
}
main();