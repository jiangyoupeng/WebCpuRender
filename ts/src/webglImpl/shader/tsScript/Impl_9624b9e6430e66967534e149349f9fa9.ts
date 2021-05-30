/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4096
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 58
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 37
#define CC_USE_HDR 0

precision mediump float;
uniform mediump vec4 cc_exposure;
vec3 SRGBToLinear (vec3 gamma) {
return gamma * gamma;
}
vec4 CCFragOutput (vec4 color) {
#if CC_USE_HDR
color.rgb = mix(color.rgb, SRGBToLinear(color.rgb) * cc_exposure.w, vec3(cc_exposure.z));
#endif
return color;
}
varying vec2 v_uv;
uniform sampler2D mainTexture;
vec4 frag () {
return CCFragOutput(texture2D(mainTexture, v_uv));
}
void main() { gl_FragColor = frag(); }
*/
import { texture2D_N_V2, float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import { glSet_V2_V2, glSet_V3_V3, glMul_V3_V3, glSet_V4_V4, getValueKeyByIndex } from "../builtin/BuiltinOperator"
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
let CC_DEVICE_SUPPORT_FLOAT_TEXTURE = new FloatData(0)
let CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS = new FloatData(4096)
let CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS = new FloatData(1024)
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(58)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(37)
let CC_USE_HDR = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
}
class VaryingDataImpl extends VaryingData {
    v_uv: Vec2Data = new Vec2Data()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([["v_uv", cpuRenderingContext.cachGameGl.FLOAT_VEC2]])
    copy(varying: VaryingDataImpl) {
        glSet_V2_V2(varying.v_uv, this.v_uv)
    }
}
class UniformDataImpl implements UniformData {
    cc_exposure: Vec4Data = new Vec4Data()
    mainTexture: Sampler2D = new Sampler2D()
    dataKeys: Map<string, any> = new Map([
        ["cc_exposure", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["mainTexture", cpuRenderingContext.cachGameGl.SAMPLER_2D],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_exposure", 1],
        ["mainTexture", 1],
    ])
}
export class Impl_9624b9e6430e66967534e149349f9fa9 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    SRGBToLinear_V3(__gamma__: Vec3Data): Vec3Data {
        let gamma: Vec3Data = new Vec3Data()
        glSet_V3_V3(gamma, __gamma__)

        return glMul_V3_V3(gamma, gamma)
    }
    CCFragOutput_V4(__color__: Vec4Data): Vec4Data {
        let color: Vec4Data = new Vec4Data()
        glSet_V4_V4(color, __color__)

        return color
    }
    frag(): Vec4Data {
        return this.CCFragOutput_V4(texture2D_N_V2(this.uniformData.mainTexture, this.varyingData.v_uv))
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
