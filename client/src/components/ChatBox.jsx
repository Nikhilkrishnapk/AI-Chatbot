import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Messages from "./Messages";

const ChatBox = () => {
  const { selectedChat, theme } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  // for automatically scroll the section to latest one.
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const onSubmit = async (e) => {
    e.preventDefault();
  };
  return (
    <>
      <div className="m-5 flex flex-1 flex-col justify-between max-md:mt-14 md:m-10 xl:mx-30 2xl:pr-40">
        {/* chat messages */}

        <div ref={containerRef} className="mb-5 flex-1 overflow-y-scroll">
          {messages.length === 0 && (
            <div className="text-primary flex h-full flex-col items-center justify-center gap-2">
              <img
                className="w-full max-w-56 sm:max-w-68"
                src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
                alt=""
              />
              <p className="mt-5 text-center text-4xl text-gray-400 sm:text-6xl dark:text-white">
                Ask Anything...
              </p>
            </div>
          )}
          {messages.map((message, index) => (
            <Messages key={index} message={message} />
          ))}

          {/* loading animation */}

          {loading && (
            <div className="loader flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 dark:bg-white"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 dark:bg-white"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 dark:bg-white"></div>
            </div>
          )}
        </div>

        {mode === "image" && (
          <label className="mx-auto mb-3 inline-flex items-center gap-2 text-sm">
            <p className="dark:text-primary text-xs">Published Generated Image to Community</p>
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
          </label>
        )}

        {/* prompt input box */}
        <form
          onSubmit={onSubmit}
          className="bg-primary/20 dark:bg-[#583C79]?30 border-primary mx-auto flex w-full max-w-2xl items-center gap-4 rounded-full border p-3 pl-4 dark:border-[#80609F]/30"
        >
          <select
            onChange={(e) => setMode(e.target.value)}
            value={mode}
            className="dark:text-primary cursor-pointer pr-2 pl-3 text-sm outline-none"
          >
            <option className="dark:text-primary dark:bg-purple-900" value="text">
              Text
            </option>
            <option className="dark:text-primary dark:bg-purple-900" value="image">
              Image
            </option>
          </select>
          <input
            onChange={(e) => setPrompt(e.target.value)}
            type="text"
            value={prompt}
            placeholder="Ask anything here..."
            className="dark:text-primary w-full flex-1 text-sm outline-none"
          />
          <button disabled={loading}>
            <img
              className="w-8 cursor-pointer"
              src={loading ? assets.stop_icon : assets.send_icon}
              alt="no img"
            />
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatBox;
