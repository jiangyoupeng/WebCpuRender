/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 46
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 0

precision highp float;
uniform highp mat4 cc_matViewProj;
uniform highp mat4 cc_matWorld;
attribute vec3 a_position;
attribute vec4 a_color;
varying vec4 v_color;
attribute float a_dist;
varying float v_dist;
vec4 vert () {
vec4 pos = vec4(a_position, 1);
pos = cc_matViewProj * cc_matWorld * pos;
v_color = a_color;
v_dist = a_dist;
return pos;
}
void main() { gl_Position = vert(); }
*/
/*
fact do glsl source: 
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 0
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 46
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0

precision highp float;
uniform highp mat4 cc_matViewProj;
uniform highp mat4 cc_matWorld;
attribute vec3 a_position;
attribute vec4 a_color;
varying vec4 v_color;
attribute float a_dist;
varying float v_dist;
vec4 vert () {
vec4 pos = vec4(a_position, 1);
pos = cc_matViewProj * cc_matWorld * pos;
v_color = a_color;
v_dist = a_dist;
return pos;
}
void main() { gl_Position = vert(); }
*/
import { vec4_V3_N, float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import { glSet_V4_V4, glSet_N_N, glMul_M4_M4, glMul_M4_V4, getValueKeyByIndex } from "../builtin/BuiltinOperator"
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
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    a_position: Vec3Data = new Vec3Data()
    a_color: Vec4Data = new Vec4Data()
    a_dist: FloatData = new FloatData()
    dataKeys: Map<string, any> = new Map([
        ["a_position", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_color", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["a_dist", cpuRenderingContext.cachGameGl.FLOAT],
    ])
    dataSize: Map<string, number> = new Map([
        ["a_position", 1],
        ["a_color", 1],
        ["a_dist", 1],
    ])
}
class VaryingDataImpl extends VaryingData {
    v_color: Vec4Data = new Vec4Data()
    v_dist: FloatData = new FloatData()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([
        ["v_color", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["v_dist", cpuRenderingContext.cachGameGl.FLOAT],
    ])
    copy(varying: VaryingDataImpl) {
        glSet_V4_V4(varying.v_color, this.v_color)
        glSet_N_N(varying.v_dist, this.v_dist)
    }
}
class UniformDataImpl implements UniformData {
    cc_matViewProj: Mat4Data = new Mat4Data()
    cc_matWorld: Mat4Data = new Mat4Data()
    dataKeys: Map<string, any> = new Map([
        ["cc_matViewProj", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_matWorld", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_matViewProj", 1],
        ["cc_matWorld", 1],
    ])
}
export class Impl_c8d058261867670df2047d942fc9d759 extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    vert(): Vec4Data {
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, vec4_V3_N(this.attributeData.a_position, int_N(1)))
        glSet_V4_V4(pos, glMul_M4_V4(glMul_M4_M4(this.uniformData.cc_matViewProj, this.uniformData.cc_matWorld), pos))
        glSet_V4_V4(this.varyingData.v_color, this.attributeData.a_color)
        glSet_N_N(this.varyingData.v_dist, this.attributeData.a_dist)
        return pos
    }
    main(): void {
        glSet_V4_V4(gl_Position, this.vert())
    }
}
