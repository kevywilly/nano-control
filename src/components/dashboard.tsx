import React, {useEffect, useState} from "react";
import {api, CategoryCount, Twist, TWIST_ZERO} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";
import {Joystick} from 'react-joystick-component';
import {IJoystickUpdateEvent} from "react-joystick-component/build/lib/Joystick";

/*
const between = (v: number, a1: number, a2: number) => {
    if(a1 < a2)
        return v >= a1 && v <= a2
    else
        return v <= a1 && v >= a2
}

 */
/*
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

 */
const CategoryButton = (props: {category: CategoryCount, onClick: (category: CategoryCount) => void}) => {

    const {category, onClick} = props

        return (
            <div className="flex flex-col w-full gap-2 justify-center">
                <button
                    onClick={() => onClick(category)}
                    className="button-xs bg-stone-700 w-full text-white"
                >{category.name}<br/>({category.count})</button>
                <div className="text-center font-bold text-xl"></div>
            </div>
        )
}

/*
const calcAngle = (x: number | null, y: number | null) => {
    x = x || 0
    y = y || 0
    let a = Math.acos(x / Math.sqrt((x * x) + (y * y))) * 57.2958
    a = y < 0 ? -a : a
    console.log(a)
    return a
}
*/

const DRIVE_MODE: number = 0

export default function Dashboard() {

    const [autodrive, setAutodrive] = useState(false)
    const queryClient = useQueryClient()
    const [twist, setTwist] = useState<Twist>(TWIST_ZERO)
    const [twistResponse, setTwistResponse] = useState<Twist>(TWIST_ZERO)


    const {
        data: categories
    } = useQuery<CategoryCount[], Error>(
        ['categories'],
        () => api.methods.getCategoryCounts()
    )

    useEffect(() => {
        api.methods.twist(twist).then(setTwistResponse)
    },[twist])

    const handleMove1 = (e: IJoystickUpdateEvent) => {

        let ly: number = 0
        let az: number  = 0

        let lx:number = (e.y || 0)

        if(DRIVE_MODE === 0) {
            ly = 0
            az = e.x || 0
            if(Math.abs(az) < Math.abs(lx)) {
                az = 0
            } else {
                lx = 0
            }
        } else {
            ly = e.x || 0
            az = 0
        }
        setTwist({
            linear: {x: lx, y: ly, z: 0},
            angular: {x: 0, y: 0, z: -az}
        })
    }

    const handleMove2 = (e: IJoystickUpdateEvent) => {
        setTwist({
            linear: {x: 0, y: 0, z: 0 },
            angular: {x: 0, y: 0, z: -(e.x || 0) }
        })
    }

    const handleStop = (e?: IJoystickUpdateEvent) => {
        setTwist({
            linear: {x: 0.0, y: 0.0, z: 0.0 },
            angular: {x: 0.0, y: 0.0, z: 0.0 }
        })
    }

    const handleAutoDrive = () => {
        api.methods.autodrive().then((v) => {
            setAutodrive(v.autodrive)
            if(!v.autodrive) {
                handleStop()
            }
        })
    }

    const speedDown = () => {

    }

    const speedUp = () => {

    }

    const handleCategoryClick = (category: CategoryCount) =>
        api.methods.collect_image(category.name).then(() => queryClient.invalidateQueries("categories"))

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row  items-center mt-12 gap-4">
                <div className="flex flex-col gap-2 justify-between">
                    <button onClick={speedUp} className="button-xs bg-green-400 w-full">+</button>
                    <button className="button-xs bg-gray-200 w-full">NA</button>
                    <button onClick={speedDown} className="button-xs bg-red-400 w-full">-</button>
                    <button onClick={handleAutoDrive}
                            className={`button-xs ${autodrive ? "bg-green-500 text-white" : "bg-gray-100 text-black"} w-full`}>
                        Auto {autodrive ? "OFF" : "ON"}
                    </button>
                </div>
                <img
                    className="rounded-lg"
                    src={`${api.routes.stream_url}`}
                    alt="Jetson Rover Stream 3d"
                    content="multipart/x-mixed-replace; boundary=frame"
                    width="640px"
                    height="480px"
                />
                <div className="flex flex-col gap-2 justify-between">
                    { categories && categories.map((k) => (
                        <CategoryButton key={k.name} category={k} onClick={handleCategoryClick}/>
                    ))
                    }
                </div>
            </div>

            <Joystick  size={DRIVE_MODE > 0 ? 100 : 150} sticky={false} baseColor="grey" stickColor="white" move={handleMove1} stop={handleStop} minDistance={10} />
            {DRIVE_MODE > 0 && (
                <Joystick  size={100} sticky={false} baseColor="grey" stickColor="white" move={handleMove2} stop={handleStop} minDistance={10} />
            )}

            <div className="text-white flex flex-row w-full justify-center">
                <div className="flex flex-row gap-2">
                    <div>Linear: ({twistResponse?.linear?.x}, {twistResponse?.linear?.y})</div>
                    <div>Angular: {twistResponse?.angular?.z}</div>
                </div>
            </div>

        </div>



    )
}
