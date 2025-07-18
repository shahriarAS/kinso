import React from "react";
import { message } from "antd";
import toast from "react-hot-toast";

type Props = {};

export default function DummyChatBox({}: Props) {
  return (
    <div className="w-1/3">
      <div className="border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col items-center justify-center relative bg-gradient-to-br from-white to-gray-100">
        <span className="text-2xl font-semibold text-gray-600 mb-4 flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="inline-block"
          >
            <circle cx="12" cy="12" r="10" fill="#64748B" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fontSize="12"
              fill="white"
              fontFamily="Arial"
              fontWeight="bold"
            >
              AI
            </text>
          </svg>
          AI Product Enhancer
        </span>
        <div
          className="w-full max-w-sm flex flex-col gap-2 bg-white/80 rounded-2xl shadow p-4 min-h-[340px] border border-gray-200 relative overflow-hidden cursor-pointer"
          onClick={() => {
            toast("AI Product Enhancer coming soon!");
          }}
          tabIndex={0}
          role="button"
          aria-disabled="true"
          style={{ pointerEvents: "auto" }}
        >
          {/* Example chat bubbles */}
          <div className="flex flex-col gap-4 pb-4 pointer-events-none select-none">
            {/* AI bubble */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                AI
              </div>
              <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl rounded-bl-none shadow-sm max-w-[75%] text-sm">
                Hi! I'm your AI assistant. How can I help enhance your product?
              </div>
            </div>
            {/* User bubble */}
            <div className="flex items-end gap-2 justify-end">
              <div className="bg-gray-400 text-white px-4 py-2 rounded-2xl rounded-br-none shadow max-w-[75%] text-sm">
                Suggest ways to improve product visibility.
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg">
                U
              </div>
            </div>
            {/* AI bubble */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                AI
              </div>
              <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl rounded-bl-none shadow-sm max-w-[75%] text-sm">
                Great idea! I can help with that soon.
              </div>
            </div>
          </div>
          {/* Disabled input area */}
          <div className="mt-auto flex items-center gap-2 pt-2 border-t border-gray-100 pointer-events-none select-none">
            <input
              type="text"
              disabled
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed outline-none"
            />
            <button
              disabled
              className="px-3 py-2 rounded-lg bg-gray-300 text-white opacity-60 cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
