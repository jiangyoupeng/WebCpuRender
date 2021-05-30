/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4096
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 46
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 1
#define USE_LOCAL 0
#define SAMPLE_FROM_RT 0
#define USE_PIXEL_ALIGNMENT 0
#define CC_USE_EMBEDDED_ALPHA 0
#define USE_ALPHA_TEST 0
#define USE_TEXTURE 1
#define IS_GRAY 1

precision highp float;
vec4 CCSampleWithAlphaSeparated(sampler2D tex, vec2 uv) {
#if CC_USE_EMBEDDED_ALPHA
return vec4(texture2D(tex, uv).rgb, texture2D(tex, uv + vec2(0.0, 0.5)).r);
#else
return texture2D(tex, uv);
#endif
}
#if USE_ALPHA_TEST
uniform float alphaThreshold;
#endif
void ALPHA_TEST (in vec4 color) {
#if USE_ALPHA_TEST
if (color.a < alphaThreshold) discard;
#endif
}
void ALPHA_TEST (in float alpha) {
#if USE_ALPHA_TEST
if (alpha < alphaThreshold) discard;
#endif
}
varying vec4 color;
#if USE_TEXTURE
varying vec2 uv0;
uniform sampler2D cc_spriteTexture;
#endif
vec4 frag () {
vec4 o = vec4(1, 1, 1, 1);
#if USE_TEXTURE
o *= CCSampleWithAlphaSeparated(cc_spriteTexture, uv0);
#if IS_GRAY
float gray  = 0.2126 * o.r + 0.7152 * o.g + 0.0722 * o.b;
o.r = o.g = o.b = gray;
#endif
#endif
o *= color;
ALPHA_TEST(o);
return o;
}
void main() { gl_FragColor = frag(); }
*/
import {
    texture2D_N_V2,
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
import { glSet_V4_V4, glSet_V2_V2, glSet_N_N, glMulSet_V4_V4, glMul_N_N, glAdd_N_N, getValueKeyByIndex } from "../builtin/BuiltinOperator"
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
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(1)
let USE_LOCAL = new FloatData(0)
let SAMPLE_FROM_RT = new FloatData(0)
let USE_PIXEL_ALIGNMENT = new FloatData(0)
let CC_USE_EMBEDDED_ALPHA = new FloatData(0)
let USE_ALPHA_TEST = new FloatData(0)
let USE_TEXTURE = new FloatData(1)
let IS_GRAY = new FloatData(1)
class AttributeDataImpl implements AttributeData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
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
    cc_spriteTexture: Sampler2D = new Sampler2D()
    dataKeys: Map<string, any> = new Map([["cc_spriteTexture", cpuRenderingContext.cachGameGl.SAMPLER_2D]])
    dataSize: Map<string, number> = new Map([["cc_spriteTexture", 1]])
}
export class Impl_2dd73f9e0389d32dd9ba9c462b85f6f0 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    CCSampleWithAlphaSeparated_N_V2(__tex__: Sampler2D, __uv__: Vec2Data): Vec4Data {
        let tex: Sampler2D = new Sampler2D()
        glSet_N_N(tex, __tex__)
        let uv: Vec2Data = new Vec2Data()
        glSet_V2_V2(uv, __uv__)

        return texture2D_N_V2(tex, uv)
    }
    ALPHA_TEST_V4(__color__: Vec4Data): void {
        let color: Vec4Data = new Vec4Data()
        glSet_V4_V4(color, __color__)
    }
    ALPHA_TEST_N(__alpha__: FloatData): void {
        let alpha: FloatData = new FloatData()
        glSet_N_N(alpha, __alpha__)
    }
    frag(): Vec4Data {
        let o: Vec4Data = vec4()
        glSet_V4_V4(o, vec4_N_N_N_N(int_N(1), int_N(1), int_N(1), int_N(1)))
        glMulSet_V4_V4(o, this.CCSampleWithAlphaSeparated_N_V2(this.uniformData.cc_spriteTexture, this.varyingData.uv0))
        let gray: FloatData = float()
        glSet_N_N(
            gray,
            glAdd_N_N(
                glAdd_N_N(glMul_N_N(float_N(0.2126), float_N(o.x)), glMul_N_N(float_N(0.7152), float_N(o.y))),
                glMul_N_N(float_N(0.0722), float_N(o.z))
            )
        )
        o.x = o.y = o.z = gray.v
        glMulSet_V4_V4(o, this.varyingData.color)
        this.ALPHA_TEST_V4(o)
        return o
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
