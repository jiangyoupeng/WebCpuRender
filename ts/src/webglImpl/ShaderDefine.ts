import { gl_FragColor, gl_Position } from "./shader/builtin/BuiltinVar"

export interface StructData {}
/**定义的顶点属性 */
export interface AttributeData {
    dataKeys: Map<string, number>
    dataSize: Map<string, number>
}
/**定义的unifom数据 */
export interface UniformData {
    dataKeys: Map<string, number>
    dataSize: Map<string, number>
}
/**定义的varying数据 */
export class VaryingData {
    constructor() {}
    dataKeys: Map<string, number> = new Map()
    factoryCreate() {
        return new VaryingData()
    }
    copy(varying: VaryingData) {
        console.error("必须自己实现copy")
    }
}

export class BaseShaderHandle {
    constructor() {}
    uniformData: UniformData = null!
    varyingData: VaryingData = null!
}

export class VertShaderHandle extends BaseShaderHandle {
    /**顶点属性只存在顶点着色器中 */
    attributeData: AttributeData = null!
    main() {
        gl_Position.set_Vn(0, 0, 0, 0)
    }
}

export class FragShaderHandle extends BaseShaderHandle {
    /**dFdx, dFdy — return the partial derivative of an argument with respect to x or y */
    dFdx(p: GLfloat) {
        console.error("dFdx 还未实现")
    }
    dFdy(p: GLfloat) {
        console.error("dFdx 还未实现")
    }
    fwidth(p: GLfloat) {
        console.error("dFdx 还未实现")
    }

    /**遍历片元处理 */
    main() {
        gl_FragColor.set_Vn(0, 0, 0, 0)
    }
}
