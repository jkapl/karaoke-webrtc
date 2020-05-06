const myVideo = document.getElementById("me");
const yourVideo = document.getElementById("you");
const screenshotButton = document.getElementById("screenshotButton");
const screenshot = document.getElementById("screenshot");
const startCallButton = document.getElementById("startCallButton");
const answerButton = document.getElementById("acceptCall");

let callerIceCandidates = [];
let receiverIceCandidates = [];

let receiverInboundStream = null;
let callerInboundStream = null;

// STUN server
const server = {
  iceServers: [{url: "stun:stun.l.google.com:19302"}]
}

// Import WebSocket
import ws from './socket/client.js';

// Create caller and call recipient RTCPeerConnection objects
let caller = new RTCPeerConnection(server);
let receiver = new RTCPeerConnection(server);

const offerOptions = {
  offerToReceiveVideo: 1,
  offerToReceiveAudio: 1
};

// Caller
async function call () {

  // Collect an audio/video stream from the local device
  const stream = await navigator.mediaDevices.getUserMedia( { audio:true, video: true });

  console.log('calling')
  myVideo.srcObject = stream;

  // Add stream tracks to the RTCPeerConnection object
  stream.getTracks().forEach(track => caller.addTrack(track, stream));

  // Create an SDP offer to send to the recipient of the call
  let sessDescription = await caller.createOffer();

  // Send the SDP offer to the signaling channel - in this case, a WebSocket connection
  ws.send(JSON.stringify(sessDescription));

  // Handle receiving messages from the WebSocket connection
  ws.onmessage = e => {
    let msg = JSON.parse(e.data);
    console.log(`Message received. Type: ${msg.type} Message: ${msg}`);
    switch (msg.type) {
      // If the message is of type answer, set it as the remote description of the RTC connection
      case ('answer'):
        caller.setRemoteDescription(msg);
        break;
      // If the message is of type ICEcandidate, add the candidate to the RTC connection
      case ('ICEcandidate') :
        let promises = [];
        let candidates = msg.receiverIceCandidates;
        for (let i = 0; i < candidates.length; i++) {
          let candidate = new RTCIceCandidate(candidates[i]);
          promises.push(caller.addIceCandidate(candidate));
        }
        Promise.all(promises);
    }
  }

  caller.setLocalDescription(sessDescription)

  caller.onicegatheringstatechange = () => {
    console.log(`ICE gathering state: ${caller.iceGatheringState}`);
    if (caller.iceGatheringState === 'complete') {
      console.log(JSON.stringify(`caller ice candidates: ${callerIceCandidates}`));
      ws.send(JSON.stringify({'type': 'ICEcandidate', callerIceCandidates}))
    }
  };

  caller.oniceconnectionstatechange = () => {
    console.log(`ICE connection state: ${caller.iceConnectionState}`);
  }


  caller.onicecandidate = e => {
    if (!e.candidate) return
    callerIceCandidates.push(e.candidate);
  }

  // Stream received; attach it to the browser to view
  caller.ontrack = e => {
    console.log('caller got track', e.track, e.streams);
    yourVideo.srcObject = e.streams[0];
  }

}

startCallButton.onclick = function() {
  call();
}


// Callee
async function receiverSendVideo() {
  ws.onmessage = e => {
    let msg = JSON.parse(e.data);
    console.log(msg);
    switch (msg.type) {
      case ('offer'):
        negotiateExchange(msg);
        break;
      // case ('ICEcandidate') :
      //   console.log(msg);
      //   let candidates = msg.callerIceCandidates;
      //   let promises = [];
      //   for (let i = 0; i < candidates.length; i++) {
      //     let candidate = new RTCIceCandidate(candidates[i]);
      //     let promise = new Promise( (resolve) => {
      //       resolve(receiver.addIceCandidate(candidate));
      //     });
      //     promises.push(promise);
      //   }
      //   Promise.all(promises);
      }
        //handle ice candidates
    }
  
  async function negotiateExchange (offer) {
    const stream = await navigator.mediaDevices.getUserMedia( { video: true });
    console.log(`Message received. Type: ${offer.type} Message: ${offer}`);
    myVideo.srcObject = stream;
    stream.getTracks().forEach(track => receiver.addTrack(track, stream));
    await receiver.setRemoteDescription(offer);
    let sessDescription = await receiver.createAnswer();

    await receiver.setLocalDescription(sessDescription)

    ws.send(JSON.stringify(sessDescription));

    ws.onmessage = e => {
      let msg = JSON.parse(e.data);
      if (msg.type === 'ICEcandidate') {
        let candidates = msg.callerIceCandidates;
        let promises = [];
        for (let i = 0; i < candidates.length; i++) {
          let candidate = new RTCIceCandidate(candidates[i]);
          let promise = receiver.addIceCandidate(candidate);
          promises.push(promise);
        }
        Promise.all(promises);
      }
    }
    receiver.onicecandidate = e => {
      if (!e.candidate) return
      receiverIceCandidates.push(e.candidate);
    }

    receiver.onicegatheringstatechange = () => {
      console.log(`ICE gathering state: ${receiver.iceGatheringState}`);
      if (receiver.iceGatheringState === 'complete') {
        console.log(JSON.stringify(`Callee ICE candidates: ${receiverIceCandidates}`));
        ws.send(JSON.stringify({'type': 'ICEcandidate', receiverIceCandidates}))
      }
    };

    receiver.oniceconnectionstatechange = () => {
      console.log(`ICE connection state: ${receiver.iceConnectionState}`);
    }

    // receiver.ontrack = e => {
    //   console.log('receiver got track', e.track, e.streams);
    //   yourVideo.srcObject = e.streams[0];
    // } 
    
    receiver.ontrack = e => {
      if (e.streams && e.streams[0]) {
        yourVideo.srcObject = e.streams[0];
      } else {
        if (!receiverInboundStream) {
          receiverInboundStream = new MediaStream();
          yourVideo.srcObject = receiverInboundStream;
        }
        receiverInboundStream.addTrack(e.track);
      }
    }

    // receiver.ontrack = e => {
    //   console.log('track event muted = ' + e.track.muted);
    //   e.track.onunmute = () => {
    //     console.log('track unmuted');
    //     yourVideo.srcObject = e.streams[0];
    //   }
    // }

  }
}

answerButton.onclick =  async function () {
  await receiverSendVideo();
}

screenshotButton.onclick = function() {
  screenshot.width = myVideo.videoWidth; 
  screenshot.height = myVideo.videoHeight;
  screenshot.getContext('2d').drawImage(myVideo, 0, 0); 
}
