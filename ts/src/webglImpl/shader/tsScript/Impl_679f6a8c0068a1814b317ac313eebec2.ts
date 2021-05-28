/*
origin glsl source: 
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 145
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 37
#define CC_USE_MORPH 0
#define CC_MORPH_TARGET_COUNT 2
#define CC_MORPH_PRECOMPUTED 0
#define CC_MORPH_TARGET_HAS_POSITION 0
#define CC_MORPH_TARGET_HAS_NORMAL 0
#define CC_MORPH_TARGET_HAS_TANGENT 0
#define CC_USE_SKINNING 0
#define CC_USE_BAKED_ANIMATION 0
#define USE_INSTANCING 0

precision highp float;
uniform mediump vec4 cc_screenSize;
varying vec2 v_uv;
uniform sampler2D cc_lighting_resultMap;
void texcoords(vec2 fragCoord, vec2 resolution,
out vec2 v_rgbNW, out vec2 v_rgbNE,
out vec2 v_rgbSW, out vec2 v_rgbSE,
out vec2 v_rgbM) {
vec2 inverseVP = 1.0 / resolution.xy;
v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
v_rgbM = vec2(fragCoord * inverseVP);
}
vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,
vec2 v_rgbNW, vec2 v_rgbNE,
vec2 v_rgbSW, vec2 v_rgbSE,
vec2 v_rgbM) {
vec4 color;
mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
vec4 texColor = texture2D(tex, v_rgbM);
vec3 rgbM  = texColor.xyz;
vec3 luma = vec3(0.299, 0.587, 0.114);
float lumaNW = dot(rgbNW, luma);
float lumaNE = dot(rgbNE, luma);
float lumaSW = dot(rgbSW, luma);
float lumaSE = dot(rgbSE, luma);
float lumaM  = dot(rgbM,  luma);
float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
mediump vec2 dir;
dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
(0.25 * (1.0 / 8.0)), (1.0/ 128.0));
float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
dir = min(vec2(8.0, 8.0),
max(vec2(-8.0, -8.0),
dir * rcpDirMin)) * inverseVP;
vec3 rgbA = 0.5 * (
texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
vec3 rgbB = rgbA * 0.5 + 0.25 * (
texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +
texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);
float lumaB = dot(rgbB, luma);
if ((lumaB < lumaMin) || (lumaB > lumaMax))
color = vec4(rgbA, texColor.a);
else
color = vec4(rgbB, texColor.a);
return color;
}
void main () {
mediump vec2 v_rgbNW;
mediump vec2 v_rgbNE;
mediump vec2 v_rgbSW;
mediump vec2 v_rgbSE;
mediump vec2 v_rgbM;
vec2 resolution = cc_screenSize.xy;
vec2 fragCoord = v_uv * resolution;
texcoords(fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
gl_FragColor = fxaa(cc_lighting_resultMap, fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
}
*/
import {
    vec2_N_N,
    vec2_V2,
    texture2D_N_V2,
    vec3_N_N_N,
    dot_V3_V3,
    min_N_N,
    max_N_N,
    abs_N,
    max_V2_V2,
    min_V2_V2,
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
    glSet_V2_V2,
    glDiv_N_V2,
    glNegative_N,
    glAdd_V2_V2,
    glMul_V2_V2,
    glSet_N_N,
    glDiv_N_N,
    glSet_V3_V3,
    glSet_V4_V4,
    glAdd_N_N,
    glSub_N_N,
    glMul_N_N,
    glMul_V2_N,
    glAdd_V3_V3,
    glMul_N_V3,
    glMul_V3_N,
    glIsLess_N_N,
    glIsMore_N_N,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(145)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(37)
let CC_USE_MORPH = new FloatData(0)
let CC_MORPH_TARGET_COUNT = new FloatData(2)
let CC_MORPH_PRECOMPUTED = new FloatData(0)
let CC_MORPH_TARGET_HAS_POSITION = new FloatData(0)
let CC_MORPH_TARGET_HAS_NORMAL = new FloatData(0)
let CC_MORPH_TARGET_HAS_TANGENT = new FloatData(0)
let CC_USE_SKINNING = new FloatData(0)
let CC_USE_BAKED_ANIMATION = new FloatData(0)
let USE_INSTANCING = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
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
    cc_screenSize: Vec4Data = null!
    cc_lighting_resultMap: Sampler2D = null!
    dataKeys: Map<string, any> = new Map([
        ["cc_screenSize", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_lighting_resultMap", cpuRenderingContext.cachGameGl.SAMPLER_2D],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_screenSize", 1],
        ["cc_lighting_resultMap", 1],
    ])
}
export class Impl_679f6a8c0068a1814b317ac313eebec2 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    texcoords_V2_V2_V2_V2_V2_V2_V2(
        __fragCoord__: Vec2Data,
        __resolution__: Vec2Data,
        v_rgbNW: Vec2Data,
        v_rgbNE: Vec2Data,
        v_rgbSW: Vec2Data,
        v_rgbSE: Vec2Data,
        v_rgbM: Vec2Data
    ): void {
        let fragCoord: Vec2Data = new Vec2Data()
        glSet_V2_V2(fragCoord, __fragCoord__)
        let resolution: Vec2Data = new Vec2Data()
        glSet_V2_V2(resolution, __resolution__)

        let inverseVP: Vec2Data = vec2()
        glSet_V2_V2(inverseVP, glDiv_N_V2(float_N(1.0), resolution.xy))
        glSet_V2_V2(
            v_rgbNW,
            glMul_V2_V2(glAdd_V2_V2(fragCoord, vec2_N_N(glNegative_N(float_N(1.0)), glNegative_N(float_N(1.0)))), inverseVP)
        )
        glSet_V2_V2(v_rgbNE, glMul_V2_V2(glAdd_V2_V2(fragCoord, vec2_N_N(float_N(1.0), glNegative_N(float_N(1.0)))), inverseVP))
        glSet_V2_V2(v_rgbSW, glMul_V2_V2(glAdd_V2_V2(fragCoord, vec2_N_N(glNegative_N(float_N(1.0)), float_N(1.0))), inverseVP))
        glSet_V2_V2(v_rgbSE, glMul_V2_V2(glAdd_V2_V2(fragCoord, vec2_N_N(float_N(1.0), float_N(1.0))), inverseVP))
        glSet_V2_V2(v_rgbM, vec2_V2(glMul_V2_V2(fragCoord, inverseVP)))
    }
    fxaa_N_V2_V2_V2_V2_V2_V2_V2(
        __tex__: Sampler2D,
        __fragCoord__: Vec2Data,
        __resolution__: Vec2Data,
        __v_rgbNW__: Vec2Data,
        __v_rgbNE__: Vec2Data,
        __v_rgbSW__: Vec2Data,
        __v_rgbSE__: Vec2Data,
        __v_rgbM__: Vec2Data
    ): Vec4Data {
        let tex: Sampler2D = new Sampler2D()
        glSet_N_N(tex, __tex__)
        let fragCoord: Vec2Data = new Vec2Data()
        glSet_V2_V2(fragCoord, __fragCoord__)
        let resolution: Vec2Data = new Vec2Data()
        glSet_V2_V2(resolution, __resolution__)
        let v_rgbNW: Vec2Data = new Vec2Data()
        glSet_V2_V2(v_rgbNW, __v_rgbNW__)
        let v_rgbNE: Vec2Data = new Vec2Data()
        glSet_V2_V2(v_rgbNE, __v_rgbNE__)
        let v_rgbSW: Vec2Data = new Vec2Data()
        glSet_V2_V2(v_rgbSW, __v_rgbSW__)
        let v_rgbSE: Vec2Data = new Vec2Data()
        glSet_V2_V2(v_rgbSE, __v_rgbSE__)
        let v_rgbM: Vec2Data = new Vec2Data()
        glSet_V2_V2(v_rgbM, __v_rgbM__)

        let color: Vec4Data = vec4()
        let inverseVP: Vec2Data = vec2()
        glSet_V2_V2(inverseVP, vec2_N_N(glDiv_N_N(float_N(1.0), float_N(resolution.x)), glDiv_N_N(float_N(1.0), float_N(resolution.y))))
        let rgbNW: Vec3Data = vec3()
        glSet_V3_V3(rgbNW, texture2D_N_V2(tex, v_rgbNW).xyz)
        let rgbNE: Vec3Data = vec3()
        glSet_V3_V3(rgbNE, texture2D_N_V2(tex, v_rgbNE).xyz)
        let rgbSW: Vec3Data = vec3()
        glSet_V3_V3(rgbSW, texture2D_N_V2(tex, v_rgbSW).xyz)
        let rgbSE: Vec3Data = vec3()
        glSet_V3_V3(rgbSE, texture2D_N_V2(tex, v_rgbSE).xyz)
        let texColor: Vec4Data = vec4()
        glSet_V4_V4(texColor, texture2D_N_V2(tex, v_rgbM))
        let rgbM: Vec3Data = vec3()
        glSet_V3_V3(rgbM, texColor.xyz)
        let luma: Vec3Data = vec3()
        glSet_V3_V3(luma, vec3_N_N_N(float_N(0.299), float_N(0.587), float_N(0.114)))
        let lumaNW: FloatData = float()
        glSet_N_N(lumaNW, dot_V3_V3(rgbNW, luma))
        let lumaNE: FloatData = float()
        glSet_N_N(lumaNE, dot_V3_V3(rgbNE, luma))
        let lumaSW: FloatData = float()
        glSet_N_N(lumaSW, dot_V3_V3(rgbSW, luma))
        let lumaSE: FloatData = float()
        glSet_N_N(lumaSE, dot_V3_V3(rgbSE, luma))
        let lumaM: FloatData = float()
        glSet_N_N(lumaM, dot_V3_V3(rgbM, luma))
        let lumaMin: FloatData = float()
        glSet_N_N(lumaMin, min_N_N(lumaM, min_N_N(min_N_N(lumaNW, lumaNE), min_N_N(lumaSW, lumaSE))))
        let lumaMax: FloatData = float()
        glSet_N_N(lumaMax, max_N_N(lumaM, max_N_N(max_N_N(lumaNW, lumaNE), max_N_N(lumaSW, lumaSE))))
        let dir: Vec2Data = vec2()
        dir.x = glNegative_N(glSub_N_N(glAdd_N_N(lumaNW, lumaNE), glAdd_N_N(lumaSW, lumaSE))).v
        dir.y = glSub_N_N(glAdd_N_N(lumaNW, lumaSW), glAdd_N_N(lumaNE, lumaSE)).v
        let dirReduce: FloatData = float()
        glSet_N_N(
            dirReduce,
            max_N_N(
                glMul_N_N(
                    glAdd_N_N(glAdd_N_N(glAdd_N_N(lumaNW, lumaNE), lumaSW), lumaSE),
                    glMul_N_N(float_N(0.25), glDiv_N_N(float_N(1.0), float_N(8.0)))
                ),
                glDiv_N_N(float_N(1.0), float_N(128.0))
            )
        )
        let rcpDirMin: FloatData = float()
        glSet_N_N(rcpDirMin, glDiv_N_N(float_N(1.0), glAdd_N_N(min_N_N(abs_N(float_N(dir.x)), abs_N(float_N(dir.y))), dirReduce)))
        glSet_V2_V2(
            dir,
            glMul_V2_V2(
                min_V2_V2(
                    vec2_N_N(float_N(8.0), float_N(8.0)),
                    max_V2_V2(vec2_N_N(glNegative_N(float_N(8.0)), glNegative_N(float_N(8.0))), glMul_V2_N(dir, rcpDirMin))
                ),
                inverseVP
            )
        )
        let rgbA: Vec3Data = vec3()
        glSet_V3_V3(
            rgbA,
            glMul_N_V3(
                float_N(0.5),
                glAdd_V3_V3(
                    texture2D_N_V2(
                        tex,
                        glAdd_V2_V2(
                            glMul_V2_V2(fragCoord, inverseVP),
                            glMul_V2_N(dir, glSub_N_N(glDiv_N_N(float_N(1.0), float_N(3.0)), float_N(0.5)))
                        )
                    ).xyz,
                    texture2D_N_V2(
                        tex,
                        glAdd_V2_V2(
                            glMul_V2_V2(fragCoord, inverseVP),
                            glMul_V2_N(dir, glSub_N_N(glDiv_N_N(float_N(2.0), float_N(3.0)), float_N(0.5)))
                        )
                    ).xyz
                )
            )
        )
        let rgbB: Vec3Data = vec3()
        glSet_V3_V3(
            rgbB,
            glAdd_V3_V3(
                glMul_V3_N(rgbA, float_N(0.5)),
                glMul_N_V3(
                    float_N(0.25),
                    glAdd_V3_V3(
                        texture2D_N_V2(tex, glAdd_V2_V2(glMul_V2_V2(fragCoord, inverseVP), glMul_V2_N(dir, glNegative_N(float_N(0.5)))))
                            .xyz,
                        texture2D_N_V2(tex, glAdd_V2_V2(glMul_V2_V2(fragCoord, inverseVP), glMul_V2_N(dir, float_N(0.5)))).xyz
                    )
                )
            )
        )
        let lumaB: FloatData = float()
        glSet_N_N(lumaB, dot_V3_V3(rgbB, luma))
        if (glIsLess_N_N(lumaB, lumaMin) || glIsMore_N_N(lumaB, lumaMax)) {
            glSet_V4_V4(color, vec4_V3_N(rgbA, float_N(texColor.w)))
        } else glSet_V4_V4(color, vec4_V3_N(rgbB, float_N(texColor.w)))
        return color
    }
    main(): void {
        let v_rgbNW: Vec2Data = vec2()
        let v_rgbNE: Vec2Data = vec2()
        let v_rgbSW: Vec2Data = vec2()
        let v_rgbSE: Vec2Data = vec2()
        let v_rgbM: Vec2Data = vec2()
        let resolution: Vec2Data = vec2()
        glSet_V2_V2(resolution, this.uniformData.cc_screenSize.xy)
        let fragCoord: Vec2Data = vec2()
        glSet_V2_V2(fragCoord, glMul_V2_V2(this.varyingData.v_uv, resolution))
        this.texcoords_V2_V2_V2_V2_V2_V2_V2(fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM)
        glSet_V4_V4(
            gl_FragColor,
            this.fxaa_N_V2_V2_V2_V2_V2_V2_V2(
                this.uniformData.cc_lighting_resultMap,
                fragCoord,
                resolution,
                v_rgbNW,
                v_rgbNE,
                v_rgbSW,
                v_rgbSE,
                v_rgbM
            )
        )
    }
}
