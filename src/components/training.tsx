import {useQuery} from "react-query";
import {api, CategoryCount, ImagesResponse} from "../api/nano-api";
import React, {useEffect, useState} from "react";


export default function Training() {

    const [category, setCategory] = useState<CategoryCount>()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [image, setImage] = useState<string>()
    const [images, setImages] = useState<string[]>([])
    const [reloadImages, setReloadImages] = useState(false)

    const {
        data: categories
    } = useQuery<CategoryCount[], Error>(
        ['categories'],
        () => api.methods.getCategoryCounts()
    )

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
        setImage(images![index])
    }

    useEffect(() => {
        if(categories) {
            setCategory(categories[0])
        }
    }, [categories])

    useEffect(() => {
        if(category){
            api.methods.getTrainingImages(category.name).then((r: ImagesResponse) => {
                setImages(r.images)
                setReloadImages(false)
                if(r.images && r.images.length > 0) {
                    if(selectedIndex > r.images.length-1) {
                        setImage(r.images[0])
                    } else {
                        setImage(r.images[selectedIndex])
                    }
                }
            })
        }
    }, [category, reloadImages, selectedIndex])

    function checkKey(e: any) {
        console.log(e)
        if (e.keyCode === 38) {
            if(selectedIndex > 0) {
                setSelectedIndex(selectedIndex-1)
            }
        }
        else if (e.keyCode === 40) {
            if(selectedIndex < images.length-1) {
                setSelectedIndex(selectedIndex+1)
            }
        }

    }
    const handleSelectCategory = (category: CategoryCount) => {
        setCategory(category)
        setSelectedIndex(0)
    }
    const handleDelete = (category: string, index: number) => {
        api.methods.deleteTrainingImage(category, images![index]).then(_ => {
            setImage(undefined)
            setReloadImages(true)
        })
    }
    return (
        <div className="text-white text-xs p-12 flex flex-row gap-2 max-h-screen">
            <div className="flex flex-col gap-2 w-40">
                { categories && categories.map((cat) => (
                    <button
                        className={`p-1 pl-4 w-full rounded-lg  text-left  ${cat === category ? 'bg-blue-400' : ''}`}
                        key={cat.name}
                        onClick={() => handleSelectCategory(cat)}
                    >
                        {cat.name} ({cat.count})
                    </button>
                ))
                }
            </div>
            <div className={"flex flex-col gap-2 max-h-3/4 overflow-y-scroll border-2 rounded-lg p-2 bg-blue-400"} onKeyDown={(e) => checkKey(e)}>
                { images && images.map((img, index) => (
                    <button
                        className={`p-1 pl-4 w-full rounded-lg  text-left  ${index === selectedIndex ? 'bg-blue-800' : ''}`}
                        key={img}
                        onClick={() => handleSelect(index)}
                    >
                        {img}
                    </button>
                ))}
            </div>
            {category &&
            <div className="border-2 rounded-lg p-2 bg-blue-400 flex flex-col gap-2">
                {image &&
                    <img src={api.routes.training_image_url(category.name, image)} alt="Training"/>
                }
                <button className = "text-base font-semibold text-white" onClick={() => handleDelete(category.name, selectedIndex)}>
                    Delete
                </button>
            </div>
            }
        </div>
    )
}