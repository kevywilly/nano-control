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

const DRIVE_MODE: number = 0

const ControlPanel = (props : {onClick: (x: number, y: number, z: number, speed: number) => void}) => {
    const {onClick} = props
    return (
        <div className="grid grid-cols-3 text-white font-bold gap-4 w-1/2">
            <div className="col-span-full text-center">
                <button className="bg-green-800 px-2 py-6 rounded-md w-full" onClick={() => onClick(1.0, 0.0, 0.0, 0.3)}>
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

    const both_non_zero = (a?: number, b?: number): boolean => (((a || 0) !== 0) && ((b || 0) !== 0))

    const handleControlClick = (x: number, y: number, z: number, speed: number) => {

        if(both_non_zero(x, twist.linear?.x) || both_non_zero(y, twist.linear?.y) || both_non_zero(z, twist.angular?.z)) {
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

            <div className="text-white flex flex-row justify-center gap-10 items-center">

                    <div>Linear: ({twistResponse?.linear?.x}, {twistResponse?.linear?.y})</div>
                    <div>Angular: {twistResponse?.angular?.z}</div>
                    <button className={`font-bold rounded-md py-2 px-4 ${capture ? "bg-green-500" : "bg-red-600"}`} onClick={() => setCapture(!capture)}>{`Capture is: ${capture ? "ON" : "OFF"}`}</button>

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