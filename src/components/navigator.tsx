import {api, TWIST_ZERO} from "../api/nano-api";
import React, {useRef, useState} from "react";

const NAVZERO: NavCommand = {x:0, y:0, w:0, h:0}

const ToggleButton = (props: {label: string, status: boolean, onClick: () => void}) => {
    const {label, status, onClick} = props
    const style = status ? "opacity-100" : "opacity-40"
    return (
        <button className={`w-1/5 mx-2 py-1 rounded-md bg-blue-900 text-blue-50 font-bold ${style}`} onClick={onClick}>
            {label} {status ? "Active" : "Désactivé"}
        </button>
    )
}
const StopButton = (props: {cls?: string, onClick: () => void}) => {
    const {cls, onClick} = props
    return (
        <button className={`bg-blue-900 text-blue-50 font-semibold py-1 px-4 w-full opacity-90 ${cls}`}  onClick={onClick}>
            ARRÊT!
        </button>
    )
}
export default function Navigator() {

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
        <div className="w-full flex flex-row justify-center items-start h-screen bg-blue-800">
        <div className="flex flex-col justify-start items-center w-4/5 md:w-1/2">
            <span className="text-base font-semibold p-2 text-blue-50">~ Bonjour Felix ~</span>
            <StopButton cls="rounded-t-lg" onClick={handleStop}/>
            <img
                ref={imgRef}
                className="w-full"
                src={`${api.routes.stream_url}`}
                alt="Jetson Rover Stream 3d"
                content="multipart/x-mixed-replace; boundary=frame"
                onClick={(e) => handleAngleClick(e)}
            />
            <StopButton cls="rounded-b-lg" onClick={handleStop}/>
            <div className = "w-full text-white font-semibold bg-blue-800 flex flex-row p-2 text-xs gap-4 justify-between items-center rounded-b-lg">
                <ToggleButton label="Capturer" status={captureMode} onClick={() => setCaptureMode(!captureMode)}/>
                <span>( x: {navCommand.x}, y: {navCommand.y}, w: {navCommand.w}, h: {navCommand.h} )</span>
                <ToggleButton label="Conduire" status={driveMode} onClick={() => setDriveMode(!driveMode)}/>
            </div>
        </div>
        </div>
    )

}