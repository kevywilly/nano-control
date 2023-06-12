import React, {useEffect, useState} from "react";
import {api, CalibrationCounts, ImagesResponse} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";

export default function Calibrator() {

    const queryClient = useQueryClient()
    const [image, setImage] = useState<string>()

    const {
        data: calibration_counts
    } = useQuery<CalibrationCounts, Error>(
        ['calibration_counts'],
        () => api.methods.getCalibrationCounts()
    )

    const {
        data: images
    } = useQuery<ImagesResponse, Error>(
        ['images'],
        () => api.methods.getCalibrationImages()
    )

    const handleSaveImgs = () => api.methods.collectCalibrationImages().then(() => {
        queryClient.invalidateQueries("calibration_counts")
        queryClient.invalidateQueries("images")
    })

    const handleDelete = (name: string) => {
        api.methods.deleteCalibrationImage(name).then(_ => {
            setImage(undefined)
            queryClient.invalidateQueries("images")
        })
    }

    const handleDeleteAll = () => {
        api.methods.deleteAllCalibrationImages().then(_ => {
            setImage(undefined)
            queryClient.invalidateQueries("images")
        })
    }

    useEffect(() => {
        if(images && images.images.length > 0) {
            setImage(images.images[0])
        }
    }, [images])

    const stream = (camera: string) => (
        <img
            className="aspect-video w-480 rounded-md border-4 border-stone-400 border-opacity-50"
            src={`${api.routes.stream_url}/${camera.toUpperCase()}`}
            alt="Jetson Rover Stream Left"
            content="multipart/x-mixed-replace; boundary=frame"
            width={480}
        />

    )


    return (
        <div className="flex flex-col items-center justify-center mt-4 gap-4 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {stream("LEFT")}
                {stream("RIGHT")}
            </div>
            <button className="button-xs ml-8 w-full max-w-lg bg-blue-800 text-white font-semibold" onClick={handleSaveImgs}>
                Capture ({calibration_counts?.count})
            </button>

            {images && images.images.length > 0 &&
                <div className={"flex flex-row gap-2  rounded-lg p-2 bg-blue-400 gap-2 mx-4 text-white"}>
                    <div className={"flex flex-col gap-2 h-80 overflow-y-scroll border-2 rounded-lg p-2 bg-blue-400"}>
                        {images.images.map((img) => (
                            <button
                                className={`p-1 pl-4 w-full rounded-lg  text-left  ${img === image ? 'bg-blue-800' : ''}`}
                                key={img}
                                onClick={() => setImage(img)}
                            >
                                {img}
                            </button>
                        ))}

                        <button className="text-base bg-red-600 font-semibold w-full rounded-md" onClick={handleDeleteAll}>DELETE ALL</button>

                    </div>
                    <div className="flex-col items-center w-full gap-4">
                        <div className="flex flex-row gap-2">
                            <div className="w-1/2 rounded-lg border-2 p-2">
                                {image && <img className="rounded-md" src={api.routes.calibration_image_url("left", image)} alt="left"/>}
                            </div>
                            <div className="w-1/2 rounded-lg border-2 p-2">
                                {image && <img className="rounded-md" src={api.routes.calibration_image_url("right", image)} alt="right"/>}
                            </div>
                        </div>
                        {image &&
                            <button className="mt-2 text-base font-semibold w-full bg-red-600 rounded-md"
                                    onClick={() => handleDelete(image)}>Delete</button>
                        }

                    </div>
                </div>
            }
        </div>
    )
}
