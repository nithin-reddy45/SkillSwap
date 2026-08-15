import React, { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import "./CallModal.css";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

function CallModal({
  isOpen,
  onClose,
  callType, // "video" | "voice"
  partnerId,
  partnerName,
  currentUserId,
  currentUserName,
  incomingCallData,
  isInitiator,
}) {
  const [callState, setCallState] = useState(
    isInitiator ? "calling" : "incoming"
  ); // "calling" | "incoming" | "connected" | "ended"

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "voice");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const screenStreamRef = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const timerRef = useRef(null);

  const isVideo = callType === "video";

  // ================= CALL TIMER =================
  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ================= STREAM BINDING HOOK =================
  // Keeps video/audio elements attached whenever components mount or switch states
  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current && isVideo) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }

    if (remoteStreamRef.current && remoteStreamRef.current.getTracks().length > 0) {
      if (remoteVideoRef.current && isVideo) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(() => {});
      }
      if (remoteAudioRef.current && !isVideo) {
        remoteAudioRef.current.srcObject = remoteStreamRef.current;
        remoteAudioRef.current.play().catch(() => {});
      }
    }
  }, [callState, isVideo]);

  // ================= GET MEDIA STREAM =================
  const getMediaStream = async () => {
    try {
      const constraints = {
        video: isVideo
          ? {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              facingMode: "user",
            }
          : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && isVideo) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      return stream;
    } catch (err) {
      console.error("Camera/Mic access error:", err);
      alert("Unable to access camera or microphone. Please check browser permissions.");
      handleEndCall(true);
      return null;
    }
  };

  // ================= DRAIN QUEUED ICE CANDIDATES =================
  const processQueuedIceCandidates = async (pc) => {
    while (iceCandidatesQueue.current.length > 0) {
      const candidate = iceCandidatesQueue.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding queued ICE candidate:", e);
      }
    }
  };

  // ================= CREATE PEER CONNECTION =================
  const createPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Add all local tracks (Audio & Video)
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    // Handle Incoming Tracks from Partner
    pc.ontrack = (event) => {
      console.log("WebRTC ontrack received:", event.track.kind);

      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
      } else {
        remoteStreamRef.current.addTrack(event.track);
      }

      if (remoteVideoRef.current && isVideo) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch((e) => console.log("Remote video play error:", e));
      }

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStreamRef.current;
        remoteAudioRef.current.play().catch((e) => console.log("Remote audio play error:", e));
      }

      setCallState("connected");
    };

    // Send local ICE candidates to the other person via Socket.IO
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const targetId = isInitiator ? partnerId : incomingCallData?.from;
        if (targetId) {
          socket.emit("iceCandidate", {
            to: targetId,
            candidate: event.candidate,
          });
        }
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setCallState("connected");
      }
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed" || pc.iceConnectionState === "closed") {
        handleEndCall(false);
      }
    };

    return pc;
  };

  // ================= START OUTGOING CALL =================
  const startCall = async () => {
    const stream = await getMediaStream();
    if (!stream) return;

    const pc = createPeerConnection(stream);

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: isVideo,
      });

      await pc.setLocalDescription(offer);

      socket.emit("callUser", {
        userToCall: partnerId,
        signalData: offer,
        from: currentUserId,
        fromName: currentUserName,
        isVideo: isVideo,
      });
    } catch (err) {
      console.error("Error creating WebRTC offer:", err);
      handleEndCall(true);
    }
  };

  // ================= ACCEPT INCOMING CALL =================
  const acceptCall = async () => {
    const stream = await getMediaStream();
    if (!stream) return;

    const pc = createPeerConnection(stream);

    try {
      if (incomingCallData?.signal) {
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.signal));
        await processQueuedIceCandidates(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answerCall", {
          to: incomingCallData.from,
          signal: answer,
        });

        setCallState("connected");
      }
    } catch (err) {
      console.error("Error answering WebRTC call:", err);
      handleEndCall(true);
    }
  };

  // ================= REJECT CALL =================
  const rejectCall = () => {
    if (incomingCallData?.from) {
      socket.emit("rejectCall", {
        to: incomingCallData.from,
      });
    }
    handleEndCall(false);
  };

  // ================= SOCKET EVENT LISTENERS =================
  useEffect(() => {
    if (!isOpen) return;

    if (isInitiator) {
      startCall();
    }

    // Call Accepted by Partner (Caller side)
    const handleCallAccepted = async ({ signal }) => {
      const pc = peerConnectionRef.current;
      if (pc && signal) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          await processQueuedIceCandidates(pc);
          setCallState("connected");
        } catch (e) {
          console.error("Error on callAccepted setRemoteDescription:", e);
        }
      }
    };

    // Incoming ICE Candidate from Partner
    const handleIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      const pc = peerConnectionRef.current;

      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding live ICE candidate:", e);
        }
      } else {
        // Buffer candidate until remote description is ready
        iceCandidatesQueue.current.push(candidate);
      }
    };

    // Call Ended
    const handleCallEnded = () => {
      handleEndCall(false);
    };

    // Call Rejected
    const handleCallRejected = () => {
      alert(`${partnerName || "Partner"} is busy or declined the call.`);
      handleEndCall(false);
    };

    socket.on("callAccepted", handleCallAccepted);
    socket.on("iceCandidate", handleIceCandidate);
    socket.on("callEnded", handleCallEnded);
    socket.on("callRejected", handleCallRejected);

    return () => {
      socket.off("callAccepted", handleCallAccepted);
      socket.off("iceCandidate", handleIceCandidate);
      socket.off("callEnded", handleCallEnded);
      socket.off("callRejected", handleCallRejected);
    };
  }, [isOpen]);

  // ================= END CALL AND HARDWARE CLEANUP =================
  const handleEndCall = (notifyPeer = true) => {
    if (notifyPeer) {
      const targetId = isInitiator ? partnerId : incomingCallData?.from;
      if (targetId) {
        socket.emit("endCall", { to: targetId });
      }
    }

    // Stop local camera & mic
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Stop screen share
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    // Close WebRTC connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    remoteStreamRef.current = new MediaStream();
    iceCandidatesQueue.current = [];
    setCallState("ended");
    onClose();
  };

  // ================= CONTROLS =================
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current && isVideo) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isVideo || !peerConnectionRef.current) return;

    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === "video");

        if (videoSender) {
          videoSender.replaceTrack(screenTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenSharing();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      stopScreenSharing();
    }
  };

  const stopScreenSharing = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    if (localStreamRef.current && peerConnectionRef.current) {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      const senders = peerConnectionRef.current.getSenders();
      const videoSender = senders.find((s) => s.track && s.track.kind === "video");

      if (videoSender && cameraTrack) {
        videoSender.replaceTrack(cameraTrack);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }

    setIsScreenSharing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="call-modal-overlay">
      <div className={`call-modal-content ${isVideo ? "video-mode" : "voice-mode"}`}>
        
        {/* Hidden Audio Tag for Audio Streaming on Voice Calls */}
        <audio ref={remoteAudioRef} autoPlay playsInline />

        {/* INCOMING CALL SCREEN */}
        {callState === "incoming" && (
          <div className="incoming-call-screen">
            <div className="incoming-avatar-pulse">
              <div className="caller-avatar">
                {incomingCallData?.fromName?.charAt(0)?.toUpperCase() || "👤"}
              </div>
            </div>
            <h2>{incomingCallData?.fromName || "Someone"} is calling...</h2>
            <p className="call-type-tag">
              {incomingCallData?.isVideo ? "📹 Incoming Video Call" : "📞 Incoming Voice Call"}
            </p>

            <div className="incoming-actions">
              <button className="call-btn accept" onClick={acceptCall}>
                📞 Accept
              </button>
              <button className="call-btn decline" onClick={rejectCall}>
                ✕ Decline
              </button>
            </div>
          </div>
        )}

        {/* OUTGOING CALL / CONNECTED SCREEN */}
        {callState !== "incoming" && (
          <>
            {/* CALL HEADER */}
            <div className="call-header-bar">
              <div className="call-info">
                <h3>{partnerName || "Skill Partner"}</h3>
                <span className="call-status-badge">
                  {callState === "calling" && "🔔 Ringing..."}
                  {callState === "connected" && `🟢 ${formatDuration(callDuration)}`}
                </span>
              </div>
            </div>

            {/* VIDEO VIEW AREA */}
            {isVideo ? (
              <div className="video-streams-container">
                {/* REMOTE VIDEO (MAIN) */}
                <div className="remote-video-box">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="remote-video"
                  />
                  {callState === "calling" && (
                    <div className="calling-placeholder">
                      <div className="caller-avatar pulse">
                        {partnerName?.charAt(0)?.toUpperCase() || "👤"}
                      </div>
                      <p>Calling {partnerName}...</p>
                    </div>
                  )}
                </div>

                {/* LOCAL VIDEO (PIP) */}
                <div className="local-video-box">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`local-video ${isVideoOff ? "hidden" : ""}`}
                  />
                  {isVideoOff && (
                    <div className="camera-off-placeholder">
                      <span>📷 Camera Off</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* VOICE CALL VIEW */
              <div className="voice-call-screen">
                <div className={`voice-avatar-box ${callState === "connected" ? "active" : "pulse"}`}>
                  <div className="caller-avatar large">
                    {partnerName?.charAt(0)?.toUpperCase() || "👤"}
                  </div>
                  {callState === "connected" && (
                    <div className="sound-wave">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
                </div>
                <h2>{partnerName || "Skill Partner"}</h2>
                <p>{callState === "calling" ? "Calling..." : "Voice Connected 🟢"}</p>
              </div>
            )}

            {/* IN-CALL CONTROLS BAR */}
            <div className="call-controls-bar">
              {/* MUTE */}
              <button
                className={`control-btn ${isMuted ? "disabled" : ""}`}
                onClick={toggleMute}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? "🔇" : "🎙️"}
              </button>

              {/* CAMERA TOGGLE (Video only) */}
              {isVideo && (
                <button
                  className={`control-btn ${isVideoOff ? "disabled" : ""}`}
                  onClick={toggleVideo}
                  title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {isVideoOff ? "🚫" : "📹"}
                </button>
              )}

              {/* SCREEN SHARE (Video only) */}
              {isVideo && (
                <button
                  className={`control-btn ${isScreenSharing ? "active-screen" : ""}`}
                  onClick={toggleScreenShare}
                  title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
                >
                  🖥️
                </button>
              )}

              {/* END CALL */}
              <button
                className="control-btn end-call"
                onClick={() => handleEndCall(true)}
                title="End Call"
              >
                🔴
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default CallModal;
