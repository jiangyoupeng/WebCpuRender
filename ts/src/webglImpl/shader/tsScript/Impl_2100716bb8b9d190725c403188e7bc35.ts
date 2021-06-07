/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 219
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 62
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
#define CC_RECEIVE_SHADOW 1
#define USE_NORMAL_MAP 0
#define CC_FORWARD_ADD 1
#define CC_PIPELINE_TYPE 0
#define CC_USE_HDR 0
#define USE_BASE_COLOR_MAP 1
#define USE_1ST_SHADE_MAP 0
#define USE_2ND_SHADE_MAP 0
#define USE_SPECULAR_MAP 0
#define USE_EMISSIVE_MAP 0
#define USE_ALPHA_TEST 0
#define ALPHA_TEST_CHANNEL a
#define SHADE_MAP_1_AS_SHADE_MAP_2 0
#define BASE_COLOR_MAP_AS_SHADE_MAP_1 1
#define BASE_COLOR_MAP_AS_SHADE_MAP_2 1

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
  vec4 CCToonShading (ToonSurface s) {
    vec3 V = normalize(cc_cameraPos.xyz - s.position);
    vec3 N = normalize(s.normal);
    float specularWeight = 1.0 - pow(s.specular.a, 5.0);
    vec3 finalColor = vec3(0.0);
    for (int i = 0; i < LIGHTS_PER_PASS; i++) {
      vec3 SLU = cc_lightPos[i].xyz - s.position;
      vec3 SL = normalize(SLU);
      vec3 SH = normalize(SL + V);
      float SNL = 0.5 * dot(N, SL) + 0.5;
      float SNH = 0.5 * dot(N, SH) + 0.5;
      float distSqr = dot(SLU, SLU);
      float litRadius = cc_lightSizeRangeAngle[i].x;
      float litRadiusSqr = litRadius * litRadius;
      float illum = litRadiusSqr / max(litRadiusSqr , distSqr);
      float attRadiusSqrInv = 1.0 / max(cc_lightSizeRangeAngle[i].y, 0.01);
      attRadiusSqrInv *= attRadiusSqrInv;
      float att = GetDistAtt(distSqr, attRadiusSqrInv);
      vec3 diffuse = mix(s.shade1, s.shade2,
        clamp(1.0 + (s.shadeStep - s.shadeFeather - SNL) / s.shadeFeather, 0.0, 1.0));
      diffuse = mix(s.baseColor.rgb, diffuse,
        clamp(1.0 + (s.baseStep - s.baseFeather - SNL) / s.baseFeather, 0.0, 1.0));
      float specularMask = step(specularWeight, SNH);
      vec3 specular = s.specular.rgb * specularMask;
      if (cc_lightPos[i].w > 0.0) {
        float cosInner = max(dot(-cc_lightDir[i].xyz, SL), 0.01);
        float cosOuter = cc_lightSizeRangeAngle[i].z;
        float litAngleScale = 1.0 / max(0.001, cosInner - cosOuter);
        float litAngleOffset = -cosOuter * litAngleScale;
        att *= GetAngleAtt(SL, -cc_lightDir[i].xyz, litAngleScale, litAngleOffset);
      }
      finalColor += SNL * cc_lightColor[i].rgb * cc_lightColor[i].a * illum * att * s.baseStep * (diffuse + specular);
    }
    return vec4(finalColor, 0.0);
  }
#else
  #if CC_RECEIVE_SHADOW
    varying highp vec4 v_shadowPos;
    uniform lowp vec4 cc_shadowNFLSInfo;
  uniform lowp vec4 cc_shadowWHPBInfo;
  uniform lowp vec4 cc_shadowLPNNInfo;
  uniform lowp vec4 cc_shadowColor;
    #if CC_RECEIVE_SHADOW
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
    #endif
  #endif
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
    #if CC_USE_HDR
      s.emissive *= cc_exposure.w;
    #endif
    finalColor += s.emissive;
    #if CC_RECEIVE_SHADOW
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
    #endif
    return vec4(finalColor, s.baseColor.a);
  }
#endif
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
  #if !CC_USE_HDR
    color.rgb = sqrt(ACESToneMap(color.rgb));
  #endif
  return color;
}
varying vec3 v_position;
varying vec2 v_uv;
#if USE_BASE_COLOR_MAP
  uniform sampler2D baseColorMap;
#endif
varying vec3 v_normal;
#if USE_NORMAL_MAP
  varying vec3 v_tangent;
  varying vec3 v_bitangent;
  uniform sampler2D normalMap;
#endif
#if USE_1ST_SHADE_MAP
  uniform sampler2D shadeMap1;
#endif
#if USE_2ND_SHADE_MAP
  uniform sampler2D shadeMap2;
#endif
#if USE_SPECULAR_MAP
  uniform sampler2D specularMap;
#endif
#if USE_EMISSIVE_MAP
  uniform sampler2D emissiveMap;
#endif
#if USE_ALPHA_TEST
#endif
void surf (out ToonSurface s) {
  s.shade2 = shadeColor2.rgb * colorScaleAndCutoff.rgb;
  #if USE_2ND_SHADE_MAP
    s.shade2 *= SRGBToLinear(texture2D(shadeMap2, v_uv).rgb);
  #endif
  s.shade1 = shadeColor1.rgb * colorScaleAndCutoff.rgb;
  #if USE_1ST_SHADE_MAP
    s.shade1 *= SRGBToLinear(texture2D(shadeMap1, v_uv).rgb);
    #if SHADE_MAP_1_AS_SHADE_MAP_2
      s.shade2 *= s.shade1.rgb;
    #endif
  #endif
  vec4 baseColor = baseColor;
  #if USE_BASE_COLOR_MAP
    vec4 baseColorMap = texture2D(baseColorMap, v_uv);
    baseColorMap.rgb = SRGBToLinear(baseColorMap.rgb);
    baseColor *= baseColorMap;
    #if BASE_COLOR_MAP_AS_SHADE_MAP_1
      s.shade1 *= baseColorMap.rgb;
    #endif
    #if BASE_COLOR_MAP_AS_SHADE_MAP_2
      s.shade2 *= baseColorMap.rgb;
    #endif
  #endif
  s.baseColor = baseColor;
  s.baseColor.rgb *= colorScaleAndCutoff.xyz;
  #if USE_ALPHA_TEST
    if (s.baseColor.ALPHA_TEST_CHANNEL < colorScaleAndCutoff.w) discard;
  #endif
  s.normal = v_normal;
  #if USE_NORMAL_MAP
    vec3 nmmp = texture2D(normalMap, v_uv).xyz - vec3(0.5);
    s.normal =
      (nmmp.x * emissiveScaleAndStrenth.w) * normalize(v_tangent) +
      (nmmp.y * emissiveScaleAndStrenth.w) * normalize(v_bitangent) +
      nmmp.z * normalize(s.normal);
  #endif
  s.position = v_position;
  s.specular = specular;
  #if USE_SPECULAR_MAP
    s.specular.rgb *= SRGBToLinear(texture2D(specularMap, v_uv).rgb);
  #endif
  s.emissive = emissive.rgb * emissiveScaleAndStrenth.xyz;
  #if USE_EMISSIVE_MAP
    s.emissive *= SRGBToLinear(texture2D(emissiveMap, v_uv).rgb);
  #endif
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
void main() { gl_FragColor = frag(); }
*/
/*
fact do glsl source: 
#define LIGHTS_PER_PASS 1
#define BASE_COLOR_MAP_AS_SHADE_MAP_2 1
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
#define CC_FORWARD_ADD 1
#define USE_NORMAL_MAP 0
#define CC_RECEIVE_SHADOW 1
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
  vec4 CCToonShading (ToonSurface s) {
    vec3 V = normalize(cc_cameraPos.xyz - s.position);
    vec3 N = normalize(s.normal);
    float specularWeight = 1.0 - pow(s.specular.a, 5.0);
    vec3 finalColor = vec3(0.0);
    for (int i = 0; i < LIGHTS_PER_PASS; i++) {
      vec3 SLU = cc_lightPos[i].xyz - s.position;
      vec3 SL = normalize(SLU);
      vec3 SH = normalize(SL + V);
      float SNL = 0.5 * dot(N, SL) + 0.5;
      float SNH = 0.5 * dot(N, SH) + 0.5;
      float distSqr = dot(SLU, SLU);
      float litRadius = cc_lightSizeRangeAngle[i].x;
      float litRadiusSqr = litRadius * litRadius;
      float illum = litRadiusSqr / max(litRadiusSqr , distSqr);
      float attRadiusSqrInv = 1.0 / max(cc_lightSizeRangeAngle[i].y, 0.01);
      attRadiusSqrInv *= attRadiusSqrInv;
      float att = GetDistAtt(distSqr, attRadiusSqrInv);
      vec3 diffuse = mix(s.shade1, s.shade2,
        clamp(1.0 + (s.shadeStep - s.shadeFeather - SNL) / s.shadeFeather, 0.0, 1.0));
      diffuse = mix(s.baseColor.rgb, diffuse,
        clamp(1.0 + (s.baseStep - s.baseFeather - SNL) / s.baseFeather, 0.0, 1.0));
      float specularMask = step(specularWeight, SNH);
      vec3 specular = s.specular.rgb * specularMask;
      if (cc_lightPos[i].w > 0.0) {
        float cosInner = max(dot(-cc_lightDir[i].xyz, SL), 0.01);
        float cosOuter = cc_lightSizeRangeAngle[i].z;
        float litAngleScale = 1.0 / max(0.001, cosInner - cosOuter);
        float litAngleOffset = -cosOuter * litAngleScale;
        att *= GetAngleAtt(SL, -cc_lightDir[i].xyz, litAngleScale, litAngleOffset);
      }
      finalColor += SNL * cc_lightColor[i].rgb * cc_lightColor[i].a * illum * att * s.baseStep * (diffuse + specular);
    }
    return vec4(finalColor, 0.0);
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
void main() { gl_FragColor = frag(); }
*/
import {
    clamp_N_N_N,
    max_N_N,
    dot_V3_V3,
    normalize_V3,
    pow_N_N,
    vec3_N,
    mix_V3_V3_N,
    step_N_N,
    vec4_V3_N,
    min_V3_V3,
    sqrt_V3,
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
import {
    glSet_V3_V3,
    glSet_V2_V2,
    glSet_N_N,
    glMul_N_N,
    glSub_N_N,
    glDiv_N_N,
    glMulSet_N_N,
    glAdd_N_N,
    glSet_Struct_Struct,
    glSub_V3_V3,
    glIsLess_N_N,
    glAfterAddSelf_N,
    glAdd_V3_V3,
    glMul_V3_N,
    glIsMore_N_N,
    glNegative_V3,
    glNegative_N,
    glMul_N_V3,
    glMul_V3_V3,
    glAddSet_V3_V3,
    glAdd_V3_N,
    glDiv_V3_V3,
    glSet_V4_V4,
    glMulSet_V4_V4,
    glMulSet_V3_V3,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(219)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(62)
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
let CC_RECEIVE_SHADOW = new FloatData(1)
let USE_NORMAL_MAP = new FloatData(0)
let CC_FORWARD_ADD = new FloatData(1)
let CC_PIPELINE_TYPE = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
let USE_BASE_COLOR_MAP = new FloatData(1)
let USE_1ST_SHADE_MAP = new FloatData(0)
let USE_2ND_SHADE_MAP = new FloatData(0)
let USE_SPECULAR_MAP = new FloatData(0)
let USE_EMISSIVE_MAP = new FloatData(0)
let USE_ALPHA_TEST = new FloatData(0)
let SHADE_MAP_1_AS_SHADE_MAP_2 = new FloatData(0)
let BASE_COLOR_MAP_AS_SHADE_MAP_1 = new FloatData(1)
let BASE_COLOR_MAP_AS_SHADE_MAP_2 = new FloatData(1)
let LIGHTS_PER_PASS = new FloatData(1)
class ToonSurface implements StructData {
    baseColor: Vec4Data = vec4()
    specular: Vec4Data = vec4()
    position: Vec3Data = vec3()
    normal: Vec3Data = vec3()
    shade1: Vec3Data = vec3()
    shade2: Vec3Data = vec3()
    emissive: Vec3Data = vec3()
    baseStep: FloatData = float()
    baseFeather: FloatData = float()
    shadeStep: FloatData = float()
    shadeFeather: FloatData = float()
}
class AttributeDataImpl implements AttributeData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
}
class VaryingDataImpl extends VaryingData {
    v_position: Vec3Data = new Vec3Data()
    v_uv: Vec2Data = new Vec2Data()
    v_normal: Vec3Data = new Vec3Data()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([
        ["v_position", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["v_uv", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["v_normal", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
    ])
    copy(varying: VaryingDataImpl) {
        glSet_V3_V3(varying.v_position, this.v_position)
        glSet_V2_V2(varying.v_uv, this.v_uv)
        glSet_V3_V3(varying.v_normal, this.v_normal)
    }
}
class UniformDataImpl implements UniformData {
    cc_cameraPos: Vec4Data = new Vec4Data()
    cc_exposure: Vec4Data = new Vec4Data()
    cc_mainLitDir: Vec4Data = new Vec4Data()
    cc_mainLitColor: Vec4Data = new Vec4Data()
    cc_lightPos: Vec4Data[] = [new Vec4Data()]
    cc_lightColor: Vec4Data[] = [new Vec4Data()]
    cc_lightSizeRangeAngle: Vec4Data[] = [new Vec4Data()]
    cc_lightDir: Vec4Data[] = [new Vec4Data()]
    baseColor: Vec4Data = new Vec4Data()
    colorScaleAndCutoff: Vec4Data = new Vec4Data()
    shadeColor1: Vec4Data = new Vec4Data()
    shadeColor2: Vec4Data = new Vec4Data()
    specular: Vec4Data = new Vec4Data()
    shadeParams: Vec4Data = new Vec4Data()
    emissive: Vec4Data = new Vec4Data()
    emissiveScaleAndStrenth: Vec4Data = new Vec4Data()
    baseColorMap: Sampler2D = new Sampler2D()
    dataKeys: Map<string, any> = new Map([
        ["cc_cameraPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_exposure", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_mainLitDir", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_mainLitColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_lightPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_lightColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_lightSizeRangeAngle", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_lightDir", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["baseColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["colorScaleAndCutoff", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["shadeColor1", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["shadeColor2", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["specular", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["shadeParams", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["emissive", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["emissiveScaleAndStrenth", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["baseColorMap", cpuRenderingContext.cachGameGl.SAMPLER_2D],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_cameraPos", 1],
        ["cc_exposure", 1],
        ["cc_mainLitDir", 1],
        ["cc_mainLitColor", 1],
        ["cc_lightPos", 1],
        ["cc_lightColor", 1],
        ["cc_lightSizeRangeAngle", 1],
        ["cc_lightDir", 1],
        ["baseColor", 1],
        ["colorScaleAndCutoff", 1],
        ["shadeColor1", 1],
        ["shadeColor2", 1],
        ["specular", 1],
        ["shadeParams", 1],
        ["emissive", 1],
        ["emissiveScaleAndStrenth", 1],
        ["baseColorMap", 1],
    ])
}
export class Impl_2100716bb8b9d190725c403188e7bc35 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    SmoothDistAtt_N_N(__distSqr__: FloatData, __invSqrAttRadius__: FloatData): FloatData {
        let distSqr: FloatData = float()
        glSet_N_N(distSqr, __distSqr__)
        let invSqrAttRadius: FloatData = float()
        glSet_N_N(invSqrAttRadius, __invSqrAttRadius__)

        let factor: FloatData = float()
        glSet_N_N(factor, glMul_N_N(distSqr, invSqrAttRadius))
        let smoothFactor: FloatData = float()
        glSet_N_N(smoothFactor, clamp_N_N_N(glSub_N_N(float_N(1.0), glMul_N_N(factor, factor)), float_N(0.0), float_N(1.0)))
        return glMul_N_N(smoothFactor, smoothFactor)
    }
    GetDistAtt_N_N(__distSqr__: FloatData, __invSqrAttRadius__: FloatData): FloatData {
        let distSqr: FloatData = float()
        glSet_N_N(distSqr, __distSqr__)
        let invSqrAttRadius: FloatData = float()
        glSet_N_N(invSqrAttRadius, __invSqrAttRadius__)

        let attenuation: FloatData = float()
        glSet_N_N(attenuation, glDiv_N_N(float_N(1.0), max_N_N(distSqr, glMul_N_N(float_N(0.01), float_N(0.01)))))
        glMulSet_N_N(attenuation, this.SmoothDistAtt_N_N(distSqr, invSqrAttRadius))
        return attenuation
    }
    GetAngleAtt_V3_V3_N_N(__L__: Vec3Data, __litDir__: Vec3Data, __litAngleScale__: FloatData, __litAngleOffset__: FloatData): FloatData {
        let L: Vec3Data = vec3()
        glSet_V3_V3(L, __L__)
        let litDir: Vec3Data = vec3()
        glSet_V3_V3(litDir, __litDir__)
        let litAngleScale: FloatData = float()
        glSet_N_N(litAngleScale, __litAngleScale__)
        let litAngleOffset: FloatData = float()
        glSet_N_N(litAngleOffset, __litAngleOffset__)

        let cd: FloatData = float()
        glSet_N_N(cd, dot_V3_V3(litDir, L))
        let attenuation: FloatData = float()
        glSet_N_N(attenuation, clamp_N_N_N(glAdd_N_N(glMul_N_N(cd, litAngleScale), litAngleOffset), float_N(0.0), float_N(1.0)))
        return glMul_N_N(attenuation, attenuation)
    }
    CCToonShading_ToonSurface(__s__: ToonSurface): Vec4Data {
        let s: ToonSurface = new ToonSurface()
        glSet_Struct_Struct(s, __s__)

        let V: Vec3Data = vec3()
        glSet_V3_V3(V, normalize_V3(glSub_V3_V3(this.uniformData.cc_cameraPos.xyz, s.position)))
        let N: Vec3Data = vec3()
        glSet_V3_V3(N, normalize_V3(s.normal))
        let specularWeight: FloatData = float()
        glSet_N_N(specularWeight, glSub_N_N(float_N(1.0), pow_N_N(float_N(s.specular.w), float_N(5.0))))
        let finalColor: Vec3Data = vec3()
        glSet_V3_V3(finalColor, vec3_N(float_N(0.0)))
        for (let i: IntData = int_N(0); glIsLess_N_N(i, LIGHTS_PER_PASS); glAfterAddSelf_N(i)) {
            let s: ToonSurface = new ToonSurface()
            glSet_Struct_Struct(s, __s__)

            let SLU: Vec3Data = vec3()
            glSet_V3_V3(SLU, glSub_V3_V3((<any>this.uniformData.cc_lightPos)[i.v].xyz, s.position))
            let SL: Vec3Data = vec3()
            glSet_V3_V3(SL, normalize_V3(SLU))
            let SH: Vec3Data = vec3()
            glSet_V3_V3(SH, normalize_V3(glAdd_V3_V3(SL, V)))
            let SNL: FloatData = float()
            glSet_N_N(SNL, glAdd_N_N(glMul_N_N(float_N(0.5), dot_V3_V3(N, SL)), float_N(0.5)))
            let SNH: FloatData = float()
            glSet_N_N(SNH, glAdd_N_N(glMul_N_N(float_N(0.5), dot_V3_V3(N, SH)), float_N(0.5)))
            let distSqr: FloatData = float()
            glSet_N_N(distSqr, dot_V3_V3(SLU, SLU))
            let litRadius: FloatData = float()
            glSet_N_N(litRadius, float_N((<any>this.uniformData.cc_lightSizeRangeAngle)[i.v].x))
            let litRadiusSqr: FloatData = float()
            glSet_N_N(litRadiusSqr, glMul_N_N(litRadius, litRadius))
            let illum: FloatData = float()
            glSet_N_N(illum, glDiv_N_N(litRadiusSqr, max_N_N(litRadiusSqr, distSqr)))
            let attRadiusSqrInv: FloatData = float()
            glSet_N_N(
                attRadiusSqrInv,
                glDiv_N_N(float_N(1.0), max_N_N(float_N((<any>this.uniformData.cc_lightSizeRangeAngle)[i.v].y), float_N(0.01)))
            )
            glMulSet_N_N(attRadiusSqrInv, attRadiusSqrInv)
            let att: FloatData = float()
            glSet_N_N(att, this.GetDistAtt_N_N(distSqr, attRadiusSqrInv))
            let diffuse: Vec3Data = vec3()
            glSet_V3_V3(
                diffuse,
                mix_V3_V3_N(
                    s.shade1,
                    s.shade2,
                    clamp_N_N_N(
                        glAdd_N_N(float_N(1.0), glDiv_N_N(glSub_N_N(glSub_N_N(s.shadeStep, s.shadeFeather), SNL), s.shadeFeather)),
                        float_N(0.0),
                        float_N(1.0)
                    )
                )
            )
            glSet_V3_V3(
                diffuse,
                mix_V3_V3_N(
                    s.baseColor.xyz,
                    diffuse,
                    clamp_N_N_N(
                        glAdd_N_N(float_N(1.0), glDiv_N_N(glSub_N_N(glSub_N_N(s.baseStep, s.baseFeather), SNL), s.baseFeather)),
                        float_N(0.0),
                        float_N(1.0)
                    )
                )
            )
            let specularMask: FloatData = float()
            glSet_N_N(specularMask, step_N_N(specularWeight, SNH))
            let specular: Vec3Data = vec3()
            glSet_V3_V3(specular, glMul_V3_N(s.specular.xyz, specularMask))
            if (glIsMore_N_N(float_N((<any>this.uniformData.cc_lightPos)[i.v].w), float_N(0.0))) {
                let s: ToonSurface = new ToonSurface()
                glSet_Struct_Struct(s, __s__)

                let cosInner: FloatData = float()
                glSet_N_N(cosInner, max_N_N(dot_V3_V3(glNegative_V3((<any>this.uniformData.cc_lightDir)[i.v].xyz), SL), float_N(0.01)))
                let cosOuter: FloatData = float()
                glSet_N_N(cosOuter, float_N((<any>this.uniformData.cc_lightSizeRangeAngle)[i.v].z))
                let litAngleScale: FloatData = float()
                glSet_N_N(litAngleScale, glDiv_N_N(float_N(1.0), max_N_N(float_N(0.001), glSub_N_N(cosInner, cosOuter))))
                let litAngleOffset: FloatData = float()
                glSet_N_N(litAngleOffset, glMul_N_N(glNegative_N(cosOuter), litAngleScale))
                glMulSet_N_N(
                    att,
                    this.GetAngleAtt_V3_V3_N_N(
                        SL,
                        glNegative_V3((<any>this.uniformData.cc_lightDir)[i.v].xyz),
                        litAngleScale,
                        litAngleOffset
                    )
                )
            }
            glAddSet_V3_V3(
                finalColor,
                glMul_V3_V3(
                    glMul_V3_N(
                        glMul_V3_N(
                            glMul_V3_N(
                                glMul_V3_N(
                                    glMul_N_V3(SNL, (<any>this.uniformData.cc_lightColor)[i.v].xyz),
                                    float_N((<any>this.uniformData.cc_lightColor)[i.v].w)
                                ),
                                illum
                            ),
                            att
                        ),
                        s.baseStep
                    ),
                    glAdd_V3_V3(diffuse, specular)
                )
            )
        }
        return vec4_V3_N(finalColor, float_N(0.0))
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
    SRGBToLinear_V3(__gamma__: Vec3Data): Vec3Data {
        let gamma: Vec3Data = vec3()
        glSet_V3_V3(gamma, __gamma__)

        return glMul_V3_V3(gamma, gamma)
    }
    CCFragOutput_V4(__color__: Vec4Data): Vec4Data {
        let color: Vec4Data = vec4()
        glSet_V4_V4(color, __color__)

        glSet_V3_V3(color.out_xyz, sqrt_V3(this.ACESToneMap_V3(color.out_xyz)))
        return color
    }
    surf_ToonSurface(s: ToonSurface): void {
        glSet_V3_V3(s.shade2, glMul_V3_V3(this.uniformData.shadeColor2.xyz, this.uniformData.colorScaleAndCutoff.xyz))
        glSet_V3_V3(s.shade1, glMul_V3_V3(this.uniformData.shadeColor1.xyz, this.uniformData.colorScaleAndCutoff.xyz))
        let baseColor: Vec4Data = vec4()
        glSet_V4_V4(baseColor, this.uniformData.baseColor)
        let baseColorMap: Vec4Data = vec4()
        glSet_V4_V4(baseColorMap, texture2D_N_V2(this.uniformData.baseColorMap, this.varyingData.v_uv))
        glSet_V3_V3(baseColorMap.out_xyz, this.SRGBToLinear_V3(baseColorMap.out_xyz))
        glMulSet_V4_V4(baseColor, baseColorMap)
        glMulSet_V3_V3(s.shade1, baseColorMap.xyz)
        glMulSet_V3_V3(s.shade2, baseColorMap.xyz)
        glSet_V4_V4(s.baseColor, baseColor)
        glMulSet_V3_V3(s.baseColor.out_xyz, this.uniformData.colorScaleAndCutoff.xyz)
        glSet_V3_V3(s.normal, this.varyingData.v_normal)
        glSet_V3_V3(s.position, this.varyingData.v_position)
        glSet_V4_V4(s.specular, this.uniformData.specular)
        glSet_V3_V3(s.emissive, glMul_V3_V3(this.uniformData.emissive.xyz, this.uniformData.emissiveScaleAndStrenth.xyz))
        glSet_N_N(s.baseStep, float_N(this.uniformData.shadeParams.x))
        glSet_N_N(s.baseFeather, float_N(this.uniformData.shadeParams.y))
        glSet_N_N(s.shadeStep, float_N(this.uniformData.shadeParams.z))
        glSet_N_N(s.shadeFeather, float_N(this.uniformData.shadeParams.w))
    }
    frag(): Vec4Data {
        let s: ToonSurface = new ToonSurface()
        this.surf_ToonSurface(s)
        let color: Vec4Data = vec4()
        glSet_V4_V4(color, this.CCToonShading_ToonSurface(s))
        return this.CCFragOutput_V4(color)
    }
    main(): void {
        glSet_V4_V4(gl_FragColor, this.frag())
    }
}
