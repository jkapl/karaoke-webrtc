let myVideo = document.getElementById("me");
let yourVideo = document.getElementById("you");
let myVideo2 = document.getElementById("me2");
let yourVideo2 = document.getElementById("you2");
let screenshotButton = document.getElementById("screenshotButton");
let screenshot = document.getElementById("screenshot");
let remoteDescriptionButton = document.getElementById("submitRemoteDescription");
let remoteDescription = document.getElementById("remoteDescription");
let startCallButton = document.getElementById("startCallButton");
let setAnswerButton = document.getElementById("submitAnswerButton");
let answer = document.getElementById("answer");

let callerIceCandidates = [];
let receiverIceCandidates = [];


let server = {
  iceServers: [{url: "stun:stun.l.google.com:19302"}]
}

let caller = new RTCPeerConnection(server);
let receiver = new RTCPeerConnection(server);

// Caller
async function getVideo () {
  const stream = await navigator.mediaDevices.getUserMedia( { video: true });
  gotStream(stream);
}

async function gotStream (stream) {
  // let caller = new RTCPeerConnection(server);
  console.log('gotStream')
  myVideo.srcObject = stream;

  stream.getTracks().forEach(track => caller.addTrack(track, stream));
  // caller.addTrack(stream);

  // caller.createOffer(offer => {
  //   caller.setLocalDescription(offer);
  // });

  let sessDescription = await caller.createOffer();
  console.log(JSON.stringify(sessDescription))

  caller.setLocalDescription(sessDescription)

  caller.onicecandidate = e => {
    if (!e.candidate) return
    console.log(e.candidate);
    callerIceCandidates.push(e.candidate);
    // caller.addIceCandidate(e.candidate);
    // caller.onicecandidate = null;
  }

  // caller.onaddstream = e => {
  //   yourVideo.srcObject = e.stream;
  // };

  caller.ontrack = e => {
    yourVideo.srcObject = e.streams[0];
  }

}

startCallButton.onclick = function() {
  getVideo();
}


// receiver
async function receiverSendVideo() {

  receiver.setRemoteDescription(JSON.parse(remoteDescription.value))
  const stream = await navigator.mediaDevices.getUserMedia( { video: true });

  // let receiver = new RTCPeerConnection(server);
  console.log('gotStream')
  myVideo2.srcObject = stream;
  stream.getTracks().forEach(track => receiver.addTrack(track, stream));


  // receiver.setRemoteDescription(JSON.parse(remoteDescription.value))

  // caller.createOffer(offer => {
  //   caller.setLocalDescription(offer);
  // });

  let sessDescription = await receiver.createAnswer();
  console.log(JSON.stringify(sessDescription))

  receiver.setLocalDescription(sessDescription)

  receiver.onicecandidate = e => {
    if (!e.candidate) return
    // console.log(JSON.stringify(e.candidate));
    receiverIceCandidates.push(e.candidate);
    // receiver.onicecandidate = null;
  }

  // receiver.onaddstream = e => {
  //   yourVideo2.srcObject = e.stream;
  // };

  receiver.ontrack = e => {
    yourVideo.srcObject = e.streams[0];
  }

  // event.preventDefault();  

}

remoteDescriptionButton.onclick = function() {
  receiverSendVideo();
  let candidate = new RTCIceCandidate(callerIceCandidates[1])
  receiver.addIceCandidate(candidate);
}

screenshotButton.onclick = function() {
  screenshot.width = myVideo.videoWidth; 
  screenshot.height = myVideo.videoHeight;
  screenshot.getContext('2d').drawImage(myVideo, 0, 0); 
}

setAnswerButton.onclick = function() {
  caller.setRemoteDescription(JSON.parse(answer.value));
  let candidate = new RTCIceCandidate(receiverIceCandidates[1]);
  caller.addIceCandidate(candidate);
}