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
        if (categories) {
            setCategory(categories[0])
        }
    }, [categories])

    useEffect(() => {
        if (category) {
            api.methods.getTrainingImages(category.name).then((r: ImagesResponse) => {
                setImages(r.images)
                setReloadImages(false)
                if (r.images && r.images.length > 0) {
                    if (selectedIndex > r.images.length - 1) {
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
            if (selectedIndex > 0) {
                setSelectedIndex(selectedIndex - 1)
            }
        } else if (e.keyCode === 40) {
            if (selectedIndex < images.length - 1) {
                setSelectedIndex(selectedIndex + 1)
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
        <div>
            <div className="absolute top-12 left-8 right-4 flex flex-row gap-4 text-xs justify-center">
                {categories && categories.map((cat) => (
                    <button
                        className={`text-white text-left ${cat === category ? 'font-bold' : ''}`}
                        key={cat.name}
                        onClick={() => handleSelectCategory(cat)}
                    >
                        {cat.name} ({cat.count})
                    </button>
                ))
                }
            </div>
            <div className="absolute left-8 top-20 bottom-16 right-8 flex flex-row justify-center gap-2">
            <div className="flex flex-col gap-2 rounded-md text-gray-50 bg-gray-700 border-gray-200 overflow-y-scroll p-2"
                onKeyDown={(e) => checkKey(e)}>
                {images && images.map((img, index) => (
                    <button
                        className={`p-1 pl-4 text-left text-xs ${index === selectedIndex ? 'bg-blue-800' : ''}`}
                        key={img}
                        onClick={() => handleSelect(index)}
                    >
                        {img}
                    </button>
                ))}
            </div>
            <div className="p-2 flex flex-col gap-2 bg-gray-700 rounded-md">
                {category && image &&
                    <div>
                        <img
                            className="aspect-video rounded-sm"
                            src={`${api.routes.training_image_url(category.name, image)}/1`} alt="Training"
                            width="420px"
                        />
                        <img
                            className="aspect-video rounded-sm"
                            src={`${api.routes.training_image_url(category.name, image)}/2`} alt="Training"
                            width="420px"
                        />
                    </div>
                        }
                {category &&
                    <button className="text-base font-semibold text-gray-50"
                            onClick={() => handleDelete(category.name, selectedIndex)}>
                        Delete
                    </button>
                }
            </div>
            </div>
        </div>
    )
}