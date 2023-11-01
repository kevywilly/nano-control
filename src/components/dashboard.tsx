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
const SPEED = 0.5

const CategoryButton = (props: {category: CategoryCount, onClick: (category: CategoryCount) => void}) => {

    const {category, onClick} = props

        return (
            <div className="flex flex-col w-full gap-2 justify-center">
                <button
                    onClick={() => onClick(category)}
                    className="button-xs bg-stone-700 w-full text-white"
                >Capture: {category.name}<br/>({category.count})</button>
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

const ControlPanel = (props : {onClick: (x: number, y: number, z: number) => void}) => {
    const {onClick} = props
    return (
        <div className="grid grid-cols-3 text-white font-bold gap-4 w-1/2">
            <div className="col-span-full text-center">
                <button className="bg-green-800 px-2 py-6 rounded-md w-full" onClick={() => onClick(1.0, 0.0, 0.0)}>
                    Forward
                </button>
            </div>
            <div className="col-span-1">
                <button className="bg-orange-800 px-2 py-6 rounded-md w-full" onClick={() => onClick(0.0, 0.0, 1.0)}>
                    Left
                </button>
            </div>
            <div className="col-span-1">
                <button className="bg-red-800 px-2 py-6 rounded-md w-full" onClick={() => onClick(0.0, 0.0, 0.0)}>
                    Stop
                </button>
            </div>
            <div className="col-span-1">
                <button className="bg-orange-800 px-2 py-6 rounded-md w-full" onClick={() => onClick(0.0, 0.0, -1.0)}>
                    Right
                </button>
            </div>
            <div className="col-span-full">
                <button className="bg-yellow-800 px-2 py-6 rounded-md w-full" onClick={() => onClick(-1.0, 0.0, 0.0)}>
                    Reverse
                </button>
            </div>
        </div>
    )
}
export default function Dashboard() {

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

    const handleControlClick = (x: number, y: number, z: number) => {
        setTwist({
            linear: {x: x*SPEED, y: y*SPEED, z: 0},
            angular: {x: 0, y: 0, z: z*SPEED}
        })
    }

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

    const handleCategoryClick = (category: CategoryCount) =>
        api.methods.collect_image(category.name).then(() => queryClient.invalidateQueries("categories"))

    return (
        <div className="flex flex-col items-center gap-4 mt-10">
                <div className="flex flex-row gap-2 justify-between w-full">
                    { categories && categories.map((k) => (
                        <CategoryButton key={k.name} category={k} onClick={handleCategoryClick}/>
                    ))
                    }
                </div>
                <img
                    className="rounded-lg"
                    src={`${api.routes.stream_url}`}
                    alt="Jetson Rover Stream 3d"
                    content="multipart/x-mixed-replace; boundary=frame"
                    width="640px"
                    height="480px"
                />

            <div className="text-white flex flex-row w-full justify-center">
                <div className="flex flex-row gap-2">
                    <div>Linear: ({twistResponse?.linear?.x}, {twistResponse?.linear?.y})</div>
                    <div>Angular: {twistResponse?.angular?.z}</div>
                </div>
            </div>
            <div className="flex flex-row gap-4 items-center w-full justify-center">
                <ControlPanel onClick={handleControlClick}/>
                <Joystick  size={DRIVE_MODE > 0 ? 100 : 150} sticky={false} baseColor="grey" stickColor="white" move={handleMove1} stop={handleMove1} minDistance={10} />
            </div>

        </div>



    )
}

/*



 */