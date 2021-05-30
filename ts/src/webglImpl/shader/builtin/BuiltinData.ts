/**
 * @en The base class of all value types.
 * @zh 所有值类型的基类。
 */
export class ValueType {
    public clone() {
        console.error("必须自己实现clone方法")
        return this
    }

    public equals(other: this) {
        console.error("必须自己实现equals方法")
        return false
    }

    public set(other: this) {
        console.error("必须自己实现set方法")
    }

    public toString() {
        console.error("必须自己实现toString方法")
    }
}

export function getNum(num: NumData | number | undefined) {
    if (num instanceof NumData) {
        return num.v
    } else {
        return num
    }
}

export class CachPool<T extends ValueType> {
    private _ctor: () => T = null!
    private _cachIndex: number = 0
    private _dataCach: T[] = []
    getData(...setData: any) {
        if (this._cachIndex >= this._dataCach.length) {
            this.expansion()
        }
        let data = this._dataCach[this._cachIndex++]
        return data
    }

    getDataByLength(num: number) {
        let endIndex = this._cachIndex + num
        if (endIndex >= this._dataCach.length) {
            let expansionNum = Math.max(100, endIndex - this._dataCach.length + 1)
            this.expansion(expansionNum)
        }
        let data = this._dataCach.slice(this._cachIndex, endIndex)
        this._cachIndex = endIndex
        return data
    }

    expansion(expansionNum: number = 100) {
        for (let index = 0; index < expansionNum; index++) {
            this._dataCach.push(this._ctor())
        }
    }

    constructor(ctor: (...info: any) => T) {
        this._ctor = ctor
    }
    clear() {
        this._cachIndex = 0
    }
}

export class BuiltinDataCach {
    intData: CachPool<IntData> = new CachPool<IntData>(() => new IntData())
    floatData: CachPool<FloatData> = new CachPool<FloatData>(() => new FloatData())
    vec2Data: CachPool<Vec2Data> = new CachPool<Vec2Data>(() => new Vec2Data())
    vec3Data: CachPool<Vec3Data> = new CachPool<Vec3Data>(() => new Vec3Data())
    vec4Data: CachPool<Vec4Data> = new CachPool<Vec4Data>(() => new Vec4Data())
    mat3Data: CachPool<Mat3Data> = new CachPool<Mat3Data>(() => new Mat3Data())
    mat4Data: CachPool<Mat4Data> = new CachPool<Mat4Data>(() => new Mat4Data())
    boolData: CachPool<BoolData> = new CachPool<BoolData>(() => new BoolData())
    clear() {
        this.vec2Data.clear()
        this.vec3Data.clear()
        this.vec4Data.clear()
        this.mat3Data.clear()
        this.mat4Data.clear()
        this.boolData.clear()
    }
}
export let builtinCachData = new BuiltinDataCach()
let vec2Data = builtinCachData.vec2Data
let vec3Data = builtinCachData.vec3Data
let vec4Data = builtinCachData.vec4Data
let floatData = builtinCachData.floatData
let intData = builtinCachData.intData
let boolData = builtinCachData.boolData

export const EPSILON = 0.000001
let floor = Math.floor
export class Vec2Data extends ValueType {
    out_x: FloatData = new FloatData()
    out_y: FloatData = new FloatData()

    public static distance(a: Vec2Data, b: Vec2Data) {
        const x = b.x - a.x
        const y = b.y - a.y
        return Math.sqrt(x * x + y * y)
    }

    public static dot(a: Vec2Data, b: Vec2Data) {
        return a.x * b.x + a.y * b.y
    }

    public static equals(a: Vec2Data, b: Vec2Data, epsilon = EPSILON) {
        return (
            Math.abs(a.x - b.x) <= epsilon * Math.max(1.0, Math.abs(a.x), Math.abs(b.x)) &&
            Math.abs(a.y - b.y) <= epsilon * Math.max(1.0, Math.abs(a.y), Math.abs(b.y))
        )
    }

    public static multiplyScalar(out: Vec2Data, a: Vec2Data, b: number) {
        out.x = a.x * b
        out.y = a.y * b
        return out
    }

    public static subtract(out: Vec2Data, a: Vec2Data, b: Vec2Data) {
        out.x = a.x - b.x
        out.y = a.y - b.y
        return out
    }

    public cross(other: Vec2Data) {
        return this.x * other.y - this.y * other.x
    }

    constructor(x?: number, y?: number) {
        super()
        this.out_x.v = x || 0
        this.out_y.v = y || 0
    }

    get x() {
        return this.out_x.v
    }
    set x(v: number) {
        this.out_x.v = v
    }
    get y() {
        return this.out_y.v
    }
    set y(v: number) {
        this.out_y.v = v
    }

    set(v: Vec2Data) {
        this.x = v.x
        this.y = v.y
    }

    set_V2(v: Vec2Data) {
        this.x = v.x
        this.y = v.y
    }

    set_N_N(x: NumData, y: NumData) {
        this.x = x.v
        this.y = y.v
    }

    set_Vn(x: number, y: number) {
        this.x = x
        this.y = y
    }

    outSet_N_N(x: NumData, y: NumData) {
        this.out_x = x
        this.out_y = y
    }

    get xx() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_x, this.out_x)
        return v
    }
    get out_xx() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_x, this.out_x)
        return v
    }
    get yx() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_y, this.out_x)
        return v
    }
    get out_yx() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_y, this.out_x)
        return v
    }
    set yx(other: Vec2Data) {
        this.y = other.x
        this.x = other.y
    }
    get xy() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_x, this.out_y)
        return v
    }
    get out_xy() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_x, this.out_y)
        return v
    }
    set xy(other: Vec2Data) {
        this.x = other.x
        this.y = other.y
    }
    get yy() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_y, this.out_y)
        return v
    }
    get out_yy() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_y, this.out_y)
        return v
    }
}

export class IVec2Data extends Vec2Data {
    out_x: IntData = new IntData()
    out_y: IntData = new IntData()
}

export class Vec3Data extends ValueType {
    out_x: FloatData = new FloatData()
    out_y: FloatData = new FloatData()
    out_z: FloatData = new FloatData()

    constructor(x?: number, y?: number, z?: number) {
        super()
        this.out_x.v = x || 0
        this.out_y.v = y || 0
        this.out_z.v = z || 0
    }

    public static distance(a: Vec3Data, b: Vec3Data) {
        const x = b.x - a.x
        const y = b.y - a.y
        const z = b.z - a.z
        return Math.sqrt(x * x + y * y + z * z)
    }

    public static dot(a: Vec3Data, b: Vec3Data) {
        return a.x * b.x + a.y * b.y + a.z * b.z
    }

    public static equals(a: Vec3Data, b: Vec3Data, epsilon = EPSILON) {
        const { x: a0, y: a1, z: a2 } = a
        const { x: b0, y: b1, z: b2 } = b
        return (
            Math.abs(a0 - b0) <= epsilon * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= epsilon * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= epsilon * Math.max(1.0, Math.abs(a2), Math.abs(b2))
        )
    }

    public static cross(out: Vec3Data, a: Vec3Data, b: Vec3Data) {
        const { x: ax, y: ay, z: az } = a
        const { x: bx, y: by, z: bz } = b
        out.x = ay * bz - az * by
        out.y = az * bx - ax * bz
        out.z = ax * by - ay * bx
        return out
    }

    public static multiplyScalar(out: Vec3Data, a: Vec3Data, b: number) {
        out.x = a.x * b
        out.y = a.y * b
        out.z = a.z * b
        return out
    }

    public static subtract(out: Vec3Data, a: Vec3Data | Vec4Data, b: Vec3Data | Vec4Data) {
        out.x = a.x - b.x
        out.y = a.y - b.y
        out.z = a.z - b.z
        return out
    }

    public static transformMat3(out: Vec3Data, a: Vec3Data, m: Mat3Data) {
        const x = a.x
        const y = a.y
        const z = a.z
        out.x = x * m.m00 + y * m.m03 + z * m.m06
        out.y = x * m.m01 + y * m.m04 + z * m.m07
        out.z = x * m.m02 + y * m.m05 + z * m.m08
        return out
    }

    public cross(other: Vec3Data) {
        const { x: ax, y: ay, z: az } = this
        const { x: bx, y: by, z: bz } = other

        this.x = ay * bz - az * by
        this.y = az * bx - ax * bz
        this.z = ax * by - ay * bx
        return this
    }

    get x() {
        return this.out_x.v
    }
    set x(v: number) {
        this.out_x.v = v
    }
    get y() {
        return this.out_y.v
    }
    set y(v: number) {
        this.out_y.v = v
    }
    get z() {
        return this.out_z.v
    }
    set z(v: number) {
        this.out_z.v = v
    }

    set(v: Vec3Data) {
        this.x = v.x
        this.y = v.y
        this.z = v.z
    }

    set_V3(v: Vec3Data) {
        this.x = v.x
        this.y = v.y
        this.z = v.z
    }

    set_N_N_N(x: NumData, y: NumData, z: NumData) {
        this.x = x.v
        this.y = y.v
        this.z = z.v
    }

    set_Vn(x: number, y: number, z: number) {
        this.x = x
        this.y = y
        this.z = z
    }

    // 专门针对inout 类型使用
    outSet_N_N_N(x: NumData, y: NumData, z: NumData) {
        this.out_x = x
        this.out_y = y
        this.out_z = z
    }
    get xx() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_x, this.out_x)
        return v
    }
    get out_xx() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_x, this.out_x)
        return v
    }
    get yx() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_y, this.out_x)
        return v
    }
    get out_yx() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_y, this.out_x)
        return v
    }
    set yx(other: Vec2Data) {
        this.y = other.x
        this.x = other.y
    }
    get zx() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_z, this.out_x)
        return v
    }
    get out_zx() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_z, this.out_x)
        return v
    }
    set zx(other: Vec2Data) {
        this.z = other.x
        this.x = other.y
    }
    get xy() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_x, this.out_y)
        return v
    }
    get out_xy() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_x, this.out_y)
        return v
    }
    set xy(other: Vec2Data) {
        this.x = other.x
        this.y = other.y
    }
    get yy() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_y, this.out_y)
        return v
    }
    get out_yy() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_y, this.out_y)
        return v
    }
    get zy() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_z, this.out_y)
        return v
    }
    get out_zy() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_z, this.out_y)
        return v
    }
    set zy(other: Vec2Data) {
        this.z = other.x
        this.y = other.y
    }
    get xz() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_x, this.out_z)
        return v
    }
    get out_xz() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_x, this.out_z)
        return v
    }
    set xz(other: Vec2Data) {
        this.x = other.x
        this.z = other.y
    }
    get yz() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_y, this.out_z)
        return v
    }
    get out_yz() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_y, this.out_z)
        return v
    }
    set yz(other: Vec2Data) {
        this.y = other.x
        this.z = other.y
    }
    get zz() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_z, this.out_z)
        return v
    }
    get out_zz() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_z, this.out_z)
        return v
    }

    get xxx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_x, this.out_x)
        return v
    }
    get out_xxx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_x, this.out_x)
        return v
    }
    get yxx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_x, this.out_x)
        return v
    }
    get out_yxx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_x, this.out_x)
        return v
    }
    get zxx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_x, this.out_x)
        return v
    }
    get out_zxx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_x, this.out_x)
        return v
    }
    get xyx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_y, this.out_x)
        return v
    }
    get out_xyx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_y, this.out_x)
        return v
    }
    get yyx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_y, this.out_x)
        return v
    }
    get out_yyx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_y, this.out_x)
        return v
    }
    get zyx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_y, this.out_x)
        return v
    }
    get out_zyx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_y, this.out_x)
        return v
    }
    set zyx(other: Vec3Data) {
        this.z = other.x
        this.y = other.y
        this.x = other.z
    }
    get xzx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_z, this.out_x)
        return v
    }
    get out_xzx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_z, this.out_x)
        return v
    }
    get yzx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_z, this.out_x)
        return v
    }
    get out_yzx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_z, this.out_x)
        return v
    }
    set yzx(other: Vec3Data) {
        this.y = other.x
        this.z = other.y
        this.x = other.z
    }
    get zzx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_z, this.out_x)
        return v
    }
    get out_zzx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_z, this.out_x)
        return v
    }
    get xxy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_x, this.out_y)
        return v
    }
    get out_xxy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_x, this.out_y)
        return v
    }
    get yxy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_x, this.out_y)
        return v
    }
    get out_yxy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_x, this.out_y)
        return v
    }
    get zxy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_x, this.out_y)
        return v
    }
    get out_zxy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_x, this.out_y)
        return v
    }
    set zxy(other: Vec3Data) {
        this.z = other.x
        this.x = other.y
        this.y = other.z
    }
    get xyy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_y, this.out_y)
        return v
    }
    get out_xyy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_y, this.out_y)
        return v
    }
    get yyy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_y, this.out_y)
        return v
    }
    get out_yyy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_y, this.out_y)
        return v
    }
    get zyy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_y, this.out_y)
        return v
    }
    get out_zyy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_y, this.out_y)
        return v
    }
    get xzy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_z, this.out_y)
        return v
    }
    get out_xzy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_z, this.out_y)
        return v
    }
    set xzy(other: Vec3Data) {
        this.x = other.x
        this.z = other.y
        this.y = other.z
    }
    get yzy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_z, this.out_y)
        return v
    }
    get out_yzy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_z, this.out_y)
        return v
    }
    get zzy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_z, this.out_y)
        return v
    }
    get out_zzy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_z, this.out_y)
        return v
    }
    get xxz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_x, this.out_z)
        return v
    }
    get out_xxz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_x, this.out_z)
        return v
    }
    get yxz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_x, this.out_z)
        return v
    }
    get out_yxz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_x, this.out_z)
        return v
    }
    set yxz(other: Vec3Data) {
        this.y = other.x
        this.x = other.y
        this.z = other.z
    }
    get zxz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_x, this.out_z)
        return v
    }
    get out_zxz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_x, this.out_z)
        return v
    }
    get xyz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_y, this.out_z)
        return v
    }
    get out_xyz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_y, this.out_z)
        return v
    }
    set xyz(other: Vec3Data) {
        this.x = other.x
        this.y = other.y
        this.z = other.z
    }
    get yyz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_y, this.out_z)
        return v
    }
    get out_yyz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_y, this.out_z)
        return v
    }
    get zyz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_y, this.out_z)
        return v
    }
    get out_zyz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_y, this.out_z)
        return v
    }
    get xzz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_z, this.out_z)
        return v
    }
    get out_xzz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_z, this.out_z)
        return v
    }
    get yzz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_z, this.out_z)
        return v
    }
    get out_yzz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_z, this.out_z)
        return v
    }
    get zzz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_z, this.out_z)
        return v
    }
    get out_zzz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_z, this.out_z)
        return v
    }
}

// export class BVec3Data extends Vec3Data {}
export class IVec3Data extends Vec3Data {
    out_x: IntData = new IntData()
    out_y: IntData = new IntData()
    out_z: IntData = new IntData()
}

export class Vec4Data extends ValueType {
    out_x: FloatData = new FloatData()
    out_y: FloatData = new FloatData()
    out_z: FloatData = new FloatData()
    out_w: FloatData = new FloatData()
    constructor(x?: number, y?: number, z?: number, w?: number) {
        super()
        this.out_x.v = x || 0
        this.out_y.v = y || 0
        this.out_z.v = z || 0
        this.out_w.v = w || 0
    }

    public static distance(a: Vec4Data, b: Vec4Data) {
        const x = b.x - a.x
        const y = b.y - a.y
        const z = b.z - a.z
        const w = b.w - a.w
        return Math.sqrt(x * x + y * y + z * z + w * w)
    }

    public static dot(a: Vec4Data, b: Vec4Data) {
        return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w
    }

    public static equals(a: Vec4Data, b: Vec4Data, epsilon = EPSILON) {
        return (
            Math.abs(a.x - b.x) <= epsilon * Math.max(1.0, Math.abs(a.x), Math.abs(b.x)) &&
            Math.abs(a.y - b.y) <= epsilon * Math.max(1.0, Math.abs(a.y), Math.abs(b.y)) &&
            Math.abs(a.z - b.z) <= epsilon * Math.max(1.0, Math.abs(a.z), Math.abs(b.z)) &&
            Math.abs(a.w - b.w) <= epsilon * Math.max(1.0, Math.abs(a.w), Math.abs(b.w))
        )
    }

    public static multiplyScalar(out: Vec4Data, a: Vec4Data, b: number) {
        out.x = a.x * b
        out.y = a.y * b
        out.z = a.z * b
        out.w = a.w * b
        return out
    }

    public static subtract(out: Vec4Data, a: Vec4Data, b: Vec4Data) {
        out.x = a.x - b.x
        out.y = a.y - b.y
        out.z = a.z - b.z
        out.w = a.w - b.w
        return out
    }

    public static transformMat4(out: Vec4Data, a: Vec4Data, m: Mat4Data) {
        const x = a.x
        const y = a.y
        const z = a.z
        const w = a.w
        out.x = m.m00 * x + m.m04 * y + m.m08 * z + m.m12 * w
        out.y = m.m01 * x + m.m05 * y + m.m09 * z + m.m13 * w
        out.z = m.m02 * x + m.m06 * y + m.m10 * z + m.m14 * w
        out.w = m.m03 * x + m.m07 * y + m.m11 * z + m.m15 * w
        return out
    }

    public cross(vector: Vec4Data) {
        const { x: ax, y: ay, z: az } = this
        const { x: bx, y: by, z: bz } = vector

        this.x = ay * bz - az * by
        this.y = az * bx - ax * bz
        this.z = ax * by - ay * bx
        return this
    }

    get x() {
        return this.out_x.v
    }
    set x(v: number) {
        this.out_x.v = v
    }
    get y() {
        return this.out_y.v
    }
    set y(v: number) {
        this.out_y.v = v
    }
    get z() {
        return this.out_z.v
    }
    set z(v: number) {
        this.out_z.v = v
    }
    get w() {
        return this.out_w.v
    }
    set w(v: number) {
        this.out_w.v = v
    }

    set(v: Vec4Data) {
        this.x = v.x
        this.y = v.y
        this.z = v.z
        this.w = v.w
    }

    set_V4(v: Vec4Data) {
        this.x = v.x
        this.y = v.y
        this.z = v.z
        this.w = v.w
    }

    set_N_N_N_N(x: NumData, y: NumData, z: NumData, w: NumData) {
        this.x = x.v
        this.y = y.v
        this.z = z.v
        this.w = w.v
    }

    set_Vn(x: number, y: number, z: number, w: number) {
        this.x = x
        this.y = y
        this.z = z
        this.w = w
    }

    outSet_N_N_N_N(x: NumData, y: NumData, z: NumData, w: NumData) {
        this.out_x = x
        this.out_y = y
        this.out_z = z
        this.out_w = w
    }
    get xx() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_x, this.out_x)
        return v
    }
    get out_xx() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_x, this.out_x)
        return v
    }
    get yx() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_y, this.out_x)
        return v
    }
    get out_yx() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_y, this.out_x)
        return v
    }
    set yx(other: Vec2Data) {
        this.y = other.x
        this.x = other.y
    }
    get zx() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_z, this.out_x)
        return v
    }
    get out_zx() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_z, this.out_x)
        return v
    }
    set zx(other: Vec2Data) {
        this.z = other.x
        this.x = other.y
    }
    get wx() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_w, this.out_x)
        return v
    }
    get out_wx() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_w, this.out_x)
        return v
    }
    set wx(other: Vec2Data) {
        this.w = other.x
        this.x = other.y
    }
    get xy() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_x, this.out_y)
        return v
    }
    get out_xy() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_x, this.out_y)
        return v
    }
    set xy(other: Vec2Data) {
        this.x = other.x
        this.y = other.y
    }
    get yy() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_y, this.out_y)
        return v
    }
    get out_yy() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_y, this.out_y)
        return v
    }
    get zy() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_z, this.out_y)
        return v
    }
    get out_zy() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_z, this.out_y)
        return v
    }
    set zy(other: Vec2Data) {
        this.z = other.x
        this.y = other.y
    }
    get wy() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_w, this.out_y)
        return v
    }
    get out_wy() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_w, this.out_y)
        return v
    }
    set wy(other: Vec2Data) {
        this.w = other.x
        this.y = other.y
    }
    get xz() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_x, this.out_z)
        return v
    }
    get out_xz() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_x, this.out_z)
        return v
    }
    set xz(other: Vec2Data) {
        this.x = other.x
        this.z = other.y
    }
    get yz() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_y, this.out_z)
        return v
    }
    get out_yz() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_y, this.out_z)
        return v
    }
    set yz(other: Vec2Data) {
        this.y = other.x
        this.z = other.y
    }
    get zz() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_z, this.out_z)
        return v
    }
    get out_zz() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_z, this.out_z)
        return v
    }
    get wz() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_w, this.out_z)
        return v
    }
    get out_wz() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_w, this.out_z)
        return v
    }
    set wz(other: Vec2Data) {
        this.w = other.x
        this.z = other.y
    }
    get xw() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_x, this.out_w)
        return v
    }
    get out_xw() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_x, this.out_w)
        return v
    }
    set xw(other: Vec2Data) {
        this.x = other.x
        this.w = other.y
    }
    get yw() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_y, this.out_w)
        return v
    }
    get out_yw() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_y, this.out_w)
        return v
    }
    set yw(other: Vec2Data) {
        this.y = other.x
        this.w = other.y
    }
    get zw() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_z, this.out_w)
        return v
    }
    get out_zw() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_z, this.out_w)
        return v
    }
    set zw(other: Vec2Data) {
        this.z = other.x
        this.w = other.y
    }
    get ww() {
        let v = vec2Data.getData()
        v.set_N_N(this.out_w, this.out_w)
        return v
    }
    get out_ww() {
        let v = new Vec2Data()
        v.outSet_N_N(this.out_w, this.out_w)
        return v
    }

    get xxx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_x, this.out_x)
        return v
    }
    get out_xxx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_x, this.out_x)
        return v
    }
    get yxx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_x, this.out_x)
        return v
    }
    get out_yxx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_x, this.out_x)
        return v
    }
    get zxx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_x, this.out_x)
        return v
    }
    get out_zxx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_x, this.out_x)
        return v
    }
    get wxx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_x, this.out_x)
        return v
    }
    get out_wxx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_x, this.out_x)
        return v
    }
    get xyx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_y, this.out_x)
        return v
    }
    get out_xyx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_y, this.out_x)
        return v
    }
    get yyx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_y, this.out_x)
        return v
    }
    get out_yyx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_y, this.out_x)
        return v
    }
    get zyx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_y, this.out_x)
        return v
    }
    get out_zyx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_y, this.out_x)
        return v
    }
    set zyx(other: Vec3Data) {
        this.z = other.x
        this.y = other.y
        this.x = other.z
    }
    get wyx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_y, this.out_x)
        return v
    }
    get out_wyx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_y, this.out_x)
        return v
    }
    set wyx(other: Vec3Data) {
        this.w = other.x
        this.y = other.y
        this.x = other.z
    }
    get xzx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_z, this.out_x)
        return v
    }
    get out_xzx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_z, this.out_x)
        return v
    }
    get yzx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_z, this.out_x)
        return v
    }
    get out_yzx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_z, this.out_x)
        return v
    }
    set yzx(other: Vec3Data) {
        this.y = other.x
        this.z = other.y
        this.x = other.z
    }
    get zzx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_z, this.out_x)
        return v
    }
    get out_zzx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_z, this.out_x)
        return v
    }
    get wzx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_z, this.out_x)
        return v
    }
    get out_wzx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_z, this.out_x)
        return v
    }
    set wzx(other: Vec3Data) {
        this.w = other.x
        this.z = other.y
        this.x = other.z
    }
    get xwx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_w, this.out_x)
        return v
    }
    get out_xwx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_w, this.out_x)
        return v
    }
    get ywx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_w, this.out_x)
        return v
    }
    get out_ywx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_w, this.out_x)
        return v
    }
    set ywx(other: Vec3Data) {
        this.y = other.x
        this.w = other.y
        this.x = other.z
    }
    get zwx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_w, this.out_x)
        return v
    }
    get out_zwx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_w, this.out_x)
        return v
    }
    set zwx(other: Vec3Data) {
        this.z = other.x
        this.w = other.y
        this.x = other.z
    }
    get wwx() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_w, this.out_x)
        return v
    }
    get out_wwx() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_w, this.out_x)
        return v
    }
    get xxy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_x, this.out_y)
        return v
    }
    get out_xxy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_x, this.out_y)
        return v
    }
    get yxy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_x, this.out_y)
        return v
    }
    get out_yxy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_x, this.out_y)
        return v
    }
    get zxy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_x, this.out_y)
        return v
    }
    get out_zxy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_x, this.out_y)
        return v
    }
    set zxy(other: Vec3Data) {
        this.z = other.x
        this.x = other.y
        this.y = other.z
    }
    get wxy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_x, this.out_y)
        return v
    }
    get out_wxy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_x, this.out_y)
        return v
    }
    set wxy(other: Vec3Data) {
        this.w = other.x
        this.x = other.y
        this.y = other.z
    }
    get xyy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_y, this.out_y)
        return v
    }
    get out_xyy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_y, this.out_y)
        return v
    }
    get yyy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_y, this.out_y)
        return v
    }
    get out_yyy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_y, this.out_y)
        return v
    }
    get zyy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_y, this.out_y)
        return v
    }
    get out_zyy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_y, this.out_y)
        return v
    }
    get wyy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_y, this.out_y)
        return v
    }
    get out_wyy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_y, this.out_y)
        return v
    }
    get xzy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_z, this.out_y)
        return v
    }
    get out_xzy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_z, this.out_y)
        return v
    }
    set xzy(other: Vec3Data) {
        this.x = other.x
        this.z = other.y
        this.y = other.z
    }
    get yzy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_z, this.out_y)
        return v
    }
    get out_yzy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_z, this.out_y)
        return v
    }
    get zzy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_z, this.out_y)
        return v
    }
    get out_zzy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_z, this.out_y)
        return v
    }
    get wzy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_z, this.out_y)
        return v
    }
    get out_wzy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_z, this.out_y)
        return v
    }
    set wzy(other: Vec3Data) {
        this.w = other.x
        this.z = other.y
        this.y = other.z
    }
    get xwy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_w, this.out_y)
        return v
    }
    get out_xwy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_w, this.out_y)
        return v
    }
    set xwy(other: Vec3Data) {
        this.x = other.x
        this.w = other.y
        this.y = other.z
    }
    get ywy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_w, this.out_y)
        return v
    }
    get out_ywy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_w, this.out_y)
        return v
    }
    get zwy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_w, this.out_y)
        return v
    }
    get out_zwy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_w, this.out_y)
        return v
    }
    set zwy(other: Vec3Data) {
        this.z = other.x
        this.w = other.y
        this.y = other.z
    }
    get wwy() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_w, this.out_y)
        return v
    }
    get out_wwy() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_w, this.out_y)
        return v
    }
    get xxz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_x, this.out_z)
        return v
    }
    get out_xxz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_x, this.out_z)
        return v
    }
    get yxz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_x, this.out_z)
        return v
    }
    get out_yxz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_x, this.out_z)
        return v
    }
    set yxz(other: Vec3Data) {
        this.y = other.x
        this.x = other.y
        this.z = other.z
    }
    get zxz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_x, this.out_z)
        return v
    }
    get out_zxz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_x, this.out_z)
        return v
    }
    get wxz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_x, this.out_z)
        return v
    }
    get out_wxz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_x, this.out_z)
        return v
    }
    set wxz(other: Vec3Data) {
        this.w = other.x
        this.x = other.y
        this.z = other.z
    }
    get xyz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_y, this.out_z)
        return v
    }
    get out_xyz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_y, this.out_z)
        return v
    }
    set xyz(other: Vec3Data) {
        this.x = other.x
        this.y = other.y
        this.z = other.z
    }
    get yyz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_y, this.out_z)
        return v
    }
    get out_yyz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_y, this.out_z)
        return v
    }
    get zyz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_y, this.out_z)
        return v
    }
    get out_zyz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_y, this.out_z)
        return v
    }
    get wyz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_y, this.out_z)
        return v
    }
    get out_wyz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_y, this.out_z)
        return v
    }
    set wyz(other: Vec3Data) {
        this.w = other.x
        this.y = other.y
        this.z = other.z
    }
    get xzz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_z, this.out_z)
        return v
    }
    get out_xzz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_z, this.out_z)
        return v
    }
    get yzz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_z, this.out_z)
        return v
    }
    get out_yzz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_z, this.out_z)
        return v
    }
    get zzz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_z, this.out_z)
        return v
    }
    get out_zzz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_z, this.out_z)
        return v
    }
    get wzz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_z, this.out_z)
        return v
    }
    get out_wzz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_z, this.out_z)
        return v
    }
    get xwz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_w, this.out_z)
        return v
    }
    get out_xwz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_w, this.out_z)
        return v
    }
    set xwz(other: Vec3Data) {
        this.x = other.x
        this.w = other.y
        this.z = other.z
    }
    get ywz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_w, this.out_z)
        return v
    }
    get out_ywz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_w, this.out_z)
        return v
    }
    set ywz(other: Vec3Data) {
        this.y = other.x
        this.w = other.y
        this.z = other.z
    }
    get zwz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_w, this.out_z)
        return v
    }
    get out_zwz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_w, this.out_z)
        return v
    }
    get wwz() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_w, this.out_z)
        return v
    }
    get out_wwz() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_w, this.out_z)
        return v
    }
    get xxw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_x, this.out_w)
        return v
    }
    get out_xxw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_x, this.out_w)
        return v
    }
    get yxw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_x, this.out_w)
        return v
    }
    get out_yxw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_x, this.out_w)
        return v
    }
    set yxw(other: Vec3Data) {
        this.y = other.x
        this.x = other.y
        this.w = other.z
    }
    get zxw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_x, this.out_w)
        return v
    }
    get out_zxw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_x, this.out_w)
        return v
    }
    set zxw(other: Vec3Data) {
        this.z = other.x
        this.x = other.y
        this.w = other.z
    }
    get wxw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_x, this.out_w)
        return v
    }
    get out_wxw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_x, this.out_w)
        return v
    }
    get xyw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_y, this.out_w)
        return v
    }
    get out_xyw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_y, this.out_w)
        return v
    }
    set xyw(other: Vec3Data) {
        this.x = other.x
        this.y = other.y
        this.w = other.z
    }
    get yyw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_y, this.out_w)
        return v
    }
    get out_yyw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_y, this.out_w)
        return v
    }
    get zyw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_y, this.out_w)
        return v
    }
    get out_zyw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_y, this.out_w)
        return v
    }
    set zyw(other: Vec3Data) {
        this.z = other.x
        this.y = other.y
        this.w = other.z
    }
    get wyw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_y, this.out_w)
        return v
    }
    get out_wyw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_y, this.out_w)
        return v
    }
    get xzw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_z, this.out_w)
        return v
    }
    get out_xzw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_z, this.out_w)
        return v
    }
    set xzw(other: Vec3Data) {
        this.x = other.x
        this.z = other.y
        this.w = other.z
    }
    get yzw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_z, this.out_w)
        return v
    }
    get out_yzw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_z, this.out_w)
        return v
    }
    set yzw(other: Vec3Data) {
        this.y = other.x
        this.z = other.y
        this.w = other.z
    }
    get zzw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_z, this.out_w)
        return v
    }
    get out_zzw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_z, this.out_w)
        return v
    }
    get wzw() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_z, this.out_w)
        return v
    }
    get out_wzw() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_z, this.out_w)
        return v
    }
    get xww() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_x, this.out_w, this.out_w)
        return v
    }
    get out_xww() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_x, this.out_w, this.out_w)
        return v
    }
    get yww() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_y, this.out_w, this.out_w)
        return v
    }
    get out_yww() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_y, this.out_w, this.out_w)
        return v
    }
    get zww() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_z, this.out_w, this.out_w)
        return v
    }
    get out_zww() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_z, this.out_w, this.out_w)
        return v
    }
    get www() {
        let v = vec3Data.getData()
        v.set_N_N_N(this.out_w, this.out_w, this.out_w)
        return v
    }
    get out_www() {
        let v = new Vec3Data()
        v.outSet_N_N_N(this.out_w, this.out_w, this.out_w)
        return v
    }

    get xxxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_x, this.out_x)
        return v
    }
    get out_xxxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_x, this.out_x)
        return v
    }
    get yxxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_x, this.out_x)
        return v
    }
    get out_yxxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_x, this.out_x)
        return v
    }
    get zxxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_x, this.out_x)
        return v
    }
    get out_zxxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_x, this.out_x)
        return v
    }
    get wxxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_x, this.out_x)
        return v
    }
    get out_wxxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_x, this.out_x)
        return v
    }
    get xyxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_x, this.out_x)
        return v
    }
    get out_xyxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_x, this.out_x)
        return v
    }
    get yyxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_x, this.out_x)
        return v
    }
    get out_yyxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_x, this.out_x)
        return v
    }
    get zyxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_x, this.out_x)
        return v
    }
    get out_zyxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_x, this.out_x)
        return v
    }
    get wyxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_x, this.out_x)
        return v
    }
    get out_wyxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_x, this.out_x)
        return v
    }
    get xzxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_x, this.out_x)
        return v
    }
    get out_xzxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_x, this.out_x)
        return v
    }
    get yzxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_x, this.out_x)
        return v
    }
    get out_yzxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_x, this.out_x)
        return v
    }
    get zzxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_x, this.out_x)
        return v
    }
    get out_zzxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_x, this.out_x)
        return v
    }
    get wzxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_x, this.out_x)
        return v
    }
    get out_wzxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_x, this.out_x)
        return v
    }
    get xwxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_x, this.out_x)
        return v
    }
    get out_xwxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_x, this.out_x)
        return v
    }
    get ywxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_x, this.out_x)
        return v
    }
    get out_ywxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_x, this.out_x)
        return v
    }
    get zwxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_x, this.out_x)
        return v
    }
    get out_zwxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_x, this.out_x)
        return v
    }
    get wwxx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_x, this.out_x)
        return v
    }
    get out_wwxx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_x, this.out_x)
        return v
    }
    get xxyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_y, this.out_x)
        return v
    }
    get out_xxyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_y, this.out_x)
        return v
    }
    get yxyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_y, this.out_x)
        return v
    }
    get out_yxyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_y, this.out_x)
        return v
    }
    get zxyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_y, this.out_x)
        return v
    }
    get out_zxyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_y, this.out_x)
        return v
    }
    get wxyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_y, this.out_x)
        return v
    }
    get out_wxyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_y, this.out_x)
        return v
    }
    get xyyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_y, this.out_x)
        return v
    }
    get out_xyyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_y, this.out_x)
        return v
    }
    get yyyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_y, this.out_x)
        return v
    }
    get out_yyyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_y, this.out_x)
        return v
    }
    get zyyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_y, this.out_x)
        return v
    }
    get out_zyyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_y, this.out_x)
        return v
    }
    get wyyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_y, this.out_x)
        return v
    }
    get out_wyyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_y, this.out_x)
        return v
    }
    get xzyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_y, this.out_x)
        return v
    }
    get out_xzyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_y, this.out_x)
        return v
    }
    get yzyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_y, this.out_x)
        return v
    }
    get out_yzyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_y, this.out_x)
        return v
    }
    get zzyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_y, this.out_x)
        return v
    }
    get out_zzyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_y, this.out_x)
        return v
    }
    get wzyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_y, this.out_x)
        return v
    }
    get out_wzyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_y, this.out_x)
        return v
    }
    set wzyx(other: Vec4Data) {
        this.w = other.x
        this.z = other.y
        this.y = other.z
        this.x = other.w
    }
    get xwyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_y, this.out_x)
        return v
    }
    get out_xwyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_y, this.out_x)
        return v
    }
    get ywyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_y, this.out_x)
        return v
    }
    get out_ywyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_y, this.out_x)
        return v
    }
    get zwyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_y, this.out_x)
        return v
    }
    get out_zwyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_y, this.out_x)
        return v
    }
    set zwyx(other: Vec4Data) {
        this.z = other.x
        this.w = other.y
        this.y = other.z
        this.x = other.w
    }
    get wwyx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_y, this.out_x)
        return v
    }
    get out_wwyx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_y, this.out_x)
        return v
    }
    get xxzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_z, this.out_x)
        return v
    }
    get out_xxzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_z, this.out_x)
        return v
    }
    get yxzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_z, this.out_x)
        return v
    }
    get out_yxzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_z, this.out_x)
        return v
    }
    get zxzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_z, this.out_x)
        return v
    }
    get out_zxzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_z, this.out_x)
        return v
    }
    get wxzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_z, this.out_x)
        return v
    }
    get out_wxzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_z, this.out_x)
        return v
    }
    get xyzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_z, this.out_x)
        return v
    }
    get out_xyzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_z, this.out_x)
        return v
    }
    get yyzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_z, this.out_x)
        return v
    }
    get out_yyzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_z, this.out_x)
        return v
    }
    get zyzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_z, this.out_x)
        return v
    }
    get out_zyzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_z, this.out_x)
        return v
    }
    get wyzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_z, this.out_x)
        return v
    }
    get out_wyzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_z, this.out_x)
        return v
    }
    set wyzx(other: Vec4Data) {
        this.w = other.x
        this.y = other.y
        this.z = other.z
        this.x = other.w
    }
    get xzzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_z, this.out_x)
        return v
    }
    get out_xzzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_z, this.out_x)
        return v
    }
    get yzzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_z, this.out_x)
        return v
    }
    get out_yzzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_z, this.out_x)
        return v
    }
    get zzzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_z, this.out_x)
        return v
    }
    get out_zzzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_z, this.out_x)
        return v
    }
    get wzzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_z, this.out_x)
        return v
    }
    get out_wzzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_z, this.out_x)
        return v
    }
    get xwzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_z, this.out_x)
        return v
    }
    get out_xwzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_z, this.out_x)
        return v
    }
    get ywzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_z, this.out_x)
        return v
    }
    get out_ywzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_z, this.out_x)
        return v
    }
    set ywzx(other: Vec4Data) {
        this.y = other.x
        this.w = other.y
        this.z = other.z
        this.x = other.w
    }
    get zwzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_z, this.out_x)
        return v
    }
    get out_zwzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_z, this.out_x)
        return v
    }
    get wwzx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_z, this.out_x)
        return v
    }
    get out_wwzx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_z, this.out_x)
        return v
    }
    get xxwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_w, this.out_x)
        return v
    }
    get out_xxwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_w, this.out_x)
        return v
    }
    get yxwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_w, this.out_x)
        return v
    }
    get out_yxwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_w, this.out_x)
        return v
    }
    get zxwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_w, this.out_x)
        return v
    }
    get out_zxwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_w, this.out_x)
        return v
    }
    get wxwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_w, this.out_x)
        return v
    }
    get out_wxwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_w, this.out_x)
        return v
    }
    get xywx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_w, this.out_x)
        return v
    }
    get out_xywx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_w, this.out_x)
        return v
    }
    get yywx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_w, this.out_x)
        return v
    }
    get out_yywx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_w, this.out_x)
        return v
    }
    get zywx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_w, this.out_x)
        return v
    }
    get out_zywx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_w, this.out_x)
        return v
    }
    set zywx(other: Vec4Data) {
        this.z = other.x
        this.y = other.y
        this.w = other.z
        this.x = other.w
    }
    get wywx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_w, this.out_x)
        return v
    }
    get out_wywx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_w, this.out_x)
        return v
    }
    get xzwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_w, this.out_x)
        return v
    }
    get out_xzwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_w, this.out_x)
        return v
    }
    get yzwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_w, this.out_x)
        return v
    }
    get out_yzwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_w, this.out_x)
        return v
    }
    set yzwx(other: Vec4Data) {
        this.y = other.x
        this.z = other.y
        this.w = other.z
        this.x = other.w
    }
    get zzwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_w, this.out_x)
        return v
    }
    get out_zzwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_w, this.out_x)
        return v
    }
    get wzwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_w, this.out_x)
        return v
    }
    get out_wzwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_w, this.out_x)
        return v
    }
    get xwwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_w, this.out_x)
        return v
    }
    get out_xwwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_w, this.out_x)
        return v
    }
    get ywwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_w, this.out_x)
        return v
    }
    get out_ywwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_w, this.out_x)
        return v
    }
    get zwwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_w, this.out_x)
        return v
    }
    get out_zwwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_w, this.out_x)
        return v
    }
    get wwwx() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_w, this.out_x)
        return v
    }
    get out_wwwx() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_w, this.out_x)
        return v
    }
    get xxxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_x, this.out_y)
        return v
    }
    get out_xxxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_x, this.out_y)
        return v
    }
    get yxxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_x, this.out_y)
        return v
    }
    get out_yxxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_x, this.out_y)
        return v
    }
    get zxxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_x, this.out_y)
        return v
    }
    get out_zxxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_x, this.out_y)
        return v
    }
    get wxxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_x, this.out_y)
        return v
    }
    get out_wxxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_x, this.out_y)
        return v
    }
    get xyxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_x, this.out_y)
        return v
    }
    get out_xyxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_x, this.out_y)
        return v
    }
    get yyxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_x, this.out_y)
        return v
    }
    get out_yyxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_x, this.out_y)
        return v
    }
    get zyxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_x, this.out_y)
        return v
    }
    get out_zyxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_x, this.out_y)
        return v
    }
    get wyxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_x, this.out_y)
        return v
    }
    get out_wyxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_x, this.out_y)
        return v
    }
    get xzxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_x, this.out_y)
        return v
    }
    get out_xzxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_x, this.out_y)
        return v
    }
    get yzxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_x, this.out_y)
        return v
    }
    get out_yzxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_x, this.out_y)
        return v
    }
    get zzxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_x, this.out_y)
        return v
    }
    get out_zzxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_x, this.out_y)
        return v
    }
    get wzxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_x, this.out_y)
        return v
    }
    get out_wzxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_x, this.out_y)
        return v
    }
    set wzxy(other: Vec4Data) {
        this.w = other.x
        this.z = other.y
        this.x = other.z
        this.y = other.w
    }
    get xwxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_x, this.out_y)
        return v
    }
    get out_xwxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_x, this.out_y)
        return v
    }
    get ywxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_x, this.out_y)
        return v
    }
    get out_ywxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_x, this.out_y)
        return v
    }
    get zwxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_x, this.out_y)
        return v
    }
    get out_zwxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_x, this.out_y)
        return v
    }
    set zwxy(other: Vec4Data) {
        this.z = other.x
        this.w = other.y
        this.x = other.z
        this.y = other.w
    }
    get wwxy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_x, this.out_y)
        return v
    }
    get out_wwxy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_x, this.out_y)
        return v
    }
    get xxyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_y, this.out_y)
        return v
    }
    get out_xxyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_y, this.out_y)
        return v
    }
    get yxyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_y, this.out_y)
        return v
    }
    get out_yxyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_y, this.out_y)
        return v
    }
    get zxyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_y, this.out_y)
        return v
    }
    get out_zxyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_y, this.out_y)
        return v
    }
    get wxyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_y, this.out_y)
        return v
    }
    get out_wxyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_y, this.out_y)
        return v
    }
    get xyyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_y, this.out_y)
        return v
    }
    get out_xyyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_y, this.out_y)
        return v
    }
    get yyyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_y, this.out_y)
        return v
    }
    get out_yyyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_y, this.out_y)
        return v
    }
    get zyyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_y, this.out_y)
        return v
    }
    get out_zyyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_y, this.out_y)
        return v
    }
    get wyyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_y, this.out_y)
        return v
    }
    get out_wyyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_y, this.out_y)
        return v
    }
    get xzyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_y, this.out_y)
        return v
    }
    get out_xzyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_y, this.out_y)
        return v
    }
    get yzyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_y, this.out_y)
        return v
    }
    get out_yzyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_y, this.out_y)
        return v
    }
    get zzyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_y, this.out_y)
        return v
    }
    get out_zzyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_y, this.out_y)
        return v
    }
    get wzyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_y, this.out_y)
        return v
    }
    get out_wzyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_y, this.out_y)
        return v
    }
    get xwyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_y, this.out_y)
        return v
    }
    get out_xwyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_y, this.out_y)
        return v
    }
    get ywyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_y, this.out_y)
        return v
    }
    get out_ywyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_y, this.out_y)
        return v
    }
    get zwyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_y, this.out_y)
        return v
    }
    get out_zwyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_y, this.out_y)
        return v
    }
    get wwyy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_y, this.out_y)
        return v
    }
    get out_wwyy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_y, this.out_y)
        return v
    }
    get xxzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_z, this.out_y)
        return v
    }
    get out_xxzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_z, this.out_y)
        return v
    }
    get yxzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_z, this.out_y)
        return v
    }
    get out_yxzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_z, this.out_y)
        return v
    }
    get zxzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_z, this.out_y)
        return v
    }
    get out_zxzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_z, this.out_y)
        return v
    }
    get wxzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_z, this.out_y)
        return v
    }
    get out_wxzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_z, this.out_y)
        return v
    }
    set wxzy(other: Vec4Data) {
        this.w = other.x
        this.x = other.y
        this.z = other.z
        this.y = other.w
    }
    get xyzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_z, this.out_y)
        return v
    }
    get out_xyzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_z, this.out_y)
        return v
    }
    get yyzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_z, this.out_y)
        return v
    }
    get out_yyzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_z, this.out_y)
        return v
    }
    get zyzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_z, this.out_y)
        return v
    }
    get out_zyzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_z, this.out_y)
        return v
    }
    get wyzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_z, this.out_y)
        return v
    }
    get out_wyzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_z, this.out_y)
        return v
    }
    get xzzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_z, this.out_y)
        return v
    }
    get out_xzzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_z, this.out_y)
        return v
    }
    get yzzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_z, this.out_y)
        return v
    }
    get out_yzzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_z, this.out_y)
        return v
    }
    get zzzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_z, this.out_y)
        return v
    }
    get out_zzzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_z, this.out_y)
        return v
    }
    get wzzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_z, this.out_y)
        return v
    }
    get out_wzzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_z, this.out_y)
        return v
    }
    get xwzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_z, this.out_y)
        return v
    }
    get out_xwzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_z, this.out_y)
        return v
    }
    set xwzy(other: Vec4Data) {
        this.x = other.x
        this.w = other.y
        this.z = other.z
        this.y = other.w
    }
    get ywzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_z, this.out_y)
        return v
    }
    get out_ywzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_z, this.out_y)
        return v
    }
    get zwzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_z, this.out_y)
        return v
    }
    get out_zwzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_z, this.out_y)
        return v
    }
    get wwzy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_z, this.out_y)
        return v
    }
    get out_wwzy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_z, this.out_y)
        return v
    }
    get xxwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_w, this.out_y)
        return v
    }
    get out_xxwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_w, this.out_y)
        return v
    }
    get yxwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_w, this.out_y)
        return v
    }
    get out_yxwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_w, this.out_y)
        return v
    }
    get zxwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_w, this.out_y)
        return v
    }
    get out_zxwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_w, this.out_y)
        return v
    }
    set zxwy(other: Vec4Data) {
        this.z = other.x
        this.x = other.y
        this.w = other.z
        this.y = other.w
    }
    get wxwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_w, this.out_y)
        return v
    }
    get out_wxwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_w, this.out_y)
        return v
    }
    get xywy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_w, this.out_y)
        return v
    }
    get out_xywy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_w, this.out_y)
        return v
    }
    get yywy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_w, this.out_y)
        return v
    }
    get out_yywy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_w, this.out_y)
        return v
    }
    get zywy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_w, this.out_y)
        return v
    }
    get out_zywy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_w, this.out_y)
        return v
    }
    get wywy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_w, this.out_y)
        return v
    }
    get out_wywy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_w, this.out_y)
        return v
    }
    get xzwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_w, this.out_y)
        return v
    }
    get out_xzwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_w, this.out_y)
        return v
    }
    set xzwy(other: Vec4Data) {
        this.x = other.x
        this.z = other.y
        this.w = other.z
        this.y = other.w
    }
    get yzwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_w, this.out_y)
        return v
    }
    get out_yzwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_w, this.out_y)
        return v
    }
    get zzwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_w, this.out_y)
        return v
    }
    get out_zzwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_w, this.out_y)
        return v
    }
    get wzwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_w, this.out_y)
        return v
    }
    get out_wzwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_w, this.out_y)
        return v
    }
    get xwwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_w, this.out_y)
        return v
    }
    get out_xwwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_w, this.out_y)
        return v
    }
    get ywwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_w, this.out_y)
        return v
    }
    get out_ywwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_w, this.out_y)
        return v
    }
    get zwwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_w, this.out_y)
        return v
    }
    get out_zwwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_w, this.out_y)
        return v
    }
    get wwwy() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_w, this.out_y)
        return v
    }
    get out_wwwy() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_w, this.out_y)
        return v
    }
    get xxxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_x, this.out_z)
        return v
    }
    get out_xxxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_x, this.out_z)
        return v
    }
    get yxxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_x, this.out_z)
        return v
    }
    get out_yxxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_x, this.out_z)
        return v
    }
    get zxxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_x, this.out_z)
        return v
    }
    get out_zxxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_x, this.out_z)
        return v
    }
    get wxxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_x, this.out_z)
        return v
    }
    get out_wxxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_x, this.out_z)
        return v
    }
    get xyxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_x, this.out_z)
        return v
    }
    get out_xyxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_x, this.out_z)
        return v
    }
    get yyxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_x, this.out_z)
        return v
    }
    get out_yyxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_x, this.out_z)
        return v
    }
    get zyxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_x, this.out_z)
        return v
    }
    get out_zyxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_x, this.out_z)
        return v
    }
    get wyxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_x, this.out_z)
        return v
    }
    get out_wyxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_x, this.out_z)
        return v
    }
    set wyxz(other: Vec4Data) {
        this.w = other.x
        this.y = other.y
        this.x = other.z
        this.z = other.w
    }
    get xzxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_x, this.out_z)
        return v
    }
    get out_xzxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_x, this.out_z)
        return v
    }
    get yzxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_x, this.out_z)
        return v
    }
    get out_yzxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_x, this.out_z)
        return v
    }
    get zzxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_x, this.out_z)
        return v
    }
    get out_zzxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_x, this.out_z)
        return v
    }
    get wzxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_x, this.out_z)
        return v
    }
    get out_wzxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_x, this.out_z)
        return v
    }
    get xwxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_x, this.out_z)
        return v
    }
    get out_xwxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_x, this.out_z)
        return v
    }
    get ywxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_x, this.out_z)
        return v
    }
    get out_ywxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_x, this.out_z)
        return v
    }
    set ywxz(other: Vec4Data) {
        this.y = other.x
        this.w = other.y
        this.x = other.z
        this.z = other.w
    }
    get zwxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_x, this.out_z)
        return v
    }
    get out_zwxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_x, this.out_z)
        return v
    }
    get wwxz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_x, this.out_z)
        return v
    }
    get out_wwxz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_x, this.out_z)
        return v
    }
    get xxyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_y, this.out_z)
        return v
    }
    get out_xxyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_y, this.out_z)
        return v
    }
    get yxyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_y, this.out_z)
        return v
    }
    get out_yxyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_y, this.out_z)
        return v
    }
    get zxyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_y, this.out_z)
        return v
    }
    get out_zxyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_y, this.out_z)
        return v
    }
    get wxyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_y, this.out_z)
        return v
    }
    get out_wxyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_y, this.out_z)
        return v
    }
    set wxyz(other: Vec4Data) {
        this.w = other.x
        this.x = other.y
        this.y = other.z
        this.z = other.w
    }
    get xyyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_y, this.out_z)
        return v
    }
    get out_xyyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_y, this.out_z)
        return v
    }
    get yyyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_y, this.out_z)
        return v
    }
    get out_yyyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_y, this.out_z)
        return v
    }
    get zyyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_y, this.out_z)
        return v
    }
    get out_zyyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_y, this.out_z)
        return v
    }
    get wyyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_y, this.out_z)
        return v
    }
    get out_wyyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_y, this.out_z)
        return v
    }
    get xzyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_y, this.out_z)
        return v
    }
    get out_xzyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_y, this.out_z)
        return v
    }
    get yzyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_y, this.out_z)
        return v
    }
    get out_yzyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_y, this.out_z)
        return v
    }
    get zzyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_y, this.out_z)
        return v
    }
    get out_zzyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_y, this.out_z)
        return v
    }
    get wzyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_y, this.out_z)
        return v
    }
    get out_wzyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_y, this.out_z)
        return v
    }
    get xwyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_y, this.out_z)
        return v
    }
    get out_xwyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_y, this.out_z)
        return v
    }
    set xwyz(other: Vec4Data) {
        this.x = other.x
        this.w = other.y
        this.y = other.z
        this.z = other.w
    }
    get ywyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_y, this.out_z)
        return v
    }
    get out_ywyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_y, this.out_z)
        return v
    }
    get zwyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_y, this.out_z)
        return v
    }
    get out_zwyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_y, this.out_z)
        return v
    }
    get wwyz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_y, this.out_z)
        return v
    }
    get out_wwyz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_y, this.out_z)
        return v
    }
    get xxzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_z, this.out_z)
        return v
    }
    get out_xxzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_z, this.out_z)
        return v
    }
    get yxzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_z, this.out_z)
        return v
    }
    get out_yxzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_z, this.out_z)
        return v
    }
    get zxzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_z, this.out_z)
        return v
    }
    get out_zxzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_z, this.out_z)
        return v
    }
    get wxzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_z, this.out_z)
        return v
    }
    get out_wxzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_z, this.out_z)
        return v
    }
    get xyzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_z, this.out_z)
        return v
    }
    get out_xyzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_z, this.out_z)
        return v
    }
    get yyzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_z, this.out_z)
        return v
    }
    get out_yyzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_z, this.out_z)
        return v
    }
    get zyzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_z, this.out_z)
        return v
    }
    get out_zyzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_z, this.out_z)
        return v
    }
    get wyzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_z, this.out_z)
        return v
    }
    get out_wyzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_z, this.out_z)
        return v
    }
    get xzzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_z, this.out_z)
        return v
    }
    get out_xzzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_z, this.out_z)
        return v
    }
    get yzzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_z, this.out_z)
        return v
    }
    get out_yzzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_z, this.out_z)
        return v
    }
    get zzzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_z, this.out_z)
        return v
    }
    get out_zzzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_z, this.out_z)
        return v
    }
    get wzzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_z, this.out_z)
        return v
    }
    get out_wzzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_z, this.out_z)
        return v
    }
    get xwzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_z, this.out_z)
        return v
    }
    get out_xwzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_z, this.out_z)
        return v
    }
    get ywzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_z, this.out_z)
        return v
    }
    get out_ywzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_z, this.out_z)
        return v
    }
    get zwzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_z, this.out_z)
        return v
    }
    get out_zwzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_z, this.out_z)
        return v
    }
    get wwzz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_z, this.out_z)
        return v
    }
    get out_wwzz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_z, this.out_z)
        return v
    }
    get xxwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_w, this.out_z)
        return v
    }
    get out_xxwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_w, this.out_z)
        return v
    }
    get yxwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_w, this.out_z)
        return v
    }
    get out_yxwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_w, this.out_z)
        return v
    }
    set yxwz(other: Vec4Data) {
        this.y = other.x
        this.x = other.y
        this.w = other.z
        this.z = other.w
    }
    get zxwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_w, this.out_z)
        return v
    }
    get out_zxwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_w, this.out_z)
        return v
    }
    get wxwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_w, this.out_z)
        return v
    }
    get out_wxwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_w, this.out_z)
        return v
    }
    get xywz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_w, this.out_z)
        return v
    }
    get out_xywz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_w, this.out_z)
        return v
    }
    set xywz(other: Vec4Data) {
        this.x = other.x
        this.y = other.y
        this.w = other.z
        this.z = other.w
    }
    get yywz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_w, this.out_z)
        return v
    }
    get out_yywz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_w, this.out_z)
        return v
    }
    get zywz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_w, this.out_z)
        return v
    }
    get out_zywz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_w, this.out_z)
        return v
    }
    get wywz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_w, this.out_z)
        return v
    }
    get out_wywz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_w, this.out_z)
        return v
    }
    get xzwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_w, this.out_z)
        return v
    }
    get out_xzwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_w, this.out_z)
        return v
    }
    get yzwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_w, this.out_z)
        return v
    }
    get out_yzwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_w, this.out_z)
        return v
    }
    get zzwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_w, this.out_z)
        return v
    }
    get out_zzwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_w, this.out_z)
        return v
    }
    get wzwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_w, this.out_z)
        return v
    }
    get out_wzwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_w, this.out_z)
        return v
    }
    get xwwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_w, this.out_z)
        return v
    }
    get out_xwwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_w, this.out_z)
        return v
    }
    get ywwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_w, this.out_z)
        return v
    }
    get out_ywwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_w, this.out_z)
        return v
    }
    get zwwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_w, this.out_z)
        return v
    }
    get out_zwwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_w, this.out_z)
        return v
    }
    get wwwz() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_w, this.out_z)
        return v
    }
    get out_wwwz() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_w, this.out_z)
        return v
    }
    get xxxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_x, this.out_w)
        return v
    }
    get out_xxxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_x, this.out_w)
        return v
    }
    get yxxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_x, this.out_w)
        return v
    }
    get out_yxxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_x, this.out_w)
        return v
    }
    get zxxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_x, this.out_w)
        return v
    }
    get out_zxxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_x, this.out_w)
        return v
    }
    get wxxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_x, this.out_w)
        return v
    }
    get out_wxxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_x, this.out_w)
        return v
    }
    get xyxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_x, this.out_w)
        return v
    }
    get out_xyxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_x, this.out_w)
        return v
    }
    get yyxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_x, this.out_w)
        return v
    }
    get out_yyxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_x, this.out_w)
        return v
    }
    get zyxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_x, this.out_w)
        return v
    }
    get out_zyxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_x, this.out_w)
        return v
    }
    set zyxw(other: Vec4Data) {
        this.z = other.x
        this.y = other.y
        this.x = other.z
        this.w = other.w
    }
    get wyxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_x, this.out_w)
        return v
    }
    get out_wyxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_x, this.out_w)
        return v
    }
    get xzxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_x, this.out_w)
        return v
    }
    get out_xzxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_x, this.out_w)
        return v
    }
    get yzxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_x, this.out_w)
        return v
    }
    get out_yzxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_x, this.out_w)
        return v
    }
    set yzxw(other: Vec4Data) {
        this.y = other.x
        this.z = other.y
        this.x = other.z
        this.w = other.w
    }
    get zzxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_x, this.out_w)
        return v
    }
    get out_zzxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_x, this.out_w)
        return v
    }
    get wzxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_x, this.out_w)
        return v
    }
    get out_wzxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_x, this.out_w)
        return v
    }
    get xwxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_x, this.out_w)
        return v
    }
    get out_xwxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_x, this.out_w)
        return v
    }
    get ywxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_x, this.out_w)
        return v
    }
    get out_ywxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_x, this.out_w)
        return v
    }
    get zwxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_x, this.out_w)
        return v
    }
    get out_zwxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_x, this.out_w)
        return v
    }
    get wwxw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_x, this.out_w)
        return v
    }
    get out_wwxw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_x, this.out_w)
        return v
    }
    get xxyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_y, this.out_w)
        return v
    }
    get out_xxyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_y, this.out_w)
        return v
    }
    get yxyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_y, this.out_w)
        return v
    }
    get out_yxyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_y, this.out_w)
        return v
    }
    get zxyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_y, this.out_w)
        return v
    }
    get out_zxyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_y, this.out_w)
        return v
    }
    set zxyw(other: Vec4Data) {
        this.z = other.x
        this.x = other.y
        this.y = other.z
        this.w = other.w
    }
    get wxyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_y, this.out_w)
        return v
    }
    get out_wxyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_y, this.out_w)
        return v
    }
    get xyyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_y, this.out_w)
        return v
    }
    get out_xyyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_y, this.out_w)
        return v
    }
    get yyyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_y, this.out_w)
        return v
    }
    get out_yyyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_y, this.out_w)
        return v
    }
    get zyyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_y, this.out_w)
        return v
    }
    get out_zyyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_y, this.out_w)
        return v
    }
    get wyyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_y, this.out_w)
        return v
    }
    get out_wyyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_y, this.out_w)
        return v
    }
    get xzyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_y, this.out_w)
        return v
    }
    get out_xzyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_y, this.out_w)
        return v
    }
    set xzyw(other: Vec4Data) {
        this.x = other.x
        this.z = other.y
        this.y = other.z
        this.w = other.w
    }
    get yzyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_y, this.out_w)
        return v
    }
    get out_yzyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_y, this.out_w)
        return v
    }
    get zzyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_y, this.out_w)
        return v
    }
    get out_zzyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_y, this.out_w)
        return v
    }
    get wzyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_y, this.out_w)
        return v
    }
    get out_wzyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_y, this.out_w)
        return v
    }
    get xwyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_y, this.out_w)
        return v
    }
    get out_xwyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_y, this.out_w)
        return v
    }
    get ywyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_y, this.out_w)
        return v
    }
    get out_ywyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_y, this.out_w)
        return v
    }
    get zwyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_y, this.out_w)
        return v
    }
    get out_zwyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_y, this.out_w)
        return v
    }
    get wwyw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_y, this.out_w)
        return v
    }
    get out_wwyw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_y, this.out_w)
        return v
    }
    get xxzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_z, this.out_w)
        return v
    }
    get out_xxzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_z, this.out_w)
        return v
    }
    get yxzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_z, this.out_w)
        return v
    }
    get out_yxzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_z, this.out_w)
        return v
    }
    set yxzw(other: Vec4Data) {
        this.y = other.x
        this.x = other.y
        this.z = other.z
        this.w = other.w
    }
    get zxzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_z, this.out_w)
        return v
    }
    get out_zxzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_z, this.out_w)
        return v
    }
    get wxzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_z, this.out_w)
        return v
    }
    get out_wxzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_z, this.out_w)
        return v
    }
    get xyzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_z, this.out_w)
        return v
    }
    get out_xyzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_z, this.out_w)
        return v
    }
    set xyzw(other: Vec4Data) {
        this.x = other.x
        this.y = other.y
        this.z = other.z
        this.w = other.w
    }
    get yyzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_z, this.out_w)
        return v
    }
    get out_yyzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_z, this.out_w)
        return v
    }
    get zyzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_z, this.out_w)
        return v
    }
    get out_zyzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_z, this.out_w)
        return v
    }
    get wyzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_z, this.out_w)
        return v
    }
    get out_wyzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_z, this.out_w)
        return v
    }
    get xzzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_z, this.out_w)
        return v
    }
    get out_xzzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_z, this.out_w)
        return v
    }
    get yzzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_z, this.out_w)
        return v
    }
    get out_yzzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_z, this.out_w)
        return v
    }
    get zzzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_z, this.out_w)
        return v
    }
    get out_zzzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_z, this.out_w)
        return v
    }
    get wzzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_z, this.out_w)
        return v
    }
    get out_wzzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_z, this.out_w)
        return v
    }
    get xwzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_z, this.out_w)
        return v
    }
    get out_xwzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_z, this.out_w)
        return v
    }
    get ywzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_z, this.out_w)
        return v
    }
    get out_ywzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_z, this.out_w)
        return v
    }
    get zwzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_z, this.out_w)
        return v
    }
    get out_zwzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_z, this.out_w)
        return v
    }
    get wwzw() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_z, this.out_w)
        return v
    }
    get out_wwzw() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_z, this.out_w)
        return v
    }
    get xxww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_x, this.out_w, this.out_w)
        return v
    }
    get out_xxww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_x, this.out_w, this.out_w)
        return v
    }
    get yxww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_x, this.out_w, this.out_w)
        return v
    }
    get out_yxww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_x, this.out_w, this.out_w)
        return v
    }
    get zxww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_x, this.out_w, this.out_w)
        return v
    }
    get out_zxww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_x, this.out_w, this.out_w)
        return v
    }
    get wxww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_x, this.out_w, this.out_w)
        return v
    }
    get out_wxww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_x, this.out_w, this.out_w)
        return v
    }
    get xyww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_y, this.out_w, this.out_w)
        return v
    }
    get out_xyww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_y, this.out_w, this.out_w)
        return v
    }
    get yyww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_y, this.out_w, this.out_w)
        return v
    }
    get out_yyww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_y, this.out_w, this.out_w)
        return v
    }
    get zyww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_y, this.out_w, this.out_w)
        return v
    }
    get out_zyww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_y, this.out_w, this.out_w)
        return v
    }
    get wyww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_y, this.out_w, this.out_w)
        return v
    }
    get out_wyww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_y, this.out_w, this.out_w)
        return v
    }
    get xzww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_z, this.out_w, this.out_w)
        return v
    }
    get out_xzww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_z, this.out_w, this.out_w)
        return v
    }
    get yzww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_z, this.out_w, this.out_w)
        return v
    }
    get out_yzww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_z, this.out_w, this.out_w)
        return v
    }
    get zzww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_z, this.out_w, this.out_w)
        return v
    }
    get out_zzww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_z, this.out_w, this.out_w)
        return v
    }
    get wzww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_z, this.out_w, this.out_w)
        return v
    }
    get out_wzww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_z, this.out_w, this.out_w)
        return v
    }
    get xwww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_x, this.out_w, this.out_w, this.out_w)
        return v
    }
    get out_xwww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_x, this.out_w, this.out_w, this.out_w)
        return v
    }
    get ywww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_y, this.out_w, this.out_w, this.out_w)
        return v
    }
    get out_ywww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_y, this.out_w, this.out_w, this.out_w)
        return v
    }
    get zwww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_z, this.out_w, this.out_w, this.out_w)
        return v
    }
    get out_zwww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_z, this.out_w, this.out_w, this.out_w)
        return v
    }
    get wwww() {
        let v = vec4Data.getData()
        v.set_N_N_N_N(this.out_w, this.out_w, this.out_w, this.out_w)
        return v
    }
    get out_wwww() {
        let v = new Vec4Data()
        v.outSet_N_N_N_N(this.out_w, this.out_w, this.out_w, this.out_w)
        return v
    }
}

export class BVec34Data extends Vec4Data {}
export class IVec4Data extends Vec4Data {
    out_x: IntData = new IntData()
    out_y: IntData = new IntData()
    out_z: IntData = new IntData()
    out_w: IntData = new IntData()
}

export class NumData extends ValueType {
    protected _v: number = 0

    ctor() {
        return floatData.getData()
    }

    get v() {
        return this._v
    }

    set v(value: number) {
        this._v = value
    }

    set(other: NumData) {
        this.v = other.v
    }

    constructor(v?: number) {
        super()
        this.v = v || 0
    }
}

export class BoolData extends ValueType {
    protected _v: boolean = false

    ctor() {
        return floatData.getData()
    }

    get v() {
        return this._v
    }

    set v(value: boolean) {
        this._v = value
    }

    set(other: BoolData) {
        this.v = other.v
    }

    constructor(v?: boolean) {
        super()
        this.v = v || false
    }
}

export class FloatData extends NumData {}

export class IntData extends NumData {
    set v(value: number) {
        this._v = floor(value)
    }
    get v() {
        return this._v
    }
    ctor() {
        return intData.getData()
    }
}

export class Sampler2D extends IntData {}

export class SamplerCube extends ValueType {
    constructor() {
        super()
        console.error("SamplerCube 内置类型还未实现")
    }
}

export class Mat3Data extends ValueType {
    out_m00: FloatData = new FloatData()
    out_m01: FloatData = new FloatData()
    out_m02: FloatData = new FloatData()
    out_m03: FloatData = new FloatData()
    out_m04: FloatData = new FloatData()
    out_m05: FloatData = new FloatData()
    out_m06: FloatData = new FloatData()
    out_m07: FloatData = new FloatData()
    out_m08: FloatData = new FloatData()

    constructor(
        m00?: number,
        m01?: number,
        m02?: number,
        m03?: number,
        m04?: number,
        m05?: number,
        m06?: number,
        m07?: number,
        m08?: number
    ) {
        super()
        this.out_m00.v = m00 || 0
        this.out_m01.v = m01 || 0
        this.out_m02.v = m02 || 0
        this.out_m03.v = m03 || 0
        this.out_m04.v = m04 || 0
        this.out_m05.v = m05 || 0
        this.out_m06.v = m06 || 0
        this.out_m07.v = m07 || 0
        this.out_m08.v = m08 || 0
    }

    public static multiply(out: Mat3Data, a: Mat3Data, b: Mat3Data) {
        const a00 = a.m00
        const a01 = a.m01
        const a02 = a.m02
        const a10 = a.m03
        const a11 = a.m04
        const a12 = a.m05
        const a20 = a.m06
        const a21 = a.m07
        const a22 = a.m08

        const b00 = b.m00
        const b01 = b.m01
        const b02 = b.m02
        const b10 = b.m03
        const b11 = b.m04
        const b12 = b.m05
        const b20 = b.m06
        const b21 = b.m07
        const b22 = b.m08

        out.m00 = b00 * a00 + b01 * a10 + b02 * a20
        out.m01 = b00 * a01 + b01 * a11 + b02 * a21
        out.m02 = b00 * a02 + b01 * a12 + b02 * a22

        out.m03 = b10 * a00 + b11 * a10 + b12 * a20
        out.m04 = b10 * a01 + b11 * a11 + b12 * a21
        out.m05 = b10 * a02 + b11 * a12 + b12 * a22

        out.m06 = b20 * a00 + b21 * a10 + b22 * a20
        out.m07 = b20 * a01 + b21 * a11 + b22 * a21
        out.m08 = b20 * a02 + b21 * a12 + b22 * a22
        return out
    }

    get m00() {
        return this.out_m00.v
    }

    set m00(v: number) {
        this.out_m00.v = v
    }

    get m01() {
        return this.out_m01.v
    }

    set m01(v: number) {
        this.out_m01.v = v
    }

    get m02() {
        return this.out_m02.v
    }

    set m02(v: number) {
        this.out_m02.v = v
    }

    get m03() {
        return this.out_m03.v
    }

    set m03(v: number) {
        this.out_m03.v = v
    }

    get m04() {
        return this.out_m04.v
    }

    set m04(v: number) {
        this.out_m04.v = v
    }

    get m05() {
        return this.out_m05.v
    }

    set m05(v: number) {
        this.out_m05.v = v
    }

    get m06() {
        return this.out_m06.v
    }

    set m06(v: number) {
        this.out_m06.v = v
    }

    get m07() {
        return this.out_m07.v
    }

    set m07(v: number) {
        this.out_m07.v = v
    }

    get m08() {
        return this.out_m08.v
    }

    set m08(v: number) {
        this.out_m08.v = v
    }

    get x() {
        let v3 = vec3Data.getData()
        v3.x = this.m00
        v3.y = this.m01
        v3.z = this.m02
        return v3
    }

    get out_x() {
        let v3 = new Vec3Data()
        v3.out_x = this.out_m00
        v3.out_y = this.out_m01
        v3.out_z = this.out_m02
        return v3
    }

    set x(v3: Vec3Data) {
        this.m00 = v3.x
        this.m01 = v3.y
        this.m02 = v3.z
    }

    get y() {
        let v3 = vec3Data.getData()
        v3.x = this.m03
        v3.y = this.m04
        v3.z = this.m05
        return v3
    }

    set(other: Mat3Data) {
        this.m00 = other.m00
        this.m01 = other.m01
        this.m02 = other.m02
        this.m03 = other.m03
        this.m04 = other.m04
        this.m05 = other.m05
        this.m06 = other.m06
        this.m07 = other.m07
        this.m08 = other.m08
    }

    set_M3(other: Mat3Data) {
        this.m00 = other.m00
        this.m01 = other.m01
        this.m02 = other.m02
        this.m03 = other.m03
        this.m04 = other.m04
        this.m05 = other.m05
        this.m06 = other.m06
        this.m07 = other.m07
        this.m08 = other.m08
    }

    get out_y() {
        let v3 = new Vec3Data()
        v3.out_x = this.out_m03
        v3.out_y = this.out_m04
        v3.out_z = this.out_m05
        return v3
    }

    set y(v3: Vec3Data) {
        this.m03 = v3.x
        this.m04 = v3.y
        this.m05 = v3.z
    }

    get z() {
        let v3 = vec3Data.getData()
        v3.x = this.m06
        v3.y = this.m07
        v3.z = this.m08
        return v3
    }

    get out_z() {
        let v3 = new Vec3Data()
        v3.out_x = this.out_m06
        v3.out_y = this.out_m07
        v3.out_z = this.out_m08
        return v3
    }

    set z(v3: Vec3Data) {
        this.m06 = v3.x
        this.m07 = v3.y
        this.m08 = v3.z
    }
}

// 内部的Num类型变量 不能使用
export class Mat4Data extends ValueType {
    out_m00: FloatData = new FloatData()
    out_m01: FloatData = new FloatData()
    out_m02: FloatData = new FloatData()
    out_m03: FloatData = new FloatData()
    out_m04: FloatData = new FloatData()
    out_m05: FloatData = new FloatData()
    out_m06: FloatData = new FloatData()
    out_m07: FloatData = new FloatData()
    out_m08: FloatData = new FloatData()
    out_m09: FloatData = new FloatData()
    out_m10: FloatData = new FloatData()
    out_m11: FloatData = new FloatData()
    out_m12: FloatData = new FloatData()
    out_m13: FloatData = new FloatData()
    out_m14: FloatData = new FloatData()
    out_m15: FloatData = new FloatData()

    constructor(
        m00?: number,
        m01?: number,
        m02?: number,
        m03?: number,
        m04?: number,
        m05?: number,
        m06?: number,
        m07?: number,
        m08?: number,
        m09?: number,
        m10?: number,
        m11?: number,
        m12?: number,
        m13?: number,
        m14?: number,
        m15?: number
    ) {
        super()
        this.out_m00.v = m00 || 0
        this.out_m01.v = m01 || 0
        this.out_m02.v = m02 || 0
        this.out_m03.v = m03 || 0
        this.out_m04.v = m04 || 0
        this.out_m05.v = m05 || 0
        this.out_m06.v = m06 || 0
        this.out_m07.v = m07 || 0
        this.out_m08.v = m08 || 0
        this.out_m09.v = m09 || 0
        this.out_m10.v = m10 || 0
        this.out_m11.v = m11 || 0
        this.out_m12.v = m12 || 0
        this.out_m13.v = m13 || 0
        this.out_m14.v = m14 || 0
        this.out_m15.v = m15 || 0
    }

    public static multiply(out: Mat4Data, a: Mat4Data, b: Mat4Data) {
        const a00 = a.m00
        const a01 = a.m01
        const a02 = a.m02
        const a03 = a.m03
        const a10 = a.m04
        const a11 = a.m05
        const a12 = a.m06
        const a13 = a.m07
        const a20 = a.m08
        const a21 = a.m09
        const a22 = a.m10
        const a23 = a.m11
        const a30 = a.m12
        const a31 = a.m13
        const a32 = a.m14
        const a33 = a.m15

        // Cache only the current line of the second matrix
        let b0 = b.m00
        let b1 = b.m01
        let b2 = b.m02
        let b3 = b.m03
        out.m00 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
        out.m01 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
        out.m02 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
        out.m03 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

        b0 = b.m04
        b1 = b.m05
        b2 = b.m06
        b3 = b.m07
        out.m04 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
        out.m05 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
        out.m06 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
        out.m07 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

        b0 = b.m08
        b1 = b.m09
        b2 = b.m10
        b3 = b.m11
        out.m08 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
        out.m09 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
        out.m10 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
        out.m11 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

        b0 = b.m12
        b1 = b.m13
        b2 = b.m14
        b3 = b.m15
        out.m12 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
        out.m13 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
        out.m14 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
        out.m15 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
        return out
    }

    get m00() {
        return this.out_m00.v
    }

    set m00(v: number) {
        this.out_m00.v = v
    }

    get m01() {
        return this.out_m01.v
    }

    set m01(v: number) {
        this.out_m01.v = v
    }

    get m02() {
        return this.out_m02.v
    }

    set m02(v: number) {
        this.out_m02.v = v
    }

    get m03() {
        return this.out_m03.v
    }

    set m03(v: number) {
        this.out_m03.v = v
    }

    get m04() {
        return this.out_m04.v
    }

    set m04(v: number) {
        this.out_m04.v = v
    }

    get m05() {
        return this.out_m05.v
    }

    set m05(v: number) {
        this.out_m05.v = v
    }

    get m06() {
        return this.out_m06.v
    }

    set m06(v: number) {
        this.out_m06.v = v
    }

    get m07() {
        return this.out_m07.v
    }

    set m07(v: number) {
        this.out_m07.v = v
    }

    get m08() {
        return this.out_m08.v
    }

    set m08(v: number) {
        this.out_m08.v = v
    }

    get m09() {
        return this.out_m09.v
    }

    set m09(v: number) {
        this.out_m09.v = v
    }

    get m10() {
        return this.out_m10.v
    }

    set m10(v: number) {
        this.out_m10.v = v
    }

    get m11() {
        return this.out_m11.v
    }

    set m11(v: number) {
        this.out_m11.v = v
    }

    get m12() {
        return this.out_m12.v
    }

    set m12(v: number) {
        this.out_m12.v = v
    }

    get m13() {
        return this.out_m13.v
    }

    set m13(v: number) {
        this.out_m13.v = v
    }

    get m14() {
        return this.out_m14.v
    }

    set m14(v: number) {
        this.out_m14.v = v
    }

    get m15() {
        return this.out_m15.v
    }

    set m15(v: number) {
        this.out_m15.v = v
    }

    set(other: Mat4Data) {
        this.m00 = other.m00
        this.m01 = other.m01
        this.m02 = other.m02
        this.m03 = other.m03
        this.m04 = other.m04
        this.m05 = other.m05
        this.m06 = other.m06
        this.m07 = other.m07
        this.m08 = other.m08
        this.m09 = other.m09
        this.m10 = other.m10
        this.m11 = other.m11
        this.m12 = other.m12
        this.m13 = other.m13
        this.m14 = other.m14
        this.m15 = other.m15
    }

    set_M4(other: Mat4Data) {
        this.m00 = other.m00
        this.m01 = other.m01
        this.m02 = other.m02
        this.m03 = other.m03
        this.m04 = other.m04
        this.m05 = other.m05
        this.m06 = other.m06
        this.m07 = other.m07
        this.m08 = other.m08
        this.m09 = other.m09
        this.m10 = other.m10
        this.m11 = other.m11
        this.m12 = other.m12
        this.m13 = other.m13
        this.m14 = other.m14
        this.m15 = other.m15
    }

    get x() {
        let v4 = vec4Data.getData()
        v4.x = this.m00
        v4.y = this.m01
        v4.z = this.m02
        v4.w = this.m03
        return v4
    }

    get out_x() {
        let v4 = new Vec4Data()
        v4.out_x = this.out_m00
        v4.out_y = this.out_m01
        v4.out_z = this.out_m02
        v4.out_w = this.out_m03
        return v4
    }

    set x(v4: Vec4Data) {
        this.m00 = v4.x
        this.m01 = v4.y
        this.m02 = v4.z
        this.m03 = v4.w
    }

    get y() {
        let v4 = vec4Data.getData()
        v4.x = this.m04
        v4.y = this.m05
        v4.z = this.m06
        v4.w = this.m07
        return v4
    }

    get out_y() {
        let v4 = new Vec4Data()
        v4.out_x = this.out_m04
        v4.out_y = this.out_m05
        v4.out_z = this.out_m06
        v4.out_w = this.out_m07
        return v4
    }

    set y(v4: Vec4Data) {
        this.m04 = v4.x
        this.m05 = v4.y
        this.m06 = v4.z
        this.m07 = v4.w
    }

    get z() {
        let v4 = vec4Data.getData()
        v4.x = this.m08
        v4.y = this.m09
        v4.z = this.m10
        v4.w = this.m11
        return v4
    }

    get out_z() {
        let v4 = new Vec4Data()
        v4.out_x = this.out_m08
        v4.out_y = this.out_m09
        v4.out_z = this.out_m10
        v4.out_w = this.out_m11
        return v4
    }

    set z(v4: Vec4Data) {
        this.m08 = v4.x
        this.m09 = v4.y
        this.m10 = v4.z
        this.m11 = v4.w
    }

    get w() {
        let v4 = vec4Data.getData()
        v4.x = this.m12
        v4.y = this.m13
        v4.z = this.m14
        v4.w = this.m15
        return v4
    }

    get out_w() {
        let v4 = new Vec4Data()
        v4.out_x = this.out_m12
        v4.out_y = this.out_m13
        v4.out_z = this.out_m14
        v4.out_w = this.out_m15
        return v4
    }

    set w(v4: Vec4Data) {
        this.m12 = v4.x
        this.m13 = v4.y
        this.m14 = v4.z
        this.m15 = v4.w
    }
}
