/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 179
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 22
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
#define HAS_SECOND_UV 0
#define USE_ALBEDO_MAP 1
#define ALBEDO_UV v_uv
#define USE_ALPHA_TEST 0
#define ALPHA_TEST_CHANNEL a

precision highp float;
   uniform vec4 albedo;
   uniform vec4 albedoScaleAndCutoff;
vec4 packDepthToRGBA (float depth) {
  vec4 ret = vec4(1.0, 255.0, 65025.0, 160581375.0) * depth;
  ret = fract(ret);
  ret -= ret.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);
  return ret;
}
uniform highp mat4 cc_matLightView;
  uniform lowp vec4 cc_shadowNFLSInfo;
  uniform lowp vec4 cc_shadowLPNNInfo;
varying vec2 v_uv;
varying vec2 v_uv1;
varying vec4 v_worldPos;
varying float v_clip_depth;
#if USE_ALBEDO_MAP
  uniform sampler2D albedoMap;
#endif
#if USE_ALPHA_TEST
#endif
vec4 frag () {
  vec4 baseColor = albedo;
  #if USE_ALBEDO_MAP
    baseColor *= texture2D(albedoMap, ALBEDO_UV);
  #endif
  #if USE_ALPHA_TEST
    if (baseColor.ALPHA_TEST_CHANNEL < albedoScaleAndCutoff.w) discard;
  #endif
  if(cc_shadowLPNNInfo.x > 0.000001 && cc_shadowLPNNInfo.x < 1.999999) {
    if (cc_shadowNFLSInfo.z > 0.000001) {
      vec4 viewStartPos = cc_matLightView * v_worldPos;
      float dist = length(viewStartPos.xyz);
      float linearDepth = cc_shadowNFLSInfo.x + (-dist / (cc_shadowNFLSInfo.y - cc_shadowNFLSInfo.x));
      return vec4(linearDepth, 1.0, 1.0, 1.0);
    }
  }
  if (cc_shadowLPNNInfo.y > 0.000001) {
    return packDepthToRGBA(v_clip_depth);
  }
  return vec4(v_clip_depth, 1.0, 1.0, 1.0);
}
void main() { gl_FragColor = frag(); }
*/
/*
fact do glsl source: 
#define USE_ALPHA_TEST 0
#define USE_ALBEDO_MAP 1
#define HAS_SECOND_UV 0
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
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 22
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 179
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define ALPHA_TEST_CHANNEL a
#define ALBEDO_UV v_uv

precision highp float;
   uniform vec4 albedo;
   uniform vec4 albedoScaleAndCutoff;
vec4 packDepthToRGBA (float depth) {
  vec4 ret = vec4(1.0, 255.0, 65025.0, 160581375.0) * depth;
  ret = fract(ret);
  ret -= ret.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);
  return ret;
}
uniform highp mat4 cc_matLightView;
  uniform lowp vec4 cc_shadowNFLSInfo;
  uniform lowp vec4 cc_shadowLPNNInfo;
varying vec2 v_uv;
varying vec2 v_uv1;
varying vec4 v_worldPos;
varying float v_clip_depth;
  uniform sampler2D albedoMap;
vec4 frag () {
  vec4 baseColor = albedo;
    baseColor *= texture2D(albedoMap, v_uv);
  if(cc_shadowLPNNInfo.x > 0.000001 && cc_shadowLPNNInfo.x < 1.999999) {
    if (cc_shadowNFLSInfo.z > 0.000001) {
      vec4 viewStartPos = cc_matLightView * v_worldPos;
      float dist = length(viewStartPos.xyz);
      float linearDepth = cc_shadowNFLSInfo.x + (-dist / (cc_shadowNFLSInfo.y - cc_shadowNFLSInfo.x));
      return vec4(linearDepth, 1.0, 1.0, 1.0);
    }
  }
  if (cc_shadowLPNNInfo.y > 0.000001) {
    return packDepthToRGBA(v_clip_depth);
  }
  return vec4(v_clip_depth, 1.0, 1.0, 1.0);
}
void main() { gl_FragColor = frag(); }
*/
import {
    vec4_N_N_N_N,
    fract_V4,
    texture2D_N_V2,
    length_V3,
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
    glSet_V4_V4,
    glSet_N_N,
    glMul_V4_N,
    glDiv_N_N,
    glMul_V4_V4,
    glSubSet_V4_V4,
    glMulSet_V4_V4,
    glIsMore_N_N,
    glIsLess_N_N,
    glMul_M4_V4,
    glNegative_N,
    glSub_N_N,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(179)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(22)
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
let HAS_SECOND_UV = new FloatData(0)
let USE_ALBEDO_MAP = new FloatData(1)
let USE_ALPHA_TEST = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
}
class VaryingDataImpl extends VaryingData {
    v_uv: Vec2Data = new Vec2Data()
    v_uv1: Vec2Data = new Vec2Data()
    v_worldPos: Vec4Data = new Vec4Data()
    v_clip_depth: FloatData = new FloatData()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([
        ["v_uv", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["v_uv1", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["v_worldPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["v_clip_depth", cpuRenderingContext.cachGameGl.FLOAT],
    ])
    copy(varying: VaryingDataImpl) {
        glSet_V2_V2(varying.v_uv, this.v_uv)
        glSet_V2_V2(varying.v_uv1, this.v_uv1)
        glSet_V4_V4(varying.v_worldPos, this.v_worldPos)
        glSet_N_N(varying.v_clip_depth, this.v_clip_depth)
    }
}
class UniformDataImpl implements UniformData {
    albedo: Vec4Data = new Vec4Data()
    albedoScaleAndCutoff: Vec4Data = new Vec4Data()
    cc_matLightView: Mat4Data = new Mat4Data()
    cc_shadowNFLSInfo: Vec4Data = new Vec4Data()
    cc_shadowLPNNInfo: Vec4Data = new Vec4Data()
    albedoMap: Sampler2D = new Sampler2D()
    dataKeys: Map<string, any> = new Map([
        ["albedo", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["albedoScaleAndCutoff", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_matLightView", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_shadowNFLSInfo", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_shadowLPNNInfo", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["albedoMap", cpuRenderingContext.cachGameGl.SAMPLER_2D],
    ])
    dataSize: Map<string, number> = new Map([
        ["albedo", 1],
        ["albedoScaleAndCutoff", 1],
        ["cc_matLightView", 1],
        ["cc_shadowNFLSInfo", 1],
        ["cc_shadowLPNNInfo", 1],
        ["albedoMap", 1],
    ])
}
export class Impl_8e4bd949cbd093c42caa94278723709b extends FragShaderHandle {
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
        glSet_V4_V4(baseColor, this.uniformData.albedo)
        glMulSet_V4_V4(baseColor, texture2D_N_V2(this.uniformData.albedoMap, this.varyingData.v_uv))
        if (
            glIsMore_N_N(float_N(this.uniformData.cc_shadowLPNNInfo.x), float_N(0.000001)) &&
            glIsLess_N_N(float_N(this.uniformData.cc_shadowLPNNInfo.x), float_N(1.999999))
        ) {
            if (glIsMore_N_N(float_N(this.uniformData.cc_shadowNFLSInfo.z), float_N(0.000001))) {
                let viewStartPos: Vec4Data = vec4()
                glSet_V4_V4(viewStartPos, glMul_M4_V4(this.uniformData.cc_matLightView, this.varyingData.v_worldPos))
                let dist: FloatData = float()
                glSet_N_N(dist, length_V3(viewStartPos.xyz))
                let linearDepth: FloatData = float()
                glSet_N_N(
                    linearDepth,
                    glAdd_N_N(
                        float_N(this.uniformData.cc_shadowNFLSInfo.x),
                        glDiv_N_N(
                            glNegative_N(dist),
                            glSub_N_N(float_N(this.uniformData.cc_shadowNFLSInfo.y), float_N(this.uniformData.cc_shadowNFLSInfo.x))
                        )
                    )
                )
                return vec4_N_N_N_N(linearDepth, float_N(1.0), float_N(1.0), float_N(1.0))
            }
        }
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowLPNNInfo.y), float_N(0.000001))) {
            return this.packDepthToRGBA_N(this.varyingData.v_clip_depth)
        }
        return vec4_N_N_N_N(this.varyingData.v_clip_depth, float_N(1.0), float_N(1.0), float_N(1.0))
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
