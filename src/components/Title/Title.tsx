import React from "react";
import { TitleTypes } from "../../types";
import "./title.css";
const Title: React.FC<TitleTypes> = ({ title }) => {
  return (
    <div className="titleText">
      <h3>{title}</h3>
    </div>
  );
};

export default Title;
