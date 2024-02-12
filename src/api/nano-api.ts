import axios from "axios";
import {IJoystickUpdateEvent} from "react-joystick-component/build/lib/Joystick";
export const API_PATH = process.env.REACT_APP_API_PATH
    //is_prod() ? process.env.REACT_APP_API_PROD : process.env.REACT_APP_API_DEV

const AUTODRIVE_PATH = `${API_PATH}/autodrive`
const STREAMING_PATH = `${API_PATH}/stream`
const CATEGORIES_PATH = `${API_PATH}/categories`
const CALIBRATION_PATH = `${API_PATH}/calibration`
const CATEGORY_PATH = (category: string) => `${API_PATH}/categories/${category}`
const TWIST_PATH = `${API_PATH}/twist`
const COLLECT_X_Y_PATH = `${API_PATH}/collect-x-y`
const TRAINING_PATH = `${API_PATH}/training`
export const TWIST_ZERO: Twist = {linear: {x: 0, y:0, z:0}, angular: {x:0, y:0, z:0}}

async function snapshot() {
    const {data} = await axios.get(`${API_PATH}/snapshot`)
    return data
}

async function getTrainingType() {
    const {data} = await axios.get(`${TRAINING_PATH}/type`)
    return data
}


async function twist(twist: Twist) {
    const {data} = await axios.post(TWIST_PATH, twist)
    return data
}

async function collectXY(payload: XYMap) {
    const {data} = await axios.post(COLLECT_X_Y_PATH, payload)
    return data
}

async function collectImage(category: string){
    const {data} = await axios.get(`${CATEGORY_PATH(category)}/collect`)
    return data
}

async function toggleAutodrive(): Promise<StatusResponse>{
    const {data} = await axios.post(AUTODRIVE_PATH, {})
    return data
}

async function getAutodrive(): Promise<StatusResponse>{
    const {data} = await axios.get(AUTODRIVE_PATH)
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

async function getTrainingImages(category: string): Promise<ImagesResponse>{
    const {data} = await axios.get(`${CATEGORIES_PATH}/${category}/images`)
    return data
}

async function deleteTrainingImage(category: string, filename: string) {
    await axios.delete(`${CATEGORIES_PATH}/${category}/images/${filename}`)
}

async function getCalibrationImages(): Promise<ImagesResponse>{
    const {data} = await axios.get(`${CALIBRATION_PATH}/images`)
    return data
}

async function deleteCalibrationImage(filename: string) {
    await axios.delete(`${CALIBRATION_PATH}/images/${filename}`)
}

async function deleteAllCalibrationImages() {
    await axios.delete(`${CALIBRATION_PATH}/images`)
}

async function calibrate() {
    await axios.get(`${CALIBRATION_PATH}/calibrate`)
}

async function navigate(request: NavRequest) {
    const {data} = await axios.post(`${API_PATH}/navigate`,request)
    return data
}

async function joystick(request: JoystickRequest) {
    const {data} = await axios.post(`${API_PATH}/joystick`,request)
    return data
}

async function add_tag(tag: string) {
    const {data} = await axios.post(`${API_PATH}/tags`,{tag})
    return data
}

async function get_tags() {
    const {data} = await axios.get(`${API_PATH}/tags`)
    return data
}

/*


@app.get('/api/calibration/images/<name>')
def delete_calibration_image(name):
    bytes_str = app.calibrator.load_image(name)
    response = flask.make_response(bytes_str)
    response.headers.set('Content-Type', 'image/png')
    return response

@app.get('/api/calibration/calibrate')
 */
export const api = {
    routes: {
        stream_url: STREAMING_PATH,
        training_image_url: (category: string, name: string) => `${CATEGORIES_PATH}/${category}/images/${name}`,
        calibration_image_url: (camera: string, name: string) => `${CALIBRATION_PATH}/${camera}/images/${name}`
    },
    methods: {
        joystick,
        twist,
        add_tag,
        get_tags,
        toggleAutodrive,
        getAutodrive,
        collectXY,
        collectImage,
        getTrainingType,
        getCategoryCounts,
        collectCalibrationImages,
        getCalibrationCounts,
        getTrainingImages,
        deleteTrainingImage,
        getCalibrationImages,
        deleteAllCalibrationImages,
        deleteCalibrationImage,
        calibrate,
        snapshot,
        navigate
    }
}

