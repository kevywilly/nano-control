import axios from "axios";
export const API_PATH = process.env.REACT_APP_API_PATH
    //is_prod() ? process.env.REACT_APP_API_PROD : process.env.REACT_APP_API_DEV

const AUTODRIVE_PATH = `${API_PATH}/autodrive`
const STREAMING_PATH = `${API_PATH}/stream`
const CATEGORIES_PATH = `${API_PATH}/categories`
const CALIBRATION_PATH = `${API_PATH}/calibration`
const CATEGORY_PATH = (category: string) => `${API_PATH}/categories/${category}`
const DRIVE_PATH = (cmd: string, speed: number) => `${API_PATH}/drive/${cmd.toLowerCase()}/${speed}`

export interface ImagesRespose {
    images: string[]
}
export interface CategoryCount {
    name: string,
    entries: number
}

export interface CalibrationCounts {
    right: number
    left: number
    stereo: number
}

export interface AutoDriveResponse {
    autodrive: boolean
}
async function drive(cmd: string, speed: number = 25) {
    const {data} = await axios.get(DRIVE_PATH(cmd, speed))
    return data
}

async function collect_image(category: string){
    const {data} = await axios.post(`${CATEGORY_PATH(category)}/collect`)
    return data
}

async function autodrive(): Promise<AutoDriveResponse>{
    const {data} = await axios.get(AUTODRIVE_PATH)
    return data
}

async function getCategories(): Promise<string[]>{
    const {data} = await axios.get(CATEGORIES_PATH)
    return data
}

async function getCategoryCounts(): Promise<CategoryCount[]>{
    const {data} = await axios.get(`${CATEGORIES_PATH}/counts`)
    return data
}

async function getCalibrationCounts(): Promise<CalibrationCounts>{
    const {data} = await axios.get(`${CALIBRATION_PATH}/images/count`)
    return data
}

async function collectCalibrationImages() {
    await axios.get(`${CALIBRATION_PATH}/images/collect`)
}

async function getTrainingImages(category: string): Promise<ImagesRespose>{
    const {data} = await axios.get(`${CATEGORIES_PATH}/${category}/images`)
    return data
}

async function deleteTrainingImage(category: string, filename: string) {
    await axios.delete(`${CATEGORIES_PATH}/${category}/images/${filename}`)
}

export const api = {
    routes: {
        stream_url: STREAMING_PATH,
        images_url: (category: string, name: string) => `${CATEGORIES_PATH}/${category}/images/${name}`
    },
    methods: {
        autodrive,
        drive,
        collect_image,
        getCategories,
        getCategoryCounts,
        collectCalibrationImages,
        getCalibrationCounts,
        getTrainingImages,
        deleteTrainingImage
    }
}

