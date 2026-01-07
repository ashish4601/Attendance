// src/utils/faceService.js
import faceapi from 'face-api.js';
import canvas from 'canvas';
import { createCanvas } from 'canvas';
import fs from 'fs';

const { Canvas, Image, ImageData } = canvas;
import path from 'path';

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// ✅ Keep a promise to ensure models are loaded only once
let modelsLoaded = false;
let loadModelsPromise = null;

export const loadModels = async () => {
  if (modelsLoaded) return; // already loaded
  if (!loadModelsPromise) {
    const modelPath =  './face_detection/models'; 
    loadModelsPromise = Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
    ]).then(() => {
      modelsLoaded = true;
      console.log('FaceAPI Models Loaded');
    });
  }
  return loadModelsPromise;
};

// Convert base64 or buffer to canvas image
const loadImageFromBase64 = async (base64String) => {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const img = await canvas.loadImage(buffer);
  return img;
};

// Convert buffer directly to canvas image (for multer uploads)
export const loadImageFromBuffer = async (buffer) => {
  const img = await canvas.loadImage(buffer);
  return img;
};


export const getFaceDescriptor = async (base64Image) => {
  
  await loadModels();

  const img = await loadImageFromBase64(base64Image);
  


  const detection = await faceapi.detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) throw new Error('No face detected in the image');

  return detection.descriptor; // Float32Array
};

export const getFaceDescriptorFromBuffer = async (buffer) => {
  await loadModels();
  const img = await loadImageFromBuffer(buffer);

  const detection = await faceapi.detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!detection) throw new Error('No face detected in the image');
  return detection.descriptor;
};
