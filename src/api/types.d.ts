
interface TrainingType {
    type: ("OBSTACLE" | "PATH")
}

interface XYMap {
    x: number
    y: number
    width: number
    height: number
}
interface Velocity {
    x: number
    y: number
    z: number
}
interface Twist {
    linear?: Velocity
    angular?: Velocity
}
interface ImagesResponse {
    images: string[]
}
interface CategoryCount {
    name: string,
    count?: number
}

interface CalibrationCounts {
    count?: number
}

interface StatusResponse {
    status: boolean
}