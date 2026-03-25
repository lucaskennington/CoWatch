var started = false;

// const style = document.createElement('style');
// style.textContent = "#overlay {position: fixed; display: none; width: 100%; height: 100%; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0); z-index: 9999; pointer-events: none; clip-path: polygon(0 0, 0 var(--1), var(--2) var(--1), var(--3) var(--1), var(--3) var(--4), var(--2) var(--4), var(--2) var(--1), 0 var(--1), 0 100%, 100% 100%, 100% 0);}";

const emotion_colours = new Map ([
  ['Happy','rgba(255, 242, 3, 0.25)'],
  ['Sad','rgba(53, 3, 255, 0.1)'],
  ['Anger','rgba(255, 3, 3, 0.25)'],
  ['Surprise','rgba(255, 3, 251, 0.25)'],
  ['Disgust','rgba(27, 186, 6, 0.25)'],
  ['Fear','rgba(143, 14, 194, 0.25)'],
  ['Neutral','rgba(0, 0, 0, 0)']
]);

const emotion_colours_solid = new Map ([
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
  newColour = emotion_colours_solid.get(emotion);
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
  const videoElement = document.querySelector('video');
  const rect = videoElement.getBoundingClientRect();
  console.log(rect.top);
  console.log(rect.bottom);
  console.log(rect.left);
  console.log(rect.right);

  rectTop = rect.top.toString();
  rectBottom = rect.bottom.toString();
  rectLeft = rect.left.toString();
  rectRight = rect.right.toString();
  rectWidth = rect.width.toString();
  rectHeight = rect.height.toString();


  const overlay = document.createElement("div");
  overlay.id = 'overlay1';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '45px',
    height: '493px',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    zIndex: '9999',          // On top of all other elements
    display: 'flex',         // Center content if needed
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer'
  })

  //update to user display
  overlay.style.width = rectLeft + "px";
  overlay.style.height = rectBottom + "px";


  const overlay2 = document.createElement("div");
  overlay2.id = 'overlay2';
  Object.assign(overlay2.style, {
    position: 'fixed',
    top: '0',
    left: '45px',
    width: '756px',
    height: '68px',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    zIndex: '9999',          // On top of all other elements
    display: 'flex',         // Center content if needed
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer'
  })

  overlay2.style.left = rectLeft + "px";
  overlay2.style.width = rectWidth + "px";
  overlay2.style.height = rectTop + "px";

  const overlay3 = document.createElement("div");
  overlay3.id = 'overlay3';
  Object.assign(overlay3.style, {
    position: 'fixed',
    top: '493px',
    left: '0',
    width: '801px',
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

  overlay3.style.top = rectBottom + "px";
  overlay3.style.width = rectRight + "px";

  const overlay4 = document.createElement("div");
  overlay4.id = 'overlay4';
  Object.assign(overlay4.style, {
    position: 'fixed',
    top: '0',
    left: '801px',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    zIndex: '9999',          // On top of all other elements
    display: 'flex',         // Center content if needed
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',

    cursor: 'pointer'
  })

  overlay4.style.left = rectRight + "px";


  // overlay.style.clipPath = "polygon(0 0, 0 ${rect.top}, ${rect.left} ${rect.top}, ${rect.right} ${rect.top}, ${rect.right} ${rect.bottom}, ${rect.left} ${rect.bottom}, ${rect.left} ${rect.top}, 0 ${rect.top}, 0 100%, 100% 100%, 100% 0)"
  // console.log(overlay.style.clipPath);
  // console.log(rect.width);
  // console.log(rect.height);

  document.body.appendChild(overlay);
  document.body.appendChild(overlay2);
  document.body.appendChild(overlay3);
  document.body.appendChild(overlay4);

  console.log("overlay created");

}

function displayEmotion(emotion){
  console.log(emotion);
  var colour = emotion_colours.get(emotion);

  overlay = document.getElementById('overlay1');
  Object.assign(overlay.style, {
    backgroundColor: colour
  })

  overlay2 = document.getElementById('overlay2');
  Object.assign(overlay2.style, {
    backgroundColor: colour
  })

  overlay3 = document.getElementById('overlay3');
  Object.assign(overlay3.style, {
    backgroundColor: colour
  })

  overlay4 = document.getElementById('overlay4');
  Object.assign(overlay4.style, {
    backgroundColor: colour
  })


  console.log("overlay updated");
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
        console.log('a');
        console.log(request.emotion);
        console.log('b');
        displayEmotion(request.emotion);
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