import { GestureRecognizer, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let gestureRecognizer;
let webcamRunning = false;
const video = document.getElementById("webcam");
const status2 = document.getElementById('status2');

const createGestureRecognizer = async () => {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU"
      },
      runningMode: "VIDEO"
  });
};

status2.innerHTML = 'Please Wait...';

await createGestureRecognizer();

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableCam();
}
else {
  console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!gestureRecognizer) {
      alert("Please wait for gestureRecognizer to load");
      return;
  }
  if (webcamRunning === true) {
      webcamRunning = false;
  }
  else {
      webcamRunning = true;
  }
  // getUsermedia parameters.
  const constraints = {
      video: true
  };
  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
      status2.innerHTML = 'This app ready to use!';
  });
}
let lastVideoTime = -1;
let results = undefined;
let nextModelLast = false;

async function predictWebcam() {
  let nowInMs = Date.now();
  if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      results = gestureRecognizer.recognizeForVideo(video, nowInMs);
  }

  if (results.landmarks) {
    console.log(results);
      for (const landmarks of results.landmarks) {
          const categoryName = results.gestures[0][0].categoryName;
          if (categoryName === 'Thumb_Up') {
            rotate()
          } else if (categoryName === 'Open_Palm') {
            zoomCamera(-0.15);
          } else if (categoryName === 'Closed_Fist') {
            zoomCamera(0.15);
          } else if (categoryName === 'Pointing_Up') {
            rotateUp();
          } else if (categoryName === 'Victory') {
            if (!nextModelLast) {
              nextModelLast = true;
              nextModel();
              setTimeout(() => {
                nextModelLast = false;
              }, 5000)
            } 
          }
          console.log('categoryName: ', categoryName);
      }
  }

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
      console.log('webcam running');
      window.requestAnimationFrame(predictWebcam);
  }
}