async function mainLoop(timeStamp, duration, imageCapture, emotions){
    // 1. Set Defaults
    var result = null;
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
            result = result["emotion"];

        } catch (error) {
            console.error(error.message);
            result = prevEmotion;
        }


    })
    .catch(error => result = prevEmotion);

    // 5. save and display emotion
    emotions.push({timestamp: timeStamp, emotion: result});
    console.log("success")
    emotionDisplayed = await chrome.tabs.sendMessage(tab.id, { action: 'displayEmotion', emotion: result });

    timeStamp += 1
    if (timeStamp > duration) {
        return emotions;
    }
    else {
        return mainLoop(timeStamp, duration, imageCapture, emotions);
    }
}