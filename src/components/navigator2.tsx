import {api, TWIST_ZERO} from "../api/nano-api";
import React, {useRef, useState} from "react";

const NAVZERO: NavCommand = {x:0, y:0, w:0, h:0}

export default function Navigator2() {

    const [captureMode, setCaptureMode] = useState(false)
    const [driveMode, setDriveMode] = useState(false)
    const [navCommand, setNavCommand] = useState<NavCommand>(NAVZERO)
    const imgRef = useRef(null)

    const handleAngleClick = (e: any) => {

        console.log(e.target.offsetLeft)
        console.log(e.target.width)
        let cmd: NavCommand = NAVZERO;
        if(imgRef.current) {
            const w = imgRef.current["width"];
            const h = imgRef.current["height"];
            const x = e.clientX-imgRef.current["offsetLeft"];
            const y = e.clientY-imgRef.current["offsetTop"];
            cmd = {x,y,w,h};
            setNavCommand(cmd)
        }

        if(driveMode || captureMode) {
            const req: NavRequest = {cmd, captureMode, driveMode}
            api.methods.navigate(req)
        }

    }

    const handleStop = () => {
        api.methods.twist(TWIST_ZERO)
    }

    return(
        <div>
            <div className="flex flex-row justify-center items-center">
                <div style={{width: "768px"}} className="flex flex-col justify-center items-center gap">
                    <button className="bg-red-600 text-white font-bold py-1 px-4 w-full" style={{height: "32px"}} onClick={handleStop}>
                        STOP
                    </button>
                    <img
                        ref={imgRef}
                        className="aspect-video object-scale-down"
                        src={`${api.routes.stream_url}`}
                        alt="Jetson Rover Stream 3d"
                        content="multipart/x-mixed-replace; boundary=frame"
                        onClick={(e) => handleAngleClick(e)}
                        width="768px"
                        height="432px"
                    />
                    <button className="bg-red-600 text-white font-bold py-1 px-4 w-full" onClick={handleStop}>
                        STOP
                    </button>
                    <div className = "w-full text-white font-semibold bg-black flex flex-row p-2 text-xs gap-4 justify-around">
                        <button className={`border px-2 ${captureMode ? "border-green-500" : "border-red-500"}`} onClick={() => setCaptureMode(!captureMode)}>Capture Mode {captureMode ? "On" : "OFF"}</button>
                        <span className="flex-grow text-center">(x: {navCommand.x}, y: {navCommand.y}, w: {navCommand.w}, h: {navCommand.h})</span>
                        <button className={`border px-2 ${driveMode ? "border-green-500" : "border-red-500"}`} onClick={() => setDriveMode(!driveMode)}>Drive Mode {driveMode ? "On" : "OFF"}</button>
                    </div>
                </div>
            </div>
        </div>
    )

}