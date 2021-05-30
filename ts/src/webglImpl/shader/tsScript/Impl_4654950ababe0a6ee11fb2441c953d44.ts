/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4096
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 37
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 37
#define CC_USE_IBL 0
#define CC_USE_HDR 0
#define USE_RGBE_CUBEMAP 0

precision mediump float;
uniform mediump vec4 cc_ambientSky;
uniform samplerCube cc_environment;
vec3 unpackRGBE (vec4 rgbe) {
return rgbe.rgb * pow(2.0, rgbe.a * 255.0 - 128.0);
}
vec3 SRGBToLinear (vec3 gamma) {
return gamma * gamma;
}
vec3 ACESToneMap (vec3 color) {
color = min(color, vec3(8.0));
const float A = 2.51;
const float B = 0.03;
const float C = 2.43;
const float D = 0.59;
const float E = 0.14;
return (color * (A * color + B)) / (color * (C * color + D) + E);
}
vec4 CCFragOutput (vec4 color) {
#if !CC_USE_HDR
color.rgb = sqrt(ACESToneMap(color.rgb));
#endif
return color;
}
varying mediump vec4 viewDir;
vec4 frag () {
#if USE_RGBE_CUBEMAP
vec3 c = unpackRGBE(textureCube(cc_environment, viewDir.xyz));
#else
vec3 c = SRGBToLinear(textureCube(cc_environment, viewDir.xyz).rgb);
#endif
return CCFragOutput(vec4(c * cc_ambientSky.w, 1.0));
}
void main() { gl_FragColor = frag(); }
*/
import {
    pow_N_N,
    vec3_N,
    min_V3_V3,
    sqrt_V3,
    textureCube_NA_V3,
    vec4_V3_N,
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
    glMul_N_N,
    glSub_N_N,
    glMul_V3_N,
    glSet_V3_V3,
    glMul_V3_V3,
    glSet_N_N,
    glMul_N_V3,
    glAdd_V3_N,
    glDiv_V3_V3,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(37)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(37)
let CC_USE_IBL = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
let USE_RGBE_CUBEMAP = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
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
    cc_ambientSky: Vec4Data = new Vec4Data()
    cc_environment: SamplerCube = new SamplerCube()
    dataKeys: Map<string, any> = new Map([
        ["cc_ambientSky", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_environment", cpuRenderingContext.cachGameGl.SAMPLER_CUBE],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_ambientSky", 1],
        ["cc_environment", 1],
    ])
}
export class Impl_4654950ababe0a6ee11fb2441c953d44 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    unpackRGBE_V4(__rgbe__: Vec4Data): Vec3Data {
        let rgbe: Vec4Data = new Vec4Data()
        glSet_V4_V4(rgbe, __rgbe__)

        return glMul_V3_N(rgbe.xyz, pow_N_N(float_N(2.0), glSub_N_N(glMul_N_N(float_N(rgbe.w), float_N(255.0)), float_N(128.0))))
    }
    SRGBToLinear_V3(__gamma__: Vec3Data): Vec3Data {
        let gamma: Vec3Data = new Vec3Data()
        glSet_V3_V3(gamma, __gamma__)

        return glMul_V3_V3(gamma, gamma)
    }
    ACESToneMap_V3(__color__: Vec3Data): Vec3Data {
        let color: Vec3Data = new Vec3Data()
        glSet_V3_V3(color, __color__)

        glSet_V3_V3(color, min_V3_V3(color, vec3_N(float_N(8.0))))
        let A: FloatData = float()
        glSet_N_N(A, float_N(2.51))
        let B: FloatData = float()
        glSet_N_N(B, float_N(0.03))
        let C: FloatData = float()
        glSet_N_N(C, float_N(2.43))
        let D: FloatData = float()
        glSet_N_N(D, float_N(0.59))
        let E: FloatData = float()
        glSet_N_N(E, float_N(0.14))
        return glDiv_V3_V3(
            glMul_V3_V3(color, glAdd_V3_N(glMul_N_V3(A, color), B)),
            glAdd_V3_N(glMul_V3_V3(color, glAdd_V3_N(glMul_N_V3(C, color), D)), E)
        )
    }
    CCFragOutput_V4(__color__: Vec4Data): Vec4Data {
        let color: Vec4Data = new Vec4Data()
        glSet_V4_V4(color, __color__)

        glSet_V3_V3(color.xyz, sqrt_V3(this.ACESToneMap_V3(color.out_xyz)))
        return color
    }
    frag(): Vec4Data {
        let c: Vec3Data = vec3()
        glSet_V3_V3(c, this.SRGBToLinear_V3(textureCube_NA_V3(this.uniformData.cc_environment, this.varyingData.viewDir.xyz).out_xyz))
        return this.CCFragOutput_V4(vec4_V3_N(glMul_V3_N(c, float_N(this.uniformData.cc_ambientSky.w)), float_N(1.0)))
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
