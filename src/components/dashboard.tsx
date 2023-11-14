import React, {useEffect, useState} from "react";
import {api, CategoryCount, Velocity, VELOCITY_ZERO} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";
import {Joystick} from 'react-joystick-component';
import {IJoystickUpdateEvent} from "react-joystick-component/build/lib/Joystick";

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

    const handleAutodrive = () => {
        setAutodrive(false)
        api.methods.autodrive().then((e) => setAutodrive(e.status))
    }

    const handleJoy = (e: IJoystickUpdateEvent) => {

        let x: number = (e.y || 0)*0.5
        let y: number = -(e.x || 0)*0.5
        let z: number = 0

        if(Math.abs(y) < .25) {
            y = 0;
        }
        setVelocity({x,y,z})
    }

    const handleJoy2 = (e: IJoystickUpdateEvent) => {
        const x = 0
        const y = 0
        const z = -(e.x || 0)*2.0

        setVelocity({x,y,z})

        
    }

    const handleCategoryClick = (category: CategoryCount) =>
        api.methods.collect_image(category.name).then(() => queryClient.invalidateQueries("categories"))

    return (
        <div>
            <div className="w-full absolute fixed top-0 -z-10 flex flex-row gap-2">
                <img
                    className="rounded-lg w-1/2 aspect-square sm:aspect-video"
                    src={`${api.routes.stream_url(0)}`}
                    alt="Jetson Rover Stream 3d"
                    content="multipart/x-mixed-replace; boundary=frame"

                />
                <img
                    className="rounded-lg w-1/2 aspect-square sm:aspect-video"
                    src={`${api.routes.stream_url(1)}`}
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
                <Joystick size={120} sticky={false} baseColor="white" stickColor="blue" move={handleJoy} stop={handleJoy} minDistance={20} />
                <Joystick size={120} sticky={false} baseColor="white" stickColor="blue" move={handleJoy2} stop={handleJoy2} minDistance={20} />
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