let myVideo = document.getElementById("me");
let yourVideo = document.getElementById("you");
let screenshotButton = document.getElementById("screenshotButton");
let screenshot = document.getElementById("screenshot");
let remoteDescriptionButton = document.getElementById("submitRemoteDescription");
let remoteDescription = document.getElementById("remoteDescription");
let startCallButton = document.getElementById("startCallButton");
let setAnswerButton = document.getElementById("submitAnswerButton");
let answer = document.getElementById("answer");
let callerIceCandidate = document.getElementById("callerIceCand");
let receiverIceCandidate = document.getElementById("receiverIceCand");
let callerIceCandidateButton = document.getElementById("submitCallerIce")
let receiverIceCandidateButton = document.getElementById("submitReceiverIce")

let callerIceCandidates = [];
let receiverIceCandidates = [];


let server = {
  iceServers: [{url: "stun:stun.l.google.com:19302"}]
}

let caller = new RTCPeerConnection(server);
let receiver = new RTCPeerConnection(server);

const offerOptions = {
  offerToReceiveVideo: 1,
  offerToReceiveAudio: 1
};

// Caller
async function call () {

  const stream = await navigator.mediaDevices.getUserMedia( { audio:true, video: true });
  // let caller = new RTCPeerConnection(server);
  console.log('calling')
  myVideo.srcObject = stream;

  stream.getTracks().forEach(track => caller.addTrack(track, stream));
  // caller.addTrack(stream);

  // caller.createOffer(offer => {
  //   caller.setLocalDescription(offer);
  // });

  let sessDescription = await caller.createOffer();
  console.log(JSON.stringify(sessDescription))

  caller.setLocalDescription(sessDescription)

  caller.onicegatheringstatechange = () => {
    console.log(caller.iceGatheringState);
    if (caller.iceGatheringState === 'complete') {
      console.log(JSON.stringify(callerIceCandidates));
    }
  };

  caller.oniceconnectionstatechange = () => {
    console.log(caller.iceConnectionState);
  }


  caller.onicecandidate = e => {
    if (!e.candidate) return
    // let cand = JSON.stringify(e.candidate);
    // console.log(cand);
    callerIceCandidates.push(e.candidate);
    // caller.addIceCandidate(e.candidate);
    // caller.onicecandidate = null;
  }

  // caller.onaddstream = e => {
  //   yourVideo.srcObject = e.stream;
  // };

  caller.ontrack = e => {
    console.log('caller got track', e.track, e.streams);
    yourVideo.srcObject = e.streams[0];
  }

}

startCallButton.onclick = function() {
  call();
}


// callee
async function receiverSendVideo() {

  receiver.setRemoteDescription(JSON.parse(remoteDescription.value))
  const stream = await navigator.mediaDevices.getUserMedia( { video: true });

  // let receiver = new RTCPeerConnection(server);
  console.log('receiving')
  myVideo.srcObject = stream;
  stream.getTracks().forEach(track => receiver.addTrack(track, stream));


  // receiver.setRemoteDescription(JSON.parse(remoteDescription.value))

  // caller.createOffer(offer => {
  //   caller.setLocalDescription(offer);
  // });

  let sessDescription = await receiver.createAnswer();

  console.log(JSON.stringify(sessDescription))

  await receiver.setLocalDescription(sessDescription)

  receiver.onicecandidate = e => {
    if (!e.candidate) return
    // let cand = JSON.stringify(e.candidate);
    // console.log(cand);
    receiverIceCandidates.push(e.candidate);
    // receiver.onicecandidate = null;
  }

  receiver.onicegatheringstatechange = () => {
    console.log(receiver.iceGatheringState);
    if (receiver.iceGatheringState === 'complete') {
      console.log(JSON.stringify(receiverIceCandidates));
    }
  };

  receiver.oniceconnectionstatechange = () => {
    console.log(receiver.iceConnectionState);
  }

  // receiver.ontrack = e => {
  //   console.log('receiver got track', e.track, e.streams);
  //   yourVideo.srcObject = e.streams[0];
  // } 

  receiver.ontrack = e => {
    console.log('track event muted = ' + e.track.muted);
    e.track.onunmute = () => {
      console.log('track unmuted');
      yourVideo.srcObject = e.streams[0];
    }
  }
}

remoteDescriptionButton.onclick = async function() {
  await receiverSendVideo();
  // let candidate = new RTCIceCandidate(JSON.parse(callerIceCandidate.value));
  // receiver.addIceCandidate(candidate);
}

setAnswerButton.onclick = function() {
  caller.setRemoteDescription(JSON.parse(answer.value));
  // let candidate = new RTCIceCandidate(JSON.parse(receiverIceCandidate.value));
  // caller.addIceCandidate(candidate);
}

callerIceCandidateButton.onclick = function () {
  let candidates = JSON.parse(callerIceCandidate.value);
  for (let i = 0; i < candidates.length; i++) {
    let candidate = new RTCIceCandidate(candidates[i]);
    receiver.addIceCandidate(candidate);
  }
  // let candidate = new RTCIceCandidate(JSON.parse(callerIceCandidate.value));  
  // receiver.addIceCandidate(candidate);
}

receiverIceCandidateButton.onclick = function () {
  let candidates = JSON.parse(receiverIceCandidates.value);
  for (let i = 0; i < candidates.length; i++) {
    let candidate = new RTCIceCandidate(candidates[i]);  
    caller.addIceCandidate(candidate);
  }
  // caller.addIceCandidate(candidate);
}

screenshotButton.onclick = function() {
  screenshot.width = myVideo.videoWidth; 
  screenshot.height = myVideo.videoHeight;
  screenshot.getContext('2d').drawImage(myVideo, 0, 0); 
}
