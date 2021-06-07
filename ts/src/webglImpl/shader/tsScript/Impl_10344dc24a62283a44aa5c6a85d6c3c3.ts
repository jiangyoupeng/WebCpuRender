/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 37
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 53
#define CC_RECEIVE_SHADOW 1
#define CC_USE_IBL 0
#define USE_LIGHTMAP 0
#define USE_BATCHING 0
#define CC_FORWARD_ADD 0
#define CC_USE_HDR 0
#define CC_PIPELINE_TYPE 0
#define CC_USE_FOG 4

precision highp float;
struct StandardVertInput {
highp vec4 position;
vec3 normal;
vec4 tangent;
};
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;
attribute vec4 a_tangent;
uniform highp vec4 cc_cameraPos;
varying vec2 v_uv;
void main () {
vec4 position;
position = vec4(a_position, 1.0);
position.xy = cc_cameraPos.w == 0.0 ? vec2(position.xy.x, -position.xy.y) : position.xy;
gl_Position = vec4(position.x, position.y, 1.0, 1.0);
v_uv = a_texCoord;
}
*/
/*
fact do glsl source: 
#define CC_USE_FOG 4
#define CC_PIPELINE_TYPE 0
#define CC_USE_HDR 0
#define CC_FORWARD_ADD 0
#define USE_BATCHING 0
#define USE_LIGHTMAP 0
#define CC_USE_IBL 0
#define CC_RECEIVE_SHADOW 1
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 53
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 37
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0

precision highp float;
struct StandardVertInput {
highp vec4 position;
vec3 normal;
vec4 tangent;
};
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;
attribute vec4 a_tangent;
uniform highp vec4 cc_cameraPos;
varying vec2 v_uv;
void main () {
vec4 position;
position = vec4(a_position, 1.0);
position.xy = cc_cameraPos.w == 0.0 ? vec2(position.xy.x, -position.xy.y) : position.xy;
gl_Position = vec4(position.x, position.y, 1.0, 1.0);
v_uv = a_texCoord;
}
*/
import {
    vec4_V3_N,
    vec2_N_N,
    vec4_N_N_N_N,
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
    glIsEqual_N_N,
    glNegative_N,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(37)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(53)
let CC_RECEIVE_SHADOW = new FloatData(1)
let CC_USE_IBL = new FloatData(0)
let USE_LIGHTMAP = new FloatData(0)
let USE_BATCHING = new FloatData(0)
let CC_FORWARD_ADD = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
let CC_PIPELINE_TYPE = new FloatData(0)
let CC_USE_FOG = new FloatData(4)
class StandardVertInput implements StructData {
    position: Vec4Data = vec4()
    normal: Vec3Data = vec3()
    tangent: Vec4Data = vec4()
}
class AttributeDataImpl implements AttributeData {
    a_position: Vec3Data = new Vec3Data()
    a_normal: Vec3Data = new Vec3Data()
    a_texCoord: Vec2Data = new Vec2Data()
    a_tangent: Vec4Data = new Vec4Data()
    dataKeys: Map<string, any> = new Map([
        ["a_position", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_normal", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_texCoord", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["a_tangent", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["a_position", 1],
        ["a_normal", 1],
        ["a_texCoord", 1],
        ["a_tangent", 1],
    ])
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
    cc_cameraPos: Vec4Data = new Vec4Data()
    dataKeys: Map<string, any> = new Map([["cc_cameraPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4]])
    dataSize: Map<string, number> = new Map([["cc_cameraPos", 1]])
}
export class Impl_10344dc24a62283a44aa5c6a85d6c3c3 extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    main(): void {
        let position: Vec4Data = vec4()
        glSet_V4_V4(position, vec4_V3_N(this.attributeData.a_position, float_N(1.0)))
        glSet_V2_V2(
            position.out_xy,
            glIsEqual_N_N(float_N(this.uniformData.cc_cameraPos.w), float_N(0.0))
                ? vec2_N_N(float_N(position.xy.x), glNegative_N(float_N(position.xy.y)))
                : position.xy
        )
        glSet_V4_V4(gl_Position, vec4_N_N_N_N(float_N(position.x), float_N(position.y), float_N(1.0), float_N(1.0)))
        glSet_V2_V2(this.varyingData.v_uv, this.attributeData.a_texCoord)
    }
}
