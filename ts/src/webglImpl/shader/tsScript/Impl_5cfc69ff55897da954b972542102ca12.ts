/*
origin glsl source: 


precision mediump float;

void
main()
{
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

}

*/
/*
fact do glsl source: 


precision mediump float;

void
main()
{
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

}

*/
import { vec4_N_N_N_N, float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
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
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
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
export class Impl_5cfc69ff55897da954b972542102ca12 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    main(): void {
        glSet_V4_V4(gl_FragColor, vec4_N_N_N_N(float_N(1.0), float_N(0.0), float_N(0.0), float_N(1.0)))
    }
}
