/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 210
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 53
#define CC_USE_MORPH 0
#define CC_MORPH_TARGET_COUNT 2
#define CC_MORPH_PRECOMPUTED 0
#define CC_MORPH_TARGET_HAS_POSITION 0
#define CC_MORPH_TARGET_HAS_NORMAL 0
#define CC_MORPH_TARGET_HAS_TANGENT 0
#define CC_USE_SKINNING 0
#define CC_USE_BAKED_ANIMATION 0
#define USE_INSTANCING 0
#define USE_BATCHING 0
#define USE_LIGHTMAP 0
#define CC_USE_HDR 0

precision mediump float;
uniform lowp vec4 cc_shadowColor;
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
vec4 frag () {
return CCFragOutput(cc_shadowColor);
}
void main() { gl_FragColor = frag(); }
*/
import { float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import { glSet_V3_V3, glMul_V3_V3, glSet_V4_V4, getValueKeyByIndex } from "../builtin/BuiltinOperator"
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
let CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS = new FloatData(4095)
let CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS = new FloatData(1024)
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(210)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(53)
let CC_USE_MORPH = new FloatData(0)
let CC_MORPH_TARGET_COUNT = new FloatData(2)
let CC_MORPH_PRECOMPUTED = new FloatData(0)
let CC_MORPH_TARGET_HAS_POSITION = new FloatData(0)
let CC_MORPH_TARGET_HAS_NORMAL = new FloatData(0)
let CC_MORPH_TARGET_HAS_TANGENT = new FloatData(0)
let CC_USE_SKINNING = new FloatData(0)
let CC_USE_BAKED_ANIMATION = new FloatData(0)
let USE_INSTANCING = new FloatData(0)
let USE_BATCHING = new FloatData(0)
let USE_LIGHTMAP = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
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
    cc_shadowColor: Vec4Data = new Vec4Data()
    cc_exposure: Vec4Data = new Vec4Data()
    dataKeys: Map<string, any> = new Map([
        ["cc_shadowColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_exposure", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_shadowColor", 1],
        ["cc_exposure", 1],
    ])
}
export class Impl_b38959f15b5e2a2eeeb15c11adee8099 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    SRGBToLinear_V3(__gamma__: Vec3Data): Vec3Data {
        let gamma: Vec3Data = vec3()
        glSet_V3_V3(gamma, __gamma__)

        return glMul_V3_V3(gamma, gamma)
    }
    CCFragOutput_V4(__color__: Vec4Data): Vec4Data {
        let color: Vec4Data = vec4()
        glSet_V4_V4(color, __color__)

        return color
    }
    frag(): Vec4Data {
        return this.CCFragOutput_V4(this.uniformData.cc_shadowColor)
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
