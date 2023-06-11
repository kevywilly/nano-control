import {api} from "../api/nano-api";
import React from "react";


export enum VideoMode {
    mode3d = "3d",
    modeRaw = "raw",
    modeMapped = "calibrated"
}

export default function VideoStream(props: {mode: VideoMode}) {

        if(props.mode === VideoMode.mode3d) {
            return <img
                className="-mt-12 aspect-video w-full max-w-3xl rounded-md border-4 border-stone-400 border-opacity-50"
                src={`${api.routes.stream_url}/3D`}
                alt="Jetson Rover Stream Left"
                content="multipart/x-mixed-replace; boundary=frame"
            />
        } else {
            return <div className="flex flex-col xl:flex-row gap-4 items-center -mt-12">
                <img className="aspect-video w-full w-3/4 max-w-3xl rounded-md border-4 border-stone-400 border-opacity-50"
                    src={`${api.routes.stream_url}/${props.mode === VideoMode.modeMapped ? 'mleft' : 'left'}`}
                alt="Jetson Rover Stream Left"
                content="multipart/x-mixed-replace; boundary=frame"
                />
                <img className="aspect-video w-full w-3/4 max-w-3xl rounded-md border-4 border-stone-400 border-opacity-50"
                     src={`${api.routes.stream_url}/${props.mode === VideoMode.modeMapped ? 'mright' : 'right'}`}
                     alt="Jetson Rover Stream Left"
                     content="multipart/x-mixed-replace; boundary=frame"
                />
            </div>
        }


}
