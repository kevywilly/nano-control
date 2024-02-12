
interface TrainingType {
    type: ("OBSTACLE" | "PATH")
}

interface JoystickRequest {
    event: {
        x: number | null;
        y: number | null;
    }
    strafe?: bool;
}

interface NavCommand {
    x: number
    y: number
    w: number
    h: number
}

interface NavRequest {
    captureMode: boolean
    driveMode: boolean
    cmd: NavCommand
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