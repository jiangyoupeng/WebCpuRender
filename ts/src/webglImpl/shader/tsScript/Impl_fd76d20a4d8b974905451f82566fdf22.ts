/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4096
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 46
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 0

#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives: enable
#endif
precision highp float;
varying vec4 v_color;
varying float v_dist;
vec4 frag () {
vec4 o = v_color;
#ifdef GL_OES_standard_derivatives
float aa = fwidth(v_dist);
#else
float aa = 0.05;
#endif
float alpha = 1. - smoothstep(-aa, 0., abs(v_dist) - 1.0);
o.rgb *= o.a;
o *= alpha;
return o;
}
void main() { gl_FragColor = frag(); }
*/
import { abs_N, smoothstep_N_N_N, float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import {
    glSet_V4_V4,
    glSet_N_N,
    glNegative_N,
    glSub_N_N,
    glMulSet_V3_N,
    glMulSet_V4_N,
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
let CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS = new FloatData(4096)
let CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS = new FloatData(1024)
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(46)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
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
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
}
export class Impl_fd76d20a4d8b974905451f82566fdf22 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    frag(): Vec4Data {
        let o: Vec4Data = vec4()
        glSet_V4_V4(o, this.varyingData.v_color)
        let aa: FloatData = float()
        glSet_N_N(aa, float_N(0.05))
        let alpha: FloatData = float()
        glSet_N_N(
            alpha,
            glSub_N_N(float_N(1), smoothstep_N_N_N(glNegative_N(aa), float_N(0), glSub_N_N(abs_N(this.varyingData.v_dist), float_N(1.0))))
        )
        glMulSet_V3_N(o.xyz, float_N(o.w))
        glMulSet_V4_N(o, alpha)
        return o
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
