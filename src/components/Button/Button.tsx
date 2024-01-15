import React from "react";
import { ButtonTypes } from "../../types";
import "./button.css";

const Button: React.FC<ButtonTypes> = ({ title, onClick }) => {
  return (
    <button onClick={onClick} className="saveButton">
      {title}
    </button>
  );
};

export default Button;
