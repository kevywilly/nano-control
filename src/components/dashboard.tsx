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

    const {
        data: categories
    } = useQuery<CategoryCount[], Error>(
        ['categories'],
        () => api.methods.getCategoryCounts().catch(() => [])
    )

    useEffect(() => {
        api.methods.drive(velocity).then(setVelocityResponse)
    },[velocity])

    const handleJoy = (e: IJoystickUpdateEvent, turn?: boolean) => {
        console.log(e)
        let x: number = 0
        let y: number=0
        let z:number=0

        if(e.type === "stop") {
            setVelocity({x,y,z})
            return
        }

        const vel = (e.distance || 0) / 100.0

        switch (e.direction) {
            case "FORWARD":
                if(!turn)
                    x = vel
                break
            case "BACKWARD":
                if(!turn)
                    x = -vel
                break
            case "RIGHT":
                if(!turn) {
                    y = -vel
                }
                else {
                    z = -vel
                }
                break
            case "LEFT":
                if(!turn) {
                    y = vel
                }
                else {
                    z = vel
                }
        }

        setVelocity({x,y,z})
    }

    const handleCategoryClick = (category: CategoryCount) =>
        api.methods.collect_image(category.name).then(() => queryClient.invalidateQueries("categories"))

    return (
        <div>
            <div className="w-full absolute fixed top-0 -z-10 flex flex-row gap-2">
                <img
                    className="rounded-lg w-1/2 aspect-square"
                    src={`${api.routes.stream_url(1)}`}
                    alt="Jetson Rover Stream 3d"
                    content="multipart/x-mixed-replace; boundary=frame"

                />
                <img
                    className="rounded-lg w-1/2 "
                    src={`${api.routes.stream_url(0)}`}
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
            <div className="bg-black opacity-50 rounded-md p-4 text-white font-bold text-xl">v: ({((velocityResponse?.x || 0)*100).toFixed(0)}, {((velocityResponse?.y || 0)*100).toFixed(0)}, {((velocityResponse?.z || 0)*100).toFixed(0)})</div>
        </div>

            <div className="w-full absolute fixed bottom-6 z-100 flex flex-col gap-4 items-center justify-between">

                <div className="flex flex-row gap-16">
                <Joystick size={120} sticky={false} baseColor="white" stickColor="green" move={handleJoy} stop={handleJoy} minDistance={5} />
                <Joystick size={120} sticky={false} baseColor="white" stickColor="orange" move={(e) => handleJoy(e, true)} stop={(e) => handleJoy(e, true)} minDistance={5} />
                </div>

            </div>

        </div>

    )
}

/*



 */