import React, {useState} from "react";
import {api, CategoryCount} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";


const DriveButton = (props: {command: string, onClick: (command: string) => void}) => {
    const {command, onClick} = props

    return (
        <button
            onClick={() => onClick(command)}
            className="rounded-md bg-blue-400 p-4 w-1/2"
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

    const queryClient = useQueryClient()

    const {
        data: categories
    } = useQuery<CategoryCount[], Error>(
        ['categories'],
        () => api.methods.get_category_counts()
    )

    const handleCmdClick = (command: string) => {
        if(cmd === command) {
            setCmd("stop")
            api.methods.drive("stop", 15)
            return
        }
        setCmd(command)
        api.methods.drive(command, 15)
    }

    const handleCategoryClick = (category: CategoryCount) =>
        api.methods.collect_image(category.name).then(() => queryClient.invalidateQueries("categories"))

    return (
        <>
            <div className="flex flex-row w-full gap-8">
                <img
                    className="aspect-square w-1/2 rounded-xl"
                    src={api.routes.stream_url}
                    alt="Jetson Rover Stream"
                    content="multipart/x-mixed-replace; boundary=frame"
                />
                <div className="flex flex-col items-center gap-4 w-1/2">

                        <h1 className="font-bold text-xl text-center mb-4">Movement</h1>
                        <div className="grid grid-cols-3 text-center w-full gap-4">
                            <div className="col-span-3"><DriveButton command="forward" onClick={handleCmdClick}/></div>
                            <div><DriveButton command="left" onClick={handleCmdClick}/></div>
                            <div><DriveButton command="stop" onClick={handleCmdClick}/></div>
                            <div><DriveButton command="right" onClick={handleCmdClick}/></div>
                            <div className="col-span-full"><DriveButton command="backward" onClick={handleCmdClick}/></div>
                        </div>
                        <h1 className="font-bold text-xl text-center mb-4">Data Collection</h1>
                        <div className="grid grid-cols-4 gap-2">
                            { categories && categories.map((k) => (
                                <CategoryButton category={k} onClick={handleCategoryClick}/>
                            ))
                            }
                        </div>
                </div>
            </div>
        </>
    )
}
