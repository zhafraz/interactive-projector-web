import { GestureRecognizer, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let gestureRecognizer;
const video = document.getElementById("webcam");
const status2 = document.getElementById("status2");
let lastVideoTime = -1;
let nextModelLast = false;

status2.innerHTML = "Memuat model gesture...";

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

// ✅ Pindahkan predictWebcam ke global window agar bisa diakses dari index.html
window.predictWebcam = async function predictWebcam() {
  const nowInMs = Date.now();

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const result = await gestureRecognizer.recognizeForVideo(video, nowInMs);

    if (result.landmarks && result.gestures.length > 0) {
      const gesture = result.gestures[0][0].categoryName;
      status2.innerText = "Gesture: " + gesture;

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
      }
    }
  }

  if (window.webcamRunning) {
    window.requestAnimationFrame(window.predictWebcam);
  }
};
