import { FloatData, IntData, Vec2Data, Vec3Data, Vec4Data } from "./shader/builtin/BuiltinData"

export class AttributeReadInfo {
    size: GLint = 0
    type: GLenum = 0
    normalized: GLboolean = false
    stride: GLsizei = 0
    offset: GLintptr = 0
    byteType: any
    isFloat: boolean = true

    /**从哪个buffer上读取 */
    readBufferIndex: GLint = 0
    constructor(
        gl: WebGLRenderingContext,
        readBufferIndex: GLint,
        size: GLint,
        type: GLenum,
        normalized: GLboolean,
        stride: GLsizei,
        offset: GLintptr
    ) {
        this.size = size
        this.type = type
        this.normalized = normalized
        this.stride = stride
        this.offset = offset

        this.byteType = Float32Array
        this.readBufferIndex = readBufferIndex
        // this.byteLength = Float32Array.BYTES_PER_ELEMENT
        switch (type) {
            case gl.BYTE:
                this.byteType = Int8Array
                this.isFloat = false
            case gl.SHORT:
                this.byteType = Int16Array
                this.isFloat = false
            case gl.UNSIGNED_BYTE:
                this.byteType = Uint8Array
                this.isFloat = false
            case gl.UNSIGNED_SHORT:
                this.byteType = Uint16Array
                this.isFloat = false
            case gl.FLOAT:
                this.byteType = Float32Array
        }
    }
}

export class CachWriteData {
    constructor(
        mode: GLenum,
        beginIndex: number,
        endIndex: number,
        cachVboAttributeDatas: Map<string, number[] | Vec2Data[] | Vec3Data[] | Vec4Data[] | IntData[] | FloatData[]>
    ) {
        this.mode = mode
        this.beginIndex = beginIndex
        this.endIndex = endIndex
        this.cachVboAttributeDatas = cachVboAttributeDatas
    }

    mode: GLenum = null!
    beginIndex: number = null!
    endIndex: number = null!
    cachVboAttributeDatas: Map<string, number[] | Vec2Data[] | Vec3Data[] | Vec4Data[] | IntData[] | FloatData[]> = null!
}
