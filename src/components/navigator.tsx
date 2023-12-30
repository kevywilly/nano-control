import {api} from "../api/nano-api";
import React, {useState} from "react";

const image_width = 1280;
const image_height = 720;
const half_width = image_width/2
const debug = false
const camera_resolution = 60
const image_divisions = 24
const panel_width=Math.round(image_width/2/(image_divisions/2));
export default function Navigator() {

    const [capture, setCapture] = useState(false)
    const [driveCmd, setDriveCmd] = useState({angle: 0, velocity: 0})
    const getDivisions = () => {
        let ar = []
        let left = 0
        let angle = -(camera_resolution/2)

        for (let i = 0; i <= image_divisions; i++) {
            let margin = angle > 0 ? "items-end" : (angle < 0 ? "items-start" : "items-center")

            ar.push({
                left: left - panel_width/2,
                width: panel_width,
                angle: -angle,
                margin: margin
            })
            left = left + panel_width
            angle = angle + camera_resolution/image_divisions
        }

        return ar
    }

    const handleAngleClick = (e: any) => {
        let velocity = 0
        let angle = Math.round((60/2)*(half_width-e.clientX)/half_width)

        if(angle >=-1.25 && angle <=1.25) {
            angle = 0
        }

        if(angle === 0) {
            velocity  = -(e.clientY - image_height / 2) / (image_height / 2)
        } else {
            velocity = (image_height-e.clientY)/image_height
        }

        if(angle === 0) {
            if(driveCmd.angle===0 && driveCmd.velocity!==0) {
                velocity = 0
            }
            if(!debug)
                api.methods.twist({linear: {x: velocity/2, y:0, z:0}, angular: {x: 0, y:0, z:0}})
        } else {
            if(!debug)
                if(angle >= 0) {
                    api.methods.turn(Math.abs(angle), 2*velocity)
                } else {
                    api.methods.turn(Math.abs(angle), -2*velocity)
                }

        }
        setDriveCmd({angle, velocity})
        if(capture) {

        }

    }

    const handleStop = () => {
        setDriveCmd({angle: 0, velocity: 0})
        api.methods.twist({linear: {x: 0, y:0, z:0}, angular: {x: 0, y:0, z:0}})

    }

    return(
        <div>
            <div className="fixed z-0 top-0">
                <img
                    className="aspect-video object-scale-down"
                    src={`${api.routes.stream_url}`}
                    alt="Jetson Rover Stream 3d"
                    content="multipart/x-mixed-replace; boundary=frame"
                />
            </div>
            <div className = "fixed top-0 z-20 w-full text-white font-semibold bg-black flex flex-row p-2 text-xs gap-4 justify-center">
                <span>cmd: (angle: {driveCmd.angle}, velocity: {driveCmd.velocity})</span>
                <span><button className={`border px-2 ${capture ? "border-green-500" : "border-gray-50"}`} onClick={() => setCapture(!capture)}>Capture {capture ? "On" : "OFF"}</button></span>
            </div>
            <div className = "fixed bottom-0 z-20 w-full text-white font-semibold bg-black flex flex-row p-2  ">
                <div className="flex-grow">
                <button className="bg-red-600 text-white font-bold py-1 px-4 rounded-md w-full" onClick={handleStop}>STOP</button>
                </div>
            </div>
            {getDivisions().map(d => (
                <div
                    key={d.angle}
                    className={`${d.angle === 0 ? 'bg-green-700 text-white' : ''} fixed z-10 opacity-80 border-r  h-full flex flex-col justify-center items-center text-white font-bold cursor-crosshair`}
                    style={{top: 0, left: d.left, width: d.width}}
                    onClick={(e) => handleAngleClick(e)}
                >
                    {d.angle}

                </div>
            ))}
            <div
                className="fixed z-50 h-12 bg-red-600 text-white font-bold opacity-50 flex flex-row justify-center items-center"
                style={{top: Math.round(image_height/2-12), width: image_width}}
                onClick={handleStop}
            >STOP</div>
        </div>
    )

}