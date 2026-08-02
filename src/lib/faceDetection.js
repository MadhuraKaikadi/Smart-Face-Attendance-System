import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;

  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
}

export async function detectFace(image) {
  try {
    // ✅ Ensure models loaded
    if (!modelsLoaded) {
      await loadModels();
    }

    const detection = await faceapi
      .detectSingleFace(
        image,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.5,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection;
  } catch (error) {
    console.error('Error detecting face:', error);
    return null;
  }
}

export async function detectAllFaces(input) {
  try {
    if (!modelsLoaded) {
      await loadModels();
    }

    const detections = await faceapi
      .detectAllFaces(
        input,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.5,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
}

export function compareFaces(descriptor1, descriptor2) {
  return faceapi.euclideanDistance(descriptor1, descriptor2);
}

export function isFaceMatch(distance, threshold = 0.45) {
  return distance < threshold;
}