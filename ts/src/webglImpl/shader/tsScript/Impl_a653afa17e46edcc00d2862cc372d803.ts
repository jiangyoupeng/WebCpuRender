/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 58
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 37
#define CC_USE_HDR 0

precision mediump float;
uniform highp mat4 cc_matViewProj;
attribute vec3 a_position;
attribute vec4 a_color;
varying vec2 v_uv;
uniform vec4 offset;
uniform vec4 digits[20];
float getComponent(vec4 v, float i) {
if (i < 1.0) { return v.x; }
else if (i < 2.0) { return v.y; }
else if (i < 3.0) { return v.z; }
else { return v.w; }
}
vec4 vert () {
vec4 position = cc_matViewProj * vec4(a_position, 1.0);
position.xy += offset.xy;
v_uv = a_color.xy;
if (a_color.z >= 0.0) {
float n = getComponent(digits[int(a_color.z)], a_color.w);
v_uv += vec2(offset.z * n, 0.0);
}
return position;
}
void main() { gl_Position = vert(); }
*/
import { vec4_V3_N, int_N, vec2_N_N, float, float_N, bool, bool_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import {
    glSet_V2_V2,
    glSet_V4_V4,
    glSet_N_N,
    glIsLess_N_N,
    glMul_M4_V4,
    glAddSet_V2_V2,
    glIsMoreEqual_N_N,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(58)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(37)
let CC_USE_HDR = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    a_position: Vec3Data = null!
    a_color: Vec4Data = null!
    dataKeys: Map<string, any> = new Map([
        ["a_position", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_color", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["a_position", 1],
        ["a_color", 1],
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
    cc_matViewProj: Mat4Data = null!
    offset: Vec4Data = null!
    digits: Vec4Data[] = null!
    dataKeys: Map<string, any> = new Map([
        ["cc_matViewProj", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["offset", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["digits", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_matViewProj", 1],
        ["offset", 1],
        ["digits", 20],
    ])
}
export class Impl_a653afa17e46edcc00d2862cc372d803 extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    getComponent_V4_N(__v__: Vec4Data, __i__: FloatData): FloatData {
        let v: Vec4Data = new Vec4Data()
        glSet_V4_V4(v, __v__)
        let i: FloatData = new FloatData()
        glSet_N_N(i, __i__)

        if (glIsLess_N_N(i, float_N(1.0))) {
            let v: Vec4Data = new Vec4Data()
            glSet_V4_V4(v, __v__)
            let i: FloatData = new FloatData()
            glSet_N_N(i, __i__)

            return float_N(v.x)
        } else if (glIsLess_N_N(i, float_N(2.0))) {
            let v: Vec4Data = new Vec4Data()
            glSet_V4_V4(v, __v__)
            let i: FloatData = new FloatData()
            glSet_N_N(i, __i__)

            return float_N(v.y)
        } else if (glIsLess_N_N(i, float_N(3.0))) {
            let v: Vec4Data = new Vec4Data()
            glSet_V4_V4(v, __v__)
            let i: FloatData = new FloatData()
            glSet_N_N(i, __i__)

            return float_N(v.z)
        } else {
            let v: Vec4Data = new Vec4Data()
            glSet_V4_V4(v, __v__)
            let i: FloatData = new FloatData()
            glSet_N_N(i, __i__)

            return float_N(v.w)
        }
    }
    vert(): Vec4Data {
        let position: Vec4Data = vec4()
        glSet_V4_V4(position, glMul_M4_V4(this.uniformData.cc_matViewProj, vec4_V3_N(this.attributeData.a_position, float_N(1.0))))
        glAddSet_V2_V2(position.xy, this.uniformData.offset.xy)
        glSet_V2_V2(this.varyingData.v_uv, this.attributeData.a_color.xy)
        if (glIsMoreEqual_N_N(float_N(this.attributeData.a_color.z), float_N(0.0))) {
            let n: FloatData = float()
            glSet_N_N(
                n,
                this.getComponent_V4_N(
                    this.uniformData.digits[int_N(float_N(this.attributeData.a_color.z)).v],
                    this.attributeData.a_color.out_w
                )
            )
            glAddSet_V2_V2(this.varyingData.v_uv, vec2_N_N(glMul_N_N(float_N(this.uniformData.offset.z), n), float_N(0.0)))
        }
        return position
    }
    main(): void {
        glSet_V4_V4(gl_Position, this.vert())
    }
}
