import React, {useEffect, useState} from "react";
import {api, CategoryCount, Velocity, VELOCITY_ZERO} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";
import {Joystick} from 'react-joystick-component';
import {IJoystickUpdateEvent} from "react-joystick-component/build/lib/Joystick";

const DEFAULT_DRIVE_POWER = 0.32
const DEFAULT_TURN_POWER = 0.16

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
    const [velocity, setVelocity] = useState<Velocity>(VELOCITY_ZERO)
    const [velocityResponse, setVelocityResponse] = useState<Velocity>(VELOCITY_ZERO)
    const [capture, setCapture] = useState(false)
    const [autodrive, setAutodrive] = useState(false)

    const {
        data: categories
    } = useQuery<CategoryCount[], Error>(
        ['categories'],
        () => api.methods.getCategoryCounts().catch(() => [])
    )

    useEffect(() => {
        api.methods.drive(velocity).then(setVelocityResponse)
    },[velocity])

    const not_zero = (a?: number, b?: number): boolean => (((a || 0) !== 0) && ((b || 0) !== 0))

    const handleAutodrive = () => {
        setAutodrive(false)
        api.methods.autodrive().then((e) => setAutodrive(e.status))
    }

    const handleControlClick = (x: number, y: number, z: number, speed: number) => {

        return 
        if(not_zero(x, velocity.x) || not_zero(y, velocity.y) || not_zero(z,velocity.z)) {
            setVelocity(VELOCITY_ZERO)
            return
        }

        setVelocity({x: x*speed, y: y*speed, z: z*speed})

        /*
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
        */
    }

    const handleJoy = (e: IJoystickUpdateEvent) => {

        let y: number = e.x || 0
        let x: number = e.y || 0
        let z: number = 0

        setVelocity({x,y,z})
        
    }

    const handleJoy2 = (e: IJoystickUpdateEvent) => {

        return

        
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
            <div className="text-white">v: ({velocityResponse?.x.toFixed(2)}, {velocityResponse?.y.toFixed(2)}, {velocityResponse?.z.toFixed(2)})</div>
        </div>

            <div className="w-full absolute fixed bottom-6 z-100 flex flex-col gap-4 items-center justify-between">

                <div className="flex flex-row gap-16">
                <Joystick size={120} sticky={false} baseColor="white" stickColor="blue" move={handleJoy} stop={handleJoy} minDistance={5} />
                <Joystick size={120} sticky={false} baseColor="white" stickColor="blue" move={handleJoy2} stop={handleJoy2} minDistance={5} />
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