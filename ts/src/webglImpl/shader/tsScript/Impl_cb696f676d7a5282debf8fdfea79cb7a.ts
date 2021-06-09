/*
origin glsl source: 


attribute vec4 vPosition;
attribute vec2 vTexCoord;

varying vec2 fTexCoord;

void main()
{

gl_Position = vPosition;
fTexCoord = vTexCoord;

}

*/
/*
fact do glsl source: 


attribute vec4 vPosition;
attribute vec2 vTexCoord;

varying vec2 fTexCoord;

void main()
{

gl_Position = vPosition;
fTexCoord = vTexCoord;

}

*/
import { float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import { glSet_V2_V2, glSet_V4_V4, getValueKeyByIndex, getOutValueKeyByIndex } from "../builtin/BuiltinOperator"
import { gl_FragData, gl_FragColor, gl_Position, gl_FragCoord, gl_FragDepth, gl_FrontFacing, custom_isDiscard } from "../builtin/BuiltinVar"
import { cpuRenderingContext } from "../../CpuRenderingContext"
import { AttributeData, FragShaderHandle, UniformData, VaryingData, VertShaderHandle, StructData } from "../../ShaderDefine"
import {
    IntData,
    FloatData,
    Vec2Data,
    Vec3Data,
    Vec4Data,
    Mat3Data,
    Mat4Data,
    BoolData,
    Sampler2D,
    SamplerCube,
} from "../builtin/BuiltinData"
class AttributeDataImpl implements AttributeData {
    vPosition: Vec4Data = new Vec4Data()
    vTexCoord: Vec2Data = new Vec2Data()
    dataKeys: Map<string, any> = new Map([
        ["vPosition", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["vTexCoord", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
    ])
    dataSize: Map<string, number> = new Map([
        ["vPosition", 1],
        ["vTexCoord", 1],
    ])
}
class VaryingDataImpl extends VaryingData {
    fTexCoord: Vec2Data = new Vec2Data()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([["fTexCoord", cpuRenderingContext.cachGameGl.FLOAT_VEC2]])
    copy(varying: VaryingDataImpl) {
        glSet_V2_V2(varying.fTexCoord, this.fTexCoord)
    }
}
class UniformDataImpl implements UniformData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
}
export class Impl_cb696f676d7a5282debf8fdfea79cb7a extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    main(): void {
        glSet_V4_V4(gl_Position, this.attributeData.vPosition)
        glSet_V2_V2(this.varyingData.fTexCoord, this.attributeData.vTexCoord)
    }
}
