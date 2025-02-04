"use client";

import React, { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";

const ImageEditor = () => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [defaultImage, setDefaultImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState<number>(0);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Helper function for MIME type mapping
  const getMimeType = (extension: string): string => {
    const mimeMap: { [key: string]: string } = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
    };
    return mimeMap[extension] || "application/octet-stream";
  };

  const readImageFile = async (filePath: string): Promise<string> => {
    try {
      // Read the file as binary
      const fileData = await readFile(filePath);
      const uint8Array = new Uint8Array(fileData);

      // Convert binary data to Base64
      const base64 = Buffer.from(uint8Array).toString("base64");
      const mimeType = getMimeType(filePath.split(".").pop() || "");

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error("Error reading image file:", error);
      return "";
    }
  };

  const impostImage = async () => {
    try {
      const selectedImage = await open({
        multiple: false,
        directory: false,
        filters: [{ name: "Image", extensions: ["jpg", "jpeg", "png"] }],
      });

      if (typeof selectedImage === "string") {
        const base64Data = await readImageFile(selectedImage);

        console.log("base64Data +++", base64Data);
        setImageData(base64Data);
        setDefaultImage(base64Data);
        setImagePath(selectedImage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const applyEffect = async (effect: string) => {
    if (!imagePath) return;
    setIsProcessing(true);

    try {
      const newPath: string = await invoke(effect, {
        path: imagePath,
      });

      const base64Data = await readImageFile(newPath);
      setImageData(base64Data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyBrightness = async () => {
    if (!imagePath) return;
    setIsProcessing(true);

    try {
      const newPath: string = await invoke("brightness", {
        value: brightness,
        path: imagePath,
      });

      const base64Data = await readImageFile(newPath);
      setImageData(base64Data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImage = () => {
    setImageData(defaultImage);
  };

  return (
    <div className="w-full">
      <div className="w-full mt-5 flex justify-center gap-4">
        <button className="editor-button" onClick={impostImage}>
          Import Image
        </button>
        <button
          onClick={() => applyEffect("blur")}
          className="editor-button"
          disabled={!imageData || isProcessing}
        >
          Blur
        </button>
        <button
          onClick={() => applyEffect("gray")}
          className="editor-button"
          disabled={!imageData || isProcessing}
        >
          Gray Scale
        </button>
        <button
          onClick={() => applyEffect("crop")}
          className="editor-button"
          disabled={!imageData || isProcessing}
        >
          Apply Crop
        </button>
        <button
          onClick={() => applyBrightness()}
          className="editor-button"
          disabled={!imageData || isProcessing}
        >
          Apply Brightness
        </button>
        <button
          onClick={() => applyEffect("flip")}
          className="editor-button"
          disabled={!imageData || isProcessing}
        >
          Flip
        </button>
        <button
          onClick={() => resetImage()}
          className="editor-button"
          disabled={!imageData || isProcessing}
        >
          Reset
        </button>
      </div>

      {isProcessing && (
        <div className="w-full mt-5 text-[#007BFF]">Processing...</div>
      )}

      {imageData && (
        <div className="w-full">
          <div className="w-full h-[400px] mt-5 flex justify-center items-center">
            <picture className="w-[400px] h-[400px] overflow-hidden m-auto rounded-lg shadow-xl">
              <img
                className="w-[400px] h-[400px] object-cover rounded-lg"
                src={imageData}
                alt="Uploaded Image"
                onLoad={() => {
                  setIsProcessing(false);
                }}
              />
            </picture>
          </div>
          <div className="w-full mt-5">
            <label htmlFor="Brightness" className="text-[16px] text-[#333]">
              Brightness :{" "}
              <input
                type="range"
                min={0}
                max={100}
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="mr-2 w-[200px]"
              />
            </label>
          </div>
          <div className="w-full"></div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
