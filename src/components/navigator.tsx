import {api, TWIST_ZERO} from "../api/nano-api";
import React, {useEffect, useRef, useState} from "react";
import {IJoystickUpdateEvent} from "react-joystick-component/build/lib/Joystick";
import {Joystick} from "react-joystick-component";

const NAVZERO: NavCommand = {x:0, y:0, w:0, h:0}

const ToggleButton = (props: {label: string, status: boolean, onClick: () => void}) => {
    const {label, status, onClick} = props
    const style = status ? "opacity-100" : "opacity-40"
    return (
        <button className={`w-1/5 mx-2 py-1 rounded-md bg-blue-900 text-blue-50 font-bold ${style}`} onClick={onClick}>
            {label} {status ? "On" : "Off"}
        </button>
    )
}
const StopButton = (props: {cls?: string, onClick: () => void}) => {
    const {cls, onClick} = props
    return (
        <button className={`bg-blue-900 text-blue-50 font-semibold py-1 px-4 w-full opacity-90 ${cls}`}  onClick={onClick}>
            STOP!
        </button>
    )
}

interface TagsResponse {
    blocked?: number;
    free?: number;
}
export default function Navigator() {

    const [captureMode, setCaptureMode] = useState(false)
    const [driveMode, setDriveMode] = useState(false)
    const [navCommand, setNavCommand] = useState<NavCommand>(NAVZERO)
    const imgRef = useRef(null)
    const [joy, setJoy] = useState<IJoystickUpdateEvent>()
    const [captured, setCaptured] = useState<string>()
    const [lastTwist, setLastTwist] = useState(TWIST_ZERO)
    const [tags, setTags] = useState<TagsResponse>({blocked: 0, free: 0})
    const [autoDrive, setAutoDrive] = useState({status: false})

    useEffect(() => {
        if(joy)
            api.methods.joystick(joy).then(setLastTwist)
    }, [joy])

    useEffect(() => {
        api.methods.get_tags().then(setTags)
        api.methods.getAutodrive().then(setAutoDrive)
    },[])


    const handleJoy = (e:IJoystickUpdateEvent) => {
        if(e.type === 'stop') {
            handleStop()
        } else {
            setJoy(undefined)
        }
    }

    const handleTags = (tag: string) => {
        api.methods.add_tag(tag).then(setTags)
    }

    const handleAngleClick = (e: any) => {

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
            api.methods.navigate(req).then(r => {
                if(r.captured) {
                    setCaptured(r.captured);
                }
            })
        }

    }

    const handleStop = () => {
        api.methods.twist(TWIST_ZERO);
    }

    const handleAutoDrive = () => {
        api.methods.toggleAutodrive().then(setAutoDrive);
    }

    return(
        <div className="w-full flex flex-row justify-center items-start h-screen bg-blue-800">
            <div className="flex flex-col justify-start items-center w-4/5 md:w-2/5">
                <span className="text-base font-semibold p-2 text-blue-50">~ Hello Felix ~</span>
                <StopButton cls="rounded-t-lg" onClick={handleStop}/>
                <img
                    ref={imgRef}
                    className="w-full cursor-crosshair"
                    src={`${api.routes.stream_url}`}
                    alt="Jetson Rover Stream 3d"
                    content="multipart/x-mixed-replace; boundary=frame"
                    onClick={(e) => handleAngleClick(e)}

                />
                <StopButton cls="rounded-b-lg" onClick={handleStop}/>
                <div className = "w-full text-white font-semibold bg-blue-800 flex flex-row p-2 text-xs gap-4 justify-between items-center rounded-b-lg">
                    <ToggleButton label="Capture" status={captureMode} onClick={() => setCaptureMode(!captureMode)}/>
                    <ToggleButton label="Autodrive" status={autoDrive.status} onClick={handleAutoDrive}/>
                    <ToggleButton label="Auto Nav" status={driveMode} onClick={() => setDriveMode(!driveMode)}/>
                </div>
                <div className="flex flex-row justify-between items-center w-full">
                    <button className="h-full p-4 bg-red-600 text-white w-1/4 font-xs" onClick={()=>handleTags('blocked')}>Blocked ({tags?.blocked})</button>
                    <Joystick
                        size={100}
                        sticky={false}
                        baseColor="#333"
                        stickColor="blue"
                        throttle={200}
                        move={handleJoy}
                        stop={handleStop}
                    />
                    <button className="h-full p-4 bg-green-700 text-white w-1/4 font-xs" onClick={() => handleTags('free')}>Free ({tags?.free})</button>
                </div>
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="mt-4 text-xs text-white">Nav: ( x: {navCommand.x}, y: {navCommand.y}, w: {navCommand.w}, h: {navCommand.h} )</div>
                    <div className="mt-4 text-xs text-white">
                        Joy: {lastTwist.linear?.x.toFixed(3)}, {lastTwist.linear?.y.toFixed(3)}, {lastTwist.angular?.z.toFixed(3)}
                    </div>
                </div>
                <div className="mt-4 text-xs text-white">Cap: {captured}</div>

            </div>
        </div>
    )

}