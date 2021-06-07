/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 195
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 38
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
#define USE_POSITION_SCALING 0
#define CC_USE_HDR 0
#define USE_BASE_COLOR_MAP 0

precision highp float;
uniform mediump vec4 cc_exposure;
  uniform mediump vec4 cc_mainLitColor;
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
   uniform vec4 baseColor;
#if USE_BASE_COLOR_MAP
  uniform sampler2D baseColorMap;
#endif
vec4 frag () {
  vec4 color = baseColor * cc_mainLitColor;
  #if USE_BASE_COLOR_MAP
    vec4 texColor = texture2D(baseColorMap, v_uv);
    texColor.rgb = SRGBToLinear(texColor.rgb);
    color *= texColor;
  #endif
  return CCFragOutput(vec4(color.rgb, 1.0));
}
void main() { gl_FragColor = frag(); }
*/
/*
fact do glsl source: 
#define USE_BASE_COLOR_MAP 0
#define CC_USE_HDR 0
#define USE_POSITION_SCALING 0
#define USE_LIGHTMAP 0
#define USE_BATCHING 0
#define USE_INSTANCING 0
#define CC_USE_BAKED_ANIMATION 0
#define CC_USE_SKINNING 0
#define CC_MORPH_TARGET_HAS_TANGENT 0
#define CC_MORPH_TARGET_HAS_NORMAL 0
#define CC_MORPH_TARGET_HAS_POSITION 0
#define CC_MORPH_PRECOMPUTED 0
#define CC_MORPH_TARGET_COUNT 2
#define CC_USE_MORPH 0
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 38
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 195
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0

precision highp float;
uniform mediump vec4 cc_exposure;
  uniform mediump vec4 cc_mainLitColor;
vec3 SRGBToLinear (vec3 gamma) {
  return gamma * gamma;
}
vec4 CCFragOutput (vec4 color) {
  return color;
}
varying vec2 v_uv;
   uniform vec4 baseColor;
vec4 frag () {
  vec4 color = baseColor * cc_mainLitColor;
  return CCFragOutput(vec4(color.rgb, 1.0));
}
void main() { gl_FragColor = frag(); }
*/
import { vec4_V3_N, float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import {
    glSet_V2_V2,
    glSet_V3_V3,
    glMul_V3_V3,
    glSet_V4_V4,
    glMul_V4_V4,
    getValueKeyByIndex,
    getOutValueKeyByIndex,
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
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(38)
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
let USE_POSITION_SCALING = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
let USE_BASE_COLOR_MAP = new FloatData(0)
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
    cc_mainLitColor: Vec4Data = new Vec4Data()
    baseColor: Vec4Data = new Vec4Data()
    dataKeys: Map<string, any> = new Map([
        ["cc_exposure", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_mainLitColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["baseColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_exposure", 1],
        ["cc_mainLitColor", 1],
        ["baseColor", 1],
    ])
}
export class Impl_887e7775c773b942505f7b843eca1ac1 extends FragShaderHandle {
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
        let color: Vec4Data = vec4()
        glSet_V4_V4(color, glMul_V4_V4(this.uniformData.baseColor, this.uniformData.cc_mainLitColor))
        return this.CCFragOutput_V4(vec4_V3_N(color.xyz, float_N(1.0)))
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
