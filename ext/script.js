function main() {

  var imageCapture;
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

    if (started == false){
      overlay_created = await chrome.tabs.sendMessage(tab.id, { action: 'createOverlay' });
      console.log(overlay_created);
      started = true;
    }
    

    playing = await chrome.tabs.sendMessage(tab.id, { action: 'playPause' });

    if (playing){
      loop = window.setInterval(async function(){
        imageCapture.takePhoto()
        .then(async blob => {
        currentFrame = blob;
        
        // const canvas = document.createElement('canvas');
        // canvas.width = currentFrame.width;
        // canvas.height = currentFrame.height;
        // const ctx = canvas.getContext('bitmaprenderer');
        // ctx.transferFromImageBitmap(currentFrame);
        // const img = canvas.toDataURL('image/jpg');
        // console.log(img);


        const formData = new FormData;
        formData.append("file", blob, "emotionImage.png")


        try{
          const response = await fetch("http://dcs.gla.ac.uk/lobos/lucas", {
            method: "POST",
            body: formData
          });
          if (!response.ok){
            throw new Error(`Response status: ${response.status}`);
          }
          const result = await response.json();
          console.log(result);
          const emotionLabel = document.querySelector('.currentEmotion');
          emotionLabel.innerHTML = result["emotion"];
          emotions.push(result["emotion"]);
          console.log(emotions)

          emotionDisplayed = await chrome.tabs.sendMessage(tab.id, { action: 'displayEmotion', emotion: result["emotion"] });

          fetch('http://localhost:3000/users')
            .then(response => console.log(response))
            .catch(error => console.error('Error:', error));

        } catch (error) {
          console.error(error.message);
        }
        
        // fetch("http://dcs.gla.ac.uk/lobos/lucas", {
        //   method: "POST",
        //   body: img,
        //   headers: {
        //     "Content-type": "multipart/form-data;"
        //   }
        // }).then((response) => response.json())
          // .then((json) => console.log(json));
        //console.log(currentFrame);
        })
        .catch(error => console.log(error));
      }, 1000);
    } else {
      clearInterval(loop);
    }
  });


  

}

main();