# Face Detection Models

This directory should contain the face-api.js model files required for face recognition.

## Required Models

Download the following model files from the face-api.js repository:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Place these files in this directory:

1. **tiny_face_detector_model-weights_manifest.json**
2. **tiny_face_detector_model-shard1**
3. **face_landmark_68_model-weights_manifest.json**
4. **face_landmark_68_model-shard1**
5. **face_recognition_model-weights_manifest.json**
6. **face_recognition_model-shard1**
7. **face_recognition_model-shard2**

## Alternative: Use CDN

The models are automatically loaded from the local `/models` directory. If you prefer to use a CDN, update the `MODEL_URL` in `src/lib/faceDetection.ts` to:

```typescript
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
```

This will use pre-hosted models from a CDN without requiring local downloads.
