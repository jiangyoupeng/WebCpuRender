// 对应要替换的glsl代码 用于调试
export let glslShaderHackScript: Map<string, string> = new Map([
    [
        `5d4097be77737e5de7008d9c59f6a3ca`,
        `#define BASE_COLOR_MAP_AS_SHADE_MAP_2 1
#define BASE_COLOR_MAP_AS_SHADE_MAP_1 1
#define SHADE_MAP_1_AS_SHADE_MAP_2 0
#define USE_ALPHA_TEST 0
#define USE_EMISSIVE_MAP 0
#define USE_SPECULAR_MAP 0
#define USE_2ND_SHADE_MAP 0
#define USE_1ST_SHADE_MAP 0
#define USE_BASE_COLOR_MAP 1
#define CC_USE_HDR 0
#define CC_PIPELINE_TYPE 0
#define CC_FORWARD_ADD 0
#define USE_NORMAL_MAP 0
#define CC_RECEIVE_SHADOW 1
#define USE_LIGHTMAP 0
#define USE_BATCHING 0
#define USE_INSTANCING 0
#define CC_USE_BAKED_ANIMATION 1
#define CC_USE_SKINNING 1
#define CC_MORPH_TARGET_HAS_TANGENT 0
#define CC_MORPH_TARGET_HAS_NORMAL 0
#define CC_MORPH_TARGET_HAS_POSITION 0
#define CC_MORPH_PRECOMPUTED 0
#define CC_MORPH_TARGET_COUNT 2
#define CC_USE_MORPH 0
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 62
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 219
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define ALPHA_TEST_CHANNEL a

varying highp float v_decode32_float_Test;
precision highp float;
highp float decode32 (highp vec4 rgba, bool judge) {
  rgba = rgba * 255.0;
  highp float Sign = 1.0 - (step(128.0, (rgba[3]) + 0.5)) * 2.0;
  highp float Exponent = 2.0 * (mod(float(int((rgba[3]) + 0.5)), 128.0)) + (step(128.0, (rgba[2]) + 0.5)) - 127.0;
  highp float Mantissa = (mod(float(int((rgba[2]) + 0.5)), 128.0)) * 65536.0 + rgba[1] * 256.0 + rgba[0] + 8388608.0;
  if (judge) {
    v_decode32_float_Test = Sign * exp2(Exponent - 23.0) * Mantissa;
  }
  return Sign * exp2(Exponent - 23.0) * Mantissa;
}
struct StandardVertInput {
  highp vec4 position;
  vec3 normal;
  vec4 tangent;
};
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;
attribute vec4 a_tangent;
    attribute vec4 a_joints;
  attribute vec4 a_weights;
    uniform highp vec4 cc_jointTextureInfo;
    uniform highp vec4 cc_jointAnimInfo;
    uniform highp sampler2D cc_jointTexture;
    varying highp vec4 v_decode32Test;
    varying highp vec2 v_decode32_v2_Test;
      mat4 getJointMatrix (float i, bool judge) {
                highp float j = 12.0 * (cc_jointAnimInfo.x * cc_jointTextureInfo.y + i) + cc_jointTextureInfo.z;
              highp float invSize = cc_jointTextureInfo.w;
              highp float y = floor(j * invSize);
              highp float x = floor(j - y * cc_jointTextureInfo.x);
              y = (y + 0.5) * invSize;
        if (judge){
            v_decode32_v2_Test = vec2((x + 4.5) * invSize, y);
            v_decode32Test = texture2D(cc_jointTexture, vec2((x + 0.5) * invSize, y));
            decode32(v_decode32Test, true);
        }
        vec4 v1 = vec4(
          decode32(texture2D(cc_jointTexture, vec2((x + 0.5) * invSize, y)), false),
          decode32(texture2D(cc_jointTexture, vec2((x + 1.5) * invSize, y)), false),
          decode32(texture2D(cc_jointTexture, vec2((x + 2.5) * invSize, y)), false),
          decode32(texture2D(cc_jointTexture, vec2((x + 3.5) * invSize, y)), false)
        );
        vec4 v2 = vec4(
          decode32(texture2D(cc_jointTexture, vec2((x + 4.5) * invSize, y)), false),
          decode32(texture2D(cc_jointTexture, vec2((x + 5.5) * invSize, y)), false),
          decode32(texture2D(cc_jointTexture, vec2((x + 6.5) * invSize, y)), false),
          decode32(texture2D(cc_jointTexture, vec2((x + 7.5) * invSize, y)), false)
        );
        vec4 v3 = vec4(
          decode32(texture2D(cc_jointTexture, vec2((x + 8.5) * invSize, y)), false),
          decode32(texture2D(cc_jointTexture, vec2((x + 9.5) * invSize, y)), false),
          decode32(texture2D(cc_jointTexture, vec2((x + 10.5) * invSize, y)), false),
          decode32(texture2D(cc_jointTexture, vec2((x + 11.5) * invSize, y)), false)
        );
        return mat4(vec4(v1.xyz, 0.0), vec4(v2.xyz, 0.0), vec4(v3.xyz, 0.0), vec4(v1.w, v2.w, v3.w, 1.0));
      }
      varying highp mat4 v_jointMatrixX;
      varying highp mat4 v_jointMatrixY;
      varying highp mat4 v_jointMatrixZ;
      varying highp mat4 v_jointMatrixW;
  mat4 skinMatrix () {
    vec4 joints = vec4(a_joints);
    vec4 testJoints = vec4(0.,0.,0.5,0.5);
    vec4 testWeights = vec4(0.5,0.5,0.,0.);
    v_jointMatrixX = getJointMatrix(testJoints.x, true) * testWeights.x;
    v_jointMatrixY = getJointMatrix(testJoints.y, false) * testWeights.y;
    v_jointMatrixZ = getJointMatrix(testJoints.z, false) * testWeights.z;
    v_jointMatrixW = getJointMatrix(testJoints.w, false) * testWeights.w;
    return getJointMatrix(joints.x, false) * a_weights.x
         + getJointMatrix(joints.y, false) * a_weights.y
         + getJointMatrix(joints.z, false) * a_weights.z
         + getJointMatrix(joints.w, false) * a_weights.w;
  }
  void CCSkin (inout vec4 position) {
    mat4 m = skinMatrix();
    position = m * position;
  }
  void CCSkin (inout StandardVertInput attr) {
    mat4 m = skinMatrix();
    attr.position = m * attr.position;
    attr.normal = (m * vec4(attr.normal, 0.0)).xyz;
    attr.tangent.xyz = (m * vec4(attr.tangent.xyz, 0.0)).xyz;
  }
uniform highp mat4 cc_matView;
  uniform highp mat4 cc_matProj;
  uniform highp mat4 cc_matWorld;
  uniform highp mat4 cc_matWorldIT;
      uniform vec4 tilingOffset;
varying highp vec4 v_shadowPos;
uniform highp mat4 cc_matLightViewProj;
  uniform sampler2D cc_shadowMap;
  uniform sampler2D cc_spotLightingMap;
varying vec3 v_position;
varying vec2 v_uv;
varying vec3 v_normal;
varying vec4 v_testColor;
vec4 vert () {
  StandardVertInput In;
      In.position = vec4(a_position, 1.0);
      In.normal = a_normal;
      In.tangent = a_tangent;
      CCSkin(In);
  mat4 matWorld, matWorldIT;
      matWorld = cc_matWorld;
      matWorldIT = cc_matWorldIT;
  vec4 pos = matWorld * In.position;
  v_position = pos.xyz;
  v_uv = a_texCoord * tilingOffset.xy + tilingOffset.zw;
  v_normal = (matWorldIT * vec4(In.normal, 0.0)).xyz;
  v_shadowPos = cc_matLightViewProj * pos;
  vec4 v4 = cc_matProj * (cc_matView * matWorld) * In.position;
  return In.position;
}
void main() { gl_Position = vert();
    v_testColor = gl_Position; }`,
    ],
    [
        `d1726f4f0d9276fc1c2677c41b272767`,
        `#define BASE_COLOR_MAP_AS_SHADE_MAP_2 1
#define BASE_COLOR_MAP_AS_SHADE_MAP_1 1
#define SHADE_MAP_1_AS_SHADE_MAP_2 0
#define USE_ALPHA_TEST 0
#define USE_EMISSIVE_MAP 0
#define USE_SPECULAR_MAP 0
#define USE_2ND_SHADE_MAP 0
#define USE_1ST_SHADE_MAP 0
#define USE_BASE_COLOR_MAP 1
#define CC_USE_HDR 0
#define CC_PIPELINE_TYPE 0
#define CC_FORWARD_ADD 0
#define USE_NORMAL_MAP 0
#define CC_RECEIVE_SHADOW 1
#define USE_LIGHTMAP 0
#define USE_BATCHING 0
#define USE_INSTANCING 0
#define CC_USE_BAKED_ANIMATION 1
#define CC_USE_SKINNING 1
#define CC_MORPH_TARGET_HAS_TANGENT 0
#define CC_MORPH_TARGET_HAS_NORMAL 0
#define CC_MORPH_TARGET_HAS_POSITION 0
#define CC_MORPH_PRECOMPUTED 0
#define CC_MORPH_TARGET_COUNT 2
#define CC_USE_MORPH 0
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 62
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 219
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define ALPHA_TEST_CHANNEL a

precision highp float;
uniform highp vec4 cc_cameraPos;
  uniform mediump vec4 cc_exposure;
  uniform mediump vec4 cc_mainLitDir;
  uniform mediump vec4 cc_mainLitColor;
struct ToonSurface {
  vec4 baseColor;
  vec4 specular;
  vec3 position;
  vec3 normal;
  vec3 shade1;
  vec3 shade2;
  vec3 emissive;
  float baseStep;
  float baseFeather;
  float shadeStep;
  float shadeFeather;
};
    varying highp vec4 v_shadowPos;
    uniform lowp vec4 cc_shadowNFLSInfo;
  uniform lowp vec4 cc_shadowWHPBInfo;
  uniform lowp vec4 cc_shadowLPNNInfo;
  uniform lowp vec4 cc_shadowColor;
      uniform sampler2D cc_shadowMap;
      uniform sampler2D cc_spotLightingMap;
      float CCGetShadowFactorX1 (vec4 shadowPos) {
        vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
        if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
            clipPos.y < 0.0 || clipPos.y > 1.0 ||
            clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
        float shadow = 0.0;
        float closestDepth = 0.0;
        clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
        if (cc_shadowLPNNInfo.y > 0.000001) {
          closestDepth = dot(texture2D(cc_shadowMap, clipPos.xy), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
        } else {
          closestDepth = texture2D(cc_shadowMap, clipPos.xy).x;
        }
        shadow = step(closestDepth, clipPos.z- cc_shadowWHPBInfo.w);
        return shadow;
      }
      float CCGetShadowFactorX5 (vec4 shadowPos) {
        vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
        if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
            clipPos.y < 0.0 || clipPos.y > 1.0 ||
            clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
        float offsetx = 1.0 / cc_shadowWHPBInfo.x;
        float offsety = 1.0 / cc_shadowWHPBInfo.y;
        float shadow = 0.0;
        clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
        if (cc_shadowLPNNInfo.y > 0.000001) {
          float closestDepth = dot(texture2D(cc_shadowMap, vec2(clipPos.x - offsetx, clipPos.y - offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
          closestDepth = dot(texture2D(cc_shadowMap, vec2(clipPos.x - offsetx, clipPos.y + offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
          closestDepth = dot(texture2D(cc_shadowMap, vec2(clipPos.x, clipPos.y)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
          closestDepth = dot(texture2D(cc_shadowMap, vec2(clipPos.x + offsetx, clipPos.y - offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
          closestDepth = dot(texture2D(cc_shadowMap, vec2(clipPos.x + offsetx, clipPos.y + offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
        } else {
          float closestDepth = texture2D(cc_shadowMap, vec2(clipPos.x - offsetx, clipPos.y - offsety)).x;
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
          closestDepth = texture2D(cc_shadowMap, vec2(clipPos.x - offsetx, clipPos.y + offsety)).x;
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
          closestDepth = texture2D(cc_shadowMap, vec2(clipPos.x, clipPos.y)).x;
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
          closestDepth = texture2D(cc_shadowMap, vec2(clipPos.x + offsetx, clipPos.y - offsety)).x;
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
          closestDepth = texture2D(cc_shadowMap, vec2(clipPos.x + offsetx, clipPos.y + offsety)).x;
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
        }
        return shadow / 5.0;
      }
      float CCGetShadowFactorX9 (vec4 shadowPos) {
        vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
        if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
            clipPos.y < 0.0 || clipPos.y > 1.0 ||
            clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
        float offsetx = 1.0 / cc_shadowWHPBInfo.x;
        float offsety = 1.0 / cc_shadowWHPBInfo.y;
        float shadow = 0.0;
        float closestDepth = 0.0;
        clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
        if (cc_shadowLPNNInfo.y > 0.000001) {
          for (int i = -1; i <= 1; i++) {
              for (int j = -1; j <= 1; j++) {
                float closestDepth = dot(texture2D(cc_shadowMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
                shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
              }
          }
        } else {
          for (int i = -1; i <= 1; i++) {
              for (int j = -1; j <= 1; j++) {
                float closestDepth = texture2D(cc_shadowMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)).x;
                shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
              }
          }
        }
        return shadow / 9.0;
      }
      float CCGetShadowFactorX25 (vec4 shadowPos) {
        vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
        if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
            clipPos.y < 0.0 || clipPos.y > 1.0 ||
            clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
        float offsetx = 1.0 / cc_shadowWHPBInfo.x;
        float offsety = 1.0 / cc_shadowWHPBInfo.y;
        float shadow = 0.0;
        clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
        if (cc_shadowLPNNInfo.y > 0.000001) {
          for (int i = -2; i <= 2; i++) {
            for (int j = -2; j <= 2; j++) {
              float closestDepth = dot(texture2D(cc_shadowMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
              shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
            }
          }
        } else {
          for (int i = -2; i <= 2; i++) {
            for (int j = -2; j <= 2; j++) {
              float closestDepth = texture2D(cc_shadowMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)).x;
              shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
            }
          }
        }
        return shadow / 25.0;
      }
  vec4 CCToonShading (ToonSurface s) {
    vec3 V = normalize(cc_cameraPos.xyz - s.position);
    vec3 N = normalize(s.normal);
    vec3 L = normalize(-cc_mainLitDir.xyz);
    float NL = 0.5 * dot(N, L) + 0.5;
    float NH = 0.5 * dot(normalize(V + L), N) + 0.5;
    vec3 lightColor = cc_mainLitColor.rgb * cc_mainLitColor.w * s.baseStep;
    vec3 diffuse = mix(s.shade1, s.shade2,
      clamp(1.0 + (s.shadeStep - s.shadeFeather - NL) / s.shadeFeather, 0.0, 1.0));
    diffuse = mix(s.baseColor.rgb, diffuse,
      clamp(1.0 + (s.baseStep - s.baseFeather - NL) / s.baseFeather, 0.0, 1.0));
    float specularWeight = 1.0 - pow(s.specular.a, 5.0);
    float specularMask = step(specularWeight, NH);
    vec3 specular = s.specular.rgb * specularMask;
    vec3 finalColor = lightColor * (diffuse + specular);
    finalColor += s.emissive;
              {
                float pcf = cc_shadowWHPBInfo.z + 0.001;
                float shadowAttenuation = 0.0;
                float cosAngle = clamp(1.0 - dot(N, cc_mainLitDir.xyz), 0.0, 1.0);
                vec3 projWorldPos = v_shadowPos.xyz + cosAngle * cc_shadowLPNNInfo.z * N;
                vec4 pos = vec4(projWorldPos.xyz, v_shadowPos.w);
                if (pcf > 3.0) shadowAttenuation = CCGetShadowFactorX25(pos);
                else if (pcf > 2.0) shadowAttenuation = CCGetShadowFactorX9(pos);
                else if (pcf > 1.0) shadowAttenuation = CCGetShadowFactorX5(pos);
                else shadowAttenuation = CCGetShadowFactorX1(pos);
                vec3 shadowColor = cc_shadowColor.rgb * cc_shadowColor.a + finalColor.rgb * (1.0 - cc_shadowColor.a);
                if (cc_shadowNFLSInfo.w > 0.000001) {
                  finalColor.rgb = shadowColor.rgb * shadowAttenuation + finalColor.rgb * (1.0 - shadowAttenuation);
                } else {
                  finalColor.rgb = shadowColor.rgb * shadowAttenuation * NL + finalColor.rgb * (1.0 - shadowAttenuation * NL);
                }
              }
    return vec4(finalColor, s.baseColor.a);
  }
    uniform vec4 baseColor;
    uniform vec4 colorScaleAndCutoff;
    uniform vec4 shadeColor1;
    uniform vec4 shadeColor2;
    uniform vec4 specular;
    uniform vec4 shadeParams;
    uniform vec4 emissive;
    uniform vec4 emissiveScaleAndStrenth;
vec3 ACESToneMap (vec3 color) {
  color = min(color, vec3(8.0));
  const float A = 2.51;
  const float B = 0.03;
  const float C = 2.43;
  const float D = 0.59;
  const float E = 0.14;
  return (color * (A * color + B)) / (color * (C * color + D) + E);
}
vec3 SRGBToLinear (vec3 gamma) {
  return gamma * gamma;
}
vec4 CCFragOutput (vec4 color) {
    color.rgb = sqrt(ACESToneMap(color.rgb));
  return color;
}
varying vec3 v_position;
varying vec2 v_uv;
  uniform sampler2D baseColorMap;
varying vec3 v_normal;
varying vec4 v_testColor;
varying highp mat4 v_jointMatrixX;
varying highp mat4 v_jointMatrixY;
varying highp mat4 v_jointMatrixZ;
varying highp mat4 v_jointMatrixW;
varying highp vec4 v_decode32Test;
varying highp vec2 v_decode32_v2_Test;
varying highp float v_decode32_float_Test;
void surf (out ToonSurface s) {
  s.shade2 = shadeColor2.rgb * colorScaleAndCutoff.rgb;
  s.shade1 = shadeColor1.rgb * colorScaleAndCutoff.rgb;
  vec4 baseColor = baseColor;
    vec4 baseColorMap = texture2D(baseColorMap, v_uv);
    baseColorMap.rgb = SRGBToLinear(baseColorMap.rgb);
    baseColor *= baseColorMap;
      s.shade1 *= baseColorMap.rgb;
      s.shade2 *= baseColorMap.rgb;
  s.baseColor = baseColor;
  s.baseColor.rgb *= colorScaleAndCutoff.xyz;
  s.normal = v_normal;
  s.position = v_position;
  s.specular = specular;
  s.emissive = emissive.rgb * emissiveScaleAndStrenth.xyz;
  s.baseStep = shadeParams.x;
  s.baseFeather = shadeParams.y;
  s.shadeStep = shadeParams.z;
  s.shadeFeather = shadeParams.w;
}
vec4 frag () {
  ToonSurface s; surf(s);
  vec4 color = CCToonShading(s);
  return CCFragOutput(color);
}
void main() { 
    // gl_FragColor = frag(); 
    // gl_FragColor = v_jointMatrixX[1].zyxw;
    // gl_FragColor = v_decode32Test;
    
    gl_FragColor = vec4(v_decode32_float_Test / 120., 0, 0, 1);
}`,
    ],
])
