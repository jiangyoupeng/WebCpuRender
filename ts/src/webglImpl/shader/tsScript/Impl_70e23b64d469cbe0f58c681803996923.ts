/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 60
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 38
#define CC_RENDER_MODE 0
#define COLOR_OVER_TIME_MODULE_ENABLE 0
#define ROTATION_OVER_TIME_MODULE_ENABLE 0
#define SIZE_OVER_TIME_MODULE_ENABLE 0
#define FORCE_OVER_TIME_MODULE_ENABLE 0
#define VELOCITY_OVER_TIME_MODULE_ENABLE 0
#define TEXTURE_ANIMATION_MODULE_ENABLE 0
#define CC_USE_WORLD_SPACE 0
#define CC_USE_HDR 0

precision mediump float;
uniform mediump vec4 cc_exposure;
vec3 SRGBToLinear (vec3 gamma) {
return gamma * gamma;
}
vec4 CCFragOutput (vec4 color) {
#if CC_USE_HDR
color.rgb = mix(color.rgb, SRGBToLinear(color.rgb) * cc_exposure.w, vec3(cc_exposure.z));
#endif
return color;
}
varying vec2 uv;
varying vec4 color;
uniform sampler2D mainTexture;
uniform vec4 tintColor;
vec4 add () {
vec4 col = 2.0 * color * tintColor * texture2D(mainTexture, uv);
return CCFragOutput(col);
}
void main() { gl_FragColor = add(); }
*/
/*
fact do glsl source: 
#define CC_USE_HDR 0
#define CC_USE_WORLD_SPACE 0
#define TEXTURE_ANIMATION_MODULE_ENABLE 0
#define VELOCITY_OVER_TIME_MODULE_ENABLE 0
#define FORCE_OVER_TIME_MODULE_ENABLE 0
#define SIZE_OVER_TIME_MODULE_ENABLE 0
#define ROTATION_OVER_TIME_MODULE_ENABLE 0
#define COLOR_OVER_TIME_MODULE_ENABLE 0
#define CC_RENDER_MODE 0
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 38
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 60
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0

precision mediump float;
uniform mediump vec4 cc_exposure;
vec3 SRGBToLinear (vec3 gamma) {
return gamma * gamma;
}
vec4 CCFragOutput (vec4 color) {
return color;
}
varying vec2 uv;
varying vec4 color;
uniform sampler2D mainTexture;
uniform vec4 tintColor;
vec4 add () {
vec4 col = 2.0 * color * tintColor * texture2D(mainTexture, uv);
return CCFragOutput(col);
}
void main() { gl_FragColor = add(); }
*/
import { texture2D_N_V2, float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import {
    glSet_V2_V2,
    glSet_V4_V4,
    glSet_V3_V3,
    glMul_V3_V3,
    glMul_N_V4,
    glMul_V4_V4,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(60)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(38)
let CC_RENDER_MODE = new FloatData(0)
let COLOR_OVER_TIME_MODULE_ENABLE = new FloatData(0)
let ROTATION_OVER_TIME_MODULE_ENABLE = new FloatData(0)
let SIZE_OVER_TIME_MODULE_ENABLE = new FloatData(0)
let FORCE_OVER_TIME_MODULE_ENABLE = new FloatData(0)
let VELOCITY_OVER_TIME_MODULE_ENABLE = new FloatData(0)
let TEXTURE_ANIMATION_MODULE_ENABLE = new FloatData(0)
let CC_USE_WORLD_SPACE = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
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
    cc_exposure: Vec4Data = new Vec4Data()
    mainTexture: Sampler2D = new Sampler2D()
    tintColor: Vec4Data = new Vec4Data()
    dataKeys: Map<string, any> = new Map([
        ["cc_exposure", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["mainTexture", cpuRenderingContext.cachGameGl.SAMPLER_2D],
        ["tintColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_exposure", 1],
        ["mainTexture", 1],
        ["tintColor", 1],
    ])
}
export class Impl_70e23b64d469cbe0f58c681803996923 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    SRGBToLinear_V3(__gamma__: Vec3Data): Vec3Data {
        let gamma: Vec3Data = vec3()
        glSet_V3_V3(gamma, __gamma__)

        return glMul_V3_V3(gamma, gamma)
    }
    CCFragOutput_V4(__color__: Vec4Data): Vec4Data {
        let color: Vec4Data = vec4()
        glSet_V4_V4(color, __color__)

        return color
    }
    add(): Vec4Data {
        let col: Vec4Data = vec4()
        glSet_V4_V4(
            col,
            glMul_V4_V4(
                glMul_V4_V4(glMul_N_V4(float_N(2.0), this.varyingData.color), this.uniformData.tintColor),
                texture2D_N_V2(this.uniformData.mainTexture, this.varyingData.uv)
            )
        )
        return this.CCFragOutput_V4(col)
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.add())
    }
}
