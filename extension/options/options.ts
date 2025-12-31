// // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// let mediaRecorder;
// let audioChunks = [];

// document.getElementById("startBtn").onclick = async () => {
// 	try {
// 		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// 		audioChunks = [];
// 		mediaRecorder = new MediaRecorder(stream);

// 		mediaRecorder.ondataavailable = (e) => {
// 			audioChunks.push(e.data);
// 		};

// 		mediaRecorder.onstop = () => {
// 			const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
// 			const audioUrl = URL.createObjectURL(audioBlob);
// 			document.getElementById("playback").src = audioUrl;
// 		};

// 		mediaRecorder.start();

// 		document.getElementById("startBtn").disabled = true;
// 		document.getElementById("stopBtn").disabled = false;
// 	} catch (err) {
// 		console.error("Mic error:", err);
// 		alert("Microphone permission denied or not available.");
// 	}
// };

// document.getElementById("stopBtn").onclick = () => {
// 	mediaRecorder.stop();
// 	document.getElementById("startBtn").disabled = false;
// 	document.getElementById("stopBtn").disabled = true;
// };

// import { Conversation } from "../lib/elevenlabs/conversation.js";
// document.getElementById("startBtn").onclick = async function () {
// 	const token =
// 		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlcl9hZ2VudF8zNDAxa2Q3MjQ3NG5lbTI4emMzOHZ5YjNjZmo4X2NvbnZfMTkwMWtkN3B6aHQzZTAyOTczMjR0d2pqMDNyeCIsIm1ldGFkYXRhIjoie1wiYXBwbHlfZGV2X2Rpc2NvdW50XCI6IGZhbHNlLCBcInNpZ25lZF91cmxcIjogbnVsbCwgXCJzb3VyY2VcIjogbnVsbCwgXCJ2ZXJzaW9uXCI6IG51bGwsIFwiYnJhbmNoX2lkXCI6IG51bGx9IiwidmlkZW8iOnsicm9vbUpvaW4iOnRydWUsInJvb20iOiJyb29tX2FnZW50XzM0MDFrZDcyNDc0bmVtMjh6YzM4dnliM2NmajhfY29udl8xOTAxa2Q3cHpodDNlMDI5NzMyNHR3amowM3J4IiwiY2FuUHVibGlzaCI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlLCJjYW5QdWJsaXNoRGF0YSI6dHJ1ZX0sInN1YiI6InVzZXJfYWdlbnRfMzQwMWtkNzI0NzRuZW0yOHpjMzh2eWIzY2ZqOF9jb252XzE5MDFrZDdwemh0M2UwMjk3MzI0dHdqajAzcngiLCJpc3MiOiJBUElLZXlFeHRlcm5hbCIsIm5iZiI6MTc2NjU2NDI4NCwiZXhwIjoxNzY2NTY1MTg0fQ.7RiUIKgWWw1s43rFznjGGoO-x9jm4m0v_OWnN4_mMbU";
// 	const agentId = "agent_3401kd72474nem28zc38vyb3cfj8";
// 	const rawAudioProcessor = chrome.runtime.getURL("lib/elevenlabs/worklets/rawAudioProcessor.js");
// 	const audioConcatProcessor = chrome.runtime.getURL("lib/elevenlabs/worklets/audioConcatProcessor.js");
// 	const libsampleratePath = chrome.runtime.getURL("lib/elevenlabs/worklets/libsamplerate.js");

// 	console.log(rawAudioProcessor, audioConcatProcessor, libsampleratePath);
// 	try {
// 		await Conversation.startSession({
// 			conversationToken: token,
// 			agentId: agentId,
// 			// signedUrl: token,
// 			connectionType: "webrtc",
// 			workletPaths: {
// 				rawAudioProcessor: rawAudioProcessor,
// 				audioConcatProcessor: audioConcatProcessor,
// 			},
// 			libsampleratePath: libsampleratePath,
// 			clientTools: {
// 				// Tools will be registered here by service worker
// 			},
// 		});
// 	} catch (error) {
// 		console.error(error);
// 	}
// };
