import React, {useState} from "react";
import {api, CategoryCount} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";


const DriveButton = (props: {command: string, onClick: (command: string) => void}) => {
    const {command, onClick} = props

    return (
        <button
            onClick={() => onClick(command)}
            className="rounded-md bg-blue-400 p-2"
        >{command}
        </button>
    )
}

const CategoryButton = (props: {category: CategoryCount, onClick: (category: CategoryCount) => void}) => {

    const {category, onClick} = props

        return (
            <div className="flex flex-col w-full gap-4 justify-center">
                <button
                    onClick={() => onClick(category)}
                    className="rounded-md bg-blue-400 w-full p-4"
                >{category.name}</button>
                <div className="text-center font-bold text-xl">{category.entries}</div>
            </div>
        )
}
export default function Dashboard() {

    const [cmd, setCmd] = useState<string>("stop")
    const [speed, setSpeed] = useState<number>(25)
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
                <div className="flex flex-col w-full xl:w-1/2 justify-center items-center gap-2">
                <img
                    className="aspect-square w-4/5 rounded-xl"
                    src={api.routes.stream_url}
                    alt="Jetson Rover Stream"
                    content="multipart/x-mixed-replace; boundary=frame"
                />
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <button onClick={handleAutoDrive}
                            className={`rounded-md ${autodrive ? "bg-green-500" : "bg-black"} text-white p-2`}>
                        Auto {autodrive ? "OFF" : "ON"}
                    </button>
                    <button onClick={speedDown} className="rounded-md bg-red-400 p-2 w-full">-</button>
                    <button className="rounded-md bg-green-100 p-2 w-full font-bold">{speed}</button>
                    <button onClick={speedUp} className="rounded-md bg-green-400 p-2 w-full">+</button>
                    <DriveButton command="left" onClick={handleCmdClick}/>
                    <DriveButton command="forward" onClick={handleCmdClick}/>
                    <DriveButton command="backward" onClick={handleCmdClick}/>
                    <DriveButton command="right" onClick={handleCmdClick}/>
                    <DriveButton command="stop" onClick={handleCmdClick}/>

                    { categories && categories.map((k) => (
                        <CategoryButton category={k} onClick={handleCategoryClick}/>
                    ))
                    }
                </div>


            </div>
        </>
    )
}
