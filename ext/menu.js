const error_message = document.getElementById('error-message');
var currentUser = "";
var currentTime = 0;
var imageCapture;

chrome.storage.local.get(["loggedInUser"])
.then((result) => {
    currentUser = result.loggedInUser;
    error_message.innerText = currentUser;
    console.log("Logged in: " + currentUser);
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

  response = await fetch('https://api-cowatch.onrender.com/newVideo', {
    method: "POST",
    headers: {
      "Content-Type":"application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(videoData).toString()
  })
  const result = await response.json();

  const checkData = new FormData;
  checkData.append("videoTitle", videoUrl);
  response = await fetch('https://api-cowatch.onrender.com/existingViews', {
    method: "POST",
    headers: {
      "Content-Type":"application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(checkData).toString()
  })
  const resultBody = await response.json();
  if (resultBody == "none"){
    return null;
  } else {
    return resultBody;
  }
  
}

function calcMode(emotionList){
  const freq = {};
  emotionList.forEach(emotion => {
    freq[emotion] = (freq[emotion] || 0) + 1;
  });

  let modes = [];
  let highest = 0;

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
    var prevEmotion = 'Neutral';
    if (emotions.length > 0) {
        prevEmotion = emotions[emotions.length - 1]["emotion"];
    }
    avgEmotion = null;
    if (avgEmotions == null){
      document.getElementById("rad2").checked = false;
      document.getElementById("rad1").checked = true;
      document.getElementById("noDataError").innerHTML = "No prior views for this video";
    } else {
      avgEmotion = avgEmotions[avgEmotionIndex];
    }

    const ownEmotions = document.getElementById("rad1").checked;

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
            displayEmotion(tab, calculatedEmotion, avgEmotion, ownEmotions);

        } catch (error) {
            console.error(error.message);
            calculatedEmotion = prevEmotion;
            emotions.push({timestamp: timeStamp, emotion: calculatedEmotion});
            displayEmotion(tab, calculatedEmotion, avgEmotion, ownEmotions);
        }

    })
    .catch(error => function () {
      calculatedEmotion = prevEmotion
      emotions.push({timestamp: timeStamp, emotion: calculatedEmotion});
      displayEmotion(tab, calculatedEmotion, avgEmotion, ownEmotions);
    });

    // 5. recursion
    timeStamp += 1
    if (timeStamp > duration) {
        console.log("Done");
        setTimeout(async function () {
          const viewData = new FormData;
          viewData.append("user", currentUser);
          viewData.append("video", tab.url);
          viewData.append("emotions", JSON.stringify(emotions));

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
          let newEmotions = mainLoop(timeStamp, duration, emotions, tab, avgEmotions, avgEmotionIndex + 1);
          return newEmotions;
        }, 1000)
        
    }
}

async function displayEmotion(tab, calculatedEmotion, avgEmotion, ownEmotions){

  if (ownEmotions){
    console.log(calculatedEmotion);
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

    document.getElementById("rad1").disabled = true;
    document.getElementById("rad2").disabled = true;

    overlay = await chrome.tabs.sendMessage(tab.id, { action: 'createOverlay'});

    duration = await chrome.tabs.sendMessage(tab.id, { action: 'getDuration' });
    avgEmotions = await videoStats(tab, duration);

    
    videoStart = await chrome.tabs.sendMessage(tab.id, { action: 'playPause' });
    loggedEmotions = mainLoop(0, duration, emotions, tab, avgEmotions, 0);

    
  })
}
main();