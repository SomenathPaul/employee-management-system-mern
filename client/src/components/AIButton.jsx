import React from "react";

function AIButton({ name, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-gradient-to-r from-purple-500 hover:from-pink-500 hover:to-purple-500 to-pink-500 w-[200px] py-2 m-2 text-white cursor-pointer rounded transition duration-1000"
    >
      Enhance {name} with AI
    </button>
  );
}

export default AIButton;
