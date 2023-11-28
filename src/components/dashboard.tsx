import React, {useEffect, useState} from "react";
import {api, CategoryCount, Twist, TWIST_ZERO} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";
import {Joystick} from 'react-joystick-component';
import {IJoystickUpdateEvent} from "react-joystick-component/build/lib/Joystick";

const DEFAULT_DRIVE_POWER = 0.5
const DEFAULT_TURN_POWER = 0.5
const drive_sensitivity = 0.5
const turn_sensitivity = 0.4

const CategoryButton = (props: {category: CategoryCount, onClick: (category: CategoryCount) => void}) => {

    const {category, onClick} = props

        return (
            <div className="flex flex-col w-full gap-2 justify-center">
                <button
                    onClick={() => onClick(category)}
                    className="button-xs w-full"
                >Grab: {category.name}<br/>({category.count})</button>

            </div>
        )
}

const ControlPanel = (props : {onClick: (x: number, y: number, z: number, speed: number) => void}) => {
    const {onClick} = props
    return (
        <div className="grid grid-cols-3 text-white font-bold gap-2 w-full">
            <div className="col-span-full text-center">
                <button className="control-button bg-green-800" onClick={() => onClick(1.0, 0.0, 0.0, DEFAULT_DRIVE_POWER)}>
                    Forward
                </button>
            </div>
            <div className="col-span-1">
                <button className="control-button bg-orange-800" onClick={() => onClick(0.0, 0.0, 1.0, DEFAULT_TURN_POWER)}>
                    Left
                </button>
            </div>
            <div className="col-span-1">
                <button className="control-button bg-red-800" onClick={() => onClick(0.0, 0.0, 0.0, 0.0)}>
                    Stop
                </button>
            </div>
            <div className="col-span-1">
                <button className="control-button bg-orange-800" onClick={() => onClick(0.0, 0.0, -1.0, DEFAULT_TURN_POWER)}>
                    Right
                </button>
            </div>
            <div className="col-span-full">
                <button className="control-button bg-yellow-800" onClick={() => onClick(-1.0, 0.0, 0.0, DEFAULT_DRIVE_POWER)}>
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
    const [capture, setCapture] = useState(false)
    const [autodrive, setAutodrive] = useState(false)


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

    const handleAutodrive = () => {
        setAutodrive(false)
        api.methods.autodrive().then((e) => setAutodrive(e.status))
    }

    const handleControlClick = (x: number, y: number, z: number, speed: number) => {

        if(not_zero(x, twist.linear?.x) || not_zero(y, twist.linear?.y) || not_zero(z, twist.angular?.z)) {
            setTwist(TWIST_ZERO)
            return
        }

        setTwist({
            linear: {x: x*speed*drive_sensitivity, y: y*speed*drive_sensitivity, z: 0},
            angular: {x: 0, y: 0, z: z*speed*turn_sensitivity}
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

    const handleStop = () => {
        setTwist(TWIST_ZERO)
    }
    const handleJoy = (e: IJoystickUpdateEvent, turn?: boolean) => {

        let x: number = 0
        let y: number=0
        let z:number=0

        if(e.type === "stop") {
            handleStop()
            return
        }

        const vel = (e.distance || 0) / 100.0

        if(turn) {
            x = (e.y || 0)
            z = -(e.x || 0)*turn_sensitivity
        }
        else {
            switch (e.direction) {
                case "FORWARD":
                    x = vel
                    break
                case "BACKWARD":
                    x = -vel
                    break
                case "RIGHT":
                    y = -vel
                    break
                case "LEFT":
                    y = vel
            }
        }

        setTwist({linear: {x,y,z:0}, angular:{x:0, y:0, z}})

    }

    const handleCategoryClick = (category: CategoryCount) =>
        api.methods.collect_image(category.name).then(() => queryClient.invalidateQueries("categories"))

    return (
        <div>
            <div className=" w-full absolute fixed top-0 -z-10">
                <img
                    className="rounded-lg w-full aspect-square sm:aspect-video"
                    src={`${api.routes.stream_url}`}
                    alt="Jetson Rover Stream 3d"
                    content="multipart/x-mixed-replace; boundary=frame"

                />
            </div>
        <div className="flex flex-col items-center gap-4 mt-10 z-100">
                <div className="flex flex-row gap-2 justify-between w-full">
                    { categories && categories.map((k) => (
                        <CategoryButton key={k.name} category={k} onClick={handleCategoryClick}/>
                    ))
                    }
                </div>
            <div className="text-white">v: ({twistResponse?.linear?.x?.toFixed(2)}, {twistResponse?.linear?.y.toFixed(2)}, {twistResponse?.angular?.z.toFixed(2)})</div>
        </div>

            <div className="w-full absolute fixed bottom-6 z-100 flex flex-col gap-4 items-center justify-between">
                <div className="text-white flex flex-row justify-center gap-4 items-center text-xs">
                <Joystick size={120} sticky={false} baseColor="white" stickColor="green" move={handleJoy} stop={handleStop} minDistance={5} />
                <button onClick={handleStop} className="button bg-red-400 text-white">Stop</button>
                <Joystick size={120} sticky={false} baseColor="white" stickColor="orange" move={(e) => handleJoy(e, true)} stop={handleStop} minDistance={5} />
                </div>

                <div className="text-white flex flex-row justify-center gap-4 items-center text-xs">
                    <button className={`toggle-button ${autodrive ? "bg-green-500" : "bg-red-600"}`} onClick={handleAutodrive}>
                        {`Autodrive is: ${autodrive ? "ON" : "OFF"}`}
                    </button>
                    <button className={`toggle-button ${capture ? "bg-green-500" : "bg-red-600"}`} onClick={() => setCapture(!capture)}>
                        {`Capture is: ${capture ? "ON" : "OFF"}`}
                    </button>
                </div>
            </div>

        </div>

    )
}

/*



 */