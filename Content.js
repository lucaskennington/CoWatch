var started = false;
const emotion_colours = new Map ([
  ['Happy','rgba(255, 242, 3, 0.25)'],
  ['Sad','rgba(53, 3, 255, 0.1)'],
  ['Anger','rgba(255, 3, 3, 0.25)'],
  ['Surprise','rgba(255, 3, 251, 0.25)'],
  ['Disgust','rgba(27, 186, 6, 0.25)'],
  ['Fear','rgba(143, 14, 194, 0.25)'],
  ['Neutral','rgba(0, 0, 0, 0)']
]);

function playVideo() {
  // get the video element, and the skip button that YouTube renders
  const videoElement = document.querySelector('video');
  const skipButton = document.querySelector('button.ytp-ad-skip-button-modern');

  // move current video time to the end and click the skip button
  if (videoElement) {
    if (videoElement.paused){
      videoElement.play();


    } else {
      videoElement.pause();
    }
  }
  return videoElement.paused;
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

function main() {
  // listen to messages from the Chrome Extension APIs
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      if (request.action == 'createOverlay'){
        //fullScreenVideo();
        createOverlay();
        sendResponse("Overlay created")
      }
      if (request.action === 'playPause') {
        const playing = !(playVideo());
        sendResponse(playing);
      }
      if (request.action === 'displayEmotion'){
        displayEmotion(request.emotion);
        sendResponse("Emotion displayed")
      }
    }
  );
}

main();