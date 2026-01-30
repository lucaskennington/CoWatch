var started = false;
// const emotion_colours = new Map ([
//   ['Happy','rgba(255, 242, 3, 0.25)'],
//   ['Sad','rgba(53, 3, 255, 0.1)'],
//   ['Anger','rgba(255, 3, 3, 0.25)'],
//   ['Surprise','rgba(255, 3, 251, 0.25)'],
//   ['Disgust','rgba(27, 186, 6, 0.25)'],
//   ['Fear','rgba(143, 14, 194, 0.25)'],
//   ['Neutral','rgba(0, 0, 0, 0)']
// ]);

const emotion_colours = new Map ([
  ['Happy','rgb(255, 242, 3)'],
  ['Sad','rgb(53, 3, 255)'],
  ['Anger','rgb(255, 3, 3)'],
  ['Surprise','rgb(255, 3, 251)'],
  ['Disgust','rgb(27, 186, 6)'],
  ['Fear','rgb(143, 14, 194)'],
  ['Neutral','rgb(255, 255, 255)']
]);

// var styleElement = document.createElement('style');
// styleElement.setAttribute('data-yt-extension', 'true');


function changeColour(emotion){
  newColour = emotion_colours.get(emotion);
  console.log("Emotion received");
  console.log(newColour);
  document.querySelector('ytd-app').style.setProperty('background-color', newColour, 'important');
}

function videoDetails(){
  const titleElement = document.getElementsByTagName("title")[0].innerHTML;
  return titleElement;
}

function timeCheck() {
  const videoElement = document.querySelector('video');
  if (videoElement) {
    currentTime = videoElement.currentTime;
    finishedStatus = (currentTime >= videoElement.duration)
    return {finished: finishedStatus, runtime: currentTime}
  }
}

function playVideo() {
  // get the video element, and the skip button that YouTube renders
  const videoElement = document.querySelector('video');
  const skipButton = document.querySelector('button.ytp-ad-skip-button-modern');

  if (videoElement) {
    if (videoElement.paused){
      videoElement.play();


    } else {
      videoElement.pause();
    }
  }
  return {pauseStatus: videoElement.paused, currentRunime: videoElement.currentTime, videoDuration: videoElement.duration};
}

function fullScreenVideo(){
  const videoElement = document.querySelector('video');
  videoElement.requestFullscreen()
}

function createOverlay(){
  const overlay = document.createElement("div");
  overlay.id = 'overlay1';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    zIndex: '9999',          // On top of all other elements
    display: 'flex',         // Center content if needed
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer'
  })
  document.body.appendChild(overlay);

}

function displayEmotion(emotion){
  var colour = emotion_colours.get(emotion);
  overlay = document.getElementById('overlay1');
  Object.assign(overlay.style, {
    backgroundColor: colour
  })
}

function checkPaused(){
  const videoElement = document.querySelector('video');
  return videoElement.paused;
}

function getDuration(){
  const videoElement = document.querySelector('video');
  return videoElement.duration;
}

function main() {
  // listen to messages from the Chrome Extension APIs
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      if (request.action == 'createOverlay'){
        //fullScreenVideo();
        createOverlay();
        sendResponse({})
      }
      if (request.action === 'playPause') {
        const videoSpecs = (playVideo());
        sendResponse(videoSpecs);
      }
      if (request.action === 'displayEmotion'){
        changeColour(request.emotion);
        sendResponse("Emotion displayed");
      }
      if (request.action === 'timeCheck'){
        sendResponse(timeCheck());
      }
      if (request.action === 'videoDetails'){
        sendResponse(videoDetails());
      }
      if (request.action === 'checkPaused'){
        sendResponse(checkPaused());
      }
      if (request.action === 'getDuration'){
        sendResponse(getDuration());
      }
    }
  );
}

main();