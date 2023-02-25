import React from "react";
import Lottie from "lottie-react";
import BgAnimation from "./bgblur.json";
import "../../App.css"

const Bganim = () => <Lottie className="roomAnim" animationData={BgAnimation} loop={true} />;

export default Bganim;