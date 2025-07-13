import { GestureRecognizer, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let gestureRecognizer;
let webcamRunning = false;
const video = document.getElementById("webcam");
const status2 = document.getElementById("status2");

status2.innerHTML = "Memuat model gesture...";

// Inisialisasi model gesture
const createGestureRecognizer = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
  });
  status2.innerHTML = "Gesture siap digunakan!";
};

await createGestureRecognizer();

// Fungsi untuk dihubungkan dengan tombol di index.html
window.enableCam = function () {
  if (!gestureRecognizer) {
    alert("Model gesture belum siap.");
    return;
  }

  if (webcamRunning) return;

  webcamRunning = true;

  const constraints = {
    video: true,
  };

  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
    status2.innerHTML = "Kamera aktif. Gerakan tangan dapat dikenali.";
  });
};

let lastVideoTime = -1;
let nextModelLast = false;

async function predictWebcam() {
  const nowInMs = Date.now();

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const result = await gestureRecognizer.recognizeForVideo(video, nowInMs);

    if (result.landmarks && result.gestures.length > 0) {
      const gesture = result.gestures[0][0].categoryName;
      status2.innerText = "Gesture: " + gesture;

      // Hubungkan dengan fungsi global dari index.html
      switch (gesture) {
        case "Thumb_Up":
          if (window.rotate) window.rotate();
          break;
        case "Open_Palm":
          if (window.zoomCamera) window.zoomCamera(-0.15);
          break;
        case "Closed_Fist":
          if (window.zoomCamera) window.zoomCamera(0.15);
          break;
        case "Pointing_Up":
          if (window.rotateUp) window.rotateUp();
          break;
        case "Victory":
          if (!nextModelLast && window.nextModel) {
            nextModelLast = true;
            window.nextModel();
            setTimeout(() => (nextModelLast = false), 3000);
          }
          break;
        default:
          // gesture lain, tidak dihandle
          break;
      }
    }
  }

  if (webcamRunning) {
    window.requestAnimationFrame(predictWebcam);
  }
}
