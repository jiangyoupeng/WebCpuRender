/*
origin glsl source: 


precision mediump float;

varying  vec2 fTexCoord;

uniform sampler2D texture;

void main() 
{ 
    gl_FragColor = texture2D( texture, fTexCoord);

} 

*/
/*
fact do glsl source: 


precision mediump float;

varying  vec2 fTexCoord;

uniform sampler2D texture;

void main() 
{ 
    gl_FragColor = texture2D( texture, fTexCoord);

} 

*/
import { texture2D_N_V2, float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
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
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
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
    texture: Sampler2D = new Sampler2D()
    dataKeys: Map<string, any> = new Map([["texture", cpuRenderingContext.cachGameGl.SAMPLER_2D]])
    dataSize: Map<string, number> = new Map([["texture", 1]])
}
export class Impl_07c44d90d7e535a0c16ba9e1910f1b39 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    main(): void {
        glSet_V4_V4(gl_FragColor, texture2D_N_V2(this.uniformData.texture, this.varyingData.fTexCoord))
    }
}
