import React, { useState } from "react";
import { writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { downloadDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-shell"; 

const HomePage = () => {
  const [name, setName] = useState("");

  const createFile = async () => {
    if (!name) return;
    const downloadDirPath = await downloadDir();
    const filePath = `${downloadDirPath}/hello.txt`;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    await writeTextFile(filePath, `Hello, ${name}!`, { dir: BaseDirectory.Download });
    await open(downloadDirPath);
  };

  return (
    <div className="w-screen h-screen p-8">
      <h1>Hello, {name}!</h1>

      <div className="w-full">
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Enter your name:
          </label>
          <input
            id="nameInput"
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Name input"
            placeholder="Enter your name"
          />
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          onClick={createFile}
        >
          Save
        </button>
      </div>
      <div className="w-full"></div>
      <div className="w-full"></div>
    </div>
  );
};

export default HomePage;
