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

function getVideoDetails(){
    const videoElement = document.querySelector('video');
    const titleElement = document.getElementsByTagName("title")[0].innerHTML;
    const durationElement = videoElement.duration
}

function start(){
    createOverlay();
    
}

function main() {
  // listen to messages from the Chrome Extension APIs
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      if (request.action == 'start'){
        //fullScreenVideo();
        start();
        sendResponse({})
      }
      if (request.action === 'playPause') {
        const videoSpecs = (playVideo());
        sendResponse(videoSpecs);
      }
      if (request.action === 'displayEmotion'){
        displayEmotion(request.emotion);
        sendResponse("Emotion displayed");
      }
      if (request.action === 'timeCheck'){
        sendResponse(timeCheck());
      }
      if (request.action === 'videoDetails'){
        sendResponse(videoDetails());
      }
    }
  );
}

main();