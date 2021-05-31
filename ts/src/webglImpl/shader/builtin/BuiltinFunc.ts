// import { Vec2Data, Vec3Data, Vec4Data } from "cc"
import { cpuRenderingContext } from "../../CpuRenderingContext"
import {
    BoolData,
    builtinCachData,
    FloatData,
    getNum,
    IntData,
    Mat3Data,
    Mat4Data,
    NumData,
    SamplerCube,
    Vec2Data,
    Vec3Data,
    Vec4Data,
} from "./BuiltinData"

let vec2Data = builtinCachData.vec2Data
let vec3Data = builtinCachData.vec3Data
let vec4Data = builtinCachData.vec4Data
let floatData = builtinCachData.floatData
let intData = builtinCachData.intData
let boolData = builtinCachData.boolData

let clampTmp = function (val: number, min: number, max: number) {
    return val < min ? min : val > max ? max : val
}
let sinTmp = Math.sin
let cosTmp = Math.cos
let tanTmp = Math.tan
let asinTmp = Math.asin
let acosTmp = Math.acos
let atanTmp = Math.atan
let sinhTmp = Math.sinh
let coshTmp = Math.cosh
let tanhTmp = Math.tanh
let asinhTmp = Math.asinh
let acoshTmp = Math.acosh
let atanhTmp = Math.atanh
let powTmp = Math.pow
let expTmp = Math.exp
let logTmp = Math.log
let log2Tmp = Math.log2
let sqrtTmp = Math.sqrt
let absTmp = Math.abs
let signTmp = Math.sign
let floorTmp = Math.floor
let ceilTmp = Math.ceil
let truncTmp = Math.trunc
let roundTmp = Math.round
let minTmp = Math.min
let maxTmp = Math.max

let modTmp = function (x: number, y: number) {
    return x - y * floorTmp(x / y)
}
let smoothstepTmp = function (edge0: number, edge1: number, x: number) {
    if (x <= edge0) {
        return 0
    } else if (x >= edge1) {
        return 1
    } else {
        let t = clampTmp(x - edge0 / (edge1 - edge0), 0, 1)
        return t * t * (3 - 2 * t)
    }
}

/** float step (float edge, float x) Returns 0.0 if x < edge; otherwise, it returns 1.0. */
let stepTmp = function (edge: number, x: number) {
    return x < edge ? 0 : 1
}

// 没有内部实现的函数
/** float mix (float x, float y, float a) 返回 x*(1.0 – a) + y*a */
// let mix

const oneDegressRadin = Math.PI / 180

export function radian_N(degrees: NumData): NumData {
    let data = degrees.ctor()
    data.v = oneDegressRadin * degrees.v
    return data
}

export function radian_V2(degrees: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.out_x.v = oneDegressRadin * degrees.x
    data.out_y.v = oneDegressRadin * degrees.y
    return data
}

export function radian_V3(degrees: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.out_x.v = oneDegressRadin * degrees.x
    data.out_y.v = oneDegressRadin * degrees.y
    data.out_z.v = oneDegressRadin * degrees.z
    return data
}

export function radian_V4(degrees: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.out_x.v = oneDegressRadin * degrees.x
    data.out_y.v = oneDegressRadin * degrees.y
    data.out_z.v = oneDegressRadin * degrees.z
    data.out_w.v = oneDegressRadin * degrees.w
    return data
}

export function degrees_N(radians: NumData): NumData {
    let data = radians.ctor()
    data.v = radians.v / oneDegressRadin
    return data
}

export function degrees_V2(radians: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.out_x.v = radians.x / oneDegressRadin
    data.out_y.v = radians.y / oneDegressRadin
    return data
}

export function degrees_V3(radians: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.out_x.v = radians.x / oneDegressRadin
    data.out_y.v = radians.y / oneDegressRadin
    data.out_z.v = radians.z / oneDegressRadin
    return data
}

export function degrees_V4(radians: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.out_x.v = radians.x / oneDegressRadin
    data.out_y.v = radians.y / oneDegressRadin
    data.out_w.v = radians.w / oneDegressRadin
    return data
}

export function sin_N(num: NumData): NumData {
    let data = num.ctor()
    data.v = sinTmp(num.v)
    return data
}

export function sin_V2(num: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(sinTmp(num.x), sinTmp(num.y))
    return data
}

export function sin_V3(num: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(sinTmp(num.x), sinTmp(num.y), sinTmp(num.z))
    return data
}

export function sin_V4(num: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(sinTmp(num.x), sinTmp(num.y), sinTmp(num.z), sinTmp(num.w))
    return data
}

export function cos_N(num: NumData): NumData {
    let data = num.ctor()
    data.v = cosTmp(num.v)
    return data
}

export function cos_V2(num: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(cosTmp(num.x), cosTmp(num.y))
    return data
}

export function cos_V3(num: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(cosTmp(num.x), cosTmp(num.y), cosTmp(num.z))
    return data
}

export function cos_V4(num: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(cosTmp(num.x), cosTmp(num.y), cosTmp(num.z), cosTmp(num.w))
    return data
}

export function tan_N(num: NumData): NumData {
    let data = num.ctor()
    data.v = tanTmp(num.v)
    return data
}

export function tan_V2(num: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(tanTmp(num.x), tanTmp(num.y))
    return data
}

export function tan_V3(num: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(tanTmp(num.x), tanTmp(num.y), tanTmp(num.z))
    return data
}

export function tan_V4(num: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(tanTmp(num.x), tanTmp(num.y), tanTmp(num.z), tanTmp(num.w))
    return data
}

export function asin_N(num: NumData): NumData {
    let data = num.ctor()
    data.v = asinTmp(num.v)
    return data
}

export function asin_V2(num: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(asinTmp(num.x), asinTmp(num.y))
    return data
}

export function asin_V3(num: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(asinTmp(num.x), asinTmp(num.y), asinTmp(num.z))
    return data
}

export function asin_V4(num: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(asinTmp(num.x), asinTmp(num.y), asinTmp(num.z), asinTmp(num.w))
    return data
}

export function acos_N(num: NumData): NumData {
    let data = num.ctor()
    data.v = acosTmp(num.v)
    return data
}

export function acos_V2(num: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(acosTmp(num.x), acosTmp(num.y))
    return data
}

export function acos_V3(num: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(acosTmp(num.x), acosTmp(num.y), acosTmp(num.z))
    return data
}

export function acos_V4(num: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(acosTmp(num.x), acosTmp(num.y), acosTmp(num.z), acosTmp(num.w))
    return data
}

export function atan_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = atanTmp(x.v)
    return data
}

export function atan_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(atanTmp(x.x), atanTmp(x.y))
    return data
}

export function atan_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(atanTmp(x.x), atanTmp(x.y), atanTmp(x.z))
    return data
}

export function atan_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(atanTmp(x.x), atanTmp(x.y), atanTmp(x.z), atanTmp(x.w))
    return data
}

export function atan_N_N(x: NumData, y: NumData): NumData {
    let data = x.ctor()
    data.v = atanTmp(y.v / x.v)
    return data
}

export function atan_V2_V2(x: Vec2Data, y: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(atanTmp(y.x / x.x), atanTmp(y.y / x.y))
    return data
}

export function atan_V3_V3(x: Vec3Data, y: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(atanTmp(y.x / x.x), atanTmp(y.y / x.y), atanTmp(y.z / x.z))
    return data
}

export function atan_V4_V4(x: Vec4Data, y: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(atanTmp(y.x / x.x), atanTmp(y.y / x.y), atanTmp(y.z / x.z), atanTmp(y.w / x.w))
    return data
}

export function sinh_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = sinhTmp(x.v)
    return data
}

export function sinh_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(sinhTmp(x.x), sinhTmp(x.y))
    return data
}

export function sinh_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(sinhTmp(x.x), sinhTmp(x.y), sinhTmp(x.z))
    return data
}

export function sinh_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(sinhTmp(x.x), sinhTmp(x.y), sinhTmp(x.z), sinhTmp(x.w))
    return data
}

export function cosh_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = coshTmp(x.v)
    return data
}

export function cosh_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(coshTmp(x.x), coshTmp(x.y))
    return data
}

export function cosh_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(coshTmp(x.x), coshTmp(x.y), coshTmp(x.z))
    return data
}

export function cosh_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(coshTmp(x.x), coshTmp(x.y), coshTmp(x.z), coshTmp(x.w))
    return data
}

export function tanh_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = tanhTmp(x.v)
    return data
}

export function tanh_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(tanhTmp(x.x), tanhTmp(x.y))
    return data
}

export function tanh_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(tanhTmp(x.x), tanhTmp(x.y), tanhTmp(x.z))
    return data
}

export function tanh_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(tanhTmp(x.x), tanhTmp(x.y), tanhTmp(x.z), tanhTmp(x.w))
    return data
}

export function asinh_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = asinhTmp(x.v)
    return data
}

export function asinh_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(asinhTmp(x.x), asinhTmp(x.y))
    return data
}

export function asinh_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(asinhTmp(x.x), asinhTmp(x.y), asinhTmp(x.z))
    return data
}

export function asinh_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(asinhTmp(x.x), asinhTmp(x.y), asinhTmp(x.z), asinhTmp(x.w))
    return data
}

export function acosh_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = acoshTmp(x.v)
    return data
}

export function acosh_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(acoshTmp(x.x), acoshTmp(x.y))
    return data
}

export function acosh_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(acoshTmp(x.x), acoshTmp(x.y), acoshTmp(x.z))
    return data
}

export function acosh_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(acoshTmp(x.x), acoshTmp(x.y), acoshTmp(x.z), acoshTmp(x.w))
    return data
}

export function atanh_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = atanhTmp(x.v)
    return data
}

export function atanh_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(atanhTmp(x.x), atanhTmp(x.y))
    return data
}

export function atanh_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(atanhTmp(x.x), atanhTmp(x.y), atanhTmp(x.z))
    return data
}

export function atanh_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(atanhTmp(x.x), atanhTmp(x.y), atanhTmp(x.z), atanhTmp(x.w))
    return data
}

export function abs_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = absTmp(x.v)
    return data
}

export function abs_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(absTmp(x.x), absTmp(x.y))
    return data
}

export function abs_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(absTmp(x.x), absTmp(x.y), absTmp(x.z))
    return data
}

export function abs_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(absTmp(x.x), absTmp(x.y), absTmp(x.z), absTmp(x.w))
    return data
}

export function ceil_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = ceilTmp(x.v)
    return data
}

export function ceil_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(ceilTmp(x.x), ceilTmp(x.y))
    return data
}

export function ceil_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(ceilTmp(x.x), ceilTmp(x.y), ceilTmp(x.z))
    return data
}

export function ceil_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(ceilTmp(x.x), ceilTmp(x.y), ceilTmp(x.z), ceilTmp(x.w))
    return data
}

export function clamp_N_N_N(x: NumData, min: NumData, max: NumData): NumData {
    let data = x.ctor()
    data.v = clampTmp(x.v, min.v, max.v)
    return data
}

export function clamp_V2_N_N(x: Vec2Data, min: NumData, max: NumData): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(clampTmp(x.x, min.v, max.v), clampTmp(x.y, min.v, max.v))
    return data
}

export function clamp_V3_N_N(x: Vec3Data, min: NumData, max: NumData): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(clampTmp(x.x, min.v, max.v), clampTmp(x.y, min.v, max.v), clampTmp(x.z, min.v, max.v))
    return data
}

export function clamp_V4_N_N(x: Vec4Data, min: NumData, max: NumData): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(clampTmp(x.x, min.v, max.v), clampTmp(x.y, min.v, max.v), clampTmp(x.z, min.v, max.v), clampTmp(x.w, min.v, max.v))
    return data
}

export function clamp_V2_V2_V2(x: Vec2Data, min: Vec2Data, max: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(clampTmp(x.x, min.x, max.x), clampTmp(x.y, min.y, max.y))
    return data
}

export function clamp_V3_V3_V3(x: Vec3Data, min: Vec3Data, max: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(clampTmp(x.x, min.x, max.x), clampTmp(x.y, min.y, max.y), clampTmp(x.z, min.z, max.z))
    return data
}

export function clamp_V4_V4_V4(x: Vec4Data, min: Vec4Data, max: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(clampTmp(x.x, min.x, max.x), clampTmp(x.y, min.y, max.y), clampTmp(x.z, min.z, max.z), clampTmp(x.w, min.w, max.w))
    return data
}

export function mix_N_N_N(x: NumData, y: NumData, a: NumData): NumData {
    let data = x.ctor()
    data.v = x.v * (1 - (<NumData>a).v) + (<NumData>y).v * (<NumData>a).v
    return data
}

export function mix_V2_V2_N(x: Vec2Data, y: Vec2Data, a: NumData): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(x.x * (1 - (<NumData>a).v) + y.x * (<NumData>a).v, x.y * (1 - (<NumData>a).v) + y.y * (<NumData>a).v)
    return data
}

export function mix_V3_V3_N(x: Vec3Data, y: Vec3Data, a: NumData): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(
        x.x * (1 - (<NumData>a).v) + y.x * (<NumData>a).v,
        x.y * (1 - (<NumData>a).v) + y.y * (<NumData>a).v,
        x.z * (1 - (<NumData>a).v) + y.z * (<NumData>a).v
    )
    return data
}

export function mix_V4_V4_N(x: Vec4Data, y: Vec4Data, a: NumData): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(
        x.x * (1 - (<NumData>a).v) + y.x * (<NumData>a).v,
        x.y * (1 - (<NumData>a).v) + y.y * (<NumData>a).v,
        x.z * (1 - (<NumData>a).v) + y.z * (<NumData>a).v,
        x.w * (1 - (<NumData>a).v) + y.w * (<NumData>a).v
    )
    return data
}

export function mix_V2_V2_V2(x: Vec2Data, y: Vec2Data, a: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(x.x * (1 - a.x) + y.x * a.x, x.y * (1 - a.y) + y.y * a.y)
    return data
}

export function mix_V3_V3_V3(x: Vec3Data, y: Vec3Data, a: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(x.x * (1 - a.x) + y.x * a.x, x.y * (1 - a.y) + y.y * a.y, x.z * (1 - a.z) + y.z * a.z)
    return data
}

export function mix_V4_V4_V4(x: Vec4Data, y: Vec4Data, a: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(x.x * (1 - a.x) + y.x * a.x, x.y * (1 - a.y) + y.y * a.y, x.z * (1 - a.z) + y.z * a.z, x.w * (1 - a.w) + y.w * a.w)
    return data
}

export function floor_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = floorTmp(x.v)
    return data
}

export function floor_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(floorTmp(x.x), floorTmp(x.y))
    return data
}

export function floor_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(floorTmp(x.x), floorTmp(x.y), floorTmp(x.z))
    return data
}

export function floor_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(floorTmp(x.x), floorTmp(x.y), floorTmp(x.z), floorTmp(x.w))
    return data
}

export function fract_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = x.v - floorTmp(x.v)
    return data
}

export function fract_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(x.x - floorTmp(x.x), x.y - floorTmp(x.y))
    return data
}

export function fract_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(x.x - floorTmp(x.x), x.y - floorTmp(x.y), x.z - floorTmp(x.z))
    return data
}

export function fract_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(x.x - floorTmp(x.x), x.y - floorTmp(x.y), x.z - floorTmp(x.z), x.w - floorTmp(x.w))
    return data
}

export function exp2_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = powTmp(2, x.v)
    return data
}

export function exp2_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(powTmp(2, x.x), powTmp(2, x.y))
    return data
}

export function exp2_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(powTmp(2, x.x), powTmp(2, x.y), powTmp(2, x.z))
    return data
}

export function exp2_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(powTmp(2, x.x), powTmp(2, x.y), powTmp(2, x.z), powTmp(2, x.w))
    return data
}

export function exp_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = expTmp(x.v)
    return data
}

export function exp_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(expTmp(x.x), expTmp(x.y))
    return data
}

export function exp_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(expTmp(x.x), expTmp(x.y), expTmp(x.z))
    return data
}

export function exp_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(expTmp(x.x), expTmp(x.y), expTmp(x.z), expTmp(x.w))
    return data
}

export function inversesqrt_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = 1 / sqrtTmp(x.v)
    return data
}

export function inversesqrt_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(1 / sqrtTmp(x.x), 1 / sqrtTmp(x.y))
    return data
}

export function inversesqrt_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(1 / sqrtTmp(x.x), 1 / sqrtTmp(x.y), 1 / sqrtTmp(x.z))
    return data
}

export function inversesqrt_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(1 / sqrtTmp(x.x), 1 / sqrtTmp(x.y), 1 / sqrtTmp(x.z), 1 / sqrtTmp(x.w))
    return data
}

export function log_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = logTmp(x.v)
    return data
}

export function log_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(logTmp(x.x), logTmp(x.y))
    return data
}

export function log_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(logTmp(x.x), logTmp(x.y), logTmp(x.z))
    return data
}

export function log_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(logTmp(x.x), logTmp(x.y), logTmp(x.z), logTmp(x.w))
    return data
}

export function log2_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = log2Tmp(x.v)
    return data
}

export function log2_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(log2Tmp(x.x), log2Tmp(x.y))
    return data
}

export function log2_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(log2Tmp(x.x), log2Tmp(x.y), log2Tmp(x.z))
    return data
}

export function log2_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(log2Tmp(x.x), log2Tmp(x.y), log2Tmp(x.z), log2Tmp(x.w))
    return data
}

export function max_N_N(x: NumData, y: NumData): NumData {
    let data = x.ctor()
    data.v = maxTmp(x.v, y.v)
    return data
}

export function max_V2_N(x: Vec2Data, y: NumData): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(maxTmp(x.x, y.v), maxTmp(x.y, y.v))
    return data
}

export function max_V3_N(x: Vec3Data, y: NumData): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(maxTmp(x.x, y.v), maxTmp(x.y, y.v), maxTmp(x.z, y.v))
    return data
}

export function max_V4_N(x: Vec4Data, y: NumData): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(maxTmp(x.x, y.v), maxTmp(x.y, y.v), maxTmp(x.z, y.v), maxTmp(x.w, y.v))
    return data
}

export function max_V2_V2(x: Vec2Data, y: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(maxTmp(x.x, y.x), maxTmp(x.y, y.y))
    return data
}

export function max_V3_V3(x: Vec3Data, y: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(maxTmp(x.x, y.x), maxTmp(x.y, y.y), maxTmp(x.z, y.z))
    return data
}

export function max_V4_V4(x: Vec4Data, y: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(maxTmp(x.x, y.x), maxTmp(x.y, y.y), maxTmp(x.z, y.z), maxTmp(x.w, y.w))
    return data
}

export function min_N_N(x: NumData, y: NumData): NumData {
    let data = x.ctor()
    data.v = minTmp(x.v, y.v)
    return data
}

export function min_V2_N(x: Vec2Data, y: NumData): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(minTmp(x.x, y.v), minTmp(x.y, y.v))
    return data
}

export function min_V3_N(x: Vec3Data, y: NumData): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(minTmp(x.x, y.v), minTmp(x.y, y.v), minTmp(x.z, y.v))
    return data
}

export function min_V4_N(x: Vec4Data, y: NumData): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(minTmp(x.x, y.v), minTmp(x.y, y.v), minTmp(x.z, y.v), minTmp(x.w, y.v))
    return data
}

export function min_V2_V2(x: Vec2Data, y: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(minTmp(x.x, y.x), minTmp(x.y, y.y))
    return data
}

export function min_V3_V3(x: Vec3Data, y: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(minTmp(x.x, y.x), minTmp(x.y, y.y), minTmp(x.z, y.z))
    return data
}

export function min_V4_V4(x: Vec4Data, y: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(minTmp(x.x, y.x), minTmp(x.y, y.y), minTmp(x.z, y.z), minTmp(x.w, y.w))
    return data
}

export function mod_N_N(x: NumData, y: NumData): NumData {
    let data = x.ctor()
    data.v = modTmp(x.v, y.v)
    return data
}

export function mod_V2_N(x: Vec2Data, y: NumData): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(modTmp(x.x, y.v), modTmp(x.y, y.v))
    return data
}

export function mod_V3_N(x: Vec3Data, y: NumData): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(modTmp(x.x, y.v), modTmp(x.y, y.v), modTmp(x.z, y.v))
    return data
}

export function mod_V4_N(x: Vec4Data, y: NumData): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(modTmp(x.x, y.v), modTmp(x.y, y.v), modTmp(x.z, y.v), modTmp(x.w, y.v))
    return data
}

export function mod_V2_V2(x: Vec2Data, y: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(modTmp(x.x, y.x), modTmp(x.y, y.y))
    return data
}

export function mod_V3_V3(x: Vec3Data, y: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(modTmp(x.x, y.x), modTmp(x.y, y.y), modTmp(x.z, y.z))
    return data
}

export function mod_V4_V4(x: Vec4Data, y: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(modTmp(x.x, y.x), modTmp(x.y, y.y), modTmp(x.z, y.z), modTmp(x.w, y.w))
    return data
}

export function pow_N_N(x: NumData, y: NumData): NumData {
    let data = x.ctor()
    data.v = powTmp(x.v, (<NumData>y).v)
    return data
}

export function pow_V2_V2(x: Vec2Data, y: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(powTmp(x.x, y.x), powTmp(x.y, y.y))
    return data
}

export function pow_V3(x: Vec3Data, y: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(powTmp(x.x, y.x), powTmp(x.y, y.y), powTmp(x.z, y.z))
    return data
}

export function pow_V4(x: Vec4Data, y: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(powTmp(x.x, y.x), powTmp(x.y, y.y), powTmp(x.z, y.z), powTmp(x.w, y.w))
    return data
}

export function round_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = roundTmp(x.v)
    return data
}

export function round_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(roundTmp(x.x), roundTmp(x.y))
    return data
}

export function round_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(roundTmp(x.x), roundTmp(x.y), roundTmp(x.z))
    return data
}

export function round_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(roundTmp(x.x), roundTmp(x.y), roundTmp(x.z), roundTmp(x.w))
    return data
}

export function sign_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = signTmp(x.v)
    return data
}

export function sign_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(signTmp(x.x), signTmp(x.y))
    return data
}

export function sign_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(signTmp(x.x), signTmp(x.y), signTmp(x.z))
    return data
}

export function sign_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(signTmp(x.x), signTmp(x.y), signTmp(x.z), signTmp(x.w))
    return data
}

export function smoothstep_N_N_N(x: NumData, min: NumData, max: NumData): NumData {
    let data = x.ctor()
    data.v = smoothstepTmp(x.v, min.v, max.v)
    return data
}

export function smoothstep_V2_N_N(x: Vec2Data, min: NumData, max: NumData): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(smoothstepTmp(x.x, min.v, max.v), smoothstepTmp(x.y, min.v, max.v))
    return data
}

export function smoothstep_V3_N_N(x: Vec3Data, min: NumData, max: NumData): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(smoothstepTmp(x.x, min.v, max.v), smoothstepTmp(x.y, min.v, max.v), smoothstepTmp(x.z, min.v, max.v))
    return data
}

export function smoothstep_V4_N_N(x: Vec4Data, min: NumData, max: NumData): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(
        smoothstepTmp(x.x, min.v, max.v),
        smoothstepTmp(x.y, min.v, max.v),
        smoothstepTmp(x.z, min.v, max.v),
        smoothstepTmp(x.w, min.v, max.v)
    )
    return data
}

export function smoothstep_V2_V2_V2(x: Vec2Data, min: Vec2Data, max: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(smoothstepTmp(x.x, min.x, max.x), smoothstepTmp(x.y, min.y, max.y))
    return data
}

export function smoothstep_V3_V3_V3(x: Vec3Data, min: Vec3Data, max: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(smoothstepTmp(x.x, min.x, max.x), smoothstepTmp(x.y, min.y, max.y), smoothstepTmp(x.z, min.z, max.z))
    return data
}

export function smoothstep_V4_V4_V4(x: Vec4Data, min: Vec4Data, max: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(
        smoothstepTmp(x.x, min.x, max.x),
        smoothstepTmp(x.y, min.y, max.y),
        smoothstepTmp(x.z, min.z, max.z),
        smoothstepTmp(x.w, min.w, max.w)
    )
    return data
}

export function sqrt_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = sqrtTmp(x.v)
    return data
}

export function sqrt_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(sqrtTmp(x.x), sqrtTmp(x.y))
    return data
}

export function sqrt_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(sqrtTmp(x.x), sqrtTmp(x.y), sqrtTmp(x.z))
    return data
}

export function sqrt_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(sqrtTmp(x.x), sqrtTmp(x.y), sqrtTmp(x.z), sqrtTmp(x.w))
    return data
}

export function step_N_N(edge: NumData, x: NumData): NumData {
    let data = x.ctor()
    data.v = stepTmp(edge.v, x.v)
    return data
}

export function step_N_V2(edge: NumData, x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(stepTmp(edge.v, x.x), stepTmp(edge.v, x.y))
    return data
}

export function step_N_V3(edge: NumData, x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(stepTmp(edge.v, x.x), stepTmp(edge.v, x.y), stepTmp(edge.v, x.z))
    return data
}

export function step_N_V4(edge: NumData, x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(stepTmp(edge.v, x.x), stepTmp(edge.v, x.y), stepTmp(edge.v, x.z), stepTmp(edge.v, x.w))
    return data
}

export function step_V2_V2(edge: Vec2Data, x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(stepTmp(edge.x, x.x), stepTmp(edge.y, x.y))
    return data
}

export function step_V3_V3(edge: Vec3Data, x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(stepTmp(edge.x, x.x), stepTmp(edge.y, x.y), stepTmp(edge.z, x.z))
    return data
}

export function step_V4_V4(edge: Vec4Data, x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(stepTmp(edge.x, x.x), stepTmp(edge.y, x.y), stepTmp(edge.z, x.z), stepTmp(edge.w, x.w))
    return data
}

export function trunc_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = truncTmp(x.v)
    return data
}

export function trunc_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(truncTmp(x.x), truncTmp(x.y))
    return data
}

export function trunc_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(truncTmp(x.x), truncTmp(x.y), truncTmp(x.z))
    return data
}

export function trunc_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(truncTmp(x.x), truncTmp(x.y), truncTmp(x.z), truncTmp(x.w))
    return data
}

export function cross_V3_V3(x: Vec3Data, y: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set(Vec3Data.cross(data, x, y))
    return data
}

export function distance_N_N(p0: NumData, p1: NumData): FloatData {
    let data = floatData.getData()
    data.v = absTmp(p0.v - (<NumData>p1).v)
    return data
}

export function distance_V2_V2(p0: Vec2Data, p1: Vec2Data): FloatData {
    let data = floatData.getData()
    data.v = Vec2Data.distance(p0, p1)
    return data
}

export function distance_V3_V3(p0: Vec3Data, p1: Vec3Data): FloatData {
    let data = floatData.getData()
    data.v = Vec3Data.distance(p0, p1)
    return data
}

export function distance_V4_V4(p0: Vec4Data, p1: Vec4Data): FloatData {
    let data = floatData.getData()
    data.v = Vec4Data.distance(p0, p1)
    return data
}

export function dot_N_N(p0: NumData, p1: NumData): FloatData {
    let data = floatData.getData()
    data.v = p0.v * (<NumData>p1).v
    return data
}

export function dot_V2_V2(p0: Vec2Data, p1: Vec2Data): FloatData {
    let data = floatData.getData()
    data.v = Vec2Data.dot(p0, p1)
    return data
}

export function dot_V3_V3(p0: Vec3Data, p1: Vec3Data): FloatData {
    let data = floatData.getData()
    data.v = Vec3Data.dot(p0, p1)
    return data
}

export function dot_V4_V4(p0: Vec4Data, p1: Vec4Data): FloatData {
    let data = floatData.getData()
    data.v = Vec4Data.dot(p0, p1)
    return data
}

export function equal_N_N(p0: NumData, p1: NumData): boolean {
    return p0.v == (<NumData>p1).v
}

export function equal_V2_V2(p0: Vec2Data, p1: Vec2Data): boolean {
    return Vec2Data.equals(p0, p1)
}

export function equal_V3_V3(p0: Vec3Data, p1: Vec3Data): boolean {
    return Vec3Data.equals(p0, p1)
}

export function equal_V4_V4(p0: Vec4Data, p1: Vec4Data): boolean {
    return Vec4Data.equals(p0, p1)
}

export function faceforward_N_N_N(N: NumData, I: NumData, Nref: NumData): NumData {
    let data = N.ctor()
    data.set(N)
    if (!((<NumData>Nref).v * (<NumData>I).v < 0)) {
        data.v = -data.v
    }
    return data
}

export function faceforward_V2_V2_V2(N: Vec2Data, I: Vec2Data, Nref: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set(N)

    Vec2Data.dot(Nref, I) < 0 ? data : data.set_Vn(-data.x, -data.y)
    return data
}

export function faceforward_V3_V3_V3(N: Vec3Data, I: Vec3Data, Nref: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set(N)
    Vec3Data.dot(Nref, I) < 0 ? data : data.set_Vn(-data.x, -data.y, -data.z)
    return data
}

export function faceforward_V4_V4_V4(N: Vec4Data, I: Vec4Data, Nref: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set(N)
    Vec4Data.dot(Nref, I) < 0 ? data : data.set_Vn(-data.x, -data.y, -data.z, -data.w)
    return data
}

export function length_N(x: NumData): FloatData {
    let data = x.ctor()
    data.v = absTmp(x.v)
    return data
}

export function length_V2(x: Vec2Data): FloatData {
    let data = floatData.getData()
    data.v = Math.sqrt(x.x * x.x + x.y * x.y)
    return data
}

export function length_V3(x: Vec3Data): FloatData {
    let data = floatData.getData()
    data.v = Math.sqrt(x.x * x.x + x.y * x.y + x.z * x.z)
    return data
}

export function length_V4(x: Vec4Data): FloatData {
    let data = floatData.getData()
    data.v = Math.sqrt(x.x * x.x + x.y * x.y + x.z * x.z + x.w * x.w)
    return data
}

export function normalize_N(x: NumData): NumData {
    let data = x.ctor()
    data.v = 1
    return data
}

export function normalize_V2(v2: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set(v2)
    const x = data.x
    const y = data.y
    let len = x * x + y * y
    if (len > 0) {
        len = 1 / Math.sqrt(len)
        data.x *= len
        data.y *= len
    }
    return data
}

export function normalize_V3(v3: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set(v3)
    const x = data.x
    const y = data.y
    const z = data.z
    let len = x * x + y * y + z * z
    if (len > 0) {
        len = 1 / Math.sqrt(len)
        data.x *= len
        data.y *= len
        data.z *= len
    }
    return data
}

export function normalize_V4(v4: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set(v4)
    const x = data.x
    const y = data.y
    const z = data.z
    const w = data.w
    let len = x * x + y * y + z * z + w * w
    if (len > 0) {
        len = 1 / Math.sqrt(len)
        data.x *= len
        data.y *= len
        data.z *= len
        data.w *= len
    }
    return data
}

export function notEqual_N_N(p0: NumData, p1: NumData): boolean {
    let data = floatData.getData()
    return p0.v != (<NumData>p1).v
}

export function notEqual_V2_V2(p0: Vec2Data, p1: Vec2Data): boolean {
    return !Vec2Data.equals(p0, p1)
}

export function notEqual_V3_V3(p0: Vec3Data, p1: Vec3Data): boolean {
    return !Vec3Data.equals(p0, p1)
}

export function notEqual_V4_V4(p0: Vec4Data, p1: Vec4Data): boolean {
    return !Vec4Data.equals(p0, p1)
}

// I - 2.0 * dot(N, I) * N.
export function reflect_N_N(I: NumData, N: NumData): NumData {
    let data = I.ctor()
    data.v = I.v - 2.0 * (<NumData>N).v * I.v * (<NumData>N).v
    return data
}

export function reflect_V2_V2(I: Vec2Data, N: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.out_x.v = I.x - N.x * 2 * Vec2Data.dot(N, I)
    data.out_y.v = I.y - N.y * 2 * Vec2Data.dot(N, I)
    return data
}

export function reflect_V3_V3(I: Vec3Data, N: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.out_x.v = I.x - N.x * 2 * Vec3Data.dot(N, I)
    data.out_y.v = I.y - N.y * 2 * Vec3Data.dot(N, I)
    data.out_z.v = I.z - N.z * 2 * Vec3Data.dot(N, I)
    return data
}

export function reflect_V4_V4(I: Vec4Data, N: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.out_x.v = I.x - N.x * 2 * Vec4Data.dot(N, I)
    data.out_y.v = I.y - N.y * 2 * Vec4Data.dot(N, I)
    data.out_z.v = I.z - N.z * 2 * Vec4Data.dot(N, I)
    data.out_w.v = I.w - N.w * 2 * Vec4Data.dot(N, I)
    return data
}

// 折射
// k = 1.0 - eta * eta * (1.0 - dot(N, I) * dot(N, I));
// if (k < 0.0)
//     R = genType(0.0);       // or genDType(0.0)
// else
//     R = eta * I - (eta * dot(N, I) + sqrt(k)) * N;
export function refract_N_N_N(I: NumData, N: NumData, eta: NumData): NumData {
    let data = I.ctor()
    let v = eta.v
    let NIDot = (<NumData>N).v * I.v
    let k = 1.0 - v * v * (1.0 - NIDot * NIDot)
    if (k < 0.0) {
        data.v = 0
    } else {
        let vd = v * I.v
        data.v = vd - (<NumData>N).v * v * NIDot + sqrtTmp(k)
    }
    return data
}
export function refract_V2_V2_N(I: Vec2Data, N: Vec2Data, eta: NumData): Vec2Data {
    let data = vec2Data.getData()
    let v = eta.v
    let NIDot = Vec2Data.dot(N, I)
    let k = 1.0 - v * v * (1.0 - NIDot * NIDot)
    if (k < 0.0) {
        data.set_Vn(0, 0)
    } else {
        let vd = vec2Data.getData()
        Vec2Data.multiplyScalar(vd, I, v)
        Vec2Data.multiplyScalar(data, N, v * NIDot + sqrtTmp(k))
        Vec2Data.subtract(data, vd, data)
    }
    return data
}
export function refract_V3_V3_N(I: Vec3Data, N: Vec3Data, eta: NumData): Vec3Data {
    let data = vec3Data.getData()
    let v = eta.v
    let NIDot = Vec3Data.dot(N, I)
    let k = 1.0 - v * v * (1.0 - NIDot * NIDot)
    if (k < 0.0) {
        data.set_Vn(0, 0, 0)
    } else {
        let vd = vec3Data.getData()
        Vec3Data.multiplyScalar(vd, I, v)
        Vec3Data.multiplyScalar(data, N, v * NIDot + sqrtTmp(k))
        Vec3Data.subtract(data, vd, data)
    }
    return data
}
export function refract_V4_V4_N(I: Vec4Data, N: Vec4Data, eta: NumData): Vec4Data {
    let data = vec4Data.getData()
    let v = eta.v
    let NIDot = Vec4Data.dot(N, I)
    let k = 1.0 - v * v * (1.0 - NIDot * NIDot)
    if (k < 0.0) {
        data.set_Vn(0, 0, 0, 0)
    } else {
        let vd = vec4Data.getData()
        Vec4Data.multiplyScalar(vd, I, v)
        Vec4Data.multiplyScalar(data, N, v * NIDot + sqrtTmp(k))
        Vec4Data.subtract(data, vd, data)
    }
    return data
}

export function determinant_M3(m: Mat3Data): FloatData {
    let data = floatData.getData()

    const a00 = m.m00
    const a01 = m.m01
    const a02 = m.m02
    const a10 = m.m03
    const a11 = m.m04
    const a12 = m.m05
    const a20 = m.m06
    const a21 = m.m07
    const a22 = m.m08

    data.v = a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20)
    return data
}

export function determinant_M4(m: Mat4Data): FloatData {
    let data = floatData.getData()

    const a00 = m.m00
    const a01 = m.m01
    const a02 = m.m02
    const a03 = m.m03
    const a10 = m.m04
    const a11 = m.m05
    const a12 = m.m06
    const a13 = m.m07
    const a20 = m.m08
    const a21 = m.m09
    const a22 = m.m10
    const a23 = m.m11
    const a30 = m.m12
    const a31 = m.m13
    const a32 = m.m14
    const a33 = m.m15

    const b00 = a00 * a11 - a01 * a10
    const b01 = a00 * a12 - a02 * a10
    const b02 = a00 * a13 - a03 * a10
    const b03 = a01 * a12 - a02 * a11
    const b04 = a01 * a13 - a03 * a11
    const b05 = a02 * a13 - a03 * a12
    const b06 = a20 * a31 - a21 * a30
    const b07 = a20 * a32 - a22 * a30
    const b08 = a20 * a33 - a23 * a30
    const b09 = a21 * a32 - a22 * a31
    const b10 = a21 * a33 - a23 * a31
    const b11 = a22 * a33 - a23 * a32

    // Calculate the determinant
    data.v = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06
    return data
}

export function inverse_M3(m: Mat3Data): Mat3Data {
    let out = builtinCachData.mat3Data.getData()
    const a00 = m.m00
    const a01 = m.m01
    const a02 = m.m02
    const a10 = m.m03
    const a11 = m.m04
    const a12 = m.m05
    const a20 = m.m06
    const a21 = m.m07
    const a22 = m.m08

    const b01 = a22 * a11 - a12 * a21
    const b11 = -a22 * a10 + a12 * a20
    const b21 = a21 * a10 - a11 * a20

    let det = a00 * b01 + a01 * b11 + a02 * b21
    if (det === 0) {
        out.m00 = 0
        out.m01 = 0
        out.m02 = 0
        out.m03 = 0
        out.m04 = 0
        out.m05 = 0
        out.m06 = 0
        out.m07 = 0
        out.m08 = 0
        return out
    }
    det = 1.0 / det

    out.m00 = b01 * det
    out.m01 = (-a22 * a01 + a02 * a21) * det
    out.m02 = (a12 * a01 - a02 * a11) * det
    out.m03 = b11 * det
    out.m04 = (a22 * a00 - a02 * a20) * det
    out.m05 = (-a12 * a00 + a02 * a10) * det
    out.m06 = b21 * det
    out.m07 = (-a21 * a00 + a01 * a20) * det
    out.m08 = (a11 * a00 - a01 * a10) * det

    return out
}

export function inverse_M4(m: Mat4Data): Mat4Data {
    let out = builtinCachData.mat4Data.getData()

    const a00 = m.m00
    const a01 = m.m01
    const a02 = m.m02
    const a03 = m.m03
    const a10 = m.m04
    const a11 = m.m05
    const a12 = m.m06
    const a13 = m.m07
    const a20 = m.m08
    const a21 = m.m09
    const a22 = m.m10
    const a23 = m.m11
    const a30 = m.m12
    const a31 = m.m13
    const a32 = m.m14
    const a33 = m.m15

    const b00 = a00 * a11 - a01 * a10
    const b01 = a00 * a12 - a02 * a10
    const b02 = a00 * a13 - a03 * a10
    const b03 = a01 * a12 - a02 * a11
    const b04 = a01 * a13 - a03 * a11
    const b05 = a02 * a13 - a03 * a12
    const b06 = a20 * a31 - a21 * a30
    const b07 = a20 * a32 - a22 * a30
    const b08 = a20 * a33 - a23 * a30
    const b09 = a21 * a32 - a22 * a31
    const b10 = a21 * a33 - a23 * a31
    const b11 = a22 * a33 - a23 * a32
    // Calculate the determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06

    // Calculate the determinant
    if (det === 0) {
        out.m00 = 0
        out.m01 = 0
        out.m02 = 0
        out.m03 = 0
        out.m04 = 0
        out.m05 = 0
        out.m06 = 0
        out.m07 = 0
        out.m08 = 0
        out.m09 = 0
        out.m10 = 0
        out.m11 = 0
        out.m12 = 0
        out.m13 = 0
        out.m14 = 0
        out.m15 = 0
        return out
    }
    det = 1.0 / det

    out.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det
    out.m01 = (a02 * b10 - a01 * b11 - a03 * b09) * det
    out.m02 = (a31 * b05 - a32 * b04 + a33 * b03) * det
    out.m03 = (a22 * b04 - a21 * b05 - a23 * b03) * det
    out.m04 = (a12 * b08 - a10 * b11 - a13 * b07) * det
    out.m05 = (a00 * b11 - a02 * b08 + a03 * b07) * det
    out.m06 = (a32 * b02 - a30 * b05 - a33 * b01) * det
    out.m07 = (a20 * b05 - a22 * b02 + a23 * b01) * det
    out.m08 = (a10 * b10 - a11 * b08 + a13 * b06) * det
    out.m09 = (a01 * b08 - a00 * b10 - a03 * b06) * det
    out.m10 = (a30 * b04 - a31 * b02 + a33 * b00) * det
    out.m11 = (a21 * b02 - a20 * b04 - a23 * b00) * det
    out.m12 = (a11 * b07 - a10 * b09 - a12 * b06) * det
    out.m13 = (a00 * b09 - a01 * b07 + a02 * b06) * det
    out.m14 = (a31 * b01 - a30 * b03 - a32 * b00) * det
    out.m15 = (a20 * b03 - a21 * b01 + a22 * b00) * det

    return out
}

export function int(): IntData {
    let data = intData.getData()
    data.v = 0
    return data
}

export function int_N(x?: NumData | number): IntData {
    let data = intData.getData()
    data.v = getNum(x) || 0
    return data
}

export function float(): IntData {
    let data = floatData.getData()
    data.v = 0
    return data
}

export function float_N(x?: NumData | number): FloatData {
    let data = floatData.getData()
    data.v = getNum(x) || 0
    return data
}

export function vec2(): Vec2Data {
    let data = vec2Data.getData()
    data.set_Vn(0, 0)
    return data
}

export function vec2_N(x: NumData): Vec2Data {
    let data = vec2Data.getData()
    data.set_N_N(x, x)
    return data
}

export function vec2_N_N(x: NumData, y: NumData): Vec2Data {
    let data = vec2Data.getData()
    data.set_N_N(x, y)
    return data
}
export function vec2_V2(x: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.set_V2(x)
    return data
}

export function vec3(): Vec3Data {
    let data = vec3Data.getData()
    data.set_Vn(0, 0, 0)
    return data
}

export function vec3_N(x: NumData): Vec3Data {
    let data = vec3Data.getData()
    data.set_N_N_N(x, x, x)
    return data
}

export function vec3_N_N_N(x: NumData, y: NumData, z: NumData): Vec3Data {
    let data = vec3Data.getData()
    data.set_N_N_N(x, y, z)
    return data
}

export function vec3_V2_N(x: Vec2Data, y: NumData): Vec3Data {
    let data = vec3Data.getData()
    data.set_N_N_N(x.out_x, x.out_y, y)
    return data
}

export function vec3_N_V2(x: NumData, y: Vec2Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_N_N_N(x, y.out_x, y.out_y)
    return data
}

export function vec3_V3(x: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.set_V3(x)
    return data
}

export function vec4(): Vec4Data {
    let data = vec4Data.getData()
    data.set_Vn(0, 0, 0, 0)
    return data
}

export function vec4_N(x: NumData): Vec4Data {
    let data = vec4Data.getData()
    data.set_N_N_N_N(x, x, x, x)
    return data
}

export function vec4_N_N_N_N(x: NumData, y: NumData, z: NumData, w: NumData): Vec4Data {
    let data = vec4Data.getData()
    data.set_N_N_N_N(x, y, z, w)
    return data
}

export function vec4_N_N_V2(x: NumData, y: NumData, z: Vec2Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_N_N_N_N(x, y, z.out_x, z.out_y)
    return data
}

export function vec4_N_V3(x: NumData, y: Vec3Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_N_N_N_N(x, y.out_x, y.out_y, y.out_z)
    return data
}

export function vec4_V2_N_N(x: Vec2Data, y: NumData, z: NumData): Vec4Data {
    let data = vec4Data.getData()
    data.set_N_N_N_N(x.out_x, x.out_y, y, z)
    return data
}

export function vec4_V2_V2(x: Vec2Data, y: Vec2Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_N_N_N_N(x.out_x, x.out_y, y.out_x, y.out_x)
    return data
}

export function vec4_V3_N(x: Vec3Data, y: NumData): Vec4Data {
    let data = vec4Data.getData()
    data.set_N_N_N_N(x.out_x, x.out_y, x.out_z, y)
    return data
}

export function vec4_V4(x: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.set_V4(x)
    return data
}

export function mat3(): Mat3Data {
    let out = builtinCachData.mat3Data.getData()
    out.m00 = 0
    out.m01 = 0
    out.m02 = 0
    out.m03 = 0
    out.m04 = 0
    out.m05 = 0
    out.m06 = 0
    out.m07 = 0
    out.m08 = 0
    return out
}

export function mat3_M3(m00: Mat3Data): Mat3Data {
    let data = builtinCachData.mat3Data.getData()
    data.set(m00)
    return data
}

export function mat3_M4(m00: Mat4Data): Mat3Data {
    let out = builtinCachData.mat3Data.getData()
    out.m00 = m00.m00
    out.m01 = m00.m01
    out.m02 = m00.m02
    out.m03 = m00.m04
    out.m04 = m00.m05
    out.m05 = m00.m06
    out.m06 = m00.m08
    out.m07 = m00.m09
    out.m08 = m00.m10
    return out
}

export function mat3_V3_V3_V3(m00: Vec3Data, m01: Vec3Data, m02: Vec3Data): Mat3Data {
    let out = builtinCachData.mat3Data.getData()
    out.m00 = m00.x
    out.m01 = m00.y
    out.m02 = m00.z
    out.m03 = m01.x
    out.m04 = m01.y
    out.m05 = m01.z
    out.m06 = m02.x
    out.m07 = m02.y
    out.m08 = m02.z
    return out
}

export function mat3_N_N_N_N_N_N_N_N_N(
    m00: NumData,
    m01: NumData,
    m02: NumData,
    m03: NumData,
    m04: NumData,
    m05: NumData,
    m06: NumData,
    m07: NumData,
    m08: NumData
): Mat3Data {
    let out = builtinCachData.mat3Data.getData()
    out.m00 = m00.v
    out.m01 = m01.v
    out.m02 = m02.v
    out.m03 = m03.v
    out.m04 = m04.v
    out.m05 = m05.v
    out.m06 = m06.v
    out.m07 = m07.v
    out.m08 = m08.v
    return out
}

export function mat4(): Mat4Data {
    let out = builtinCachData.mat4Data.getData()
    out.m00 = 0
    out.m01 = 0
    out.m02 = 0
    out.m03 = 0
    out.m04 = 0
    out.m05 = 0
    out.m06 = 0
    out.m07 = 0
    out.m08 = 0
    out.m09 = 0
    out.m10 = 0
    out.m11 = 0
    out.m12 = 0
    out.m13 = 0
    out.m14 = 0
    out.m15 = 0
    return out
}

export function mat4_M3(m00: Mat3Data): Mat4Data {
    let data = builtinCachData.mat4Data.getData()
    data.m00 = m00.m00
    data.m01 = m00.m01
    data.m02 = m00.m02
    data.m03 = 0
    data.m04 = m00.m03
    data.m05 = m00.m04
    data.m06 = m00.m05
    data.m07 = 0
    data.m08 = m00.m06
    data.m09 = m00.m07
    data.m10 = m00.m08
    data.m11 = 0
    data.m12 = 0
    data.m13 = 0
    data.m14 = 0
    data.m15 = 0

    return data
}

export function mat4_M4(m00: Mat4Data): Mat4Data {
    let data = builtinCachData.mat4Data.getData()
    data.set(m00)
    return data
}

export function mat4_V4_V4_V4_V4(m00: Vec4Data, m01: Vec4Data, m02: Vec4Data, m03: Vec4Data): Mat4Data {
    let out = builtinCachData.mat4Data.getData()
    out.m00 = m00.x
    out.m01 = m00.y
    out.m02 = m00.z
    out.m03 = m00.w
    out.m04 = m01.x
    out.m05 = m01.y
    out.m06 = m01.z
    out.m07 = m01.w
    out.m08 = m02.x
    out.m09 = m02.y
    out.m10 = m02.z
    out.m11 = m02.w
    out.m12 = m03.x
    out.m13 = m03.y
    out.m14 = m03.z
    out.m15 = m03.w
    return out
}

export function mat4_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N(
    m00: NumData,
    m01: NumData,
    m02: NumData,
    m03: NumData,
    m04: NumData,
    m05: NumData,
    m06: NumData,
    m07: NumData,
    m08: NumData,
    m09: NumData,
    m10: NumData,
    m11: NumData,
    m12: NumData,
    m13: NumData,
    m14: NumData,
    m15: NumData
): Mat4Data {
    let out = builtinCachData.mat4Data.getData()
    out.m00 = m00.v
    out.m01 = m01.v
    out.m02 = m02.v
    out.m03 = m03.v
    out.m04 = m04.v
    out.m05 = m05.v
    out.m06 = m06.v
    out.m07 = m07.v
    out.m08 = m08.v
    out.m09 = m09.v
    out.m10 = m10.v
    out.m11 = m11.v
    out.m12 = m12.v
    out.m13 = m13.v
    out.m14 = m14.v
    out.m15 = m15.v
    return out
}

export function texture2D_N_V2(texIndex: IntData, uv: Vec2Data) {
    return cpuRenderingContext.customSampler2D(texIndex.v, uv)
}

export function textureCube_NA_V3(texIndex: SamplerCube, uv: Vec3Data) {
    // return cpuRenderingContext.customSampler2D(texIndex.v, uv)
    console.error("textureCube_IA_V3 还未实现")
    return new Vec4Data()
}

export function bool(): BoolData {
    let data = boolData.getData()
    data.v = false
    return data
}

export function bool_N(v: boolean): BoolData {
    let data = boolData.getData()
    data.v = v
    return data
}
