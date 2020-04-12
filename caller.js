let myVideo = document.getElementById("me");
let yourVideo = document.getElementById("you");
let screenshotButton = document.getElementById("screenshotButton")
let screenshot = document.getElementById("screenshot")

let pc = new RTCPeerConnection();

async function getVideo () {
  const stream = await navigator.mediaDevices.getUserMedia( { video: true }, gotStream);
  // video.srcObject = stream;
}

async function gotStream (event) {
  myVideo.srcObject = event.stream;
  pc.addStream(event.stream);

  pc.createOffer(offer => {
    pc.setLocalDescription(offer);
  });
}

getVideo();

screenshotButton.onclick = function() {
  screenshot.width = myVideo.videoWidth; 
  screenshot.height = myVideo.videoHeight;
  screenshot.getContext('2d').drawImage(myVideo, 0, 0); 
}