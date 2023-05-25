import React, {useState} from "react";
import {api, CategoryCount} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";
import {AppSettings} from "../constants";
import { Joystick } from 'react-joystick-component';
import {IJoystickUpdateEvent} from "react-joystick-component/build/lib/Joystick";


const DriveButton = (props: {command: string, onClick: (command: string) => void}) => {
    const {command, onClick} = props

    return (
        <button
            onClick={() => onClick(command)}
            className="rounded-md bg-blue-400 p-2 w-full"
        >{command}
        </button>
    )
}

const handleMove = (e: IJoystickUpdateEvent) => {
    console.log(e)
}

const handleStop = (e: IJoystickUpdateEvent) => {
    console.log(e)
}
const CategoryButton = (props: {category: CategoryCount, onClick: (category: CategoryCount) => void}) => {

    const {category, onClick} = props

        return (
            <div className="flex flex-col w-full gap-1 justify-center">
                <button
                    onClick={() => onClick(category)}
                    className="rounded-full bg-black w-full p-2 text-white text-xs"
                >{category.name}<br/>{category.entries}</button>
                <div className="text-center font-bold text-xl"></div>
            </div>
        )
}
export default function Dashboard() {

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

    const handleAutoDrive = () => {
        api.methods.autodrive().then((v) => setAutodrive(v.autodrive))
    }

    const handleCmdClick = (command: string) => {
        if(cmd === command) {
            setCmd("stop")
            api.methods.drive("stop", speed)
            return
        }
        setCmd(command)
        drive(command, speed)
    }

    const drive = (command: string, speed: number) => {
        api.methods.drive(command, speed)
    }

    const speedDown = () => {
        if(speed >= 5) {
            const s = speed-5
            setSpeed(s)
            drive(cmd, s)
        }

    }

    const speedUp = () => {
        if(speed <=95) {
            const s = speed + 5
            setSpeed(s)
            drive(cmd, s)
        }
    }

    const handleCategoryClick = (category: CategoryCount) =>
        api.methods.collect_image(category.name).then(() => queryClient.invalidateQueries("categories"))

    return (
        <>
            <div className="flex flex-col xl:flex-row  w-full gap-4 items-center">
                <div className="flex flex-col w-full lg:w-1/2 justify-center items-center gap-2">
                <img
                    className="aspect-square w-full rounded-xl"
                    src={api.routes.stream_url}
                    alt="Jetson Rover Stream"
                    content="multipart/x-mixed-replace; boundary=frame"
                />
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <DriveButton command="left" onClick={handleCmdClick}/>
                    <DriveButton command="forward" onClick={handleCmdClick}/>
                    <DriveButton command="right" onClick={handleCmdClick}/>
                    <button onClick={speedUp} className="rounded-full bg-green-400 p-2 w-full font-extrabold">+</button>

                    <DriveButton command="slide_left" onClick={handleCmdClick}/>
                    <DriveButton command="stop" onClick={handleCmdClick}/>
                    <DriveButton command="slide_right" onClick={handleCmdClick}/>
                    <button onClick={speedDown} className="rounded-full bg-red-400 p-2 w-full font-extrabold">-</button>

                    <div className="col-span-3 w-full">
                        <DriveButton command="backward" onClick={handleCmdClick}/>
                    </div>
                    <button className="rounded-full bg-gray-200 p-2 w-full font-bold">{speed}</button>

                    { categories && categories.map((k) => (
                        <CategoryButton category={k} onClick={handleCategoryClick}/>
                    ))
                    }
                    <button onClick={handleAutoDrive}
                            className={`rounded-full ${autodrive ? "bg-green-500 text-white" : "bg-gray-100 text-black"}  p-2 w-full`}>
                        Auto {autodrive ? "OFF" : "ON"}
                    </button>
                </div>


            </div>
            <Joystick size={100} sticky={false} baseColor="indigo" stickColor="blue" move={handleMove} stop={handleStop}></Joystick>
        </>
    )
}
