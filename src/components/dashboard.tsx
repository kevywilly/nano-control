import React, {useEffect, useState} from "react";
import {api, CategoryCount, Twist, TWIST_ZERO} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";
import {Joystick} from 'react-joystick-component';
import {IJoystickUpdateEvent} from "react-joystick-component/build/lib/Joystick";

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

const ControlPanel = (props : {onClick: (x: number, y: number, z: number, speed: number) => void}) => {
    const {onClick} = props
    return (
        <div className="grid grid-cols-3 text-white font-bold gap-2 w-1/2">
            <div className="col-span-full text-center">
                <button className="bg-green-800 px-2 py-5 rounded-md w-full" onClick={() => onClick(1.0, 0.0, 0.0, 0.3)}>
                    Forward
                </button>
            </div>
            <div className="col-span-1">
                <button className="bg-orange-800 px-2 py-6 rounded-md w-full" onClick={() => onClick(0.0, 0.0, 1.0, 0.2)}>
                    Left
                </button>
            </div>
            <div className="col-span-1">
                <button className="bg-red-800 px-2 py-6 rounded-md w-full" onClick={() => onClick(0.0, 0.0, 0.0, 0.0)}>
                    Stop
                </button>
            </div>
            <div className="col-span-1">
                <button className="bg-orange-800 px-2 py-6 rounded-md w-full" onClick={() => onClick(0.0, 0.0, -1.0, 0.2)}>
                    Right
                </button>
            </div>
            <div className="col-span-full">
                <button className="bg-yellow-800 px-2 py-6 rounded-md w-full" onClick={() => onClick(-1.0, 0.0, 0.0, 0.3)}>
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
    const [capture, setCapture] = useState(true)


    const {
        data: categories
    } = useQuery<CategoryCount[], Error>(
        ['categories'],
        () => api.methods.getCategoryCounts()
    )

    useEffect(() => {
        api.methods.twist(twist).then(setTwistResponse)
    },[twist])

    const not_zero = (a?: number, b?: number): boolean => (((a || 0) !== 0) && ((b || 0) !== 0))

    const handleControlClick = (x: number, y: number, z: number, speed: number) => {

        if(not_zero(x, twist.linear?.x) || not_zero(y, twist.linear?.y) || not_zero(z, twist.angular?.z)) {
            setTwist(TWIST_ZERO)
            return
        }

        setTwist({
            linear: {x: x*speed, y: y*speed, z: 0},
            angular: {x: 0, y: 0, z: z*speed}
        })

        let cat: string | undefined = undefined

        if(capture) {
            if(x > 0) {
                cat = "forward"
            } else if (z > 0) {
                cat = "left"
            } else if (z < 0) {
                cat = "right"
            }
        }
        if(cat) {
            api.methods.collect_image(cat).then(() => queryClient.invalidateQueries("categories"))
        }
    }

    const handleJoy = (e: IJoystickUpdateEvent) => {

        let y: number = 0
        let z: number = -(e.x || 0)
        let x: number = (e.y || 0)

        if(Math.abs(z) < Math.abs(x)) {
            z = 0
        } else {
            x = 0
        }

        setTwist({
            linear: {x: x, y: y, z: 0},
            angular: {x: 0, y: 0, z: z}
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
            <div className="text-white flex flex-row justify-center gap-4 items-center text-xs">
                    <div>v: {twistResponse?.linear?.x},{twistResponse?.linear?.y},{twistResponse?.angular?.z})</div>
                    <button className={`font-bold text-xs rounded-md py-2 px-4 ${capture ? "bg-green-500" : "bg-red-600"}`} onClick={() => setCapture(!capture)}>{`Capture is: ${capture ? "ON" : "OFF"}`}</button>
            </div>

            <div className="flex flex-row gap-4 items-center w-full justify-center">
                <ControlPanel onClick={handleControlClick}/>
                <Joystick  size={80} sticky={false} baseColor="white" stickColor="blue" move={handleJoy} stop={handleJoy} minDistance={5} />
            </div>

        </div>



    )
}

/*



 */