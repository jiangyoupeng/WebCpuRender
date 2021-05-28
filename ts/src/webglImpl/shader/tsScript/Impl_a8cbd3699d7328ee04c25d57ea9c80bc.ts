/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 195
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 39
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
#define CC_USE_FOG 0
#define CC_FORWARD_ADD 0
#define USE_VERTEX_COLOR 0
#define USE_TEXTURE 0
#define SAMPLE_FROM_RT 0
#define CC_USE_HDR 0
#define USE_ALPHA_TEST 0
#define ALPHA_TEST_CHANNEL a

precision highp float;
uniform mediump vec4 cc_exposure;
uniform mediump vec4 cc_fogColor;
vec3 SRGBToLinear (vec3 gamma) {
return gamma * gamma;
}
vec4 CCFragOutput (vec4 color) {
#if CC_USE_HDR
color.rgb = mix(color.rgb, SRGBToLinear(color.rgb) * cc_exposure.w, vec3(cc_exposure.z));
#endif
return color;
}
varying float v_fog_factor;
#if USE_ALPHA_TEST
#endif
#if USE_TEXTURE
varying vec2 v_uv;
uniform sampler2D mainTexture;
#endif
uniform vec4 mainColor;
uniform vec4 colorScaleAndCutoff;
#if USE_VERTEX_COLOR
varying lowp vec4 v_color;
#endif
vec4 frag () {
vec4 o = mainColor;
o.rgb *= colorScaleAndCutoff.xyz;
#if USE_VERTEX_COLOR
o *= v_color;
#endif
#if USE_TEXTURE
o *= texture2D(mainTexture, v_uv);
#endif
#if USE_ALPHA_TEST
if (o.ALPHA_TEST_CHANNEL < colorScaleAndCutoff.w) discard;
#endif
o = vec4(mix(CC_FORWARD_ADD > 0 ? vec3(0.0) : cc_fogColor.rgb, o.rgb, v_fog_factor), o.a);
return CCFragOutput(o);
}
void main() { gl_FragColor = frag(); }
*/
import {
    vec3_N,
    mix_V3_V3_N,
    vec4_V3_N,
    float,
    float_N,
    bool,
    bool_N,
    int_N,
    int,
    vec4,
    vec3,
    vec2,
    mat3,
    mat4,
} from "../builtin/BuiltinFunc"
import {
    glSet_N_N,
    glSet_V3_V3,
    glMul_V3_V3,
    glSet_V4_V4,
    glMulSet_V3_V3,
    glIsMore_N_N,
    getValueKeyByIndex,
} from "../builtin/BuiltinOperator"
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(195)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(39)
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
let CC_USE_FOG = new FloatData(0)
let CC_FORWARD_ADD = new FloatData(0)
let USE_VERTEX_COLOR = new FloatData(0)
let USE_TEXTURE = new FloatData(0)
let SAMPLE_FROM_RT = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
let USE_ALPHA_TEST = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
}
class VaryingDataImpl extends VaryingData {
    v_fog_factor: FloatData = new FloatData()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([["v_fog_factor", cpuRenderingContext.cachGameGl.FLOAT]])
    copy(varying: VaryingDataImpl) {
        glSet_N_N(varying.v_fog_factor, this.v_fog_factor)
    }
}
class UniformDataImpl implements UniformData {
    cc_exposure: Vec4Data = null!
    cc_fogColor: Vec4Data = null!
    mainColor: Vec4Data = null!
    colorScaleAndCutoff: Vec4Data = null!
    dataKeys: Map<string, any> = new Map([
        ["cc_exposure", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_fogColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["mainColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["colorScaleAndCutoff", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_exposure", 1],
        ["cc_fogColor", 1],
        ["mainColor", 1],
        ["colorScaleAndCutoff", 1],
    ])
}
export class Impl_a8cbd3699d7328ee04c25d57ea9c80bc extends FragShaderHandle {
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
        let o: Vec4Data = vec4()
        glSet_V4_V4(o, this.uniformData.mainColor)
        glMulSet_V3_V3(o.xyz, this.uniformData.colorScaleAndCutoff.xyz)
        glSet_V4_V4(
            o,
            vec4_V3_N(
                mix_V3_V3_N(
                    glIsMore_N_N(CC_FORWARD_ADD, int_N(0)) ? vec3_N(float_N(0.0)) : this.uniformData.cc_fogColor.xyz,
                    o.xyz,
                    this.varyingData.v_fog_factor
                ),
                float_N(o.w)
            )
        )
        return this.CCFragOutput_V4(o)
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
