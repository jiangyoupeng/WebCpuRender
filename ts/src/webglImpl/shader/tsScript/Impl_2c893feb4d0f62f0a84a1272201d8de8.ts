/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 46
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 1
#define USE_LOCAL 0
#define SAMPLE_FROM_RT 0
#define USE_PIXEL_ALIGNMENT 0
#define CC_USE_EMBEDDED_ALPHA 1
#define USE_ALPHA_TEST 0
#define USE_TEXTURE 1
#define IS_GRAY 1

precision highp float;
uniform highp mat4 cc_matView;
uniform highp mat4 cc_matProj;
uniform highp mat4 cc_matViewProj;
uniform highp vec4 cc_cameraPos;
#if USE_LOCAL
uniform highp mat4 cc_matWorld;
#endif
#if SAMPLE_FROM_RT
#endif
attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;
varying vec4 color;
varying vec2 uv0;
vec4 vert () {
vec4 pos = vec4(a_position, 1);
#if USE_LOCAL
pos = cc_matWorld * pos;
#endif
#if USE_PIXEL_ALIGNMENT
pos = cc_matView * pos;
pos.xyz = floor(pos.xyz);
pos = cc_matProj * pos;
#else
pos = cc_matViewProj * pos;
#endif
uv0 = a_texCoord;
#if SAMPLE_FROM_RT
uv0 = cc_cameraPos.w > 1.0 ? vec2(uv0.x, 1.0 - uv0.y) : uv0;
#endif
color = a_color;
return pos;
}
void main() { gl_Position = vert(); }
*/
/*
fact do glsl source: 
#define IS_GRAY 1
#define USE_TEXTURE 1
#define USE_ALPHA_TEST 0
#define CC_USE_EMBEDDED_ALPHA 1
#define USE_PIXEL_ALIGNMENT 0
#define SAMPLE_FROM_RT 0
#define USE_LOCAL 0
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 1
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 46
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0

precision highp float;
uniform highp mat4 cc_matView;
uniform highp mat4 cc_matProj;
uniform highp mat4 cc_matViewProj;
uniform highp vec4 cc_cameraPos;
attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;
varying vec4 color;
varying vec2 uv0;
vec4 vert () {
vec4 pos = vec4(a_position, 1);
pos = cc_matViewProj * pos;
uv0 = a_texCoord;
color = a_color;
return pos;
}
void main() { gl_Position = vert(); }
*/
import { vec4_V3_N, float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import { glSet_V4_V4, glSet_V2_V2, glMul_M4_V4, getValueKeyByIndex, getOutValueKeyByIndex } from "../builtin/BuiltinOperator"
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(46)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(1)
let USE_LOCAL = new FloatData(0)
let SAMPLE_FROM_RT = new FloatData(0)
let USE_PIXEL_ALIGNMENT = new FloatData(0)
let CC_USE_EMBEDDED_ALPHA = new FloatData(1)
let USE_ALPHA_TEST = new FloatData(0)
let USE_TEXTURE = new FloatData(1)
let IS_GRAY = new FloatData(1)
class AttributeDataImpl implements AttributeData {
    a_position: Vec3Data = new Vec3Data()
    a_texCoord: Vec2Data = new Vec2Data()
    a_color: Vec4Data = new Vec4Data()
    dataKeys: Map<string, any> = new Map([
        ["a_position", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_texCoord", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["a_color", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["a_position", 1],
        ["a_texCoord", 1],
        ["a_color", 1],
    ])
}
class VaryingDataImpl extends VaryingData {
    color: Vec4Data = new Vec4Data()
    uv0: Vec2Data = new Vec2Data()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([
        ["color", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["uv0", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
    ])
    copy(varying: VaryingDataImpl) {
        glSet_V4_V4(varying.color, this.color)
        glSet_V2_V2(varying.uv0, this.uv0)
    }
}
class UniformDataImpl implements UniformData {
    cc_matView: Mat4Data = new Mat4Data()
    cc_matProj: Mat4Data = new Mat4Data()
    cc_matViewProj: Mat4Data = new Mat4Data()
    cc_cameraPos: Vec4Data = new Vec4Data()
    dataKeys: Map<string, any> = new Map([
        ["cc_matView", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_matProj", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_matViewProj", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_cameraPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_matView", 1],
        ["cc_matProj", 1],
        ["cc_matViewProj", 1],
        ["cc_cameraPos", 1],
    ])
}
export class Impl_2c893feb4d0f62f0a84a1272201d8de8 extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    vert(): Vec4Data {
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, vec4_V3_N(this.attributeData.a_position, int_N(1)))
        glSet_V4_V4(pos, glMul_M4_V4(this.uniformData.cc_matViewProj, pos))
        glSet_V2_V2(this.varyingData.uv0, this.attributeData.a_texCoord)
        glSet_V4_V4(this.varyingData.color, this.attributeData.a_color)
        return pos
    }
    main(): void {
        glSet_V4_V4(gl_Position, this.vert())
    }
}
