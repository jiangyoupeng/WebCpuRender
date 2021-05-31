import {
    BoolData,
    builtinCachData,
    FloatData,
    IntData,
    Mat3Data,
    Mat4Data,
    NumData,
    Vec2Data,
    Vec3Data,
    Vec4Data,
    ValueType,
} from "./BuiltinData"

let vec2Data = builtinCachData.vec2Data
let vec3Data = builtinCachData.vec3Data
let vec4Data = builtinCachData.vec4Data
let mat3Data = builtinCachData.mat3Data
let mat4Data = builtinCachData.mat4Data
let boolData = builtinCachData.boolData

// 经测试 glsl中不会直接拿int和float做操作

export function glAdd_N_N(left: NumData, right: NumData): NumData {
    let data = left.ctor()
    data.v = left.v + right.v
    return data
}

export function glAdd_N_V2(left: NumData, right: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    let v = left.v
    data.x = v + right.x
    data.y = v + right.y
    return data
}

export function glAdd_N_V3(left: NumData, right: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    let v = left.v
    data.x = v + right.x
    data.y = v + right.y
    data.z = v + right.z
    return data
}

export function glAdd_N_V4(left: NumData, right: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    let v = left.v
    data.x = v + right.x
    data.y = v + right.y
    data.z = v + right.z
    data.w = v + right.w
    return data
}

export function glAdd_V2_N(left: Vec2Data, right: NumData): Vec2Data {
    let data = vec2Data.getData()
    let v = right.v
    data.x = left.x + v
    data.y = left.y + v
    return data
}

export function glAdd_V2_V2(left: Vec2Data, right: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.x = left.x + right.x
    data.y = left.y + right.y
    return data
}

export function glAdd_V3_N(left: Vec3Data, right: NumData): Vec3Data {
    let data = vec3Data.getData()
    let v = right.v
    data.x = left.x + v
    data.y = left.y + v
    data.z = left.z + v
    return data
}

export function glAdd_V3_V3(left: Vec3Data, right: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.x = left.x + right.x
    data.y = left.y + right.y
    data.z = left.z + right.z
    return data
}

export function glAdd_V4_N(left: Vec4Data, right: NumData): Vec4Data {
    let data = vec4Data.getData()
    let v = right.v
    data.x = left.x + v
    data.y = left.y + v
    data.z = left.z + v
    data.w = left.w + v
    return data
}

export function glAdd_V4_V4(left: Vec4Data, right: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.x = left.x + right.x
    data.y = left.y + right.y
    data.z = left.z + right.z
    data.w = left.w + right.w
    return data
}

export function glAddSet_N_N(left: NumData, right: NumData): void {
    left.v = left.v + right.v
}

export function glAddSet_V2_N(left: Vec2Data, right: NumData): void {
    let v = right.v
    left.x = left.x + v
    left.y = left.y + v
}

export function glAddSet_V2_V2(left: Vec2Data, right: Vec2Data): void {
    left.x = left.x + right.x
    left.y = left.y + right.y
}

export function glAddSet_V3_N(left: Vec3Data, right: NumData): void {
    let v = right.v
    left.x = left.x + v
    left.y = left.y + v
    left.z = left.z + v
}

export function glAddSet_V3_V3(left: Vec3Data, right: Vec3Data): void {
    left.x = left.x + right.x
    left.y = left.y + right.y
    left.z = left.z + right.z
}

export function glAddSet_V4_N(left: Vec4Data, right: NumData): void {
    let v = right.v
    left.x = left.x + v
    left.y = left.y + v
    left.z = left.z + v
    left.w = left.w + v
}

export function glAddSet_V4_V4(left: Vec4Data, right: Vec4Data): void {
    left.x = left.x + right.x
    left.y = left.y + right.y
    left.z = left.z + right.z
    left.w = left.w + right.w
}

export function glSub_N_N(left: NumData, right: NumData): NumData {
    let data = left.ctor()
    data.v = left.v - right.v
    return data
}

export function glSub_N_V2(left: NumData, right: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    let v = left.v
    data.x = v - right.x
    data.y = v - right.y
    return data
}

export function glSub_N_V3(left: NumData, right: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    let v = left.v
    data.x = v - right.x
    data.y = v - right.y
    data.z = v - right.z
    return data
}

export function glSub_N_V4(left: NumData, right: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    let v = left.v
    data.x = v - right.x
    data.y = v - right.y
    data.z = v - right.z
    data.w = v - right.w
    return data
}

export function glSub_V2_N(left: Vec2Data, right: NumData): Vec2Data {
    let data = vec2Data.getData()
    let v = right.v
    data.x = left.x - v
    data.y = left.y - v
    return data
}

export function glSub_V2_V2(left: Vec2Data, right: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.x = left.x - right.x
    data.y = left.y - right.y
    return data
}

export function glSub_V3_N(left: Vec3Data, right: NumData): Vec3Data {
    let data = vec3Data.getData()
    let v = right.v
    data.x = left.x - v
    data.y = left.y - v
    data.z = left.z - v
    return data
}

export function glSub_V3_V3(left: Vec3Data, right: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.x = left.x - right.x
    data.y = left.y - right.y
    data.z = left.z - right.z
    return data
}

export function glSub_V4_N(left: Vec4Data, right: NumData): Vec4Data {
    let data = vec4Data.getData()
    let v = right.v
    data.x = left.x - v
    data.y = left.y - v
    data.z = left.z - v
    data.w = left.w - v
    return data
}

export function glSub_V4_V4(left: Vec4Data, right: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.x = left.x - right.x
    data.y = left.y - right.y
    data.z = left.z - right.z
    data.w = left.w - right.w
    return data
}

export function glSubSet_N_N(left: NumData, right: NumData): void {
    left.v = left.v - right.v
}

export function glSubSet_V2_N(left: Vec2Data, right: NumData): void {
    let v = right.v
    left.x = left.x - v
    left.y = left.y - v
}

export function glSubSet_V2_V2(left: Vec2Data, right: Vec2Data): void {
    left.x = left.x - right.x
    left.y = left.y - right.y
}

export function glSubSet_V3_N(left: Vec3Data, right: NumData): void {
    let v = right.v
    left.x = left.x - v
    left.y = left.y - v
    left.z = left.z - v
}

export function glSubSet_V3_V3(left: Vec3Data, right: Vec3Data): void {
    left.x = left.x - right.x
    left.y = left.y - right.y
    left.z = left.z - right.z
}

export function glSubSet_V4_N(left: Vec4Data, right: NumData): void {
    let v = right.v
    left.x = left.x - v
    left.y = left.y - v
    left.z = left.z - v
    left.w = left.w - v
}

export function glSubSet_V4_V4(left: Vec4Data, right: Vec4Data): void {
    left.x = left.x - right.x
    left.y = left.y - right.y
    left.z = left.z - right.z
    left.w = left.w - right.w
}

export function glMul_N_N(left: NumData, right: NumData): NumData {
    let data = left.ctor()
    data.v = left.v * right.v
    return data
}

export function glMul_N_V2(left: NumData, right: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    let v = left.v
    data.x = v * right.x
    data.y = v * right.y
    return data
}

export function glMul_N_V3(left: NumData, right: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    let v = left.v
    data.x = v * right.x
    data.y = v * right.y
    data.z = v * right.z
    return data
}

export function glMul_N_V4(left: NumData, right: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    let v = left.v
    data.x = v * right.x
    data.y = v * right.y
    data.z = v * right.z
    data.w = v * right.w
    return data
}

export function glMul_V2_N(left: Vec2Data, right: NumData): Vec2Data {
    let data = vec2Data.getData()
    let v = right.v
    data.x = left.x * v
    data.y = left.y * v
    return data
}

export function glMul_V2_V2(left: Vec2Data, right: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.x = left.x * right.x
    data.y = left.y * right.y
    return data
}

export function glMul_V3_N(left: Vec3Data, right: NumData): Vec3Data {
    let data = vec3Data.getData()
    let v = right.v
    data.x = left.x * v
    data.y = left.y * v
    data.z = left.z * v
    return data
}

export function glMul_V3_V3(left: Vec3Data, right: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.x = left.x * right.x
    data.y = left.y * right.y
    data.z = left.z * right.z
    return data
}

export function glMul_V3_M3(left: Vec3Data, right: Mat3Data): Vec3Data {
    let data = vec3Data.getData()
    Vec3Data.transformMat3(data, left, right)
    return data
}

export function glMul_V4_N(left: Vec4Data, right: NumData): Vec4Data {
    let data = vec4Data.getData()
    let v = right.v
    data.x = left.x * v
    data.y = left.y * v
    data.z = left.z * v
    data.w = left.w * v
    return data
}

export function glMul_V4_V4(left: Vec4Data, right: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.x = left.x * right.x
    data.y = left.y * right.y
    data.z = left.z * right.z
    data.w = left.w * right.w
    return data
}

export function glMul_M3_M3(left: Mat3Data, right: Mat3Data): Mat3Data {
    let data = mat3Data.getData()
    Mat3Data.multiply(data, left, right)
    return data
}

export function glMul_M4_M4(left: Mat4Data, right: Mat4Data): Mat4Data {
    let data = mat4Data.getData()
    Mat4Data.multiply(data, left, right)
    return data
}

export function glMulSet_N_N(left: NumData, right: NumData): void {
    left.v = left.v * right.v
}

export function glMulSet_V2_N(left: Vec2Data, right: NumData): void {
    let v = right.v
    left.x = left.x * v
    left.y = left.y * v
}

export function glMulSet_V2_V2(left: Vec2Data, right: Vec2Data): void {
    left.x = left.x * right.x
    left.y = left.y * right.y
}

export function glMulSet_V3_N(left: Vec3Data, right: NumData): void {
    let v = right.v
    left.x = left.x * v
    left.y = left.y * v
    left.z = left.z * v
}

export function glMulSet_V3_V3(left: Vec3Data, right: Vec3Data): void {
    left.x = left.x * right.x
    left.y = left.y * right.y
    left.z = left.z * right.z
}

export function glMulSet_V4_N(left: Vec4Data, right: NumData): void {
    let v = right.v
    left.x = left.x * v
    left.y = left.y * v
    left.z = left.z * v
    left.w = left.w * v
}

export function glMulSet_V4_V4(left: Vec4Data, right: Vec4Data): void {
    left.x = left.x * right.x
    left.y = left.y * right.y
    left.z = left.z * right.z
    left.w = left.w * right.w
}

export function glMul_M4_V4(left: Mat4Data, right: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    Vec4Data.transformMat4(data, right, left)
    return data
}

export function glMul_V4_M4(left: Vec4Data, right: Mat4Data): Vec4Data {
    let data = vec4Data.getData()
    Vec4Data.transformMat4(data, left, right)
    return data
}

export function glDiv_N_N(left: NumData, right: NumData): NumData {
    let data = left.ctor()
    data.v = left.v / right.v
    return data
}

export function glDiv_N_V2(left: NumData, right: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    let v = left.v
    data.x = v / right.x
    data.y = v / right.y
    return data
}

export function glDiv_N_V3(left: NumData, right: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    let v = left.v
    data.x = v / right.x
    data.y = v / right.y
    data.z = v / right.z
    return data
}

export function glDiv_N_V4(left: NumData, right: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    let v = left.v
    data.x = v / right.x
    data.y = v / right.y
    data.z = v / right.z
    data.w = v / right.w
    return data
}

export function glDiv_V2_N(left: Vec2Data, right: NumData): Vec2Data {
    let data = vec2Data.getData()
    let v = right.v
    data.x = left.x / v
    data.y = left.y / v
    return data
}

export function glDiv_V2_V2(left: Vec2Data, right: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.x = left.x / right.x
    data.y = left.y / right.y
    return data
}

export function glDiv_V3_N(left: Vec3Data, right: NumData): Vec3Data {
    let data = vec3Data.getData()
    let v = right.v
    data.x = left.x / v
    data.y = left.y / v
    data.z = left.z / v
    return data
}

export function glDiv_V3_V3(left: Vec3Data, right: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.x = left.x / right.x
    data.y = left.y / right.y
    data.z = left.z / right.z
    return data
}

export function glDiv_V4_N(left: Vec4Data, right: NumData): Vec4Data {
    let data = vec4Data.getData()
    let v = right.v
    data.x = left.x / v
    data.y = left.y / v
    data.z = left.z / v
    data.w = left.w / v
    return data
}

export function glDiv_V4_V4(left: Vec4Data, right: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.x = left.x / right.x
    data.y = left.y / right.y
    data.z = left.z / right.z
    data.w = left.w / right.w
    return data
}

export function glDivSet_N_N(left: NumData, right: NumData): void {
    left.v = left.v / right.v
}

export function glDivSet_V2_N(left: Vec2Data, right: NumData): void {
    let v = right.v
    left.x = left.x / v
    left.y = left.y / v
}

export function glDivSet_V2_V2(left: Vec2Data, right: Vec2Data): void {
    left.x = left.x / right.x
    left.y = left.y / right.y
}

export function glDivSet_V3_N(left: Vec3Data, right: NumData): void {
    let v = right.v
    left.x = left.x / v
    left.y = left.y / v
    left.z = left.z / v
}

export function glDivSet_V3_V3(left: Vec3Data, right: Vec3Data): void {
    left.x = left.x / right.x
    left.y = left.y / right.y
    left.z = left.z / right.z
}

export function glDivSet_V4_N(left: Vec4Data, right: NumData): void {
    let v = right.v
    left.x = left.x / v
    left.y = left.y / v
    left.z = left.z / v
    left.w = left.w / v
}

export function glNegative_N(v: NumData): NumData {
    let data = v.ctor()
    data.v = -v.v
    return data
}

export function glNegative_V2(v: Vec2Data): Vec2Data {
    let data = vec2Data.getData()
    data.x = -v.x
    data.y = -v.y
    return data
}

export function glNegative_V3(v: Vec3Data): Vec3Data {
    let data = vec3Data.getData()
    data.x = -v.x
    data.y = -v.y
    data.z = -v.z
    return data
}

export function glNegative_V4(v: Vec4Data): Vec4Data {
    let data = vec4Data.getData()
    data.x = -v.x
    data.y = -v.y
    data.z = -v.z
    data.w = -v.w
    return data
}

export function glSet_N_N(left: NumData, right: NumData): NumData {
    left.v = right.v
    return left
}

export function glSet_B_B(left: BoolData, right: BoolData): BoolData {
    left.v = right.v
    return left
}

export function glSet_B_b(left: BoolData, right: boolean): BoolData {
    left.v = right
    return left
}

export function glSet_V2_V2(left: Vec2Data, right: Vec2Data): Vec2Data {
    left.x = right.x
    left.y = right.y
    return left
}

export function glSet_V3_V3(left: Vec3Data, right: Vec3Data): Vec3Data {
    left.x = right.x
    left.y = right.y
    left.z = right.z
    return left
}

export function glSet_V4_V4(left: Vec4Data, right: Vec4Data): Vec4Data {
    left.x = right.x
    left.y = right.y
    left.z = right.z
    left.w = right.w
    return left
}

export function glSet_M3_M3(left: Mat3Data, right: Mat3Data): Mat3Data {
    left.set(right)
    return left
}

export function glSet_M4_M4(left: Mat4Data, right: Mat4Data): Mat4Data {
    left.set(right)
    return left
}

export function glSet_Struct_Struct(left: any, right: any): any {
    for (const key in right) {
        if (Object.prototype.hasOwnProperty.call(right, key)) {
            const element = right[key]
            if (element.constructor === ValueType) {
                ;(<ValueType>left[key]).set(right[key])
            } else if (element.constructor === Object) {
                glSet_Struct_Struct(left[key], right[key])
            } else {
                left[key] = right[key]
            }
        }
    }
    return left
}

export function glIsNotEqual_N_N(left: NumData, right: NumData): boolean {
    return left.v !== right.v
}

export function glIsEqual_N_N(left: NumData, right: NumData): boolean {
    return left.v === right.v
}

export function glIsLessEqual_N_N(left: NumData, right: NumData): boolean {
    return left.v <= right.v
}

export function glIsLess_N_N(left: NumData, right: NumData): boolean {
    return left.v < right.v
}

export function glIsMore_N_N(left: NumData, right: NumData): boolean {
    return left.v > right.v
}

export function glIsMoreEqual_N_N(left: NumData, right: NumData): boolean {
    return left.v >= right.v
}

export function glFrontAddSelf_N(n: NumData): NumData {
    ++n.v
    return n
}

export function glAfterAddSelf_N(n: NumData): NumData {
    n.v++
    return n
}

export function glFrontSubSelf_N(n: NumData): NumData {
    --n.v
    return n
}

export function glAfterSubSelf_N(n: NumData): NumData {
    n.v--
    return n
}

export function glFrontAddSelf_V2(n: Vec2Data): Vec2Data {
    ++n.x
    ++n.y
    return n
}

export function glAfterAddSelf_V2(n: Vec2Data): Vec2Data {
    n.x++
    n.y++
    return n
}

export function glFrontSubSelf_V2(n: Vec2Data): Vec2Data {
    --n.x
    --n.y
    return n
}

export function glAfterSubSelf_V2(n: Vec2Data): Vec2Data {
    n.x--
    n.y--
    return n
}

export function glFrontAddSelf_V3(n: Vec3Data): Vec3Data {
    ++n.x
    ++n.y
    ++n.z
    return n
}

export function glAfterAddSelf_V3(n: Vec3Data): Vec3Data {
    n.x++
    n.y++
    n.z++
    return n
}

export function glFrontSubSelf_V3(n: Vec3Data): Vec3Data {
    --n.x
    --n.y
    --n.z
    return n
}

export function glAfterSubSelf_V3(n: Vec3Data): Vec3Data {
    n.x--
    n.y--
    n.z--
    return n
}

export function glFrontAddSelf_V4(n: Vec4Data): Vec4Data {
    ++n.x
    ++n.y
    ++n.z
    ++n.w
    return n
}

export function glAfterAddSelf_V4(n: Vec4Data): Vec4Data {
    n.x++
    n.y++
    n.z++
    n.w++
    return n
}

export function glFrontSubSelf_V4(n: Vec4Data): Vec4Data {
    --n.x
    --n.y
    --n.z
    --n.w
    return n
}

export function glAfterSubSelf_V4(n: Vec4Data): Vec4Data {
    n.x--
    n.y--
    n.z--
    n.w--
    return n
}

export function glFrontAddSelf_M3(n: Mat3Data): Mat3Data {
    ++n.m01
    ++n.m02
    ++n.m03
    ++n.m04
    ++n.m05
    ++n.m06
    ++n.m07
    ++n.m08
    return n
}

export function glAfterAddSelf_M3(n: Mat3Data): Mat3Data {
    n.m01++
    n.m02++
    n.m03++
    n.m04++
    n.m05++
    n.m06++
    n.m07++
    n.m08++
    return n
}

export function glFrontSubSelf_M3(n: Mat3Data): Mat3Data {
    --n.m01
    --n.m02
    --n.m03
    --n.m04
    --n.m05
    --n.m06
    --n.m07
    --n.m08
    return n
}

export function glAfterSubSelf_M3(n: Mat3Data): Mat3Data {
    n.m01--
    n.m02--
    n.m03--
    n.m04--
    n.m05--
    n.m06--
    n.m07--
    n.m08--
    return n
}

export function glFrontAddSelf_M4(n: Mat4Data): Mat4Data {
    ++n.m01
    ++n.m02
    ++n.m03
    ++n.m04
    ++n.m05
    ++n.m06
    ++n.m07
    ++n.m08
    ++n.m09
    ++n.m10
    ++n.m11
    ++n.m12
    ++n.m13
    ++n.m14
    ++n.m15
    return n
}

export function glAfterAddSelf_M4(n: Mat4Data): Mat4Data {
    n.m01++
    n.m02++
    n.m03++
    n.m04++
    n.m05++
    n.m06++
    n.m07++
    n.m08++
    n.m09++
    n.m10++
    n.m11++
    n.m12++
    n.m13++
    n.m14++
    n.m15++
    return n
}

export function glFrontSubSelf_M4(n: Mat4Data): Mat4Data {
    --n.m01
    --n.m02
    --n.m03
    --n.m04
    --n.m05
    --n.m06
    --n.m07
    --n.m08
    --n.m09
    --n.m10
    --n.m11
    --n.m12
    --n.m13
    --n.m14
    --n.m15
    return n
}

export function glAfterSubSelf_M4(n: Mat4Data): Mat4Data {
    n.m01--
    n.m02--
    n.m03--
    n.m04--
    n.m05--
    n.m06--
    n.m07--
    n.m08--
    n.m09--
    n.m10--
    n.m11--
    n.m12--
    n.m13--
    n.m14--
    n.m15--
    return n
}

let numWithXYZW = ["x", "y", "z", "w"]
export function getValueKeyByIndex(n: NumData): string {
    return numWithXYZW[n.v]
}
