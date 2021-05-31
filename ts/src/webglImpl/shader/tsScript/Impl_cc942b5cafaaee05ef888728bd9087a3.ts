/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 37
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 37
#define CC_USE_IBL 0
#define CC_USE_HDR 0
#define USE_RGBE_CUBEMAP 0

precision highp float;
uniform highp mat4 cc_matView;
uniform highp mat4 cc_matProj;
struct StandardVertInput {
highp vec4 position;
vec3 normal;
vec4 tangent;
};
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;
attribute vec4 a_tangent;
varying mediump vec4 viewDir;
vec4 vert () {
viewDir = vec4(a_position, 1.0);
mat4 matViewRotOnly = mat4(mat3(cc_matView));
mat4 matProj = cc_matProj;
if (matProj[3].w > 0.0) {
vec2 scale = vec2(48.0, 24.0);
matProj[0].xy *= scale;
matProj[1].xy *= scale;
matProj[2].zw = vec2(-1.0);
matProj[3].zw = vec2(0.0);
}
vec4 pos = matProj * matViewRotOnly * viewDir;
pos.z = 0.99999 * pos.w;
return pos;
}
void main() { gl_Position = vert(); }
*/
import {
    vec4_V3_N,
    mat3_M4,
    mat4_M3,
    vec2_N_N,
    vec2_N,
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
    glSet_V4_V4,
    glSet_M4_M4,
    glIsMore_N_N,
    glSet_V2_V2,
    glMulSet_V2_V2,
    glNegative_N,
    glMul_M4_M4,
    glMul_M4_V4,
    glMul_N_N,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(37)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(37)
let CC_USE_IBL = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
let USE_RGBE_CUBEMAP = new FloatData(0)
class StandardVertInput implements StructData {
    position: Vec4Data = new Vec4Data()
    normal: Vec3Data = new Vec3Data()
    tangent: Vec4Data = new Vec4Data()
}
class AttributeDataImpl implements AttributeData {
    a_position: Vec3Data = null!
    a_normal: Vec3Data = null!
    a_texCoord: Vec2Data = null!
    a_tangent: Vec4Data = null!
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
    viewDir: Vec4Data = new Vec4Data()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([["viewDir", cpuRenderingContext.cachGameGl.FLOAT_VEC4]])
    copy(varying: VaryingDataImpl) {
        glSet_V4_V4(varying.viewDir, this.viewDir)
    }
}
class UniformDataImpl implements UniformData {
    cc_matView: Mat4Data = new Mat4Data()
    cc_matProj: Mat4Data = new Mat4Data()
    dataKeys: Map<string, any> = new Map([
        ["cc_matView", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_matProj", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_matView", 1],
        ["cc_matProj", 1],
    ])
}
export class Impl_cc942b5cafaaee05ef888728bd9087a3 extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    vert(): Vec4Data {
        glSet_V4_V4(this.varyingData.viewDir, vec4_V3_N(this.attributeData.a_position, float_N(1.0)))
        let matViewRotOnly: Mat4Data = mat4()
        glSet_M4_M4(matViewRotOnly, mat4_M3(mat3_M4(this.uniformData.cc_matView)))
        let matProj: Mat4Data = mat4()
        glSet_M4_M4(matProj, this.uniformData.cc_matProj)
        if (glIsMore_N_N(float_N((<any>matProj)[getValueKeyByIndex(int_N(3))].w), float_N(0.0))) {
            let scale: Vec2Data = vec2()
            glSet_V2_V2(scale, vec2_N_N(float_N(48.0), float_N(24.0)))
            glMulSet_V2_V2((<any>matProj)[getValueKeyByIndex(int_N(0))].xy, scale)
            glMulSet_V2_V2((<any>matProj)[getValueKeyByIndex(int_N(1))].xy, scale)
            glSet_V2_V2((<any>matProj)[getValueKeyByIndex(int_N(2))].zw, vec2_N(glNegative_N(float_N(1.0))))
            glSet_V2_V2((<any>matProj)[getValueKeyByIndex(int_N(3))].zw, vec2_N(float_N(0.0)))
        }
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, glMul_M4_V4(glMul_M4_M4(matProj, matViewRotOnly), this.varyingData.viewDir))
        pos.z = glMul_N_N(float_N(0.99999), float_N(pos.w)).v
        return pos
    }
    main(): void {
        glSet_V4_V4(gl_Position, this.vert())
    }
}
