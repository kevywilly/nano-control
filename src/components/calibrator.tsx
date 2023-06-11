import React, {useEffect, useState} from "react";
import {api, CalibrationCounts, CategoryCount} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";
import {AppSettings} from "../constants";
import { Joystick } from 'react-joystick-component';
import {IJoystickUpdateEvent} from "react-joystick-component/build/lib/Joystick";

const between = (v: number, a1: number, a2: number) => {
    if(a1 < a2)
        return v >= a1 && v <= a2
    else
        return v <= a1 && v >= a2
}
const get_cmd = (a: number) => {
    if(between(a, -22.5, 22.5))
        return "slide_right"
    if(between(a, 22.5, 67.5))
        return "forward_right"
    if(between(a, 67.5, 112.5))
        return "forward"
    if(between(a, 112.5, 157.5))
        return "forward_left"
    if( a > 157.5 || a < (-157.5))
        return "slide_left"
    if(between(a, -112.5, -157.5))
        return "backward_left"
    if(between(a, -112.5, -67.5))
        return "backward"
    if(between(a, -67.5, -22.5))
        return "backward_right"

}

const calcAngle = (x: number | null, y: number | null) => {
    x = x || 0
    y = y || 0
    let a = Math.acos(x / Math.sqrt((x * x) + (y * y))) * 57.2958
    a = y < 0 ? -a : a
    console.log(a)
    return a
}

export default function Calibrator() {

    const queryClient = useQueryClient()

    const {
        data: calibration_counts
    } = useQuery<CalibrationCounts, Error>(
        ['calibration_counts'],
        () => api.methods.get_calibration_counts()
    )

    const handleSaveImgs = (img: string) => api.methods.collect_calibration_images(img).then(() => queryClient.invalidateQueries("calibration_counts"))

    const stream = (camera: string) => (
        <img
            className="aspect-video w-480 rounded-md border-4 border-stone-400 border-opacity-50"
            src={`${api.routes.stream_url}/${camera.toUpperCase()}`}
            alt="Jetson Rover Stream Left"
            content="multipart/x-mixed-replace; boundary=frame"
            width={480}
        />

    )
    return (
        <div className="flex flex-col items-center justify-center mt-16 gap-4 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {stream("LEFT")}
                {stream("RIGHT")}
            </div>
            <button className="button-xs ml-8 w-full max-w-lg" onClick={() => handleSaveImgs("stereo")}>
                Capture ({calibration_counts?.stereo})
            </button>
        </div>
    )
}
