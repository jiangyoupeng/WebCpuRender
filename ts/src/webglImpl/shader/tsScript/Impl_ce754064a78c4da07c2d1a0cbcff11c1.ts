/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 210
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 54
#define CC_USE_MORPH 0
#define CC_MORPH_TARGET_COUNT 2
#define CC_MORPH_PRECOMPUTED 0
#define CC_MORPH_TARGET_HAS_POSITION 0
#define CC_MORPH_TARGET_HAS_NORMAL 0
#define CC_MORPH_TARGET_HAS_TANGENT 0
#define CC_USE_SKINNING 0
#define CC_USE_BAKED_ANIMATION 0
#define USE_INSTANCING 0
#define USE_BATCHING 0
#define USE_LIGHTMAP 0
#define CC_USE_FOG 0
#define CC_FORWARD_ADD 0
#define CC_RECEIVE_SHADOW 0
#define HAS_SECOND_UV 0
#define CC_USE_IBL 0
#define CC_PIPELINE_TYPE 0

#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod: enable
#endif
precision highp float;
varying float v_fog_factor;
#if CC_RECEIVE_SHADOW
  uniform sampler2D cc_shadowMap;
  uniform sampler2D cc_spotLightingMap;
#endif
#if CC_USE_IBL
  uniform samplerCube cc_environment;
#endif
struct StandardSurface {
  vec4 albedo;
  vec3 position;
  vec3 normal;
  vec3 emissive;
  vec3 lightmap;
  float lightmap_test;
  float roughness;
  float metallic;
  float occlusion;
};
#if CC_FORWARD_ADD
#if CC_PIPELINE_TYPE == 0
# define LIGHTS_PER_PASS 1
#else
# define LIGHTS_PER_PASS 10
#endif
#endif
varying vec2 v_uv;
uniform sampler2D mainTexture;
varying float factor_fog;
   uniform vec4 mainColor;
void test1Func(float asvdsx, inout float asv, in float qwes, out float qwescxs){
}
vec4 frag () {
  float a = 1.;
  a++;
  a--;
  ++a;
  --a;
  vec3 I = vec3(1,0,0);
  I++;
  I--;
  --I;
  ++I;
  mat3 mat3test = mat3(1.,1.,1.,1.,1.,1.,0.1,0.2,0.3);
  mat3test--;
  mat3test++;
  StandardSurface s;
  s.position.xy = vec2(0.1,0.5);
  StandardSurface s1 = s;
  s1.position.xy = vec2(0,0);
  if (v_uv.x < 0.5){
    vec3 v_uv;
    v_uv = vec3(1,1,1);
  }else{
    vec2 v_uv;
    v_uv = vec2(0,0);
  }
  const int qweqeas = 1;
  vec3 testV3 = vec3(0.5);
  vec3 Nref = vec3(0.5,0,0);
  I += 3.;
  I += I.zyx;
  I -= I.zyx;
  I -= 3.;
  I = -I;
  I *= 1.;
  I /= 1.;
  vec3 N = vec3(0.5,0.5,0.5);
  vec3 t = normalize(N);
  I += 1.;
  I += a;
  float b = 2.;
  b += a;
  float c = 2.;
  float gg, bb, tt = 1.;
  float wwww, www = a, zzz = b = c = 1. + gg + I.x;
  vec2 yx = vec2(I.xy + (c + (a + b * c * (a + b) * c) * b + I.x + dot(I, N)));
  yx.x = 2. + vec2(I.xy + (c + (a + b * c * (a + b) * c) * b + I.x + dot(I, N))).x;
  yx[qweqeas+0] = 1.;
  for (int i = 1; i < 3; i++) {
  }
  vec4 asd = vec4(1,1,1,1);
  asd.stpq = vec4(1,1,1,1);
  vec2 te = vec2(1,1);
  asd =  asd / 0.5;
  float tes = asd.r;
  vec2 stepTest = step(te, te);
  mat3 matrix3 = mat3(1.,1.,1.,1.,1.,1.,0.1,0.2,0.3);
  mat4 matrix4 = mat4(matrix3);
  vec4 matrix4Test = matrix4[0];
  matrix4Test.x = 0.;
  matrix4Test.y = 0.;
  matrix4Test.z = 0.;
  matrix4Test.w = 0.;
  matrix4[0] = matrix4Test;
  matrix4[0][0] = 1.;
  matrix4[0][1] = 1.;
  matrix4[0][2] = 1.;
  matrix4[0][3] = 1.;
  vec4 test = vec4(0.5);
  test[1] = 2.;
  test[1] *= 1.;
  test = test * matrix4;
  vec4 test1 = vec4(test.xy, 1., 1.);
  vec4 col = mainColor * texture2D(mainTexture, v_uv);
  vec4 vec4TestA = vec4(1,1,1,1);
  vec4 vec4TestB = vec4TestA;
  a = 0.;
  bool tqweqwe = a > 0.;
  if (a > 0.9){
  }else if(a > 0.8){
  }else if(a > 0.7){
  }else{
  }
  if (tqweqwe){}
  for (int i = 1;  (i < 3); i++) {
      int tes = 3;
  }
  vec4 color;
  float lumaB;
  float lumaMin;
  float lumaMax;
  if ((lumaB < lumaMin) || (lumaB > lumaMax)){
      color = vec4(2);
  }else{
      color = vec4(2);
  }
  if ((lumaB < lumaMin) || (lumaB > lumaMax))
    color = vec4(1);
  else if (lumaB < lumaMin)
    color = vec4(1);
  else if (lumaB > lumaMax)
    color = vec4(1);
  else
    color = vec4(1);
  color.x = 1.;
  color.y = 1.;
  color.z = 1.;
  color.w = 1.;
  test1Func((color.x + color.y + color.z + color).z , color.y, color.z, color.w);
  return vec4(color);
}
void main() { gl_FragColor = frag(); }
*/
import {
    vec3_N_N_N,
    mat3_N_N_N_N_N_N_N_N_N,
    vec2_N_N,
    vec3_N,
    normalize_V3,
    dot_V3_V3,
    vec2_V2,
    vec4_N_N_N_N,
    step_V2_V2,
    mat4_M3,
    vec4_N,
    vec4_V2_N_N,
    texture2D_N_V2,
    vec4_V4,
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
    glSet_N_N,
    glSet_V2_V2,
    glAfterAddSelf_N,
    glFrontSubSelf_N,
    glFrontAddSelf_N,
    glSet_V3_V3,
    glAfterAddSelf_V3,
    glFrontSubSelf_V3,
    glFrontAddSelf_V3,
    glSet_M3_M3,
    glFrontSubSelf_M3,
    glAfterAddSelf_M3,
    glSet_Struct_Struct,
    glIsLess_N_N,
    glAddSet_V3_N,
    glAddSet_V3_V3,
    glSubSet_V3_V3,
    glSubSet_V3_N,
    glNegative_V3,
    glMulSet_V3_N,
    glDivSet_V3_N,
    glAddSet_N_N,
    glAdd_N_N,
    glMul_N_N,
    glAdd_V2_N,
    glSet_V4_V4,
    glDiv_V4_N,
    glSet_M4_M4,
    glMul_V4_M4,
    glMul_V4_V4,
    glSet_B_B,
    glIsMore_N_N,
    glSet_B_b,
    glAdd_N_V4,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(210)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(54)
let CC_USE_MORPH = new FloatData(0)
let CC_MORPH_TARGET_COUNT = new FloatData(2)
let CC_MORPH_PRECOMPUTED = new FloatData(0)
let CC_MORPH_TARGET_HAS_POSITION = new FloatData(0)
let CC_MORPH_TARGET_HAS_NORMAL = new FloatData(0)
let CC_MORPH_TARGET_HAS_TANGENT = new FloatData(0)
let CC_USE_SKINNING = new FloatData(0)
let CC_USE_BAKED_ANIMATION = new FloatData(0)
let USE_INSTANCING = new FloatData(0)
let USE_BATCHING = new FloatData(0)
let USE_LIGHTMAP = new FloatData(0)
let CC_USE_FOG = new FloatData(0)
let CC_FORWARD_ADD = new FloatData(0)
let CC_RECEIVE_SHADOW = new FloatData(0)
let HAS_SECOND_UV = new FloatData(0)
let CC_USE_IBL = new FloatData(0)
let CC_PIPELINE_TYPE = new FloatData(0)
class StandardSurface implements StructData {
    albedo: Vec4Data = vec4()
    position: Vec3Data = vec3()
    normal: Vec3Data = vec3()
    emissive: Vec3Data = vec3()
    lightmap: Vec3Data = vec3()
    lightmap_test: FloatData = float()
    roughness: FloatData = float()
    metallic: FloatData = float()
    occlusion: FloatData = float()
}
class AttributeDataImpl implements AttributeData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
}
class VaryingDataImpl extends VaryingData {
    v_fog_factor: FloatData = new FloatData()
    v_uv: Vec2Data = new Vec2Data()
    factor_fog: FloatData = new FloatData()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([
        ["v_fog_factor", cpuRenderingContext.cachGameGl.FLOAT],
        ["v_uv", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["factor_fog", cpuRenderingContext.cachGameGl.FLOAT],
    ])
    copy(varying: VaryingDataImpl) {
        glSet_N_N(varying.v_fog_factor, this.v_fog_factor)
        glSet_V2_V2(varying.v_uv, this.v_uv)
        glSet_N_N(varying.factor_fog, this.factor_fog)
    }
}
class UniformDataImpl implements UniformData {
    mainTexture: Sampler2D = new Sampler2D()
    mainColor: Vec4Data = new Vec4Data()
    dataKeys: Map<string, any> = new Map([
        ["mainTexture", cpuRenderingContext.cachGameGl.SAMPLER_2D],
        ["mainColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["mainTexture", 1],
        ["mainColor", 1],
    ])
}
export class Impl_ce754064a78c4da07c2d1a0cbcff11c1 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    test1Func_N_N_N_N(__asvdsx__: FloatData, asv: FloatData, __qwes__: FloatData, qwescxs: FloatData): void {
        let asvdsx: FloatData = float()
        glSet_N_N(asvdsx, __asvdsx__)
        let qwes: FloatData = float()
        glSet_N_N(qwes, __qwes__)
    }
    frag(): Vec4Data {
        let a: FloatData = float()
        glSet_N_N(a, float_N(1))
        glAfterAddSelf_N(a)
        glFrontSubSelf_N(a)
        glFrontAddSelf_N(a)
        glFrontSubSelf_N(a)
        let I: Vec3Data = vec3()
        glSet_V3_V3(I, vec3_N_N_N(int_N(1), int_N(0), int_N(0)))
        glAfterAddSelf_V3(I)
        glFrontSubSelf_V3(I)
        glFrontSubSelf_V3(I)
        glFrontAddSelf_V3(I)
        let mat3test: Mat3Data = mat3()
        glSet_M3_M3(
            mat3test,
            mat3_N_N_N_N_N_N_N_N_N(
                float_N(1),
                float_N(1),
                float_N(1),
                float_N(1),
                float_N(1),
                float_N(1),
                float_N(0.1),
                float_N(0.2),
                float_N(0.3)
            )
        )
        glFrontSubSelf_M3(mat3test)
        glAfterAddSelf_M3(mat3test)
        let s: StandardSurface = new StandardSurface()
        glSet_V2_V2(s.position.xy, vec2_N_N(float_N(0.1), float_N(0.5)))
        let s1: StandardSurface = new StandardSurface()
        glSet_Struct_Struct(s1, s)
        glSet_V2_V2(s1.position.xy, vec2_N_N(int_N(0), int_N(0)))
        if (glIsLess_N_N(float_N(this.varyingData.v_uv.x), float_N(0.5))) {
            let v_uv: Vec3Data = vec3()
            glSet_V3_V3(v_uv, vec3_N_N_N(int_N(1), int_N(1), int_N(1)))
        } else {
            let v_uv: Vec2Data = vec2()
            glSet_V2_V2(v_uv, vec2_N_N(int_N(0), int_N(0)))
        }
        let qweqeas: IntData = int()
        glSet_N_N(qweqeas, int_N(1))
        let testV3: Vec3Data = vec3()
        glSet_V3_V3(testV3, vec3_N(float_N(0.5)))
        let Nref: Vec3Data = vec3()
        glSet_V3_V3(Nref, vec3_N_N_N(float_N(0.5), int_N(0), int_N(0)))
        glAddSet_V3_N(I, float_N(3))
        glAddSet_V3_V3(I, I.zyx)
        glSubSet_V3_V3(I, I.zyx)
        glSubSet_V3_N(I, float_N(3))
        glSet_V3_V3(I, glNegative_V3(I))
        glMulSet_V3_N(I, float_N(1))
        glDivSet_V3_N(I, float_N(1))
        let N: Vec3Data = vec3()
        glSet_V3_V3(N, vec3_N_N_N(float_N(0.5), float_N(0.5), float_N(0.5)))
        let t: Vec3Data = vec3()
        glSet_V3_V3(t, normalize_V3(N))
        glAddSet_V3_N(I, float_N(1))
        glAddSet_V3_N(I, a)
        let b: FloatData = float()
        glSet_N_N(b, float_N(2))
        glAddSet_N_N(b, a)
        let c: FloatData = float()
        glSet_N_N(c, float_N(2))
        let gg: FloatData = float()

        let bb: FloatData = float()

        let tt: FloatData = float()
        glSet_N_N(tt, float_N(1))
        let wwww: FloatData = float()

        let www: FloatData = float()
        glSet_N_N(www, a)
        let zzz: FloatData = float()
        glSet_N_N(zzz, glSet_N_N(b, glSet_N_N(c, glAdd_N_N(glAdd_N_N(float_N(1), gg), float_N(I.x)))))
        let yx: Vec2Data = vec2()
        glSet_V2_V2(
            yx,
            vec2_V2(
                glAdd_V2_N(
                    I.xy,
                    glAdd_N_N(
                        glAdd_N_N(
                            glAdd_N_N(c, glMul_N_N(glAdd_N_N(a, glMul_N_N(glMul_N_N(glMul_N_N(b, c), glAdd_N_N(a, b)), c)), b)),
                            float_N(I.x)
                        ),
                        dot_V3_V3(I, N)
                    )
                )
            )
        )
        yx.x = glAdd_N_N(
            float_N(2),
            float_N(
                vec2_V2(
                    glAdd_V2_N(
                        I.xy,
                        glAdd_N_N(
                            glAdd_N_N(
                                glAdd_N_N(c, glMul_N_N(glAdd_N_N(a, glMul_N_N(glMul_N_N(glMul_N_N(b, c), glAdd_N_N(a, b)), c)), b)),
                                float_N(I.x)
                            ),
                            dot_V3_V3(I, N)
                        )
                    )
                ).x
            )
        ).v
        ;(<any>yx)[getValueKeyByIndex(glAdd_N_N(qweqeas, int_N(0)))] = float_N(1).v
        for (let i: IntData = int_N(1); glIsLess_N_N(i, int_N(3)); glAfterAddSelf_N(i)) {}
        let asd: Vec4Data = vec4()
        glSet_V4_V4(asd, vec4_N_N_N_N(int_N(1), int_N(1), int_N(1), int_N(1)))
        glSet_V4_V4(asd.xyzw, vec4_N_N_N_N(int_N(1), int_N(1), int_N(1), int_N(1)))
        let te: Vec2Data = vec2()
        glSet_V2_V2(te, vec2_N_N(int_N(1), int_N(1)))
        glSet_V4_V4(asd, glDiv_V4_N(asd, float_N(0.5)))
        let tes: FloatData = float()
        glSet_N_N(tes, float_N(asd.x))
        let stepTest: Vec2Data = vec2()
        glSet_V2_V2(stepTest, step_V2_V2(te, te))
        let matrix3: Mat3Data = mat3()
        glSet_M3_M3(
            matrix3,
            mat3_N_N_N_N_N_N_N_N_N(
                float_N(1),
                float_N(1),
                float_N(1),
                float_N(1),
                float_N(1),
                float_N(1),
                float_N(0.1),
                float_N(0.2),
                float_N(0.3)
            )
        )
        let matrix4: Mat4Data = mat4()
        glSet_M4_M4(matrix4, mat4_M3(matrix3))
        let matrix4Test: Vec4Data = vec4()
        glSet_V4_V4(matrix4Test, (<any>matrix4)[getValueKeyByIndex(int_N(0))])
        matrix4Test.x = float_N(0).v
        matrix4Test.y = float_N(0).v
        matrix4Test.z = float_N(0).v
        matrix4Test.w = float_N(0).v
        glSet_V4_V4((<any>matrix4)[getValueKeyByIndex(int_N(0))], matrix4Test)
        ;(<any>matrix4)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(0))] = float_N(1).v
        ;(<any>matrix4)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(1))] = float_N(1).v
        ;(<any>matrix4)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(2))] = float_N(1).v
        ;(<any>matrix4)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(3))] = float_N(1).v
        let test: Vec4Data = vec4()
        glSet_V4_V4(test, vec4_N(float_N(0.5)))
        ;(<any>test)[getValueKeyByIndex(int_N(1))] = float_N(2).v
        ;(<any>test)[getValueKeyByIndex(int_N(1))] *= float_N(1).v
        glSet_V4_V4(test, glMul_V4_M4(test, matrix4))
        let test1: Vec4Data = vec4()
        glSet_V4_V4(test1, vec4_V2_N_N(test.xy, float_N(1), float_N(1)))
        let col: Vec4Data = vec4()
        glSet_V4_V4(col, glMul_V4_V4(this.uniformData.mainColor, texture2D_N_V2(this.uniformData.mainTexture, this.varyingData.v_uv)))
        let vec4TestA: Vec4Data = vec4()
        glSet_V4_V4(vec4TestA, vec4_N_N_N_N(int_N(1), int_N(1), int_N(1), int_N(1)))
        let vec4TestB: Vec4Data = vec4()
        glSet_V4_V4(vec4TestB, vec4TestA)
        glSet_N_N(a, float_N(0))
        let tqweqwe: BoolData = bool()
        glSet_B_b(tqweqwe, glIsMore_N_N(a, float_N(0)))
        if (glIsMore_N_N(a, float_N(0.9))) {
        } else if (glIsMore_N_N(a, float_N(0.8))) {
        } else if (glIsMore_N_N(a, float_N(0.7))) {
        } else {
        }

        if (tqweqwe.v) {
        }
        for (let i: IntData = int_N(1); glIsLess_N_N(i, int_N(3)); glAfterAddSelf_N(i)) {
            let tes: IntData = int()
            glSet_N_N(tes, int_N(3))
        }
        let color: Vec4Data = vec4()
        let lumaB: FloatData = float()
        let lumaMin: FloatData = float()
        let lumaMax: FloatData = float()
        if (glIsLess_N_N(lumaB, lumaMin) || glIsMore_N_N(lumaB, lumaMax)) {
            glSet_V4_V4(color, vec4_N(int_N(2)))
        } else {
            glSet_V4_V4(color, vec4_N(int_N(2)))
        }
        if (glIsLess_N_N(lumaB, lumaMin) || glIsMore_N_N(lumaB, lumaMax)) {
            glSet_V4_V4(color, vec4_N(int_N(1)))
        } else if (glIsLess_N_N(lumaB, lumaMin)) {
            glSet_V4_V4(color, vec4_N(int_N(1)))
        } else if (glIsMore_N_N(lumaB, lumaMax)) {
            glSet_V4_V4(color, vec4_N(int_N(1)))
        } else glSet_V4_V4(color, vec4_N(int_N(1)))

        color.x = float_N(1).v
        color.y = float_N(1).v
        color.z = float_N(1).v
        color.w = float_N(1).v
        this.test1Func_N_N_N_N(
            glAdd_N_V4(glAdd_N_N(glAdd_N_N(float_N(color.x), float_N(color.y)), float_N(color.z)), color).out_z,
            color.out_y,
            color.out_z,
            color.out_w
        )
        return vec4_V4(color)
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
