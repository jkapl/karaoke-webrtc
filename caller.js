let myVideo = document.getElementById("me");
let yourVideo = document.getElementById("you");
let screenshotButton = document.getElementById("screenshotButton")
let screenshot = document.getElementById("screenshot")

let server = {
  iceServers: [{url: "stun:23.21.150.121"}]
}


// Caller
let caller = new RTCPeerConnection(server);

async function getVideo () {
  const stream = await navigator.mediaDevices.getUserMedia( { video: true });
  gotStream(stream);
}

async function gotStream (stream) {
  console.log('gotStream')
  myVideo.srcObject = stream;
  caller.addStream(stream);

  // caller.createOffer(offer => {
  //   caller.setLocalDescription(offer);
  // });

  let sessDescription = await caller.createOffer();
  console.log(sessDescription)

  caller.setLocalDescription(sessDescription)

  caller.onicecandidate = e => {
    if (!e.candidate) return
    // console.log(JSON.stringify(e.candidate));
    caller.onicecandidate = null;
  }

  caller.onaddstream = e => {
    yourVideo.src = e.stream;
  };
}

getVideo();

screenshotButton.onclick = function() {
  screenshot.width = myVideo.videoWidth; 
  screenshot.height = myVideo.videoHeight;
  screenshot.getContext('2d').drawImage(myVideo, 0, 0); 
}

// Receiver