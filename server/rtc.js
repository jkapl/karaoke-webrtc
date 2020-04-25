const myVideo = document.getElementById("me");
const yourVideo = document.getElementById("you");
const screenshotButton = document.getElementById("screenshotButton");
const screenshot = document.getElementById("screenshot");
const startCallButton = document.getElementById("startCallButton");
const answerButton = document.getElementById("acceptCall");

let callerIceCandidates = [];
let receiverIceCandidates = [];


const server = {
  iceServers: [{url: "stun:stun.l.google.com:19302"}]
}

import ws from './socket/client.js';

let caller = new RTCPeerConnection(server);
let receiver = new RTCPeerConnection(server);

const offerOptions = {
  offerToReceiveVideo: 1,
  offerToReceiveAudio: 1
};

// Caller
async function call () {

  const stream = await navigator.mediaDevices.getUserMedia( { audio:true, video: true });

  console.log('calling')
  myVideo.srcObject = stream;

  stream.getTracks().forEach(track => caller.addTrack(track, stream));

  let sessDescription = await caller.createOffer();

  ws.send(JSON.stringify(sessDescription));
  // console.log(`caller session description: ${sessDescription}`)
  ws.onmessage = e => {
    let msg = JSON.parse(e.data);
    console.log(msg);
    switch (msg.type) {
      case ('answer'):
        console.log('in switch')
        caller.setRemoteDescription(msg);
        break;
      case ('ICEcandidate') :
        let promises = [];
        let candidates = msg.receiverIceCandidates;
        for (let i = 0; i < candidates.length; i++) {
          let candidate = new RTCIceCandidate(candidates[i]);
          let promise = new Promise( (resolve ) => {
            resolve(caller.addIceCandidate(candidate));
          })
          promises.push(promise);
        }
        Promise.all(promises);
          // caller.addIceCandidate(candidate);
    }
  }

  caller.setLocalDescription(sessDescription)

  caller.onicegatheringstatechange = () => {
    console.log(caller.iceGatheringState);
    if (caller.iceGatheringState === 'complete') {
      console.log(JSON.stringify(`caller ice candidates: ${callerIceCandidates}`));
      ws.send(JSON.stringify({'type': 'ICEcandidate', callerIceCandidates}))
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
  console.log('inside receiver send video')

  ws.onmessage = e => {
    let msg = JSON.parse(e.data);
    console.log(msg);
    switch (msg.type) {
      case ('offer'):
        console.log('in switch')
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
    console.log('inside negotiate')
    const stream = await navigator.mediaDevices.getUserMedia( { video: true });

    // let receiver = new RTCPeerConnection(server);
    console.log('receiving')
    myVideo.srcObject = stream;
    stream.getTracks().forEach(track => receiver.addTrack(track, stream));
    await receiver.setRemoteDescription(offer);
    let sessDescription = await receiver.createAnswer();

    console.log(`Callee answer: ${JSON.stringify(sessDescription)}`)

    await receiver.setLocalDescription(sessDescription)

    ws.send(JSON.stringify(sessDescription));

    ws.onmessage = e => {
      let msg = JSON.parse(e.data);
      if (msg.type === 'ICEcandidate') {
        let candidates = msg.callerIceCandidates;
        let promises = [];
        for (let i = 0; i < candidates.length; i++) {
          let candidate = new RTCIceCandidate(candidates[i]);
          let promise = new Promise( (resolve) => {
            resolve(receiver.addIceCandidate(candidate));
          });
          promises.push(promise);
        }
        Promise.all(promises);
      }
    }
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
        ws.send(JSON.stringify({'type': 'ICEcandidate', receiverIceCandidates}))
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
}

answerButton.onclick =  async function () {
  receiverSendVideo();
}

screenshotButton.onclick = function() {
  screenshot.width = myVideo.videoWidth; 
  screenshot.height = myVideo.videoHeight;
  screenshot.getContext('2d').drawImage(myVideo, 0, 0); 
}
