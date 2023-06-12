import {useQuery} from "react-query";
import {api, CategoryCount, ImagesRespose} from "../api/nano-api";
import React, {useEffect, useState} from "react";


export default function Training() {

    const [category, setCategory] = useState<CategoryCount>()
    const [image, setImage] = useState<string>()
    const [images, setImages] = useState<string[]>([])
    const [reloadImages, setReloadImages] = useState(false)

    const {
        data: categories
    } = useQuery<CategoryCount[], Error>(
        ['categories'],
        () => api.methods.getCategoryCounts()
    )

    useEffect(() => {
        if(categories)
            setCategory(categories[0])
    }, [categories])

    useEffect(() => {
        if(category){
            api.methods.getTrainingImages(category.name).then((r: ImagesRespose) => {
                setImages(r.images)
                setReloadImages(false)
                if(r.images && r.images.length > 0) {
                    setImage(r.images[0])
                }
            })
        }
    }, [category, reloadImages])

    const handleDelete = (category: string, name: string) => {
        api.methods.deleteTrainingImage(category, name).then(_ => {
            setImage(undefined)
            setReloadImages(true)
        })
    }
    return (
        <div className="text-white text-xs p-12 flex flex-row gap-2">
            <div className="flex flex-col gap-2 w-40">
                { categories && categories.map((cat) => (
                    <button
                        className={`p-1 pl-4 w-full rounded-lg  text-left  ${cat === category ? 'bg-blue-400' : ''}`}
                        key={cat.name}
                        onClick={() => setCategory(cat)}
                    >
                        {cat.name} ({cat.entries})
                    </button>
                ))
                }
            </div>
            <div className={"flex flex-col gap-2 max-h-screen overflow-y-scroll border-2 rounded-lg p-2 bg-blue-400"}>
                { images && images.map((img) => (
                    <button
                        className={`p-1 pl-4 w-full rounded-lg  text-left  ${img === image ? 'bg-blue-800' : ''}`}
                        key={img}
                        onClick={() => setImage(img)}
                    >
                        {img}
                    </button>
                ))}
            </div>
            {image && category &&
            <div className="border-2 rounded-lg p-2 bg-blue-400 flex flex-col gap-2">
                <img src={api.routes.images_url(category.name,image)} alt="Training"/>
                <button className = "text-base font-semibold" onClick={() => handleDelete(category.name, image)}>Delete</button>
            </div>
            }
        </div>
    )
}