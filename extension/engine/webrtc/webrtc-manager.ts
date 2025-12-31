export class WebRTCManager {
	private peerConnection: RTCPeerConnection | null = null;
	private signalingWs: WebSocket | null = null;
	private localStream: MediaStream | null = null;

	async startEscalation(roomId: string, signalingUrl: string) {
		// 1. Connect to signaling server
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

	private async initializePeerConnection(roomId: string) {
		// 2. Create peer connection
		this.peerConnection = new RTCPeerConnection({
			iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
		});

		// 3. Get user media
		this.localStream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true,
			},
		});

		this.localStream.getTracks().forEach((track) => {
			this.peerConnection!.addTrack(track, this.localStream!);
		});

		// 4. Handle incoming stream
		this.peerConnection.ontrack = (event) => {
			const remoteAudio = new Audio();
			remoteAudio.srcObject = event.streams[0];
			remoteAudio.play();

			// Notify UI that human is connected
			chrome.runtime.sendMessage({
				type: "FORWARD_TO_TAB",
				tabMessage: {
					type: "UPDATE_UI_STATE",
					parameters: {
						callStatus: "connected",
						aiState: "listening",
					},
				},
			});
		};

		// 5. Handle ICE candidates
		this.peerConnection.onicecandidate = (event) => {
			if (event.candidate && this.signalingWs) {
				this.signalingWs.send(
					JSON.stringify({
						type: "ice-candidate",
						roomId,
						candidate: event.candidate,
					})
				);
			}
		};

		// 6. Create and send offer
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);

		this.signalingWs!.send(
			JSON.stringify({
				type: "offer",
				roomId,
				sdp: offer,
			})
		);
	}

	private async handleSignalingMessage(msg: any) {
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
