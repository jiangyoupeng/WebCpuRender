/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 49
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 38
#define CC_RENDER_MODE 0
#define CC_DRAW_WIRE_FRAME 0
#define CC_USE_WORLD_SPACE 0
#define CC_USE_HDR 0

precision mediump float;
uniform vec4 mainTiling_Offset;
uniform highp mat4 cc_matViewProj;
uniform highp vec4 cc_cameraPos;
uniform highp mat4 cc_matWorld;
varying mediump vec2 uv;
varying mediump vec4 color;
attribute vec3 a_position;
attribute vec4 a_texCoord;
attribute vec3 a_texCoord1;
attribute vec3 a_texCoord2;
attribute vec4 a_color;
#if CC_DRAW_WIRE_FRAME
varying vec3 vBarycentric;
#endif
vec4 vs_main() {
highp vec4 pos = vec4(a_position, 1);
vec4 velocity = vec4(a_texCoord1.xyz, 0);
#if !CC_USE_WORLD_SPACE
pos = cc_matWorld * pos;
velocity = cc_matWorld * velocity;
#endif
float vertOffset = (a_texCoord.x - 0.5) * a_texCoord.y;
vec3 camUp = normalize(cross(pos.xyz - cc_cameraPos.xyz, velocity.xyz));
pos.xyz += camUp * vertOffset;
pos = cc_matViewProj * pos;
uv = a_texCoord.zw * mainTiling_Offset.xy + mainTiling_Offset.zw;;
color = a_color;
#if CC_DRAW_WIRE_FRAME
vBarycentric = a_texCoord2;
#endif
return pos;
}
void main() { gl_Position = vs_main(); }
*/
import {
    vec4_V3_N,
    cross_V3_V3,
    normalize_V3,
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
    glMul_M4_V4,
    glSet_N_N,
    glSub_N_N,
    glMul_N_N,
    glSet_V3_V3,
    glSub_V3_V3,
    glMul_V3_N,
    glAddSet_V3_V3,
    glMul_V2_V2,
    glAdd_V2_V2,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(49)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(38)
let CC_RENDER_MODE = new FloatData(0)
let CC_DRAW_WIRE_FRAME = new FloatData(0)
let CC_USE_WORLD_SPACE = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    a_position: Vec3Data = null!
    a_texCoord: Vec4Data = null!
    a_texCoord1: Vec3Data = null!
    a_texCoord2: Vec3Data = null!
    a_color: Vec4Data = null!
    dataKeys: Map<string, any> = new Map([
        ["a_position", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_texCoord", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["a_texCoord1", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_texCoord2", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_color", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["a_position", 1],
        ["a_texCoord", 1],
        ["a_texCoord1", 1],
        ["a_texCoord2", 1],
        ["a_color", 1],
    ])
}
class VaryingDataImpl extends VaryingData {
    uv: Vec2Data = new Vec2Data()
    color: Vec4Data = new Vec4Data()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([
        ["uv", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["color", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    copy(varying: VaryingDataImpl) {
        glSet_V2_V2(varying.uv, this.uv)
        glSet_V4_V4(varying.color, this.color)
    }
}
class UniformDataImpl implements UniformData {
    mainTiling_Offset: Vec4Data = new Vec4Data()
    cc_matViewProj: Mat4Data = new Mat4Data()
    cc_cameraPos: Vec4Data = new Vec4Data()
    cc_matWorld: Mat4Data = new Mat4Data()
    dataKeys: Map<string, any> = new Map([
        ["mainTiling_Offset", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_matViewProj", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_cameraPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_matWorld", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
    ])
    dataSize: Map<string, number> = new Map([
        ["mainTiling_Offset", 1],
        ["cc_matViewProj", 1],
        ["cc_cameraPos", 1],
        ["cc_matWorld", 1],
    ])
}
export class Impl_b1ade01f0e1a563134bbab8d61b1c2d9 extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    vs_main(): Vec4Data {
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, vec4_V3_N(this.attributeData.a_position, int_N(1)))
        let velocity: Vec4Data = vec4()
        glSet_V4_V4(velocity, vec4_V3_N(this.attributeData.a_texCoord1.xyz, int_N(0)))
        glSet_V4_V4(pos, glMul_M4_V4(this.uniformData.cc_matWorld, pos))
        glSet_V4_V4(velocity, glMul_M4_V4(this.uniformData.cc_matWorld, velocity))
        let vertOffset: FloatData = float()
        glSet_N_N(
            vertOffset,
            glMul_N_N(glSub_N_N(float_N(this.attributeData.a_texCoord.x), float_N(0.5)), float_N(this.attributeData.a_texCoord.y))
        )
        let camUp: Vec3Data = vec3()
        glSet_V3_V3(camUp, normalize_V3(cross_V3_V3(glSub_V3_V3(pos.xyz, this.uniformData.cc_cameraPos.xyz), velocity.xyz)))
        glAddSet_V3_V3(pos.xyz, glMul_V3_N(camUp, vertOffset))
        glSet_V4_V4(pos, glMul_M4_V4(this.uniformData.cc_matViewProj, pos))
        glSet_V2_V2(
            this.varyingData.uv,
            glAdd_V2_V2(
                glMul_V2_V2(this.attributeData.a_texCoord.zw, this.uniformData.mainTiling_Offset.xy),
                this.uniformData.mainTiling_Offset.zw
            )
        )
        glSet_V4_V4(this.varyingData.color, this.attributeData.a_color)
        return pos
    }
    main(): void {
        glSet_V4_V4(gl_Position, this.vs_main())
    }
}
