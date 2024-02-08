import React, {useEffect, useState} from "react";
import {api, TWIST_ZERO} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";
import {Joystick} from 'react-joystick-component';
import {IJoystickUpdateEvent} from "react-joystick-component/build/lib/Joystick";
import {CameraIcon} from "@heroicons/react/20/solid";

const drive_sensitivity = .6;
const turn_sensitivity = .2;
const img_height = 540;
const img_width = 960;


const CategoryButton = (props: { category: CategoryCount, onClick: (category: CategoryCount) => void }) => {
    const {category, onClick} = props;
    return (

        <button
            onClick={() => onClick(category)}
            className="button-xs"
        >{category.name}: ({category.count})
        </button>
    );
}

export default function Dashboard() {
    const queryClient = useQueryClient()
    const [twist, setTwist] = useState<Twist>(TWIST_ZERO)
    const [twistResponse, setTwistResponse] = useState<Twist>(TWIST_ZERO)
    const [autodrive, setAutodrive] = useState(false)
    const [xy, setXy] = useState<XYMap>({x: 0, y: 0, width: img_width, height: img_height})
    const [trainingType, setTrainingType] = useState<TrainingType>()

    const {
        data: categories
    } = useQuery<CategoryCount[], Error>(
        ['categories'],
        () => api.methods.getCategoryCounts()
    )
    useEffect(() => {
        api.methods.getTrainingType().then(setTrainingType)
    },[])

    useEffect(() => {
        api.methods.twist(twist).then(setTwistResponse)
    }, [twist])

    const handleAutodrive = () => {
        setAutodrive(false)
        api.methods.toggleAutodrive().then((e) => setAutodrive(e.status))
    }

    const moveCamera = (margin: string) => {
        let x = document.getElementById("camera");
        x!.style.marginLeft = margin;
        x!.style.transition = ".2s"
    }
    const takeSnapshot = () => {
        setTimeout(() => {
            moveCamera("5px");
            setTimeout(() => {
                moveCamera("-5px")
                setTimeout(() => {
                    moveCamera("0px");
                },50)
            }, 50)
        }, 50);

        api.methods.snapshot()
    }

    const handleImageClick = (e: any) => {
        if(trainingType?.type !== 'PATH') {
            return;
        }
        const x = e.clientX
        const y = e.clientY
        const payload = {...xy, x, y}
        setXy(payload)
        api.methods.collectXY(payload)
    }
    const handleStop = () => {
        setTwist({linear: {x:0, y:0, z: 0}, angular: {x: 0, y: 0, z:0}})
    }
    const handleJoy = (e: IJoystickUpdateEvent, turn?: boolean) => {

        let x: number = 0
        let y: number = 0
        let z: number = 0

        if (e.type === "stop") {
            handleStop()
            return
        }

        //const vel = (e.distance || 0) / 100.0

        if (turn) {
            x = (e.y || 0)
            z = -(e.x || 0)
        } else {
            const d = (e.distance || 0)/100.0
            switch(e.direction) {
                case "FORWARD":
                    x = d
                    break
                case "BACKWARD":
                    x = -d
                    break
                case "LEFT":
                    y = -d
                    break
                case "RIGHT":
                    y = d
                    break

            }

            //x = (e.y || 0)
            //y = (e.x || 0)
        }

        x = x * drive_sensitivity;
        y = y * drive_sensitivity;
        z = z * turn_sensitivity;

        setTwist({linear: {x, y, z: 0}, angular: {x: 0, y: 0, z}})

    }

    const handleCategoryClick = (category: CategoryCount) => {
        if(trainingType?.type === 'OBSTACLE') {
            api.methods.collectImage(category.name).then(() => queryClient.invalidateQueries("categories"))
        }
    }

    return (
        <div>

            <div className={`flex flex-row w-full fixed top-0 -z-10 gap-2`} >
                <div className="flex flex-col items-center gap-y-6">
                    <div style={{width: "960px", height:"540px"}}>
                        <img
                            className="rounded-lg"
                            width="960px"
                            height="540px"
                            src={`${api.routes.stream_url}`}
                            alt="Jetson Rover Stream 3d"
                            content="multipart/x-mixed-replace; boundary=frame"
                            onClick={(e) => handleImageClick(e)}
                        />
                    </div>
                    <div >
                        <div className="text-white flex flex-row justify-center gap-x-8 items-center text-xs">
                            <Joystick size={120} sticky={false} baseColor="white" stickColor="green" move={handleJoy}
                                      stop={handleStop} />
                            <button className={`button-xs}`} onClick={handleAutodrive}>
                                {`Auto: ${autodrive ? "ON" : "OFF"}`}
                            </button>
                            <button onClick={handleStop} className="button bg-red-400 text-white">Stop</button>
                            <Joystick size={120} sticky={false} baseColor="white" stickColor="orange"
                                      move={(e) => handleJoy(e, true)} stop={handleStop} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col bg-gray-200 w-full gap-y-4">

                    <div className="grid-box grid-cols-3">
                        <div className="col-span-3 underline text-center bg-black text-white">Velocity</div>
                        <div className="table-header">x</div>
                        <div className="table-header">y</div>
                        <div className="table-header">z</div>
                        <div>{twistResponse?.linear?.x?.toFixed(2)}</div>
                        <div>{twistResponse?.linear?.y.toFixed(2)}</div>
                        <div>{twistResponse?.angular?.z.toFixed(2)}</div>
                    </div>
                    {trainingType?.type === "PATH" &&
                        <div className="grid-box grid-cols-2">
                            <div className="grid-header">Path</div>
                            <div className="table-header">x</div>
                            <div className="table-header">y</div>
                            <div>{xy.x}</div>
                            <div>{xy.y}</div>
                        </div>
                    }
                    {trainingType?.type === "OBSTACLE" &&
                        <div className="grid-box auto-cols-auto">
                            <div className="grid-header">Obstacles</div>
                            {categories && categories.map((k) => (
                                <CategoryButton key={k.name} category={k} onClick={handleCategoryClick}/>
                            ))
                            }
                        </div>
                    }
                </div>
            </div>

            <div className="fixed border-t" style={{top: "270px", left: "0px", width: "960px", height: "1px"}}>
            </div>
            <div className="fixed border-l" style={{top: "0px", left: "480px", width: "1px", height: "540px"}}>
            </div>

            <div id="camera" className="fixed" style={{top: "244px", left: "456px", width: "40px", height: "40px"}}>
                <CameraIcon className="w-12 h-12 text-white opacity-40 hover:opacity-80" onClick={takeSnapshot} />
            </div>

        </div>

    )
}

/*



 */