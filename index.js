{/* <video id="local_video" autoplay></video> 
<video id="remote_video" autoplay></video>  */}


{/* <script> */}
  var ice = {"iceServers": [
    {"url": "stun:stunserver.com:12345"},
    {"url": "turn:turnserver.com", "username": "user", "credential": "pass"}
  ]};

  var signalingChannel = new SignalingChannel(); 
  var pc = new RTCPeerConnection(ice); 
  

  navigator.getUserMedia({ "audio": true, "video": true }, gotStream, logError); 

  function gotStream(evt) {
    pc.addStream(evt.stream); 

    var local_video = document.getElementById('local_video');
    local_video.src = window.URL.createObjectURL(evt.stream); 

    pc.createOffer(function(offer) { 
      pc.setLocalDescription(offer);
      signalingChannel.send(offer.sdp);
    });
  }

  pc.onicecandidate = function(evt) { 
    if (evt.candidate) {
      signalingChannel.send(evt.candidate);
    }
  }

  signalingChannel.onmessage = function(msg) { 
    if (msg.candidate) {
      pc.addIceCandidate(msg.candidate);
    }
  }

  pc.onaddstream = function (evt) { 
    var remote_video = document.getElementById('remote_video');
    remote_video.src = window.URL.createObjectURL(evt.stream);
  }

  function logError() { ... }
// </script>