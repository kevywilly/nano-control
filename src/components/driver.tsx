// https://github.com/elmarti/react-joystick-component
import { Joystick } from 'react-joystick-component';
import React, {useEffect, useState} from "react";
import {IJoystickUpdateEvent} from "react-joystick-component/build/lib/Joystick";
import {api} from "../api/nano-api";

export default function Driver() {

    const [joy, setJoy] = useState<IJoystickUpdateEvent>()

    useEffect(() => {
        if(joy)
            api.methods.joystick(joy)
    }, [joy])

    const handleJoy = (e:IJoystickUpdateEvent) => {
        setJoy(e)
    }

    return <div className="flex flex-col items-center justify-around mt-4 gap-4 w-full h-full">
        <img
            className="w-full md:w-1/2 rounded-lg"
            src={`${api.routes.stream_url}`}
            alt="Jetson Rover Stream 3d"
            content="multipart/x-mixed-replace; boundary=frame"
        />
        <Joystick
            size={100}
            sticky={false}
            baseColor="#333"
            stickColor="blue"
            throttle={200}
            move={handleJoy}
            stop={handleJoy}
        />
    </div>
}