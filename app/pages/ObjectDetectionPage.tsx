import React, { useEffect, useRef, useState } from 'react';

const API_KEY = '4SFFXiMYtEJQlaUUNOq4aZfwfwWZtyOlQUiGK0EjhQSV9NFiZwUkJQQJ99BDACYeBjFXJ3w3AAAIACOGz9CmY';
const API_ENDPOINT = 'https://customvisionforcrimedetection.cognitiveservices.azure.com/';

interface Prediction {
  tagName: string;
  probability: number;
  boundingBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export const ObjectDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Camera access error:', error);
      }
    };

    enableCamera();
  }, []);

  const captureFrame = async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg');
      });
    }

    return null;
  };

  const sendToAPI = async (imageBlob: Blob) => {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Prediction-Key': API_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBlob,
      });

      const result = await response.json();
      setPredictions(result.predictions || []);
    } catch (error) {
      console.error('Detection API error:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const frame = await captureFrame();
      if (frame) {
        await sendToAPI(frame);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Draw boxes when predictions update
  useEffect(() => {
    const drawBoxes = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      predictions.forEach((pred) => {
        const { left, top, width, height } = pred.boundingBox;
        const x = left * canvas.width;
        const y = top * canvas.height;
        const w = width * canvas.width;
        const h = height * canvas.height;

        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = 'lime';
        ctx.font = '16px sans-serif';
        ctx.fillText(
          `${pred.tagName} (${(pred.probability * 100).toFixed(1)}%)`,
          x + 4,
          y + 18
        );
      });
    };

    drawBoxes();
  }, [predictions]);

  return (
    <div className="p-4 relative w-full max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Real-Time Object Detection</h1>

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded"
          style={{ transform: 'scaleX(-1)' }} // mirror for selfie cam
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Detected Objects:</h2>
        <ul className="list-disc pl-5">
          {predictions.length === 0 && <li>No objects detected yet.</li>}
          {predictions.map((obj, index) => (
            <li key={index}>
              {obj.tagName} - {(obj.probability * 100).toFixed(1)}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ObjectDetection;
