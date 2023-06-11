import React from "react";
import {api, CalibrationCounts} from "../api/nano-api";
import {useQuery, useQueryClient} from "react-query";

export default function Calibrator() {

    const queryClient = useQueryClient()

    const {
        data: calibration_counts
    } = useQuery<CalibrationCounts, Error>(
        ['calibration_counts'],
        () => api.methods.get_calibration_counts()
    )

    const handleSaveImgs = (img: string) => api.methods.collect_calibration_images(img).then(() => queryClient.invalidateQueries("calibration_counts"))

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
        <div className="flex flex-col items-center justify-center mt-16 gap-4 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {stream("LEFT")}
                {stream("RIGHT")}
            </div>
            <button className="button-xs ml-8 w-full max-w-lg" onClick={() => handleSaveImgs("stereo")}>
                Capture ({calibration_counts?.stereo})
            </button>
        </div>
    )
}
