import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

import FeatureTemplate from "./FeatureTemplate";
function ObjectDetection() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [object, setObject] = useState(null);
  const [prevObjects, setPrevObjects] = useState([]);
  const net = [];
  const runCoco = async () => {
    // const net = await cocossd.load();
    setInterval(() => {
      detect(net);
    }, 8000);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const objects = await net.detect(video);

      // Compare the objects detected in the current frame to those detected in the previous frame
      const newObjects = objects.filter(
        (object) =>
          !prevObjects.some((prevObject) => object.class === prevObject.class)
      );

      if (newObjects.length > 0) {
        setObject(newObjects[0].class);
      }
      const ctx = canvasRef.current.getContext("2d");
      // Update the previous objects with the current objects
      setPrevObjects(objects);
      drawRect(objects, ctx);
    }
  };

  useEffect(() => {
    runCoco();
  }, []);

  // Draw rectangle box
  const drawRect = (detection, ctx) => {
    detection.forEach((prediction) => {
      // Get prediction results
      const [x, y, width, height] = prediction["bbox"];
      let text = prediction["class"];

      // Set styling
      const color = "red";
      ctx.strokeStyle = color;
      ctx.font = "20px Arial";
      ctx.fillStyle = "white";

      // Draw rectangles and text
      ctx.beginPath();
      ctx.fillText(text, x, y);
      ctx.rect(x, y, width, height);
      ctx.stroke();

      if ("speechSynthesis" in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        const voices = synth.getVoices();
        const voice = voices.find((v) => v.name === "Daniel"); // Change this to the name of the desired voice
        utterance.voice = voice;
        synth.speak(utterance);
      }

      text = text.toUpperCase();
      let str = text.slice(1, text.length);
      text = text.charAt(0) + str.toLowerCase();
      setObject(text);
    });
  };
  return (
    <FeatureTemplate>
      <div className="p-4 h-3/4">
        <h1 className="text-2xl font-semibold border-l-4 border-b-4 inline-block border-l-orange-400 border-b-orange-400 px-2 text-left">
          Object Detection
        </h1>
        <div className="border my-2 p-2 h-full">
          <Webcam
            ref={webcamRef}
            muted={true}
            className="block"
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              width: 640,
              height: 480,
              borderRadius: "20px",
            }}
          />

          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              width: 640,
              height: 480,
            }}
          />
        </div>

        {/* Here goes Object names */}
        <div className="h-28 flex justify-center items-start">
          <h1 className="text-2xl border-b-4 border-blue-300 inline-block border-l-4 p-2">
            {object}
          </h1>
        </div>
      </div>
    </FeatureTemplate>
  );
}

export default ObjectDetection;
