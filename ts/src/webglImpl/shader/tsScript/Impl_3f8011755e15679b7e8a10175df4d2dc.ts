/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 46
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 1
#define USE_LOCAL 0
#define TWO_COLORED 0
#define USE_ALPHA_TEST 0

precision highp float;
uniform highp mat4 cc_matViewProj;
#if USE_LOCAL
uniform highp mat4 cc_matWorld;
#endif
attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;
varying vec4 v_light;
varying vec2 uv0;
#if TWO_COLORED
attribute vec4 a_color2;
varying vec4 v_dark;
#endif
vec4 vert () {
vec4 pos = vec4(a_position, 1);
#if USE_LOCAL
pos = cc_matWorld * pos;
#endif
pos = cc_matViewProj * pos;
uv0 = a_texCoord;
v_light = a_color;
#if TWO_COLORED
v_dark = a_color2;
#endif
return pos;
}
void main() { gl_Position = vert(); }
*/
import { vec4_V3_N, float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import { glSet_V4_V4, glSet_V2_V2, glMul_M4_V4, getValueKeyByIndex } from "../builtin/BuiltinOperator"
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
let TWO_COLORED = new FloatData(0)
let USE_ALPHA_TEST = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    a_position: Vec3Data = null!
    a_texCoord: Vec2Data = null!
    a_color: Vec4Data = null!
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
    v_light: Vec4Data = new Vec4Data()
    uv0: Vec2Data = new Vec2Data()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([
        ["v_light", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["uv0", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
    ])
    copy(varying: VaryingDataImpl) {
        glSet_V4_V4(varying.v_light, this.v_light)
        glSet_V2_V2(varying.uv0, this.uv0)
    }
}
class UniformDataImpl implements UniformData {
    cc_matViewProj: Mat4Data = null!
    dataKeys: Map<string, any> = new Map([["cc_matViewProj", cpuRenderingContext.cachGameGl.FLOAT_MAT4]])
    dataSize: Map<string, number> = new Map([["cc_matViewProj", 1]])
}
export class Impl_3f8011755e15679b7e8a10175df4d2dc extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    vert(): Vec4Data {
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, vec4_V3_N(this.attributeData.a_position, int_N(1)))
        glSet_V4_V4(pos, glMul_M4_V4(this.uniformData.cc_matViewProj, pos))
        glSet_V2_V2(this.varyingData.uv0, this.attributeData.a_texCoord)
        glSet_V4_V4(this.varyingData.v_light, this.attributeData.a_color)
        return pos
    }
    main(): void {
        glSet_V4_V4(gl_Position, this.vert())
    }
}
