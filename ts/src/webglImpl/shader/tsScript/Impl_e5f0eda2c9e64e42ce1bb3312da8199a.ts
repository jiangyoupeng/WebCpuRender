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
varying vec4 v_light;
#if TWO_COLORED
varying vec4 v_dark;
#endif
varying vec2 uv0;
uniform sampler2D cc_spriteTexture;
vec4 frag () {
vec4 o = vec4(1, 1, 1, 1);
#if TWO_COLORED
vec4 texColor = vec4(1, 1, 1, 1);
texColor *= texture2D(cc_spriteTexture, uv0);
o.a = texColor.a * v_light.a;
o.rgb = ((texColor.a - 1.0) * v_dark.a + 1.0 - texColor.rgb) * v_dark.rgb + texColor.rgb * v_light.rgb;
#else
o *= texture2D(cc_spriteTexture, uv0);
o *= v_light;
#endif
ALPHA_TEST(o);
return o;
}
void main() { gl_FragColor = frag(); }
*/
import {
    vec4_N_N_N_N,
    texture2D_N_V2,
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
import { glSet_V4_V4, glSet_V2_V2, glSet_N_N, glMulSet_V4_V4, getValueKeyByIndex } from "../builtin/BuiltinOperator"
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
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
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
    cc_spriteTexture: Sampler2D = null!
    dataKeys: Map<string, any> = new Map([["cc_spriteTexture", cpuRenderingContext.cachGameGl.SAMPLER_2D]])
    dataSize: Map<string, number> = new Map([["cc_spriteTexture", 1]])
}
export class Impl_e5f0eda2c9e64e42ce1bb3312da8199a extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

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
        glMulSet_V4_V4(o, texture2D_N_V2(this.uniformData.cc_spriteTexture, this.varyingData.uv0))
        glMulSet_V4_V4(o, this.varyingData.v_light)
        this.ALPHA_TEST_V4(o)
        return o
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
