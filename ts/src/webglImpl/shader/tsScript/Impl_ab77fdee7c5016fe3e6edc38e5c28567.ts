/*
origin glsl source: 


attribute  vec4 vPosition;

void main() 
{
    gl_Position = vPosition;
} 

*/
/*
fact do glsl source: 


attribute  vec4 vPosition;

void main() 
{
    gl_Position = vPosition;
} 

*/
import { float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import { glSet_V4_V4, getValueKeyByIndex, getOutValueKeyByIndex } from "../builtin/BuiltinOperator"
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
    dataKeys: Map<string, any> = new Map([["vPosition", cpuRenderingContext.cachGameGl.FLOAT_VEC4]])
    dataSize: Map<string, number> = new Map([["vPosition", 1]])
}
class VaryingDataImpl extends VaryingData {
    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([])
    copy(varying: VaryingDataImpl) {}
}
class UniformDataImpl implements UniformData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
}
export class Impl_ab77fdee7c5016fe3e6edc38e5c28567 extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    main(): void {
        glSet_V4_V4(gl_Position, this.attributeData.vPosition)
    }
}
