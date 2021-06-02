/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 216
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 59
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
#define CC_RECEIVE_SHADOW 1
#define USE_VERTEX_COLOR 0
#define USE_NORMAL_MAP 0
#define HAS_SECOND_UV 0
#define SAMPLE_FROM_RT 0
#define CC_USE_IBL 0
#define CC_USE_HDR 0
#define USE_ALBEDO_MAP 0
#define ALBEDO_UV v_uv
#define NORMAL_UV v_uv
#define PBR_UV v_uv
#define USE_PBR_MAP 0
#define USE_METALLIC_ROUGHNESS_MAP 0
#define USE_OCCLUSION_MAP 0
#define USE_EMISSIVE_MAP 0
#define EMISSIVE_UV v_uv
#define USE_ALPHA_TEST 0
#define ALPHA_TEST_CHANNEL a
#define CC_PIPELINE_TYPE 0

#ifdef GL_EXT_draw_buffers
#extension GL_EXT_draw_buffers: enable
#endif
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod: enable
#endif
precision highp float;
uniform highp vec4 cc_cameraPos;
  uniform mediump vec4 cc_exposure;
  uniform mediump vec4 cc_mainLitDir;
  uniform mediump vec4 cc_mainLitColor;
  uniform mediump vec4 cc_ambientSky;
  uniform mediump vec4 cc_ambientGround;
  uniform mediump vec4 cc_fogColor;
     uniform vec4 albedo;
     uniform vec4 albedoScaleAndCutoff;
     uniform vec4 pbrParams;
     uniform vec4 emissive;
     uniform vec4 emissiveScaleParam;
varying float v_fog_factor;
vec3 SRGBToLinear (vec3 gamma) {
  return gamma * gamma;
}
uniform highp mat4 cc_matLightView;
  uniform lowp vec4 cc_shadowNFLSInfo;
  uniform lowp vec4 cc_shadowWHPBInfo;
  uniform lowp vec4 cc_shadowLPNNInfo;
  uniform lowp vec4 cc_shadowColor;
#if CC_RECEIVE_SHADOW
  uniform sampler2D cc_shadowMap;
  uniform sampler2D cc_spotLightingMap;
  float CCGetLinearDepth (vec3 worldPos) {
    vec4 viewStartPos = cc_matLightView * vec4(worldPos.xyz, 1.0);
    float dist = length(viewStartPos.xyz);
    return cc_shadowNFLSInfo.x + (-dist / (cc_shadowNFLSInfo.y - cc_shadowNFLSInfo.x));
  }
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
  float CCGetDirLightShadowFactorX1 (vec4 shadowPos, vec3 worldPos) {
    vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
    if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
        clipPos.y < 0.0 || clipPos.y > 1.0 ||
        clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
    float shadow = 0.0;
    float closestDepth = 0.0;
    float depth = 0.0;
    clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
    if (cc_shadowNFLSInfo.z > 0.000001) {
      depth = CCGetLinearDepth(worldPos);
    } else {
      depth = clipPos.z;
    }
    if (cc_shadowLPNNInfo.y > 0.000001) {
      closestDepth = dot(texture2D(cc_spotLightingMap, clipPos.xy), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
    } else {
      closestDepth = texture2D(cc_spotLightingMap, clipPos.xy).x;
    }
    shadow = step(closestDepth, depth - cc_shadowWHPBInfo.w);
    return shadow;
  }
  float CCGetDirLightShadowFactorX5 (vec4 shadowPos, vec3 worldPos) {
    vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
    if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
        clipPos.y < 0.0 || clipPos.y > 1.0 ||
        clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
    float offsetx = 1.0 / cc_shadowWHPBInfo.x;
    float offsety = 1.0 / cc_shadowWHPBInfo.y;
    float shadow = 0.0;
    float depth = 0.0;
    if (cc_shadowNFLSInfo.z > 0.000001) {
      depth = CCGetLinearDepth(worldPos);
    } else {
      depth = clipPos.z;
    }
    clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
    if (cc_shadowLPNNInfo.y > 0.000001) {
      float closestDepth = dot(texture2D(cc_spotLightingMap, vec2(clipPos.x - offsetx, clipPos.y - offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = dot(texture2D(cc_spotLightingMap, vec2(clipPos.x - offsetx, clipPos.y + offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = dot(texture2D(cc_spotLightingMap, vec2(clipPos.x, clipPos.y)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = dot(texture2D(cc_spotLightingMap, vec2(clipPos.x + offsetx, clipPos.y - offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = dot(texture2D(cc_spotLightingMap, vec2(clipPos.x + offsetx, clipPos.y + offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
    } else {
      float closestDepth = texture2D(cc_spotLightingMap, vec2(clipPos.x - offsetx, clipPos.y - offsety)).x;
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = texture2D(cc_spotLightingMap, vec2(clipPos.x - offsetx, clipPos.y + offsety)).x;
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = texture2D(cc_spotLightingMap, vec2(clipPos.x, clipPos.y)).x;
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = texture2D(cc_spotLightingMap, vec2(clipPos.x + offsetx, clipPos.y - offsety)).x;
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = texture2D(cc_spotLightingMap, vec2(clipPos.x + offsetx, clipPos.y + offsety)).x;
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
    }
    return shadow / 5.0;
  }
  float CCGetDirLightShadowFactorX9 (vec4 shadowPos, vec3 worldPos) {
    vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
    if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
        clipPos.y < 0.0 || clipPos.y > 1.0 ||
        clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
    float offsetx = 1.0 / cc_shadowWHPBInfo.x;
    float offsety = 1.0 / cc_shadowWHPBInfo.y;
    float shadow = 0.0;
    float depth = 0.0;
    if (cc_shadowNFLSInfo.z > 0.000001) {
      depth = CCGetLinearDepth(worldPos);
    } else {
      depth = clipPos.z;
    }
    clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
    if (cc_shadowLPNNInfo.y > 0.000001) {
      for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
          float closestDepth = dot(texture2D(cc_spotLightingMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
          shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
        }
      }
    } else {
      for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
          float closestDepth = texture2D(cc_spotLightingMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)).x;
          shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
        }
      }
    }
    return shadow / 9.0;
  }
  float CCGetDirLightShadowFactorX25 (vec4 shadowPos, vec3 worldPos) {
    vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
    if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
        clipPos.y < 0.0 || clipPos.y > 1.0 ||
        clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
    float offsetx = 1.0 / cc_shadowWHPBInfo.x;
    float offsety = 1.0 / cc_shadowWHPBInfo.y;
    float depth = 0.0;
    float shadow = 0.0;
    if (cc_shadowNFLSInfo.z > 0.000001) {
      depth = CCGetLinearDepth(worldPos);
    } else {
      depth = clipPos.z;
    }
    clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
    if (cc_shadowLPNNInfo.y > 0.000001) {
      for (int i = -2; i <= 2; i++) {
        for (int j = -2; j <= 2; j++) {
          float closestDepth = dot(texture2D(cc_spotLightingMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
        }
      }
    } else {
      for (int i = -2; i <= 2; i++) {
        for (int j = -2; j <= 2; j++) {
          float closestDepth = texture2D(cc_spotLightingMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)).x;
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
        }
      }
    }
    return shadow / 25.0;
  }
#endif
#if CC_USE_IBL
  uniform samplerCube cc_environment;
  vec3 unpackRGBE (vec4 rgbe) {
    return rgbe.rgb * pow(2.0, rgbe.a * 255.0 - 128.0);
  }
  vec4 fragTextureLod (sampler2D tex, vec2 coord, float lod) {
      #ifdef GL_EXT_shader_texture_lod
        return texture2DLodEXT(tex, coord, lod);
      #else
        return texture2D(tex, coord, lod);
      #endif
  }
  vec4 fragTextureLod (samplerCube tex, vec3 coord, float lod) {
      #ifdef GL_EXT_shader_texture_lod
        return textureCubeLodEXT(tex, coord, lod);
      #else
        return textureCube(tex, coord, lod);
      #endif
  }
#endif
float GGXMobile (float roughness, float NoH, vec3 H, vec3 N) {
  vec3 NxH = cross(N, H);
  float OneMinusNoHSqr = dot(NxH, NxH);
  float a = roughness * roughness;
  float n = NoH * a;
  float p = a / (OneMinusNoHSqr + n * n);
  return p * p;
}
float CalcSpecular (float roughness, float NoH, vec3 H, vec3 N) {
  return (roughness * 0.25 + 0.25) * GGXMobile(roughness, NoH, H, N);
}
vec3 BRDFApprox (vec3 specular, float roughness, float NoV) {
  const vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
  const vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
  vec4 r = roughness * c0 + c1;
  float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
  vec2 AB = vec2(-1.04, 1.04) * a004 + r.zw;
  AB.y *= clamp(50.0 * specular.g, 0.0, 1.0);
  return specular * AB.x + AB.y;
}
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
vec4 CCStandardShadingBase (StandardSurface s, vec4 shadowPos) {
  vec3 diffuse = s.albedo.rgb * (1.0 - s.metallic);
  vec3 specular = mix(vec3(0.04), s.albedo.rgb, s.metallic);
  vec3 N = normalize(s.normal);
  vec3 V = normalize(cc_cameraPos.xyz - s.position);
  float NV = max(abs(dot(N, V)), 0.001);
  specular = BRDFApprox(specular, s.roughness, NV);
  vec3 L = normalize(-cc_mainLitDir.xyz);
  vec3 H = normalize(L + V);
  float NH = max(dot(N, H), 0.0);
  float NL = max(dot(N, L), 0.001);
  vec3 finalColor = NL * cc_mainLitColor.rgb * cc_mainLitColor.w;
  vec3 diffuseContrib = diffuse;
  #if USE_LIGHTMAP && !USE_BATCHING && !CC_FORWARD_ADD
    if (s.lightmap_test > 0.0001) {
      finalColor = s.lightmap.rgb;
    }
  #else
    diffuseContrib /= 3.14159265359;
  #endif
  vec3 specularContrib = specular * CalcSpecular(s.roughness, NH, H, N);
  finalColor *= (diffuseContrib + specularContrib);
  float fAmb = 0.5 - N.y * 0.5;
  vec3 ambDiff = mix(cc_ambientSky.rgb, cc_ambientGround.rgb, fAmb) * cc_ambientSky.w;
  finalColor += (ambDiff.rgb * diffuse);
  #if CC_USE_IBL
    vec3 R = normalize(reflect(-V, N));
    vec4 envmap = fragTextureLod(cc_environment, R, s.roughness * cc_ambientGround.w);
    #if CC_USE_IBL == 2
      vec3 env = unpackRGBE(envmap);
    #else
      vec3 env = SRGBToLinear(envmap.rgb);
    #endif
    finalColor += env * cc_ambientSky.w * specular;
  #endif
  finalColor = finalColor * s.occlusion;
  #if CC_USE_HDR
    s.emissive *= cc_exposure.w;
  #endif
  finalColor += s.emissive;
  #if CC_RECEIVE_SHADOW
    {
      float pcf = cc_shadowWHPBInfo.z + 0.001;
      float shadowAttenuation = 0.0;
      float cosAngle = clamp(1.0 - dot(N, L.xyz), 0.0, 1.0);
      vec3 projWorldPos = shadowPos.xyz + cosAngle * cc_shadowLPNNInfo.z * N;
      vec4 pos = vec4(projWorldPos.xyz, shadowPos.w);
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
  #endif
  return vec4(finalColor, s.albedo.a);
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
varying highp vec4 v_shadowPos;
#if USE_LIGHTMAP && !USE_BATCHING && !CC_FORWARD_ADD
  varying vec3 v_luv;
  uniform sampler2D cc_lightingMap;
  vec3 UnpackLightingmap(vec4 color) {
    vec3 c;
    float e = 1.0 + color.a * (8.0 - 1.0);
    c.r = color.r * e;
    c.g = color.g * e;
    c.b = color.b * e;
    return c;
  }
#endif
varying vec3 v_position;
varying vec2 v_uv;
varying vec2 v_uv1;
varying vec3 v_normal;
#if USE_VERTEX_COLOR
  varying vec4 v_color;
#endif
#if USE_ALBEDO_MAP
  uniform sampler2D albedoMap;
#endif
#if USE_NORMAL_MAP
  varying vec3 v_tangent;
  varying vec3 v_bitangent;
  uniform sampler2D normalMap;
#endif
#if USE_PBR_MAP
  uniform sampler2D pbrMap;
#endif
#if USE_METALLIC_ROUGHNESS_MAP
  uniform sampler2D metallicRoughnessMap;
#endif
#if USE_OCCLUSION_MAP
  uniform sampler2D occlusionMap;
#endif
#if USE_EMISSIVE_MAP
  uniform sampler2D emissiveMap;
#endif
#if USE_ALPHA_TEST
#endif
void surf (out StandardSurface s) {
  vec4 baseColor = albedo;
  #if USE_VERTEX_COLOR
    baseColor *= v_color;
  #endif
  #if USE_ALBEDO_MAP
    vec4 texColor = texture2D(albedoMap, ALBEDO_UV);
    texColor.rgb = SRGBToLinear(texColor.rgb);
    baseColor *= texColor;
  #endif
  s.albedo = baseColor;
  s.albedo.rgb *= albedoScaleAndCutoff.xyz;
  #if USE_ALPHA_TEST
    if (s.albedo.ALPHA_TEST_CHANNEL < albedoScaleAndCutoff.w) discard;
  #endif
  #if USE_LIGHTMAP && !USE_BATCHING && !CC_FORWARD_ADD
    vec4 lightColor = texture2D(cc_lightingMap, v_luv.xy);
    s.lightmap = UnpackLightingmap(lightColor);
    s.lightmap_test = v_luv.z;
  #endif
  s.normal = v_normal;
  #if USE_NORMAL_MAP
    vec3 nmmp = texture2D(normalMap, NORMAL_UV).xyz - vec3(0.5);
    s.normal =
      (nmmp.x * pbrParams.w) * normalize(v_tangent) +
      (nmmp.y * pbrParams.w) * normalize(v_bitangent) +
      nmmp.z * normalize(s.normal);
  #endif
  s.position = v_position;
  vec4 pbr = pbrParams;
  #if USE_PBR_MAP
    vec4 res = texture2D(pbrMap, PBR_UV);
    pbr.x *= res.r;
    pbr.y *= res.g;
    pbr.z *= res.b;
  #endif
  #if USE_METALLIC_ROUGHNESS_MAP
    vec4 metallicRoughness = texture2D(metallicRoughnessMap, PBR_UV);
    pbr.z *= metallicRoughness.b;
    pbr.y *= metallicRoughness.g;
  #endif
  #if USE_OCCLUSION_MAP
    pbr.x *= texture2D(occlusionMap, PBR_UV).r;
  #endif
  s.occlusion = clamp(pbr.x, 0.0, 0.96);
  s.roughness = clamp(pbr.y, 0.04, 1.0);
  s.metallic = pbr.z;
  s.emissive = emissive.rgb * emissiveScaleParam.xyz;
  #if USE_EMISSIVE_MAP
    s.emissive *= SRGBToLinear(texture2D(emissiveMap, EMISSIVE_UV).rgb);
  #endif
}
#if CC_FORWARD_ADD
  #if CC_PIPELINE_TYPE == 0
  # define LIGHTS_PER_PASS 1
  #else
  # define LIGHTS_PER_PASS 10
  #endif
  uniform highp vec4 cc_lightPos[LIGHTS_PER_PASS];
  uniform vec4 cc_lightColor[LIGHTS_PER_PASS];
  uniform vec4 cc_lightSizeRangeAngle[LIGHTS_PER_PASS];
  uniform vec4 cc_lightDir[LIGHTS_PER_PASS];
  float SmoothDistAtt (float distSqr, float invSqrAttRadius) {
    float factor = distSqr * invSqrAttRadius;
    float smoothFactor = clamp(1.0 - factor * factor, 0.0, 1.0);
    return smoothFactor * smoothFactor;
  }
  float GetDistAtt (float distSqr, float invSqrAttRadius) {
    float attenuation = 1.0 / max(distSqr, 0.01*0.01);
    attenuation *= SmoothDistAtt(distSqr , invSqrAttRadius);
    return attenuation;
  }
  float GetAngleAtt (vec3 L, vec3 litDir, float litAngleScale, float litAngleOffset) {
    float cd = dot(litDir, L);
    float attenuation = clamp(cd * litAngleScale + litAngleOffset, 0.0, 1.0);
    return (attenuation * attenuation);
  }
  vec4 CCStandardShadingAdditive (StandardSurface s, vec4 shadowPos) {
    vec3 diffuse = s.albedo.rgb * (1.0 - s.metallic);
    vec3 specular = mix(vec3(0.04), s.albedo.rgb, s.metallic);
    vec3 diffuseContrib = diffuse / 3.14159265359;
    vec3 N = normalize(s.normal);
    vec3 V = normalize(cc_cameraPos.xyz - s.position);
    float NV = max(abs(dot(N, V)), 0.001);
    specular = BRDFApprox(specular, s.roughness, NV);
    vec3 finalColor = vec3(0.0);
    int numLights = CC_PIPELINE_TYPE == 0 ? LIGHTS_PER_PASS : int(cc_lightDir[0].w);
    for (int i = 0; i < LIGHTS_PER_PASS; i++) {
      if (i >= numLights) break;
      vec3 SLU = cc_lightPos[i].xyz - s.position;
      vec3 SL = normalize(SLU);
      vec3 SH = normalize(SL + V);
      float SNL = max(dot(N, SL), 0.001);
      float SNH = max(dot(N, SH), 0.0);
      float distSqr = dot(SLU, SLU);
      float litRadius = cc_lightSizeRangeAngle[i].x;
      float litRadiusSqr = litRadius * litRadius;
      float illum = 3.14159265359 * (litRadiusSqr / max(litRadiusSqr , distSqr));
      float attRadiusSqrInv = 1.0 / max(cc_lightSizeRangeAngle[i].y, 0.01);
      attRadiusSqrInv *= attRadiusSqrInv;
      float att = GetDistAtt(distSqr, attRadiusSqrInv);
      vec3 lspec = specular * CalcSpecular(s.roughness, SNH, SH, N);
      if (cc_lightPos[i].w > 0.0) {
        float cosInner = max(dot(-cc_lightDir[i].xyz, SL), 0.01);
        float cosOuter = cc_lightSizeRangeAngle[i].z;
        float litAngleScale = 1.0 / max(0.001, cosInner - cosOuter);
        float litAngleOffset = -cosOuter * litAngleScale;
        att *= GetAngleAtt(SL, -cc_lightDir[i].xyz, litAngleScale, litAngleOffset);
      }
      vec3 lightColor = cc_lightColor[i].rgb;
      #if CC_RECEIVE_SHADOW
        if (cc_lightPos[i].w > 0.0) {
          {
            float pcf = cc_shadowWHPBInfo.z + 0.001;
            float shadowAttenuation = 0.0;
            float cosAngle = clamp(1.0 - dot(N, normalize(cc_lightPos[i].xyz - s.position.xyz)), 0.0, 1.0);
            vec3 projWorldPos = shadowPos.xyz + cosAngle * cc_shadowLPNNInfo.z * N;
            vec4 pos = vec4(projWorldPos.xyz, shadowPos.w);
            if (pcf > 3.0) shadowAttenuation = CCGetDirLightShadowFactorX25(pos, s.position);
            else if (pcf > 2.0) shadowAttenuation = CCGetDirLightShadowFactorX9(pos, s.position);
            else if (pcf > 1.0) shadowAttenuation = CCGetDirLightShadowFactorX5(pos, s.position);
            else shadowAttenuation = CCGetDirLightShadowFactorX1(pos, s.position);
            lightColor *= 1.0 - shadowAttenuation;
          }
        }
      #endif
      finalColor += SNL * lightColor * cc_lightColor[i].w * illum * att * (diffuseContrib + lspec);
    }
    finalColor = finalColor * s.occlusion;
    return vec4(finalColor, 0.0);
  }
  void main () {
    StandardSurface s; surf(s);
    vec4 color = CCStandardShadingAdditive(s, v_shadowPos);
    color = vec4(mix(CC_FORWARD_ADD > 0 ? vec3(0.0) : cc_fogColor.rgb, color.rgb, v_fog_factor), color.a);
    gl_FragData[0] = CCFragOutput(color);
  }
#elif CC_PIPELINE_TYPE == 0
  void main () {
    StandardSurface s; surf(s);
    vec4 color = CCStandardShadingBase(s, v_shadowPos);
    color = vec4(mix(CC_FORWARD_ADD > 0 ? vec3(0.0) : cc_fogColor.rgb, color.rgb, v_fog_factor), color.a);
    gl_FragData[0] = CCFragOutput(color);
  }
#elif CC_PIPELINE_TYPE == 1
  void main () {
    StandardSurface s; surf(s);
    gl_FragData[0] = s.albedo;
    gl_FragData[1] = vec4(s.position, s.roughness);
    gl_FragData[2] = vec4(s.normal, s.metallic);
    gl_FragData[3] = vec4(s.emissive, s.occlusion);
  }
#endif
*/
/*
fact do glsl source: 
#define CC_PIPELINE_TYPE 0
#define USE_ALPHA_TEST 0
#define USE_EMISSIVE_MAP 0
#define USE_OCCLUSION_MAP 0
#define USE_METALLIC_ROUGHNESS_MAP 0
#define USE_PBR_MAP 0
#define USE_ALBEDO_MAP 0
#define CC_USE_HDR 0
#define CC_USE_IBL 0
#define SAMPLE_FROM_RT 0
#define HAS_SECOND_UV 0
#define USE_NORMAL_MAP 0
#define USE_VERTEX_COLOR 0
#define CC_RECEIVE_SHADOW 1
#define CC_FORWARD_ADD 0
#define CC_USE_FOG 0
#define USE_LIGHTMAP 0
#define USE_BATCHING 0
#define USE_INSTANCING 0
#define CC_USE_BAKED_ANIMATION 0
#define CC_USE_SKINNING 0
#define CC_MORPH_TARGET_HAS_TANGENT 0
#define CC_MORPH_TARGET_HAS_NORMAL 0
#define CC_MORPH_TARGET_HAS_POSITION 0
#define CC_MORPH_PRECOMPUTED 0
#define CC_MORPH_TARGET_COUNT 2
#define CC_USE_MORPH 0
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 59
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 216
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define ALPHA_TEST_CHANNEL a
#define EMISSIVE_UV v_uv
#define PBR_UV v_uv
#define NORMAL_UV v_uv
#define ALBEDO_UV v_uv

precision highp float;
uniform highp vec4 cc_cameraPos;
  uniform mediump vec4 cc_exposure;
  uniform mediump vec4 cc_mainLitDir;
  uniform mediump vec4 cc_mainLitColor;
  uniform mediump vec4 cc_ambientSky;
  uniform mediump vec4 cc_ambientGround;
  uniform mediump vec4 cc_fogColor;
     uniform vec4 albedo;
     uniform vec4 albedoScaleAndCutoff;
     uniform vec4 pbrParams;
     uniform vec4 emissive;
     uniform vec4 emissiveScaleParam;
varying float v_fog_factor;
vec3 SRGBToLinear (vec3 gamma) {
  return gamma * gamma;
}
uniform highp mat4 cc_matLightView;
  uniform lowp vec4 cc_shadowNFLSInfo;
  uniform lowp vec4 cc_shadowWHPBInfo;
  uniform lowp vec4 cc_shadowLPNNInfo;
  uniform lowp vec4 cc_shadowColor;
  uniform sampler2D cc_shadowMap;
  uniform sampler2D cc_spotLightingMap;
  float CCGetLinearDepth (vec3 worldPos) {
    vec4 viewStartPos = cc_matLightView * vec4(worldPos.xyz, 1.0);
    float dist = length(viewStartPos.xyz);
    return cc_shadowNFLSInfo.x + (-dist / (cc_shadowNFLSInfo.y - cc_shadowNFLSInfo.x));
  }
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
  float CCGetDirLightShadowFactorX1 (vec4 shadowPos, vec3 worldPos) {
    vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
    if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
        clipPos.y < 0.0 || clipPos.y > 1.0 ||
        clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
    float shadow = 0.0;
    float closestDepth = 0.0;
    float depth = 0.0;
    clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
    if (cc_shadowNFLSInfo.z > 0.000001) {
      depth = CCGetLinearDepth(worldPos);
    } else {
      depth = clipPos.z;
    }
    if (cc_shadowLPNNInfo.y > 0.000001) {
      closestDepth = dot(texture2D(cc_spotLightingMap, clipPos.xy), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
    } else {
      closestDepth = texture2D(cc_spotLightingMap, clipPos.xy).x;
    }
    shadow = step(closestDepth, depth - cc_shadowWHPBInfo.w);
    return shadow;
  }
  float CCGetDirLightShadowFactorX5 (vec4 shadowPos, vec3 worldPos) {
    vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
    if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
        clipPos.y < 0.0 || clipPos.y > 1.0 ||
        clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
    float offsetx = 1.0 / cc_shadowWHPBInfo.x;
    float offsety = 1.0 / cc_shadowWHPBInfo.y;
    float shadow = 0.0;
    float depth = 0.0;
    if (cc_shadowNFLSInfo.z > 0.000001) {
      depth = CCGetLinearDepth(worldPos);
    } else {
      depth = clipPos.z;
    }
    clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
    if (cc_shadowLPNNInfo.y > 0.000001) {
      float closestDepth = dot(texture2D(cc_spotLightingMap, vec2(clipPos.x - offsetx, clipPos.y - offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = dot(texture2D(cc_spotLightingMap, vec2(clipPos.x - offsetx, clipPos.y + offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = dot(texture2D(cc_spotLightingMap, vec2(clipPos.x, clipPos.y)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = dot(texture2D(cc_spotLightingMap, vec2(clipPos.x + offsetx, clipPos.y - offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = dot(texture2D(cc_spotLightingMap, vec2(clipPos.x + offsetx, clipPos.y + offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
    } else {
      float closestDepth = texture2D(cc_spotLightingMap, vec2(clipPos.x - offsetx, clipPos.y - offsety)).x;
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = texture2D(cc_spotLightingMap, vec2(clipPos.x - offsetx, clipPos.y + offsety)).x;
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = texture2D(cc_spotLightingMap, vec2(clipPos.x, clipPos.y)).x;
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = texture2D(cc_spotLightingMap, vec2(clipPos.x + offsetx, clipPos.y - offsety)).x;
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
      closestDepth = texture2D(cc_spotLightingMap, vec2(clipPos.x + offsetx, clipPos.y + offsety)).x;
      shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
    }
    return shadow / 5.0;
  }
  float CCGetDirLightShadowFactorX9 (vec4 shadowPos, vec3 worldPos) {
    vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
    if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
        clipPos.y < 0.0 || clipPos.y > 1.0 ||
        clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
    float offsetx = 1.0 / cc_shadowWHPBInfo.x;
    float offsety = 1.0 / cc_shadowWHPBInfo.y;
    float shadow = 0.0;
    float depth = 0.0;
    if (cc_shadowNFLSInfo.z > 0.000001) {
      depth = CCGetLinearDepth(worldPos);
    } else {
      depth = clipPos.z;
    }
    clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
    if (cc_shadowLPNNInfo.y > 0.000001) {
      for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
          float closestDepth = dot(texture2D(cc_spotLightingMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
          shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
        }
      }
    } else {
      for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
          float closestDepth = texture2D(cc_spotLightingMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)).x;
          shadow += step(closestDepth, depth - cc_shadowWHPBInfo.w);
        }
      }
    }
    return shadow / 9.0;
  }
  float CCGetDirLightShadowFactorX25 (vec4 shadowPos, vec3 worldPos) {
    vec3 clipPos = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
    if (clipPos.x < 0.0 || clipPos.x > 1.0 ||
        clipPos.y < 0.0 || clipPos.y > 1.0 ||
        clipPos.z <-1.0 || clipPos.z > 1.0) { return 0.0; }
    float offsetx = 1.0 / cc_shadowWHPBInfo.x;
    float offsety = 1.0 / cc_shadowWHPBInfo.y;
    float depth = 0.0;
    float shadow = 0.0;
    if (cc_shadowNFLSInfo.z > 0.000001) {
      depth = CCGetLinearDepth(worldPos);
    } else {
      depth = clipPos.z;
    }
    clipPos.xy = cc_cameraPos.w == 1.0 ? vec2(clipPos.xy.x, 1.0 - clipPos.xy.y) : clipPos.xy;
    if (cc_shadowLPNNInfo.y > 0.000001) {
      for (int i = -2; i <= 2; i++) {
        for (int j = -2; j <= 2; j++) {
          float closestDepth = dot(texture2D(cc_spotLightingMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)), vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 160581375.0));
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
        }
      }
    } else {
      for (int i = -2; i <= 2; i++) {
        for (int j = -2; j <= 2; j++) {
          float closestDepth = texture2D(cc_spotLightingMap, clipPos.xy + vec2(i, j) * vec2(offsetx, offsety)).x;
          shadow += step(closestDepth, clipPos.z - cc_shadowWHPBInfo.w);
        }
      }
    }
    return shadow / 25.0;
  }
float GGXMobile (float roughness, float NoH, vec3 H, vec3 N) {
  vec3 NxH = cross(N, H);
  float OneMinusNoHSqr = dot(NxH, NxH);
  float a = roughness * roughness;
  float n = NoH * a;
  float p = a / (OneMinusNoHSqr + n * n);
  return p * p;
}
float CalcSpecular (float roughness, float NoH, vec3 H, vec3 N) {
  return (roughness * 0.25 + 0.25) * GGXMobile(roughness, NoH, H, N);
}
vec3 BRDFApprox (vec3 specular, float roughness, float NoV) {
  const vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
  const vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
  vec4 r = roughness * c0 + c1;
  float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
  vec2 AB = vec2(-1.04, 1.04) * a004 + r.zw;
  AB.y *= clamp(50.0 * specular.g, 0.0, 1.0);
  return specular * AB.x + AB.y;
}
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
vec4 CCStandardShadingBase (StandardSurface s, vec4 shadowPos) {
  vec3 diffuse = s.albedo.rgb * (1.0 - s.metallic);
  vec3 specular = mix(vec3(0.04), s.albedo.rgb, s.metallic);
  vec3 N = normalize(s.normal);
  vec3 V = normalize(cc_cameraPos.xyz - s.position);
  float NV = max(abs(dot(N, V)), 0.001);
  specular = BRDFApprox(specular, s.roughness, NV);
  vec3 L = normalize(-cc_mainLitDir.xyz);
  vec3 H = normalize(L + V);
  float NH = max(dot(N, H), 0.0);
  float NL = max(dot(N, L), 0.001);
  vec3 finalColor = NL * cc_mainLitColor.rgb * cc_mainLitColor.w;
  vec3 diffuseContrib = diffuse;
    diffuseContrib /= 3.14159265359;
  vec3 specularContrib = specular * CalcSpecular(s.roughness, NH, H, N);
  finalColor *= (diffuseContrib + specularContrib);
  float fAmb = 0.5 - N.y * 0.5;
  vec3 ambDiff = mix(cc_ambientSky.rgb, cc_ambientGround.rgb, fAmb) * cc_ambientSky.w;
  finalColor += (ambDiff.rgb * diffuse);
  finalColor = finalColor * s.occlusion;
  finalColor += s.emissive;
    {
      float pcf = cc_shadowWHPBInfo.z + 0.001;
      float shadowAttenuation = 0.0;
      float cosAngle = clamp(1.0 - dot(N, L.xyz), 0.0, 1.0);
      vec3 projWorldPos = shadowPos.xyz + cosAngle * cc_shadowLPNNInfo.z * N;
      vec4 pos = vec4(projWorldPos.xyz, shadowPos.w);
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
  return vec4(finalColor, s.albedo.a);
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
    color.rgb = sqrt(ACESToneMap(color.rgb));
  return color;
}
varying highp vec4 v_shadowPos;
varying vec3 v_position;
varying vec2 v_uv;
varying vec2 v_uv1;
varying vec3 v_normal;
void surf (out StandardSurface s) {
  vec4 baseColor = albedo;
  s.albedo = baseColor;
  s.albedo.rgb *= albedoScaleAndCutoff.xyz;
  s.normal = v_normal;
  s.position = v_position;
  vec4 pbr = pbrParams;
  s.occlusion = clamp(pbr.x, 0.0, 0.96);
  s.roughness = clamp(pbr.y, 0.04, 1.0);
  s.metallic = pbr.z;
  s.emissive = emissive.rgb * emissiveScaleParam.xyz;
}
  void main () {
    StandardSurface s; surf(s);
    vec4 color = CCStandardShadingBase(s, v_shadowPos);
    color = vec4(mix(CC_FORWARD_ADD > 0 ? vec3(0.0) : cc_fogColor.rgb, color.rgb, v_fog_factor), color.a);
    gl_FragData[0] = CCFragOutput(color);
  }
*/
import {
    vec4_V3_N,
    length_V3,
    vec2_N_N,
    texture2D_N_V2,
    vec4_N_N_N_N,
    dot_V4_V4,
    step_N_N,
    cross_V3_V3,
    dot_V3_V3,
    exp2_N,
    min_N_N,
    clamp_N_N_N,
    vec3_N,
    mix_V3_V3_N,
    normalize_V3,
    abs_N,
    max_N_N,
    min_V3_V3,
    sqrt_V3,
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
    glSet_V4_V4,
    glSet_V3_V3,
    glSet_V2_V2,
    glMul_V3_V3,
    glMul_M4_V4,
    glNegative_N,
    glSub_N_N,
    glDiv_N_N,
    glAdd_N_N,
    glDiv_V3_N,
    glMul_V3_N,
    glAdd_V3_N,
    glIsLess_N_N,
    glIsMore_N_N,
    glIsEqual_N_N,
    glAddSet_N_N,
    glIsLessEqual_N_N,
    glAfterAddSelf_N,
    glMul_V2_V2,
    glAdd_V2_V2,
    glMul_N_N,
    glMul_N_V4,
    glAdd_V4_V4,
    glMul_V2_N,
    glSet_Struct_Struct,
    glSub_V3_V3,
    glNegative_V3,
    glAdd_V3_V3,
    glMul_N_V3,
    glDivSet_V3_N,
    glMulSet_V3_V3,
    glAddSet_V3_V3,
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
let CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS = new FloatData(4095)
let CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS = new FloatData(1024)
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(216)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(59)
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
let CC_RECEIVE_SHADOW = new FloatData(1)
let USE_VERTEX_COLOR = new FloatData(0)
let USE_NORMAL_MAP = new FloatData(0)
let HAS_SECOND_UV = new FloatData(0)
let SAMPLE_FROM_RT = new FloatData(0)
let CC_USE_IBL = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
let USE_ALBEDO_MAP = new FloatData(0)
let USE_PBR_MAP = new FloatData(0)
let USE_METALLIC_ROUGHNESS_MAP = new FloatData(0)
let USE_OCCLUSION_MAP = new FloatData(0)
let USE_EMISSIVE_MAP = new FloatData(0)
let USE_ALPHA_TEST = new FloatData(0)
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
    v_shadowPos: Vec4Data = new Vec4Data()
    v_position: Vec3Data = new Vec3Data()
    v_uv: Vec2Data = new Vec2Data()
    v_uv1: Vec2Data = new Vec2Data()
    v_normal: Vec3Data = new Vec3Data()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([
        ["v_fog_factor", cpuRenderingContext.cachGameGl.FLOAT],
        ["v_shadowPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["v_position", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["v_uv", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["v_uv1", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["v_normal", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
    ])
    copy(varying: VaryingDataImpl) {
        glSet_N_N(varying.v_fog_factor, this.v_fog_factor)
        glSet_V4_V4(varying.v_shadowPos, this.v_shadowPos)
        glSet_V3_V3(varying.v_position, this.v_position)
        glSet_V2_V2(varying.v_uv, this.v_uv)
        glSet_V2_V2(varying.v_uv1, this.v_uv1)
        glSet_V3_V3(varying.v_normal, this.v_normal)
    }
}
class UniformDataImpl implements UniformData {
    cc_cameraPos: Vec4Data = new Vec4Data()
    cc_exposure: Vec4Data = new Vec4Data()
    cc_mainLitDir: Vec4Data = new Vec4Data()
    cc_mainLitColor: Vec4Data = new Vec4Data()
    cc_ambientSky: Vec4Data = new Vec4Data()
    cc_ambientGround: Vec4Data = new Vec4Data()
    cc_fogColor: Vec4Data = new Vec4Data()
    albedo: Vec4Data = new Vec4Data()
    albedoScaleAndCutoff: Vec4Data = new Vec4Data()
    pbrParams: Vec4Data = new Vec4Data()
    emissive: Vec4Data = new Vec4Data()
    emissiveScaleParam: Vec4Data = new Vec4Data()
    cc_matLightView: Mat4Data = new Mat4Data()
    cc_shadowNFLSInfo: Vec4Data = new Vec4Data()
    cc_shadowWHPBInfo: Vec4Data = new Vec4Data()
    cc_shadowLPNNInfo: Vec4Data = new Vec4Data()
    cc_shadowColor: Vec4Data = new Vec4Data()
    cc_shadowMap: Sampler2D = new Sampler2D()
    cc_spotLightingMap: Sampler2D = new Sampler2D()
    dataKeys: Map<string, any> = new Map([
        ["cc_cameraPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_exposure", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_mainLitDir", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_mainLitColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_ambientSky", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_ambientGround", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_fogColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["albedo", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["albedoScaleAndCutoff", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["pbrParams", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["emissive", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["emissiveScaleParam", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_matLightView", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_shadowNFLSInfo", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_shadowWHPBInfo", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_shadowLPNNInfo", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_shadowColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_shadowMap", cpuRenderingContext.cachGameGl.SAMPLER_2D],
        ["cc_spotLightingMap", cpuRenderingContext.cachGameGl.SAMPLER_2D],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_cameraPos", 1],
        ["cc_exposure", 1],
        ["cc_mainLitDir", 1],
        ["cc_mainLitColor", 1],
        ["cc_ambientSky", 1],
        ["cc_ambientGround", 1],
        ["cc_fogColor", 1],
        ["albedo", 1],
        ["albedoScaleAndCutoff", 1],
        ["pbrParams", 1],
        ["emissive", 1],
        ["emissiveScaleParam", 1],
        ["cc_matLightView", 1],
        ["cc_shadowNFLSInfo", 1],
        ["cc_shadowWHPBInfo", 1],
        ["cc_shadowLPNNInfo", 1],
        ["cc_shadowColor", 1],
        ["cc_shadowMap", 1],
        ["cc_spotLightingMap", 1],
    ])
}
export class Impl_15b83ec76b5b9d5c5cbf5e3ce8e4877b extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    SRGBToLinear_V3(__gamma__: Vec3Data): Vec3Data {
        let gamma: Vec3Data = vec3()
        glSet_V3_V3(gamma, __gamma__)

        return glMul_V3_V3(gamma, gamma)
    }
    CCGetLinearDepth_V3(__worldPos__: Vec3Data): FloatData {
        let worldPos: Vec3Data = vec3()
        glSet_V3_V3(worldPos, __worldPos__)

        let viewStartPos: Vec4Data = vec4()
        glSet_V4_V4(viewStartPos, glMul_M4_V4(this.uniformData.cc_matLightView, vec4_V3_N(worldPos.xyz, float_N(1.0))))
        let dist: FloatData = float()
        glSet_N_N(dist, length_V3(viewStartPos.xyz))
        return glAdd_N_N(
            float_N(this.uniformData.cc_shadowNFLSInfo.x),
            glDiv_N_N(
                glNegative_N(dist),
                glSub_N_N(float_N(this.uniformData.cc_shadowNFLSInfo.y), float_N(this.uniformData.cc_shadowNFLSInfo.x))
            )
        )
    }
    CCGetShadowFactorX1_V4(__shadowPos__: Vec4Data): FloatData {
        let shadowPos: Vec4Data = vec4()
        glSet_V4_V4(shadowPos, __shadowPos__)

        let clipPos: Vec3Data = vec3()
        glSet_V3_V3(clipPos, glAdd_V3_N(glMul_V3_N(glDiv_V3_N(shadowPos.xyz, float_N(shadowPos.w)), float_N(0.5)), float_N(0.5)))
        if (
            glIsLess_N_N(float_N(clipPos.x), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.x), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.y), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.y), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.z), glNegative_N(float_N(1.0))) ||
            glIsMore_N_N(float_N(clipPos.z), float_N(1.0))
        ) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            return float_N(0.0)
        }
        let shadow: FloatData = float()
        glSet_N_N(shadow, float_N(0.0))
        let closestDepth: FloatData = float()
        glSet_N_N(closestDepth, float_N(0.0))
        glSet_V2_V2(
            clipPos.xy,
            glIsEqual_N_N(float_N(this.uniformData.cc_cameraPos.w), float_N(1.0))
                ? vec2_N_N(float_N(clipPos.xy.x), glSub_N_N(float_N(1.0), float_N(clipPos.xy.y)))
                : clipPos.xy
        )
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowLPNNInfo.y), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(this.uniformData.cc_shadowMap, clipPos.xy),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            glSet_N_N(closestDepth, float_N(texture2D_N_V2(this.uniformData.cc_shadowMap, clipPos.xy).x))
        }
        glSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w))))
        return shadow
    }
    CCGetShadowFactorX5_V4(__shadowPos__: Vec4Data): FloatData {
        let shadowPos: Vec4Data = vec4()
        glSet_V4_V4(shadowPos, __shadowPos__)

        let clipPos: Vec3Data = vec3()
        glSet_V3_V3(clipPos, glAdd_V3_N(glMul_V3_N(glDiv_V3_N(shadowPos.xyz, float_N(shadowPos.w)), float_N(0.5)), float_N(0.5)))
        if (
            glIsLess_N_N(float_N(clipPos.x), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.x), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.y), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.y), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.z), glNegative_N(float_N(1.0))) ||
            glIsMore_N_N(float_N(clipPos.z), float_N(1.0))
        ) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            return float_N(0.0)
        }
        let offsetx: FloatData = float()
        glSet_N_N(offsetx, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.x)))
        let offsety: FloatData = float()
        glSet_N_N(offsety, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.y)))
        let shadow: FloatData = float()
        glSet_N_N(shadow, float_N(0.0))
        glSet_V2_V2(
            clipPos.xy,
            glIsEqual_N_N(float_N(this.uniformData.cc_cameraPos.w), float_N(1.0))
                ? vec2_N_N(float_N(clipPos.xy.x), glSub_N_N(float_N(1.0), float_N(clipPos.xy.y)))
                : clipPos.xy
        )
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowLPNNInfo.y), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            let closestDepth: FloatData = float()
            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(
                        this.uniformData.cc_shadowMap,
                        vec2_N_N(glSub_N_N(float_N(clipPos.x), offsetx), glSub_N_N(float_N(clipPos.y), offsety))
                    ),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(
                        this.uniformData.cc_shadowMap,
                        vec2_N_N(glSub_N_N(float_N(clipPos.x), offsetx), glAdd_N_N(float_N(clipPos.y), offsety))
                    ),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(this.uniformData.cc_shadowMap, vec2_N_N(float_N(clipPos.x), float_N(clipPos.y))),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(
                        this.uniformData.cc_shadowMap,
                        vec2_N_N(glAdd_N_N(float_N(clipPos.x), offsetx), glSub_N_N(float_N(clipPos.y), offsety))
                    ),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(
                        this.uniformData.cc_shadowMap,
                        vec2_N_N(glAdd_N_N(float_N(clipPos.x), offsetx), glAdd_N_N(float_N(clipPos.y), offsety))
                    ),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w))))
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            let closestDepth: FloatData = float()
            glSet_N_N(
                closestDepth,
                float_N(
                    texture2D_N_V2(
                        this.uniformData.cc_shadowMap,
                        vec2_N_N(glSub_N_N(float_N(clipPos.x), offsetx), glSub_N_N(float_N(clipPos.y), offsety))
                    ).x
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                float_N(
                    texture2D_N_V2(
                        this.uniformData.cc_shadowMap,
                        vec2_N_N(glSub_N_N(float_N(clipPos.x), offsetx), glAdd_N_N(float_N(clipPos.y), offsety))
                    ).x
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                float_N(texture2D_N_V2(this.uniformData.cc_shadowMap, vec2_N_N(float_N(clipPos.x), float_N(clipPos.y))).x)
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                float_N(
                    texture2D_N_V2(
                        this.uniformData.cc_shadowMap,
                        vec2_N_N(glAdd_N_N(float_N(clipPos.x), offsetx), glSub_N_N(float_N(clipPos.y), offsety))
                    ).x
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                float_N(
                    texture2D_N_V2(
                        this.uniformData.cc_shadowMap,
                        vec2_N_N(glAdd_N_N(float_N(clipPos.x), offsetx), glAdd_N_N(float_N(clipPos.y), offsety))
                    ).x
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w))))
        }
        return glDiv_N_N(shadow, float_N(5.0))
    }
    CCGetShadowFactorX9_V4(__shadowPos__: Vec4Data): FloatData {
        let shadowPos: Vec4Data = vec4()
        glSet_V4_V4(shadowPos, __shadowPos__)

        let clipPos: Vec3Data = vec3()
        glSet_V3_V3(clipPos, glAdd_V3_N(glMul_V3_N(glDiv_V3_N(shadowPos.xyz, float_N(shadowPos.w)), float_N(0.5)), float_N(0.5)))
        if (
            glIsLess_N_N(float_N(clipPos.x), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.x), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.y), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.y), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.z), glNegative_N(float_N(1.0))) ||
            glIsMore_N_N(float_N(clipPos.z), float_N(1.0))
        ) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            return float_N(0.0)
        }
        let offsetx: FloatData = float()
        glSet_N_N(offsetx, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.x)))
        let offsety: FloatData = float()
        glSet_N_N(offsety, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.y)))
        let shadow: FloatData = float()
        glSet_N_N(shadow, float_N(0.0))
        let closestDepth: FloatData = float()
        glSet_N_N(closestDepth, float_N(0.0))
        glSet_V2_V2(
            clipPos.xy,
            glIsEqual_N_N(float_N(this.uniformData.cc_cameraPos.w), float_N(1.0))
                ? vec2_N_N(float_N(clipPos.xy.x), glSub_N_N(float_N(1.0), float_N(clipPos.xy.y)))
                : clipPos.xy
        )
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowLPNNInfo.y), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            for (let i: IntData = glNegative_N(int_N(1)); glIsLessEqual_N_N(i, int_N(1)); glAfterAddSelf_N(i)) {
                let shadowPos: Vec4Data = vec4()
                glSet_V4_V4(shadowPos, __shadowPos__)

                for (let j: IntData = glNegative_N(int_N(1)); glIsLessEqual_N_N(j, int_N(1)); glAfterAddSelf_N(j)) {
                    let shadowPos: Vec4Data = vec4()
                    glSet_V4_V4(shadowPos, __shadowPos__)

                    let closestDepth: FloatData = float()
                    glSet_N_N(
                        closestDepth,
                        dot_V4_V4(
                            texture2D_N_V2(
                                this.uniformData.cc_shadowMap,
                                glAdd_V2_V2(clipPos.xy, glMul_V2_V2(vec2_N_N(i, j), vec2_N_N(offsetx, offsety)))
                            ),
                            vec4_N_N_N_N(
                                float_N(1.0),
                                glDiv_N_N(float_N(1.0), float_N(255.0)),
                                glDiv_N_N(float_N(1.0), float_N(65025.0)),
                                glDiv_N_N(float_N(1.0), float_N(160581375.0))
                            )
                        )
                    )
                    glAddSet_N_N(
                        shadow,
                        step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w)))
                    )
                }
            }
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            for (let i: IntData = glNegative_N(int_N(1)); glIsLessEqual_N_N(i, int_N(1)); glAfterAddSelf_N(i)) {
                let shadowPos: Vec4Data = vec4()
                glSet_V4_V4(shadowPos, __shadowPos__)

                for (let j: IntData = glNegative_N(int_N(1)); glIsLessEqual_N_N(j, int_N(1)); glAfterAddSelf_N(j)) {
                    let shadowPos: Vec4Data = vec4()
                    glSet_V4_V4(shadowPos, __shadowPos__)

                    let closestDepth: FloatData = float()
                    glSet_N_N(
                        closestDepth,
                        float_N(
                            texture2D_N_V2(
                                this.uniformData.cc_shadowMap,
                                glAdd_V2_V2(clipPos.xy, glMul_V2_V2(vec2_N_N(i, j), vec2_N_N(offsetx, offsety)))
                            ).x
                        )
                    )
                    glAddSet_N_N(
                        shadow,
                        step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w)))
                    )
                }
            }
        }
        return glDiv_N_N(shadow, float_N(9.0))
    }
    CCGetShadowFactorX25_V4(__shadowPos__: Vec4Data): FloatData {
        let shadowPos: Vec4Data = vec4()
        glSet_V4_V4(shadowPos, __shadowPos__)

        let clipPos: Vec3Data = vec3()
        glSet_V3_V3(clipPos, glAdd_V3_N(glMul_V3_N(glDiv_V3_N(shadowPos.xyz, float_N(shadowPos.w)), float_N(0.5)), float_N(0.5)))
        if (
            glIsLess_N_N(float_N(clipPos.x), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.x), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.y), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.y), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.z), glNegative_N(float_N(1.0))) ||
            glIsMore_N_N(float_N(clipPos.z), float_N(1.0))
        ) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            return float_N(0.0)
        }
        let offsetx: FloatData = float()
        glSet_N_N(offsetx, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.x)))
        let offsety: FloatData = float()
        glSet_N_N(offsety, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.y)))
        let shadow: FloatData = float()
        glSet_N_N(shadow, float_N(0.0))
        glSet_V2_V2(
            clipPos.xy,
            glIsEqual_N_N(float_N(this.uniformData.cc_cameraPos.w), float_N(1.0))
                ? vec2_N_N(float_N(clipPos.xy.x), glSub_N_N(float_N(1.0), float_N(clipPos.xy.y)))
                : clipPos.xy
        )
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowLPNNInfo.y), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            for (let i: IntData = glNegative_N(int_N(2)); glIsLessEqual_N_N(i, int_N(2)); glAfterAddSelf_N(i)) {
                let shadowPos: Vec4Data = vec4()
                glSet_V4_V4(shadowPos, __shadowPos__)

                for (let j: IntData = glNegative_N(int_N(2)); glIsLessEqual_N_N(j, int_N(2)); glAfterAddSelf_N(j)) {
                    let shadowPos: Vec4Data = vec4()
                    glSet_V4_V4(shadowPos, __shadowPos__)

                    let closestDepth: FloatData = float()
                    glSet_N_N(
                        closestDepth,
                        dot_V4_V4(
                            texture2D_N_V2(
                                this.uniformData.cc_shadowMap,
                                glAdd_V2_V2(clipPos.xy, glMul_V2_V2(vec2_N_N(i, j), vec2_N_N(offsetx, offsety)))
                            ),
                            vec4_N_N_N_N(
                                float_N(1.0),
                                glDiv_N_N(float_N(1.0), float_N(255.0)),
                                glDiv_N_N(float_N(1.0), float_N(65025.0)),
                                glDiv_N_N(float_N(1.0), float_N(160581375.0))
                            )
                        )
                    )
                    glAddSet_N_N(
                        shadow,
                        step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w)))
                    )
                }
            }
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            for (let i: IntData = glNegative_N(int_N(2)); glIsLessEqual_N_N(i, int_N(2)); glAfterAddSelf_N(i)) {
                let shadowPos: Vec4Data = vec4()
                glSet_V4_V4(shadowPos, __shadowPos__)

                for (let j: IntData = glNegative_N(int_N(2)); glIsLessEqual_N_N(j, int_N(2)); glAfterAddSelf_N(j)) {
                    let shadowPos: Vec4Data = vec4()
                    glSet_V4_V4(shadowPos, __shadowPos__)

                    let closestDepth: FloatData = float()
                    glSet_N_N(
                        closestDepth,
                        float_N(
                            texture2D_N_V2(
                                this.uniformData.cc_shadowMap,
                                glAdd_V2_V2(clipPos.xy, glMul_V2_V2(vec2_N_N(i, j), vec2_N_N(offsetx, offsety)))
                            ).x
                        )
                    )
                    glAddSet_N_N(
                        shadow,
                        step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w)))
                    )
                }
            }
        }
        return glDiv_N_N(shadow, float_N(25.0))
    }
    CCGetDirLightShadowFactorX1_V4_V3(__shadowPos__: Vec4Data, __worldPos__: Vec3Data): FloatData {
        let shadowPos: Vec4Data = vec4()
        glSet_V4_V4(shadowPos, __shadowPos__)
        let worldPos: Vec3Data = vec3()
        glSet_V3_V3(worldPos, __worldPos__)

        let clipPos: Vec3Data = vec3()
        glSet_V3_V3(clipPos, glAdd_V3_N(glMul_V3_N(glDiv_V3_N(shadowPos.xyz, float_N(shadowPos.w)), float_N(0.5)), float_N(0.5)))
        if (
            glIsLess_N_N(float_N(clipPos.x), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.x), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.y), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.y), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.z), glNegative_N(float_N(1.0))) ||
            glIsMore_N_N(float_N(clipPos.z), float_N(1.0))
        ) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            return float_N(0.0)
        }
        let shadow: FloatData = float()
        glSet_N_N(shadow, float_N(0.0))
        let closestDepth: FloatData = float()
        glSet_N_N(closestDepth, float_N(0.0))
        let depth: FloatData = float()
        glSet_N_N(depth, float_N(0.0))
        glSet_V2_V2(
            clipPos.xy,
            glIsEqual_N_N(float_N(this.uniformData.cc_cameraPos.w), float_N(1.0))
                ? vec2_N_N(float_N(clipPos.xy.x), glSub_N_N(float_N(1.0), float_N(clipPos.xy.y)))
                : clipPos.xy
        )
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowNFLSInfo.z), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            glSet_N_N(depth, this.CCGetLinearDepth_V3(worldPos))
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            glSet_N_N(depth, float_N(clipPos.z))
        }
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowLPNNInfo.y), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(this.uniformData.cc_spotLightingMap, clipPos.xy),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            glSet_N_N(closestDepth, float_N(texture2D_N_V2(this.uniformData.cc_spotLightingMap, clipPos.xy).x))
        }
        glSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
        return shadow
    }
    CCGetDirLightShadowFactorX5_V4_V3(__shadowPos__: Vec4Data, __worldPos__: Vec3Data): FloatData {
        let shadowPos: Vec4Data = vec4()
        glSet_V4_V4(shadowPos, __shadowPos__)
        let worldPos: Vec3Data = vec3()
        glSet_V3_V3(worldPos, __worldPos__)

        let clipPos: Vec3Data = vec3()
        glSet_V3_V3(clipPos, glAdd_V3_N(glMul_V3_N(glDiv_V3_N(shadowPos.xyz, float_N(shadowPos.w)), float_N(0.5)), float_N(0.5)))
        if (
            glIsLess_N_N(float_N(clipPos.x), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.x), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.y), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.y), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.z), glNegative_N(float_N(1.0))) ||
            glIsMore_N_N(float_N(clipPos.z), float_N(1.0))
        ) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            return float_N(0.0)
        }
        let offsetx: FloatData = float()
        glSet_N_N(offsetx, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.x)))
        let offsety: FloatData = float()
        glSet_N_N(offsety, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.y)))
        let shadow: FloatData = float()
        glSet_N_N(shadow, float_N(0.0))
        let depth: FloatData = float()
        glSet_N_N(depth, float_N(0.0))
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowNFLSInfo.z), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            glSet_N_N(depth, this.CCGetLinearDepth_V3(worldPos))
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            glSet_N_N(depth, float_N(clipPos.z))
        }
        glSet_V2_V2(
            clipPos.xy,
            glIsEqual_N_N(float_N(this.uniformData.cc_cameraPos.w), float_N(1.0))
                ? vec2_N_N(float_N(clipPos.xy.x), glSub_N_N(float_N(1.0), float_N(clipPos.xy.y)))
                : clipPos.xy
        )
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowLPNNInfo.y), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            let closestDepth: FloatData = float()
            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(
                        this.uniformData.cc_spotLightingMap,
                        vec2_N_N(glSub_N_N(float_N(clipPos.x), offsetx), glSub_N_N(float_N(clipPos.y), offsety))
                    ),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(
                        this.uniformData.cc_spotLightingMap,
                        vec2_N_N(glSub_N_N(float_N(clipPos.x), offsetx), glAdd_N_N(float_N(clipPos.y), offsety))
                    ),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(this.uniformData.cc_spotLightingMap, vec2_N_N(float_N(clipPos.x), float_N(clipPos.y))),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(
                        this.uniformData.cc_spotLightingMap,
                        vec2_N_N(glAdd_N_N(float_N(clipPos.x), offsetx), glSub_N_N(float_N(clipPos.y), offsety))
                    ),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                dot_V4_V4(
                    texture2D_N_V2(
                        this.uniformData.cc_spotLightingMap,
                        vec2_N_N(glAdd_N_N(float_N(clipPos.x), offsetx), glAdd_N_N(float_N(clipPos.y), offsety))
                    ),
                    vec4_N_N_N_N(
                        float_N(1.0),
                        glDiv_N_N(float_N(1.0), float_N(255.0)),
                        glDiv_N_N(float_N(1.0), float_N(65025.0)),
                        glDiv_N_N(float_N(1.0), float_N(160581375.0))
                    )
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            let closestDepth: FloatData = float()
            glSet_N_N(
                closestDepth,
                float_N(
                    texture2D_N_V2(
                        this.uniformData.cc_spotLightingMap,
                        vec2_N_N(glSub_N_N(float_N(clipPos.x), offsetx), glSub_N_N(float_N(clipPos.y), offsety))
                    ).x
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                float_N(
                    texture2D_N_V2(
                        this.uniformData.cc_spotLightingMap,
                        vec2_N_N(glSub_N_N(float_N(clipPos.x), offsetx), glAdd_N_N(float_N(clipPos.y), offsety))
                    ).x
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                float_N(texture2D_N_V2(this.uniformData.cc_spotLightingMap, vec2_N_N(float_N(clipPos.x), float_N(clipPos.y))).x)
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                float_N(
                    texture2D_N_V2(
                        this.uniformData.cc_spotLightingMap,
                        vec2_N_N(glAdd_N_N(float_N(clipPos.x), offsetx), glSub_N_N(float_N(clipPos.y), offsety))
                    ).x
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
            glSet_N_N(
                closestDepth,
                float_N(
                    texture2D_N_V2(
                        this.uniformData.cc_spotLightingMap,
                        vec2_N_N(glAdd_N_N(float_N(clipPos.x), offsetx), glAdd_N_N(float_N(clipPos.y), offsety))
                    ).x
                )
            )
            glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
        }
        return glDiv_N_N(shadow, float_N(5.0))
    }
    CCGetDirLightShadowFactorX9_V4_V3(__shadowPos__: Vec4Data, __worldPos__: Vec3Data): FloatData {
        let shadowPos: Vec4Data = vec4()
        glSet_V4_V4(shadowPos, __shadowPos__)
        let worldPos: Vec3Data = vec3()
        glSet_V3_V3(worldPos, __worldPos__)

        let clipPos: Vec3Data = vec3()
        glSet_V3_V3(clipPos, glAdd_V3_N(glMul_V3_N(glDiv_V3_N(shadowPos.xyz, float_N(shadowPos.w)), float_N(0.5)), float_N(0.5)))
        if (
            glIsLess_N_N(float_N(clipPos.x), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.x), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.y), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.y), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.z), glNegative_N(float_N(1.0))) ||
            glIsMore_N_N(float_N(clipPos.z), float_N(1.0))
        ) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            return float_N(0.0)
        }
        let offsetx: FloatData = float()
        glSet_N_N(offsetx, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.x)))
        let offsety: FloatData = float()
        glSet_N_N(offsety, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.y)))
        let shadow: FloatData = float()
        glSet_N_N(shadow, float_N(0.0))
        let depth: FloatData = float()
        glSet_N_N(depth, float_N(0.0))
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowNFLSInfo.z), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            glSet_N_N(depth, this.CCGetLinearDepth_V3(worldPos))
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            glSet_N_N(depth, float_N(clipPos.z))
        }
        glSet_V2_V2(
            clipPos.xy,
            glIsEqual_N_N(float_N(this.uniformData.cc_cameraPos.w), float_N(1.0))
                ? vec2_N_N(float_N(clipPos.xy.x), glSub_N_N(float_N(1.0), float_N(clipPos.xy.y)))
                : clipPos.xy
        )
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowLPNNInfo.y), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            for (let i: IntData = glNegative_N(int_N(1)); glIsLessEqual_N_N(i, int_N(1)); glAfterAddSelf_N(i)) {
                let shadowPos: Vec4Data = vec4()
                glSet_V4_V4(shadowPos, __shadowPos__)
                let worldPos: Vec3Data = vec3()
                glSet_V3_V3(worldPos, __worldPos__)

                for (let j: IntData = glNegative_N(int_N(1)); glIsLessEqual_N_N(j, int_N(1)); glAfterAddSelf_N(j)) {
                    let shadowPos: Vec4Data = vec4()
                    glSet_V4_V4(shadowPos, __shadowPos__)
                    let worldPos: Vec3Data = vec3()
                    glSet_V3_V3(worldPos, __worldPos__)

                    let closestDepth: FloatData = float()
                    glSet_N_N(
                        closestDepth,
                        dot_V4_V4(
                            texture2D_N_V2(
                                this.uniformData.cc_spotLightingMap,
                                glAdd_V2_V2(clipPos.xy, glMul_V2_V2(vec2_N_N(i, j), vec2_N_N(offsetx, offsety)))
                            ),
                            vec4_N_N_N_N(
                                float_N(1.0),
                                glDiv_N_N(float_N(1.0), float_N(255.0)),
                                glDiv_N_N(float_N(1.0), float_N(65025.0)),
                                glDiv_N_N(float_N(1.0), float_N(160581375.0))
                            )
                        )
                    )
                    glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
                }
            }
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            for (let i: IntData = glNegative_N(int_N(1)); glIsLessEqual_N_N(i, int_N(1)); glAfterAddSelf_N(i)) {
                let shadowPos: Vec4Data = vec4()
                glSet_V4_V4(shadowPos, __shadowPos__)
                let worldPos: Vec3Data = vec3()
                glSet_V3_V3(worldPos, __worldPos__)

                for (let j: IntData = glNegative_N(int_N(1)); glIsLessEqual_N_N(j, int_N(1)); glAfterAddSelf_N(j)) {
                    let shadowPos: Vec4Data = vec4()
                    glSet_V4_V4(shadowPos, __shadowPos__)
                    let worldPos: Vec3Data = vec3()
                    glSet_V3_V3(worldPos, __worldPos__)

                    let closestDepth: FloatData = float()
                    glSet_N_N(
                        closestDepth,
                        float_N(
                            texture2D_N_V2(
                                this.uniformData.cc_spotLightingMap,
                                glAdd_V2_V2(clipPos.xy, glMul_V2_V2(vec2_N_N(i, j), vec2_N_N(offsetx, offsety)))
                            ).x
                        )
                    )
                    glAddSet_N_N(shadow, step_N_N(closestDepth, glSub_N_N(depth, float_N(this.uniformData.cc_shadowWHPBInfo.w))))
                }
            }
        }
        return glDiv_N_N(shadow, float_N(9.0))
    }
    CCGetDirLightShadowFactorX25_V4_V3(__shadowPos__: Vec4Data, __worldPos__: Vec3Data): FloatData {
        let shadowPos: Vec4Data = vec4()
        glSet_V4_V4(shadowPos, __shadowPos__)
        let worldPos: Vec3Data = vec3()
        glSet_V3_V3(worldPos, __worldPos__)

        let clipPos: Vec3Data = vec3()
        glSet_V3_V3(clipPos, glAdd_V3_N(glMul_V3_N(glDiv_V3_N(shadowPos.xyz, float_N(shadowPos.w)), float_N(0.5)), float_N(0.5)))
        if (
            glIsLess_N_N(float_N(clipPos.x), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.x), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.y), float_N(0.0)) ||
            glIsMore_N_N(float_N(clipPos.y), float_N(1.0)) ||
            glIsLess_N_N(float_N(clipPos.z), glNegative_N(float_N(1.0))) ||
            glIsMore_N_N(float_N(clipPos.z), float_N(1.0))
        ) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            return float_N(0.0)
        }
        let offsetx: FloatData = float()
        glSet_N_N(offsetx, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.x)))
        let offsety: FloatData = float()
        glSet_N_N(offsety, glDiv_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowWHPBInfo.y)))
        let depth: FloatData = float()
        glSet_N_N(depth, float_N(0.0))
        let shadow: FloatData = float()
        glSet_N_N(shadow, float_N(0.0))
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowNFLSInfo.z), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            glSet_N_N(depth, this.CCGetLinearDepth_V3(worldPos))
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            glSet_N_N(depth, float_N(clipPos.z))
        }
        glSet_V2_V2(
            clipPos.xy,
            glIsEqual_N_N(float_N(this.uniformData.cc_cameraPos.w), float_N(1.0))
                ? vec2_N_N(float_N(clipPos.xy.x), glSub_N_N(float_N(1.0), float_N(clipPos.xy.y)))
                : clipPos.xy
        )
        if (glIsMore_N_N(float_N(this.uniformData.cc_shadowLPNNInfo.y), float_N(0.000001))) {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            for (let i: IntData = glNegative_N(int_N(2)); glIsLessEqual_N_N(i, int_N(2)); glAfterAddSelf_N(i)) {
                let shadowPos: Vec4Data = vec4()
                glSet_V4_V4(shadowPos, __shadowPos__)
                let worldPos: Vec3Data = vec3()
                glSet_V3_V3(worldPos, __worldPos__)

                for (let j: IntData = glNegative_N(int_N(2)); glIsLessEqual_N_N(j, int_N(2)); glAfterAddSelf_N(j)) {
                    let shadowPos: Vec4Data = vec4()
                    glSet_V4_V4(shadowPos, __shadowPos__)
                    let worldPos: Vec3Data = vec3()
                    glSet_V3_V3(worldPos, __worldPos__)

                    let closestDepth: FloatData = float()
                    glSet_N_N(
                        closestDepth,
                        dot_V4_V4(
                            texture2D_N_V2(
                                this.uniformData.cc_spotLightingMap,
                                glAdd_V2_V2(clipPos.xy, glMul_V2_V2(vec2_N_N(i, j), vec2_N_N(offsetx, offsety)))
                            ),
                            vec4_N_N_N_N(
                                float_N(1.0),
                                glDiv_N_N(float_N(1.0), float_N(255.0)),
                                glDiv_N_N(float_N(1.0), float_N(65025.0)),
                                glDiv_N_N(float_N(1.0), float_N(160581375.0))
                            )
                        )
                    )
                    glAddSet_N_N(
                        shadow,
                        step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w)))
                    )
                }
            }
        } else {
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)
            let worldPos: Vec3Data = vec3()
            glSet_V3_V3(worldPos, __worldPos__)

            for (let i: IntData = glNegative_N(int_N(2)); glIsLessEqual_N_N(i, int_N(2)); glAfterAddSelf_N(i)) {
                let shadowPos: Vec4Data = vec4()
                glSet_V4_V4(shadowPos, __shadowPos__)
                let worldPos: Vec3Data = vec3()
                glSet_V3_V3(worldPos, __worldPos__)

                for (let j: IntData = glNegative_N(int_N(2)); glIsLessEqual_N_N(j, int_N(2)); glAfterAddSelf_N(j)) {
                    let shadowPos: Vec4Data = vec4()
                    glSet_V4_V4(shadowPos, __shadowPos__)
                    let worldPos: Vec3Data = vec3()
                    glSet_V3_V3(worldPos, __worldPos__)

                    let closestDepth: FloatData = float()
                    glSet_N_N(
                        closestDepth,
                        float_N(
                            texture2D_N_V2(
                                this.uniformData.cc_spotLightingMap,
                                glAdd_V2_V2(clipPos.xy, glMul_V2_V2(vec2_N_N(i, j), vec2_N_N(offsetx, offsety)))
                            ).x
                        )
                    )
                    glAddSet_N_N(
                        shadow,
                        step_N_N(closestDepth, glSub_N_N(float_N(clipPos.z), float_N(this.uniformData.cc_shadowWHPBInfo.w)))
                    )
                }
            }
        }
        return glDiv_N_N(shadow, float_N(25.0))
    }
    GGXMobile_N_N_V3_V3(__roughness__: FloatData, __NoH__: FloatData, __H__: Vec3Data, __N__: Vec3Data): FloatData {
        let roughness: FloatData = float()
        glSet_N_N(roughness, __roughness__)
        let NoH: FloatData = float()
        glSet_N_N(NoH, __NoH__)
        let H: Vec3Data = vec3()
        glSet_V3_V3(H, __H__)
        let N: Vec3Data = vec3()
        glSet_V3_V3(N, __N__)

        let NxH: Vec3Data = vec3()
        glSet_V3_V3(NxH, cross_V3_V3(N, H))
        let OneMinusNoHSqr: FloatData = float()
        glSet_N_N(OneMinusNoHSqr, dot_V3_V3(NxH, NxH))
        let a: FloatData = float()
        glSet_N_N(a, glMul_N_N(roughness, roughness))
        let n: FloatData = float()
        glSet_N_N(n, glMul_N_N(NoH, a))
        let p: FloatData = float()
        glSet_N_N(p, glDiv_N_N(a, glAdd_N_N(OneMinusNoHSqr, glMul_N_N(n, n))))
        return glMul_N_N(p, p)
    }
    CalcSpecular_N_N_V3_V3(__roughness__: FloatData, __NoH__: FloatData, __H__: Vec3Data, __N__: Vec3Data): FloatData {
        let roughness: FloatData = float()
        glSet_N_N(roughness, __roughness__)
        let NoH: FloatData = float()
        glSet_N_N(NoH, __NoH__)
        let H: Vec3Data = vec3()
        glSet_V3_V3(H, __H__)
        let N: Vec3Data = vec3()
        glSet_V3_V3(N, __N__)

        return glMul_N_N(glAdd_N_N(glMul_N_N(roughness, float_N(0.25)), float_N(0.25)), this.GGXMobile_N_N_V3_V3(roughness, NoH, H, N))
    }
    BRDFApprox_V3_N_N(__specular__: Vec3Data, __roughness__: FloatData, __NoV__: FloatData): Vec3Data {
        let specular: Vec3Data = vec3()
        glSet_V3_V3(specular, __specular__)
        let roughness: FloatData = float()
        glSet_N_N(roughness, __roughness__)
        let NoV: FloatData = float()
        glSet_N_N(NoV, __NoV__)

        let c0: Vec4Data = vec4()
        glSet_V4_V4(
            c0,
            vec4_N_N_N_N(glNegative_N(float_N(1.0)), glNegative_N(float_N(0.0275)), glNegative_N(float_N(0.572)), float_N(0.022))
        )
        let c1: Vec4Data = vec4()
        glSet_V4_V4(c1, vec4_N_N_N_N(float_N(1.0), float_N(0.0425), float_N(1.04), glNegative_N(float_N(0.04))))
        let r: Vec4Data = vec4()
        glSet_V4_V4(r, glAdd_V4_V4(glMul_N_V4(roughness, c0), c1))
        let a004: FloatData = float()
        glSet_N_N(
            a004,
            glAdd_N_N(
                glMul_N_N(
                    min_N_N(glMul_N_N(float_N(r.x), float_N(r.x)), exp2_N(glMul_N_N(glNegative_N(float_N(9.28)), NoV))),
                    float_N(r.x)
                ),
                float_N(r.y)
            )
        )
        let AB: Vec2Data = vec2()
        glSet_V2_V2(AB, glAdd_V2_V2(glMul_V2_N(vec2_N_N(glNegative_N(float_N(1.04)), float_N(1.04)), a004), r.zw))
        AB.y *= clamp_N_N_N(glMul_N_N(float_N(50.0), float_N(specular.y)), float_N(0.0), float_N(1.0)).v
        return glAdd_V3_N(glMul_V3_N(specular, float_N(AB.x)), float_N(AB.y))
    }
    CCStandardShadingBase_StandardSurface_V4(__s__: StandardSurface, __shadowPos__: Vec4Data): Vec4Data {
        let s: StandardSurface = new StandardSurface()
        glSet_Struct_Struct(s, __s__)
        let shadowPos: Vec4Data = vec4()
        glSet_V4_V4(shadowPos, __shadowPos__)

        let diffuse: Vec3Data = vec3()
        glSet_V3_V3(diffuse, glMul_V3_N(s.albedo.xyz, glSub_N_N(float_N(1.0), s.metallic)))
        let specular: Vec3Data = vec3()
        glSet_V3_V3(specular, mix_V3_V3_N(vec3_N(float_N(0.04)), s.albedo.xyz, s.metallic))
        let N: Vec3Data = vec3()
        glSet_V3_V3(N, normalize_V3(s.normal))
        let V: Vec3Data = vec3()
        glSet_V3_V3(V, normalize_V3(glSub_V3_V3(this.uniformData.cc_cameraPos.xyz, s.position)))
        let NV: FloatData = float()
        glSet_N_N(NV, max_N_N(abs_N(dot_V3_V3(N, V)), float_N(0.001)))
        glSet_V3_V3(specular, this.BRDFApprox_V3_N_N(specular, s.roughness, NV))
        let L: Vec3Data = vec3()
        glSet_V3_V3(L, normalize_V3(glNegative_V3(this.uniformData.cc_mainLitDir.xyz)))
        let H: Vec3Data = vec3()
        glSet_V3_V3(H, normalize_V3(glAdd_V3_V3(L, V)))
        let NH: FloatData = float()
        glSet_N_N(NH, max_N_N(dot_V3_V3(N, H), float_N(0.0)))
        let NL: FloatData = float()
        glSet_N_N(NL, max_N_N(dot_V3_V3(N, L), float_N(0.001)))
        let finalColor: Vec3Data = vec3()
        glSet_V3_V3(
            finalColor,
            glMul_V3_N(glMul_N_V3(NL, this.uniformData.cc_mainLitColor.xyz), float_N(this.uniformData.cc_mainLitColor.w))
        )
        let diffuseContrib: Vec3Data = vec3()
        glSet_V3_V3(diffuseContrib, diffuse)
        glDivSet_V3_N(diffuseContrib, float_N(3.14159265359))
        let specularContrib: Vec3Data = vec3()
        glSet_V3_V3(specularContrib, glMul_V3_N(specular, this.CalcSpecular_N_N_V3_V3(s.roughness, NH, H, N)))
        glMulSet_V3_V3(finalColor, glAdd_V3_V3(diffuseContrib, specularContrib))
        let fAmb: FloatData = float()
        glSet_N_N(fAmb, glSub_N_N(float_N(0.5), glMul_N_N(float_N(N.y), float_N(0.5))))
        let ambDiff: Vec3Data = vec3()
        glSet_V3_V3(
            ambDiff,
            glMul_V3_N(
                mix_V3_V3_N(this.uniformData.cc_ambientSky.xyz, this.uniformData.cc_ambientGround.xyz, fAmb),
                float_N(this.uniformData.cc_ambientSky.w)
            )
        )
        glAddSet_V3_V3(finalColor, glMul_V3_V3(ambDiff.xyz, diffuse))
        glSet_V3_V3(finalColor, glMul_V3_N(finalColor, s.occlusion))
        glAddSet_V3_V3(finalColor, s.emissive)
        {
            let s: StandardSurface = new StandardSurface()
            glSet_Struct_Struct(s, __s__)
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            let pcf: FloatData = float()
            glSet_N_N(pcf, glAdd_N_N(float_N(this.uniformData.cc_shadowWHPBInfo.z), float_N(0.001)))
            let shadowAttenuation: FloatData = float()
            glSet_N_N(shadowAttenuation, float_N(0.0))
            let cosAngle: FloatData = float()
            glSet_N_N(cosAngle, clamp_N_N_N(glSub_N_N(float_N(1.0), dot_V3_V3(N, L.xyz)), float_N(0.0), float_N(1.0)))
            let projWorldPos: Vec3Data = vec3()
            glSet_V3_V3(
                projWorldPos,
                glAdd_V3_V3(shadowPos.xyz, glMul_N_V3(glMul_N_N(cosAngle, float_N(this.uniformData.cc_shadowLPNNInfo.z)), N))
            )
            let pos: Vec4Data = vec4()
            glSet_V4_V4(pos, vec4_V3_N(projWorldPos.xyz, float_N(shadowPos.w)))
            if (glIsMore_N_N(pcf, float_N(3.0))) {
                glSet_N_N(shadowAttenuation, this.CCGetShadowFactorX25_V4(pos))
            } else if (glIsMore_N_N(pcf, float_N(2.0))) {
                glSet_N_N(shadowAttenuation, this.CCGetShadowFactorX9_V4(pos))
            } else if (glIsMore_N_N(pcf, float_N(1.0))) {
                glSet_N_N(shadowAttenuation, this.CCGetShadowFactorX5_V4(pos))
            } else glSet_N_N(shadowAttenuation, this.CCGetShadowFactorX1_V4(pos))

            let shadowColor: Vec3Data = vec3()
            glSet_V3_V3(
                shadowColor,
                glAdd_V3_V3(
                    glMul_V3_N(this.uniformData.cc_shadowColor.xyz, float_N(this.uniformData.cc_shadowColor.w)),
                    glMul_V3_N(finalColor.xyz, glSub_N_N(float_N(1.0), float_N(this.uniformData.cc_shadowColor.w)))
                )
            )
            if (glIsMore_N_N(float_N(this.uniformData.cc_shadowNFLSInfo.w), float_N(0.000001))) {
                let s: StandardSurface = new StandardSurface()
                glSet_Struct_Struct(s, __s__)
                let shadowPos: Vec4Data = vec4()
                glSet_V4_V4(shadowPos, __shadowPos__)

                glSet_V3_V3(
                    finalColor.xyz,
                    glAdd_V3_V3(
                        glMul_V3_N(shadowColor.xyz, shadowAttenuation),
                        glMul_V3_N(finalColor.xyz, glSub_N_N(float_N(1.0), shadowAttenuation))
                    )
                )
            } else {
                let s: StandardSurface = new StandardSurface()
                glSet_Struct_Struct(s, __s__)
                let shadowPos: Vec4Data = vec4()
                glSet_V4_V4(shadowPos, __shadowPos__)

                glSet_V3_V3(
                    finalColor.xyz,
                    glAdd_V3_V3(
                        glMul_V3_N(glMul_V3_N(shadowColor.xyz, shadowAttenuation), NL),
                        glMul_V3_N(finalColor.xyz, glSub_N_N(float_N(1.0), glMul_N_N(shadowAttenuation, NL)))
                    )
                )
            }
        }
        return vec4_V3_N(finalColor, float_N(s.albedo.w))
    }
    ACESToneMap_V3(__color__: Vec3Data): Vec3Data {
        let color: Vec3Data = vec3()
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
        let color: Vec4Data = vec4()
        glSet_V4_V4(color, __color__)

        glSet_V3_V3(color.xyz, sqrt_V3(this.ACESToneMap_V3(color.out_xyz)))
        return color
    }
    surf_StandardSurface(s: StandardSurface): void {
        let baseColor: Vec4Data = vec4()
        glSet_V4_V4(baseColor, this.uniformData.albedo)
        glSet_V4_V4(s.albedo, baseColor)
        glMulSet_V3_V3(s.albedo.xyz, this.uniformData.albedoScaleAndCutoff.xyz)
        glSet_V3_V3(s.normal, this.varyingData.v_normal)
        glSet_V3_V3(s.position, this.varyingData.v_position)
        let pbr: Vec4Data = vec4()
        glSet_V4_V4(pbr, this.uniformData.pbrParams)
        glSet_N_N(s.occlusion, clamp_N_N_N(float_N(pbr.x), float_N(0.0), float_N(0.96)))
        glSet_N_N(s.roughness, clamp_N_N_N(float_N(pbr.y), float_N(0.04), float_N(1.0)))
        glSet_N_N(s.metallic, float_N(pbr.z))
        glSet_V3_V3(s.emissive, glMul_V3_V3(this.uniformData.emissive.xyz, this.uniformData.emissiveScaleParam.xyz))
    }
    main(): void {
        let s: StandardSurface = new StandardSurface()
        this.surf_StandardSurface(s)
        let color: Vec4Data = vec4()
        glSet_V4_V4(color, this.CCStandardShadingBase_StandardSurface_V4(s, this.varyingData.v_shadowPos))
        glSet_V4_V4(
            color,
            vec4_V3_N(
                mix_V3_V3_N(
                    glIsMore_N_N(CC_FORWARD_ADD, int_N(0)) ? vec3_N(float_N(0.0)) : this.uniformData.cc_fogColor.xyz,
                    color.xyz,
                    this.varyingData.v_fog_factor
                ),
                float_N(color.w)
            )
        )
        glSet_V4_V4(gl_FragData[int_N(0).v], this.CCFragOutput_V4(color))
    }
}
