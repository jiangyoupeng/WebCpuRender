/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 182
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 9
#define CC_USE_MORPH 0
#define CC_MORPH_TARGET_COUNT 2
#define CC_MORPH_PRECOMPUTED 0
#define CC_MORPH_TARGET_HAS_POSITION 0
#define CC_MORPH_TARGET_HAS_NORMAL 0
#define CC_MORPH_TARGET_HAS_TANGENT 0
#define CC_USE_SKINNING 1
#define CC_USE_BAKED_ANIMATION 1
#define USE_INSTANCING 0
#define USE_BATCHING 0
#define USE_LIGHTMAP 0
#define USE_BASE_COLOR_MAP 1
#define USE_ALPHA_TEST 0
#define ALPHA_TEST_CHANNEL a

precision highp float;
   uniform vec4 baseColor;
   uniform vec4 colorScaleAndCutoff;
vec4 packDepthToRGBA (float depth) {
  vec4 ret = vec4(1.0, 255.0, 65025.0, 160581375.0) * depth;
  ret = fract(ret);
  ret -= ret.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);
  return ret;
}
varying vec2 v_uv;
varying vec2 v_clip_depth;
#if USE_BASE_COLOR_MAP
  uniform sampler2D baseColorMap;
#endif
#if USE_ALPHA_TEST
#endif
vec4 frag () {
  vec4 baseColor = baseColor;
  #if USE_BASE_COLOR_MAP
    baseColor *= texture2D(baseColorMap, v_uv);
  #endif
  #if USE_ALPHA_TEST
    if (baseColor.ALPHA_TEST_CHANNEL < colorScaleAndCutoff.w) discard;
  #endif
  return packDepthToRGBA(v_clip_depth.x / v_clip_depth.y * 0.5 + 0.5);
}
void main() { gl_FragColor = frag(); }
*/
/*
fact do glsl source: 
#define USE_ALPHA_TEST 0
#define USE_BASE_COLOR_MAP 1
#define USE_LIGHTMAP 0
#define USE_BATCHING 0
#define USE_INSTANCING 0
#define CC_USE_BAKED_ANIMATION 1
#define CC_USE_SKINNING 1
#define CC_MORPH_TARGET_HAS_TANGENT 0
#define CC_MORPH_TARGET_HAS_NORMAL 0
#define CC_MORPH_TARGET_HAS_POSITION 0
#define CC_MORPH_PRECOMPUTED 0
#define CC_MORPH_TARGET_COUNT 2
#define CC_USE_MORPH 0
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 9
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 182
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define ALPHA_TEST_CHANNEL a

precision highp float;
   uniform vec4 baseColor;
   uniform vec4 colorScaleAndCutoff;
vec4 packDepthToRGBA (float depth) {
  vec4 ret = vec4(1.0, 255.0, 65025.0, 160581375.0) * depth;
  ret = fract(ret);
  ret -= ret.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);
  return ret;
}
varying vec2 v_uv;
varying vec2 v_clip_depth;
  uniform sampler2D baseColorMap;
vec4 frag () {
  vec4 baseColor = baseColor;
    baseColor *= texture2D(baseColorMap, v_uv);
  return packDepthToRGBA(v_clip_depth.x / v_clip_depth.y * 0.5 + 0.5);
}
void main() { gl_FragColor = frag(); }
*/
import {
    vec4_N_N_N_N,
    fract_V4,
    texture2D_N_V2,
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
    glSet_V2_V2,
    glSet_N_N,
    glSet_V4_V4,
    glMul_V4_N,
    glDiv_N_N,
    glMul_V4_V4,
    glSubSet_V4_V4,
    glMulSet_V4_V4,
    glMul_N_N,
    glAdd_N_N,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(182)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(9)
let CC_USE_MORPH = new FloatData(0)
let CC_MORPH_TARGET_COUNT = new FloatData(2)
let CC_MORPH_PRECOMPUTED = new FloatData(0)
let CC_MORPH_TARGET_HAS_POSITION = new FloatData(0)
let CC_MORPH_TARGET_HAS_NORMAL = new FloatData(0)
let CC_MORPH_TARGET_HAS_TANGENT = new FloatData(0)
let CC_USE_SKINNING = new FloatData(1)
let CC_USE_BAKED_ANIMATION = new FloatData(1)
let USE_INSTANCING = new FloatData(0)
let USE_BATCHING = new FloatData(0)
let USE_LIGHTMAP = new FloatData(0)
let USE_BASE_COLOR_MAP = new FloatData(1)
let USE_ALPHA_TEST = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
}
class VaryingDataImpl extends VaryingData {
    v_uv: Vec2Data = new Vec2Data()
    v_clip_depth: Vec2Data = new Vec2Data()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([
        ["v_uv", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["v_clip_depth", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
    ])
    copy(varying: VaryingDataImpl) {
        glSet_V2_V2(varying.v_uv, this.v_uv)
        glSet_V2_V2(varying.v_clip_depth, this.v_clip_depth)
    }
}
class UniformDataImpl implements UniformData {
    baseColor: Vec4Data = new Vec4Data()
    colorScaleAndCutoff: Vec4Data = new Vec4Data()
    baseColorMap: Sampler2D = new Sampler2D()
    dataKeys: Map<string, any> = new Map([
        ["baseColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["colorScaleAndCutoff", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["baseColorMap", cpuRenderingContext.cachGameGl.SAMPLER_2D],
    ])
    dataSize: Map<string, number> = new Map([
        ["baseColor", 1],
        ["colorScaleAndCutoff", 1],
        ["baseColorMap", 1],
    ])
}
export class Impl_271798b7c7c7115ac9a8540ab21920fc extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    packDepthToRGBA_N(__depth__: FloatData): Vec4Data {
        let depth: FloatData = float()
        glSet_N_N(depth, __depth__)

        let ret: Vec4Data = vec4()
        glSet_V4_V4(ret, glMul_V4_N(vec4_N_N_N_N(float_N(1.0), float_N(255.0), float_N(65025.0), float_N(160581375.0)), depth))
        glSet_V4_V4(ret, fract_V4(ret))
        glSubSet_V4_V4(
            ret,
            glMul_V4_V4(
                ret.yzww,
                vec4_N_N_N_N(
                    glDiv_N_N(float_N(1.0), float_N(255.0)),
                    glDiv_N_N(float_N(1.0), float_N(255.0)),
                    glDiv_N_N(float_N(1.0), float_N(255.0)),
                    float_N(0.0)
                )
            )
        )
        return ret
    }
    frag(): Vec4Data {
        let baseColor: Vec4Data = vec4()
        glSet_V4_V4(baseColor, this.uniformData.baseColor)
        glMulSet_V4_V4(baseColor, texture2D_N_V2(this.uniformData.baseColorMap, this.varyingData.v_uv))
        return this.packDepthToRGBA_N(
            glAdd_N_N(
                glMul_N_N(glDiv_N_N(float_N(this.varyingData.v_clip_depth.x), float_N(this.varyingData.v_clip_depth.y)), float_N(0.5)),
                float_N(0.5)
            )
        )
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
