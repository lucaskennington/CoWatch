var started = false;

// colours used by overlay, mapped to emotions
const emotion_colours = new Map ([
  ['Happy','rgba(255, 242, 3, 0.25)'], //fff20340
  ['Sad','rgba(0, 4, 248, 0.33)'], //0004f854
  ['Anger','rgba(255, 3, 3, 0.25)'], //ff030340
  ['Surprise','rgba(255, 3, 251, 0.25)'], //ff03fb40
  ['Disgust','rgba(27, 186, 6, 0.25)'], //1bba0640
  ['Fear','rgba(143, 14, 194, 0.47)'], //8f0ec240
  ['Neutral','rgba(0, 0, 0, 0)']
]);

// const emotion_colours_solid = new Map ([
//   ['Happy','rgb(255, 242, 3)'],
//   ['Sad','rgb(53, 3, 255)'],
//   ['Anger','rgb(255, 3, 3)'],
//   ['Surprise','rgb(255, 3, 251)'],
//   ['Disgust','rgb(27, 186, 6)'],
//   ['Fear','rgb(143, 14, 194)'],
//   ['Neutral','rgb(255, 255, 255)']
// ]);

// var styleElement = document.createElement('style');
// styleElement.setAttribute('data-yt-extension', 'true');

function videoDetails(){
  const titleElement = document.getElementsByTagName("title")[0].innerHTML;
  return titleElement;
}

function playVideo() {
  // get the video element [1]
  const videoElement = document.querySelector('video');

  // play / pause 
  if (videoElement) {
    if (videoElement.paused){
      videoElement.play();


    } else {
      videoElement.pause();
    }
  }
  // return if video is paused
  return {pauseStatus: videoElement.paused, currentRunime: videoElement.currentTime, videoDuration: videoElement.duration};
}

function overlayTemplate(id, this_top, this_left, this_width, this_height){
  // create overlay [3]
  overlay = document.createElement("div");
  overlay.id = id;
  Object.assign(overlay.style, {
    position: 'fixed',
    top: this_top,
    left: this_left,
    width: this_width,
    height: this_height,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    zIndex: '9999',          // On top of all other elements
    display: 'flex',         // Center content if needed
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer'
  })
  return overlay;
}

function createOverlay(){
  const videoElement = document.querySelector('video');
  // get video dimensions [2]
  const rect = videoElement.getBoundingClientRect();

  rectTop = rect.top.toString();
  rectBottom = rect.bottom.toString();
  rectLeft = rect.left.toString();
  rectRight = rect.right.toString();
  rectWidth = rect.width.toString();
  rectHeight = rect.height.toString();

  // build overlays around existing video
  const overlay = overlayTemplate('overlay1', '0', '0', rectLeft + "px", rectBottom + "px");
  const overlay2 = overlayTemplate('overlay2', '0', rectLeft + "px", rectWidth + "px", rectTop + "px");
  const overlay3 = overlayTemplate('overlay3', rectBottom + "px", '0', rectRight + "px", '100%');
  const overlay4 = overlayTemplate('overlay4', '0', rectRight + "px", '100%', '100%');


  // display overlay
  document.body.appendChild(overlay);
  document.body.appendChild(overlay2);
  document.body.appendChild(overlay3);
  document.body.appendChild(overlay4);

  console.log("overlay created");

}

function displayEmotion(emotion){

  // get colour of emotion from Map
  var colour = emotion_colours.get(emotion);

  // change overlay colour
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

// return duration of video
function getDuration(){
  const videoElement = document.querySelector('video');
  return videoElement.duration;
}

function main() {
  // wait for request
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      switch (request.action){
        // request for video details
        case 'videoDetails':
          sendResponse(videoDetails());
          break;
        // request for video duration
        case 'getDuration':
          sendResponse(getDuration());
          break;
        // request to create overlay, send empty response
        case 'createOverlay':
          createOverlay();
          sendResponse({});
          break;
        // request to start video, send video specs
        case 'playPause':
          const videoSpecs = (playVideo());
          sendResponse(videoSpecs);
          break;
        // request to display emotion, send confirmation
        case 'displayEmotion':
          displayEmotion(request.emotion);
          sendResponse("Emotion displayed");
          break;
        default:
          sendResponse("Instruction not recognised");
      }
      

      

      


      // request for video duration
      if (request.action === 'getDuration'){
        sendResponse(getDuration());
      }
    }
  );
}

main();

// ---------------------------------------------------------------------------------------------------
// **CODE BIBLIOGRAPHY**

// [1] w3schools - HTML DOM Document querySelector() - last accessed 2026-03-22
// Available at https://www.w3schools.com/jsref/met_document_queryselector.asp

// [2] Mozilla MDN - "Element: getBoundingClientRect() method" - last updated 2025-10-30
// Available at https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

// [3] w3schools - How TO - Full screen Overlay Navigation - last accessed 2026-03-22
// Available at https://www.w3schools.com/howto/howto_js_fullscreen_overlay.asp

// [4] w3schools - JavaScript Switch Statement - last accessed 2026-03-22
// Available at https://www.w3schools.com/js/js_switch.asp