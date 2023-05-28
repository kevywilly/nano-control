import React, {useEffect, useState} from "react";
import {api, CategoryCount} from "../api/nano-api";
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
const CategoryButton = (props: {category: CategoryCount, onClick: (category: CategoryCount) => void}) => {

    const {category, onClick} = props

        return (
            <div className="flex flex-col w-full gap-2 justify-center">
                <button
                    onClick={() => onClick(category)}
                    className="rounded-xl bg-stone-700 w-full p-2 text-white text-xs"
                >{category.name}<br/>{category.entries}</button>
                <div className="text-center font-bold text-xl"></div>
            </div>
        )
}

const calcAngle = (x: number | null, y: number | null) => {
    x = x || 0
    y = y || 0
    let a = Math.acos(x / Math.sqrt((x * x) + (y * y))) * 57.2958
    a = y < 0 ? -a : a
    console.log(a)
    return a
}

export default function Dashboard2() {

    const [cmd, setCmd] = useState<string>("stop")
    const [speed, setSpeed] = useState<number>(AppSettings.defaultSpeed)
    const [autodrive, setAutodrive] = useState(false)
    const queryClient = useQueryClient()

    const {
        data: categories
    } = useQuery<CategoryCount[], Error>(
        ['categories'],
        () => api.methods.get_category_counts()
    )

    useEffect(() => {
        api.methods.drive(cmd, speed)
    },[cmd,speed])

    const handleMove1 = (e: IJoystickUpdateEvent) => {
        const s = Math.round((e.distance || 0)/10.0)*0.1
        const c = get_cmd(calcAngle(e.x, e.y)) || "stop"

        if (s !== speed || c !== cmd) {
            setCmd(c)
            setSpeed(s)
        }
    }

    const handleMove2 = (e: IJoystickUpdateEvent) => {

        const c = e.direction?.toLowerCase() || "stop"
        const s = Math.round((e.distance || 0)/10.0)*0.1
        if(e.direction === "LEFT" || e.direction === "RIGHT") {
            if (s !== speed || c !== cmd) {
                setCmd(e.direction?.toLowerCase())
                setSpeed(s)
            }

        }
    }

    const handleStop = (e: IJoystickUpdateEvent) => {
        setCmd("stop")
    }

    const handleAutoDrive = () => {
        api.methods.autodrive().then((v) => {
            setAutodrive(v.autodrive)
            if(!v.autodrive) {
                setCmd("stop")
            }
        })
    }

    const speedDown = () => {
        if(speed >= .05) {
            const s = speed-.05
            setSpeed(s)
        }
    }

    const speedUp = () => {
        if(speed <=0.95) {
            const s = speed + .05
            setSpeed(s)
        }
    }

    const handleCategoryClick = (category: CategoryCount) =>
        api.methods.collect_image(category.name).then(() => queryClient.invalidateQueries("categories"))

    return (
        <div className="overflow-x-hidden overflow-y-hidden">
            <div className="absolute flex flex-col z-10 top-10 right-5 gap-3">
                { categories && categories.map((k) => (
                    <CategoryButton key={k.name} category={k} onClick={handleCategoryClick}/>
                ))
                }
            </div>
            <div className="absolute flex flex-col z-10 left-5 top-10 gap-3">
                <button onClick={speedUp} className="rounded-xl bg-green-400 p-2 w-full font-extrabold">+</button>
                <button className="rounded-xl bg-gray-200 p-2 w-full font-bold">{Math.round(speed*100)}</button>
                <button onClick={speedDown} className="rounded-xl bg-red-400 p-2 w-full font-extrabold">-</button>
                <button onClick={handleAutoDrive}
                        className={`rounded-full ${autodrive ? "bg-green-500 text-white" : "bg-gray-100 text-black"}  p-2 w-full`}>
                    Auto {autodrive ? "OFF" : "ON"}
                </button>
            </div>
            <div className="absolute w-full  top-5 z-0 flex flex-col items-center">
                <img
                    className="aspect-square w-full max-w-3xl rounded-lg"
                    src={api.routes.stream_url}
                    alt="Jetson Rover Stream"
                    content="multipart/x-mixed-replace; boundary=frame"
                />
            </div>
            <div className="absolute z-10 bottom-1/3 flex flex-row w-full justify-center gap-24">
                <Joystick  size={140} sticky={false} baseColor="grey" stickColor="white" move={handleMove1} stop={handleStop} minDistance={30} />
                <Joystick  size={140} sticky={false} baseColor="grey" stickColor="white" move={handleMove2} stop={handleStop} minDistance={30} />
            </div>

        </div>
    )
}
