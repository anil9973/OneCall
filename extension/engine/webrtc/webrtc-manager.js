class WebRTCManager {
  peerConnection = null;
  signalingWs = null;
  localStream = null;
  async startEscalation(roomId, signalingUrl) {
    this.signalingWs = new WebSocket(signalingUrl);
    this.signalingWs.onopen = () => {
      console.log("[WebRTC] Connected to signaling server");
      this.initializePeerConnection(roomId);
    };
    this.signalingWs.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      await this.handleSignalingMessage(msg);
    };
    this.signalingWs.onerror = (error) => {
      console.error("[WebRTC] Signaling error:", error);
    };
  }
  async initializePeerConnection(roomId) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
    });
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });
    this.peerConnection.ontrack = (event) => {
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play();
      chrome.runtime.sendMessage({
        type: "FORWARD_TO_TAB",
        tabMessage: {
          type: "UPDATE_UI_STATE",
          parameters: {
            callStatus: "connected",
            aiState: "listening"
          }
        }
      });
    };
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.signalingWs) {
        this.signalingWs.send(
          JSON.stringify({
            type: "ice-candidate",
            roomId,
            candidate: event.candidate
          })
        );
      }
    };
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.signalingWs.send(
      JSON.stringify({
        type: "offer",
        roomId,
        sdp: offer
      })
    );
  }
  async handleSignalingMessage(msg) {
    if (!this.peerConnection) return;
    switch (msg.type) {
      case "answer":
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        break;
      case "ice-candidate":
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
        break;
      case "peer-disconnected":
        this.disconnect();
        break;
    }
  }
  disconnect() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.peerConnection?.close();
    this.signalingWs?.close();
    this.localStream = null;
    this.peerConnection = null;
    this.signalingWs = null;
  }
}
export {
  WebRTCManager
};
