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
#define CC_USE_FOG 4
#define CC_FORWARD_ADD 1
#define CC_RECEIVE_SHADOW 0
#define USE_VERTEX_COLOR 0
#define USE_NORMAL_MAP 0
#define HAS_SECOND_UV 0
#define SAMPLE_FROM_RT 0
#define CC_USE_IBL 0
#define CC_USE_HDR 0
#define USE_ALBEDO_MAP 1
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

precision highp float;
highp float decode32 (highp vec4 rgba) {
  rgba = rgba * 255.0;
  highp float Sign = 1.0 - (step(128.0, (rgba[3]) + 0.5)) * 2.0;
  highp float Exponent = 2.0 * (mod(float(int((rgba[3]) + 0.5)), 128.0)) + (step(128.0, (rgba[2]) + 0.5)) - 127.0;
  highp float Mantissa = (mod(float(int((rgba[2]) + 0.5)), 128.0)) * 65536.0 + rgba[1] * 256.0 + rgba[0] + 8388608.0;
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
#if CC_USE_MORPH
    attribute float a_vertexId;
    int getVertexId() {
      return int(a_vertexId);
    }
  uniform vec4 cc_displacementWeights[15];
  uniform vec4 cc_displacementTextureInfo;
  vec2 getPixelLocation(vec2 textureResolution, int pixelIndex) {
    float pixelIndexF = float(pixelIndex);
    float x = mod(pixelIndexF, textureResolution.x);
    float y = floor(pixelIndexF / textureResolution.x);
    return vec2(x, y);
  }
  vec2 getPixelCoordFromLocation(vec2 location, vec2 textureResolution) {
    return (vec2(location.x, location.y) + .5) / textureResolution;
  }
  #if CC_DEVICE_SUPPORT_FLOAT_TEXTURE
      vec4 fetchVec3ArrayFromTexture(sampler2D tex, int elementIndex) {
        int pixelIndex = elementIndex;
        vec2 location = getPixelLocation(cc_displacementTextureInfo.xy, pixelIndex);
        vec2 uv = getPixelCoordFromLocation(location, cc_displacementTextureInfo.xy);
        return texture2D(tex, uv);
      }
  #else
    vec4 fetchVec3ArrayFromTexture(sampler2D tex, int elementIndex) {
      int pixelIndex = elementIndex * 4;
      vec2 location = getPixelLocation(cc_displacementTextureInfo.xy, pixelIndex);
      vec2 x = getPixelCoordFromLocation(location + vec2(0.0, 0.0), cc_displacementTextureInfo.xy);
      vec2 y = getPixelCoordFromLocation(location + vec2(1.0, 0.0), cc_displacementTextureInfo.xy);
      vec2 z = getPixelCoordFromLocation(location + vec2(2.0, 0.0), cc_displacementTextureInfo.xy);
      return vec4(
        decode32(texture2D(tex, x)),
        decode32(texture2D(tex, y)),
        decode32(texture2D(tex, z)),
        1.0
      );
    }
  #endif
  float getDisplacementWeight(int index) {
    int quot = index / 4;
    int remainder = index - quot * 4;
    if (remainder == 0) {
      return cc_displacementWeights[quot].x;
    } else if (remainder == 1) {
      return cc_displacementWeights[quot].y;
    } else if (remainder == 2) {
      return cc_displacementWeights[quot].z;
    } else {
      return cc_displacementWeights[quot].w;
    }
  }
  vec3 getVec3DisplacementFromTexture(sampler2D tex, int vertexIndex) {
  #if CC_MORPH_PRECOMPUTED
    return fetchVec3ArrayFromTexture(tex, vertexIndex).rgb;
  #else
    vec3 result = vec3(0, 0, 0);
    int nVertices = int(cc_displacementTextureInfo.z);
    for (int iTarget = 0; iTarget < CC_MORPH_TARGET_COUNT; ++iTarget) {
      result += (fetchVec3ArrayFromTexture(tex, nVertices * iTarget + vertexIndex).rgb * getDisplacementWeight(iTarget));
    }
    return result;
  #endif
  }
  #if CC_MORPH_TARGET_HAS_POSITION
    uniform sampler2D cc_PositionDisplacements;
    vec3 getPositionDisplacement(int vertexId) {
      return getVec3DisplacementFromTexture(cc_PositionDisplacements, vertexId);
    }
  #endif
  #if CC_MORPH_TARGET_HAS_NORMAL
    uniform sampler2D cc_NormalDisplacements;
    vec3 getNormalDisplacement(int vertexId) {
      return getVec3DisplacementFromTexture(cc_NormalDisplacements, vertexId);
    }
  #endif
  #if CC_MORPH_TARGET_HAS_TANGENT
    uniform sampler2D cc_TangentDisplacements;
    vec3 getTangentDisplacement(int vertexId) {
      return getVec3DisplacementFromTexture(cc_TangentDisplacements, vertexId);
    }
  #endif
  void applyMorph (inout StandardVertInput attr) {
    int vertexId = getVertexId();
  #if CC_MORPH_TARGET_HAS_POSITION
    attr.position.xyz = attr.position.xyz + getPositionDisplacement(vertexId);
  #endif
  #if CC_MORPH_TARGET_HAS_NORMAL
    attr.normal.xyz = attr.normal.xyz + getNormalDisplacement(vertexId);
  #endif
  #if CC_MORPH_TARGET_HAS_TANGENT
    attr.tangent.xyz = attr.tangent.xyz + getTangentDisplacement(vertexId);
  #endif
  }
  void applyMorph (inout vec4 position) {
  #if CC_MORPH_TARGET_HAS_POSITION
    position.xyz = position.xyz + getPositionDisplacement(getVertexId());
  #endif
  }
#endif
#if CC_USE_SKINNING
    attribute vec4 a_joints;
  attribute vec4 a_weights;
  #if CC_USE_BAKED_ANIMATION
    #if USE_INSTANCING
      attribute highp vec4 a_jointAnimInfo;
    #endif
    uniform highp vec4 cc_jointTextureInfo;
    uniform highp vec4 cc_jointAnimInfo;
    uniform highp sampler2D cc_jointTexture;
      #else
    uniform highp vec4 cc_joints[90];
  #endif
  #if CC_USE_BAKED_ANIMATION
    #if CC_DEVICE_SUPPORT_FLOAT_TEXTURE
      mat4 getJointMatrix (float i) {
              #if USE_INSTANCING
                highp float j = 3.0 * (a_jointAnimInfo.x * a_jointAnimInfo.y + i) + a_jointAnimInfo.z;
              #else
                highp float j = 3.0 * (cc_jointAnimInfo.x * cc_jointTextureInfo.y + i) + cc_jointTextureInfo.z;
              #endif
              highp float invSize = cc_jointTextureInfo.w;
              highp float y = floor(j * invSize);
              highp float x = floor(j - y * cc_jointTextureInfo.x);
              y = (y + 0.5) * invSize;
        vec4 v1 = texture2D(cc_jointTexture, vec2((x + 0.5) * invSize, y));
        vec4 v2 = texture2D(cc_jointTexture, vec2((x + 1.5) * invSize, y));
        vec4 v3 = texture2D(cc_jointTexture, vec2((x + 2.5) * invSize, y));
        return mat4(vec4(v1.xyz, 0.0), vec4(v2.xyz, 0.0), vec4(v3.xyz, 0.0), vec4(v1.w, v2.w, v3.w, 1.0));
      }
    #else
      mat4 getJointMatrix (float i) {
              #if USE_INSTANCING
                highp float j = 12.0 * (a_jointAnimInfo.x * a_jointAnimInfo.y + i) + a_jointAnimInfo.z;
              #else
                highp float j = 12.0 * (cc_jointAnimInfo.x * cc_jointTextureInfo.y + i) + cc_jointTextureInfo.z;
              #endif
              highp float invSize = cc_jointTextureInfo.w;
              highp float y = floor(j * invSize);
              highp float x = floor(j - y * cc_jointTextureInfo.x);
              y = (y + 0.5) * invSize;
        vec4 v1 = vec4(
          decode32(texture2D(cc_jointTexture, vec2((x + 0.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 1.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 2.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 3.5) * invSize, y)))
        );
        vec4 v2 = vec4(
          decode32(texture2D(cc_jointTexture, vec2((x + 4.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 5.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 6.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 7.5) * invSize, y)))
        );
        vec4 v3 = vec4(
          decode32(texture2D(cc_jointTexture, vec2((x + 8.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 9.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 10.5) * invSize, y))),
          decode32(texture2D(cc_jointTexture, vec2((x + 11.5) * invSize, y)))
        );
        return mat4(vec4(v1.xyz, 0.0), vec4(v2.xyz, 0.0), vec4(v3.xyz, 0.0), vec4(v1.w, v2.w, v3.w, 1.0));
      }
    #endif
  #else
    mat4 getJointMatrix (float i) {
      int idx = int(i);
      vec4 v1 = cc_joints[idx * 3];
      vec4 v2 = cc_joints[idx * 3 + 1];
      vec4 v3 = cc_joints[idx * 3 + 2];
      return mat4(vec4(v1.xyz, 0.0), vec4(v2.xyz, 0.0), vec4(v3.xyz, 0.0), vec4(v1.w, v2.w, v3.w, 1.0));
    }
  #endif
  mat4 skinMatrix () {
    vec4 joints = vec4(a_joints);
    return getJointMatrix(joints.x) * a_weights.x
         + getJointMatrix(joints.y) * a_weights.y
         + getJointMatrix(joints.z) * a_weights.z
         + getJointMatrix(joints.w) * a_weights.w;
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
#endif
uniform highp mat4 cc_matView;
  uniform highp mat4 cc_matProj;
  uniform highp vec4 cc_cameraPos;
  uniform mediump vec4 cc_fogBase;
  uniform mediump vec4 cc_fogAdd;
#if USE_INSTANCING
  attribute vec4 a_matWorld0;
  attribute vec4 a_matWorld1;
  attribute vec4 a_matWorld2;
  #if USE_LIGHTMAP
    attribute vec4 a_lightingMapUVParam;
  #endif
#elif USE_BATCHING
  attribute float a_dyn_batch_id;
  uniform highp mat4 cc_matWorlds[10];
#else
  uniform highp mat4 cc_matWorld;
  uniform highp mat4 cc_matWorldIT;
  uniform highp vec4 cc_lightingMapUVParam;
#endif
      uniform vec4 tilingOffset;
float LinearFog(vec4 pos) {
  vec4 wPos = pos;
  float cam_dis = distance(cc_cameraPos, wPos);
  float fogStart = cc_fogBase.x;
  float fogEnd = cc_fogBase.y;
  return clamp((fogEnd - cam_dis) / (fogEnd - fogStart), 0., 1.);
}
float ExpFog(vec4 pos) {
  vec4 wPos = pos;
  float fogAtten = cc_fogAdd.z;
  float fogDensity = cc_fogBase.z;
  float cam_dis = distance(cc_cameraPos, wPos) / fogAtten * 4.;
  float f = exp(-cam_dis * fogDensity);
  return f;
}
float ExpSquaredFog(vec4 pos) {
  vec4 wPos = pos;
  float fogAtten = cc_fogAdd.z;
  float fogDensity = cc_fogBase.z;
  float cam_dis = distance(cc_cameraPos, wPos) / fogAtten * 4.;
  float f = exp(-cam_dis * cam_dis * fogDensity * fogDensity);
  return f;
}
float LayeredFog(vec4 pos) {
  vec4 wPos = pos;
  float fogAtten = cc_fogAdd.z;
  float _FogTop = cc_fogAdd.x;
  float _FogRange = cc_fogAdd.y;
  vec3 camWorldProj = cc_cameraPos.xyz;
  camWorldProj.y = 0.;
  vec3 worldPosProj = wPos.xyz;
  worldPosProj.y = 0.;
  float fDeltaD = distance(worldPosProj, camWorldProj) / fogAtten * 2.0;
  float fDeltaY, fDensityIntegral;
  if (cc_cameraPos.y > _FogTop) {
    if (wPos.y < _FogTop) {
      fDeltaY = (_FogTop - wPos.y) / _FogRange * 2.0;
      fDensityIntegral = fDeltaY * fDeltaY * 0.5;
    } else {
      fDeltaY = 0.;
      fDensityIntegral = 0.;
    }
  } else {
    if (wPos.y < _FogTop) {
      float fDeltaA = (_FogTop - cc_cameraPos.y) / _FogRange * 2.;
      float fDeltaB = (_FogTop - wPos.y) / _FogRange * 2.;
      fDeltaY = abs(fDeltaA - fDeltaB);
      fDensityIntegral = abs((fDeltaA * fDeltaA * 0.5) - (fDeltaB * fDeltaB * 0.5));
    } else {
      fDeltaY = abs(_FogTop - cc_cameraPos.y) / _FogRange * 2.;
      fDensityIntegral = abs(fDeltaY * fDeltaY * 0.5);
    }
  }
  float fDensity;
  if (fDeltaY != 0.) {
    fDensity = (sqrt(1.0 + ((fDeltaD / fDeltaY) * (fDeltaD / fDeltaY)))) * fDensityIntegral;
  } else {
    fDensity = 0.;
  }
  float f = exp(-fDensity);
  return f;
}
varying float v_fog_factor;
varying highp vec4 v_shadowPos;
uniform highp mat4 cc_matLightViewProj;
#if CC_RECEIVE_SHADOW
  uniform sampler2D cc_shadowMap;
  uniform sampler2D cc_spotLightingMap;
#endif
#if USE_VERTEX_COLOR
  attribute vec4 a_color;
  varying vec4 v_color;
#endif
varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_uv;
varying vec2 v_uv1;
#if USE_NORMAL_MAP
  varying vec3 v_tangent;
  varying vec3 v_bitangent;
#endif
#if HAS_SECOND_UV || USE_LIGHTMAP
  attribute vec2 a_texCoord1;
#endif
#if USE_LIGHTMAP && !USE_BATCHING && !CC_FORWARD_ADD
  varying vec3 v_luv;
  void CCLightingMapCaclUV()
  {
  #if !USE_INSTANCING
    v_luv.xy = cc_lightingMapUVParam.xy + a_texCoord1 * cc_lightingMapUVParam.zw;
    v_luv.z = cc_lightingMapUVParam.z;
  #else
    v_luv.xy = a_lightingMapUVParam.xy + a_texCoord1 * a_lightingMapUVParam.zw;
    v_luv.z = a_lightingMapUVParam.z;
  #endif
  }
#endif
void main () {
  StandardVertInput In;
      In.position = vec4(a_position, 1.0);
      In.normal = a_normal;
      In.tangent = a_tangent;
    #if CC_USE_MORPH
      applyMorph(In);
    #endif
    #if CC_USE_SKINNING
      CCSkin(In);
    #endif
  mat4 matWorld, matWorldIT;
    #if USE_INSTANCING
      matWorld = mat4(
        vec4(a_matWorld0.xyz, 0.0),
        vec4(a_matWorld1.xyz, 0.0),
        vec4(a_matWorld2.xyz, 0.0),
        vec4(a_matWorld0.w, a_matWorld1.w, a_matWorld2.w, 1.0)
      );
      matWorldIT = matWorld;
    #elif USE_BATCHING
      matWorld = cc_matWorlds[int(a_dyn_batch_id)];
      matWorldIT = matWorld;
    #else
      matWorld = cc_matWorld;
      matWorldIT = cc_matWorldIT;
    #endif
  vec4 pos = matWorld * In.position;
  v_position = pos.xyz;
  v_normal = normalize((matWorldIT * vec4(In.normal, 0.0)).xyz);
  #if USE_NORMAL_MAP
    v_tangent = normalize((matWorld * vec4(In.tangent.xyz, 0.0)).xyz);
    v_bitangent = cross(v_normal, v_tangent) * In.tangent.w;
  #endif
  v_uv = a_texCoord * tilingOffset.xy + tilingOffset.zw;
  #if SAMPLE_FROM_RT
    v_uv = cc_cameraPos.w > 1.0 ? vec2(v_uv.x, 1.0 - v_uv.y) : v_uv;
  #endif
  #if HAS_SECOND_UV
    v_uv1 = a_texCoord1 * tilingOffset.xy + tilingOffset.zw;
    #if SAMPLE_FROM_RT
      v_uv1 = cc_cameraPos.w > 1.0 ? vec2(v_uv1.x, 1.0 - v_uv1.y) : v_uv1;
    #endif
  #endif
  #if USE_VERTEX_COLOR
    v_color = a_color;
  #endif
    #if CC_USE_FOG == 0
      v_fog_factor = LinearFog(pos);
    #elif CC_USE_FOG == 1
      v_fog_factor = ExpFog(pos);
    #elif CC_USE_FOG == 2
      v_fog_factor = ExpSquaredFog(pos);
    #elif CC_USE_FOG == 3
      v_fog_factor = LayeredFog(pos);
    #else
      v_fog_factor = 1.0;
    #endif
  v_shadowPos = cc_matLightViewProj * pos;
  #if USE_LIGHTMAP && !USE_BATCHING && !CC_FORWARD_ADD
    CCLightingMapCaclUV();
  #endif
  gl_Position = cc_matProj * (cc_matView * matWorld) * In.position;
}
*/
/*
fact do glsl source: 
#define CC_PIPELINE_TYPE 0
#define USE_ALPHA_TEST 0
#define USE_EMISSIVE_MAP 0
#define USE_OCCLUSION_MAP 0
#define USE_METALLIC_ROUGHNESS_MAP 0
#define USE_PBR_MAP 0
#define USE_ALBEDO_MAP 1
#define CC_USE_HDR 0
#define CC_USE_IBL 0
#define SAMPLE_FROM_RT 0
#define HAS_SECOND_UV 0
#define USE_NORMAL_MAP 0
#define USE_VERTEX_COLOR 0
#define CC_RECEIVE_SHADOW 0
#define CC_FORWARD_ADD 1
#define CC_USE_FOG 4
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
highp float decode32 (highp vec4 rgba) {
  rgba = rgba * 255.0;
  highp float Sign = 1.0 - (step(128.0, (rgba[3]) + 0.5)) * 2.0;
  highp float Exponent = 2.0 * (mod(float(int((rgba[3]) + 0.5)), 128.0)) + (step(128.0, (rgba[2]) + 0.5)) - 127.0;
  highp float Mantissa = (mod(float(int((rgba[2]) + 0.5)), 128.0)) * 65536.0 + rgba[1] * 256.0 + rgba[0] + 8388608.0;
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
uniform highp mat4 cc_matView;
  uniform highp mat4 cc_matProj;
  uniform highp vec4 cc_cameraPos;
  uniform mediump vec4 cc_fogBase;
  uniform mediump vec4 cc_fogAdd;
  uniform highp mat4 cc_matWorld;
  uniform highp mat4 cc_matWorldIT;
  uniform highp vec4 cc_lightingMapUVParam;
      uniform vec4 tilingOffset;
float LinearFog(vec4 pos) {
  vec4 wPos = pos;
  float cam_dis = distance(cc_cameraPos, wPos);
  float fogStart = cc_fogBase.x;
  float fogEnd = cc_fogBase.y;
  return clamp((fogEnd - cam_dis) / (fogEnd - fogStart), 0., 1.);
}
float ExpFog(vec4 pos) {
  vec4 wPos = pos;
  float fogAtten = cc_fogAdd.z;
  float fogDensity = cc_fogBase.z;
  float cam_dis = distance(cc_cameraPos, wPos) / fogAtten * 4.;
  float f = exp(-cam_dis * fogDensity);
  return f;
}
float ExpSquaredFog(vec4 pos) {
  vec4 wPos = pos;
  float fogAtten = cc_fogAdd.z;
  float fogDensity = cc_fogBase.z;
  float cam_dis = distance(cc_cameraPos, wPos) / fogAtten * 4.;
  float f = exp(-cam_dis * cam_dis * fogDensity * fogDensity);
  return f;
}
float LayeredFog(vec4 pos) {
  vec4 wPos = pos;
  float fogAtten = cc_fogAdd.z;
  float _FogTop = cc_fogAdd.x;
  float _FogRange = cc_fogAdd.y;
  vec3 camWorldProj = cc_cameraPos.xyz;
  camWorldProj.y = 0.;
  vec3 worldPosProj = wPos.xyz;
  worldPosProj.y = 0.;
  float fDeltaD = distance(worldPosProj, camWorldProj) / fogAtten * 2.0;
  float fDeltaY, fDensityIntegral;
  if (cc_cameraPos.y > _FogTop) {
    if (wPos.y < _FogTop) {
      fDeltaY = (_FogTop - wPos.y) / _FogRange * 2.0;
      fDensityIntegral = fDeltaY * fDeltaY * 0.5;
    } else {
      fDeltaY = 0.;
      fDensityIntegral = 0.;
    }
  } else {
    if (wPos.y < _FogTop) {
      float fDeltaA = (_FogTop - cc_cameraPos.y) / _FogRange * 2.;
      float fDeltaB = (_FogTop - wPos.y) / _FogRange * 2.;
      fDeltaY = abs(fDeltaA - fDeltaB);
      fDensityIntegral = abs((fDeltaA * fDeltaA * 0.5) - (fDeltaB * fDeltaB * 0.5));
    } else {
      fDeltaY = abs(_FogTop - cc_cameraPos.y) / _FogRange * 2.;
      fDensityIntegral = abs(fDeltaY * fDeltaY * 0.5);
    }
  }
  float fDensity;
  if (fDeltaY != 0.) {
    fDensity = (sqrt(1.0 + ((fDeltaD / fDeltaY) * (fDeltaD / fDeltaY)))) * fDensityIntegral;
  } else {
    fDensity = 0.;
  }
  float f = exp(-fDensity);
  return f;
}
varying float v_fog_factor;
varying highp vec4 v_shadowPos;
uniform highp mat4 cc_matLightViewProj;
varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_uv;
varying vec2 v_uv1;
void main () {
  StandardVertInput In;
      In.position = vec4(a_position, 1.0);
      In.normal = a_normal;
      In.tangent = a_tangent;
  mat4 matWorld, matWorldIT;
      matWorld = cc_matWorld;
      matWorldIT = cc_matWorldIT;
  vec4 pos = matWorld * In.position;
  v_position = pos.xyz;
  v_normal = normalize((matWorldIT * vec4(In.normal, 0.0)).xyz);
  v_uv = a_texCoord * tilingOffset.xy + tilingOffset.zw;
      v_fog_factor = 1.0;
  v_shadowPos = cc_matLightViewProj * pos;
  gl_Position = cc_matProj * (cc_matView * matWorld) * In.position;
}
*/
import {
    step_N_N,
    int_N,
    float_N,
    mod_N_N,
    exp2_N,
    distance_V4_V4,
    clamp_N_N_N,
    exp_N,
    distance_V3_V3,
    abs_N,
    sqrt_N,
    vec4_V3_N,
    normalize_V3,
    float,
    bool,
    bool_N,
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
    glMul_V4_N,
    glAdd_N_N,
    glMul_N_N,
    glSub_N_N,
    glDiv_N_N,
    glNegative_N,
    glIsMore_N_N,
    glIsLess_N_N,
    glIsNotEqual_N_N,
    glSet_M4_M4,
    glMul_M4_V4,
    glMul_V2_V2,
    glAdd_V2_V2,
    glMul_M4_M4,
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
let CC_USE_FOG = new FloatData(4)
let CC_FORWARD_ADD = new FloatData(1)
let CC_RECEIVE_SHADOW = new FloatData(0)
let USE_VERTEX_COLOR = new FloatData(0)
let USE_NORMAL_MAP = new FloatData(0)
let HAS_SECOND_UV = new FloatData(0)
let SAMPLE_FROM_RT = new FloatData(0)
let CC_USE_IBL = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
let USE_ALBEDO_MAP = new FloatData(1)
let USE_PBR_MAP = new FloatData(0)
let USE_METALLIC_ROUGHNESS_MAP = new FloatData(0)
let USE_OCCLUSION_MAP = new FloatData(0)
let USE_EMISSIVE_MAP = new FloatData(0)
let USE_ALPHA_TEST = new FloatData(0)
let CC_PIPELINE_TYPE = new FloatData(0)
class StandardVertInput implements StructData {
    position: Vec4Data = vec4()
    normal: Vec3Data = vec3()
    tangent: Vec4Data = vec4()
}
class AttributeDataImpl implements AttributeData {
    a_position: Vec3Data = new Vec3Data()
    a_normal: Vec3Data = new Vec3Data()
    a_texCoord: Vec2Data = new Vec2Data()
    a_tangent: Vec4Data = new Vec4Data()
    dataKeys: Map<string, any> = new Map([
        ["a_position", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_normal", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_texCoord", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["a_tangent", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["a_position", 1],
        ["a_normal", 1],
        ["a_texCoord", 1],
        ["a_tangent", 1],
    ])
}
class VaryingDataImpl extends VaryingData {
    v_fog_factor: FloatData = new FloatData()
    v_shadowPos: Vec4Data = new Vec4Data()
    v_position: Vec3Data = new Vec3Data()
    v_normal: Vec3Data = new Vec3Data()
    v_uv: Vec2Data = new Vec2Data()
    v_uv1: Vec2Data = new Vec2Data()

    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([
        ["v_fog_factor", cpuRenderingContext.cachGameGl.FLOAT],
        ["v_shadowPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["v_position", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["v_normal", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["v_uv", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
        ["v_uv1", cpuRenderingContext.cachGameGl.FLOAT_VEC2],
    ])
    copy(varying: VaryingDataImpl) {
        glSet_N_N(varying.v_fog_factor, this.v_fog_factor)
        glSet_V4_V4(varying.v_shadowPos, this.v_shadowPos)
        glSet_V3_V3(varying.v_position, this.v_position)
        glSet_V3_V3(varying.v_normal, this.v_normal)
        glSet_V2_V2(varying.v_uv, this.v_uv)
        glSet_V2_V2(varying.v_uv1, this.v_uv1)
    }
}
class UniformDataImpl implements UniformData {
    cc_matView: Mat4Data = new Mat4Data()
    cc_matProj: Mat4Data = new Mat4Data()
    cc_cameraPos: Vec4Data = new Vec4Data()
    cc_fogBase: Vec4Data = new Vec4Data()
    cc_fogAdd: Vec4Data = new Vec4Data()
    cc_matWorld: Mat4Data = new Mat4Data()
    cc_matWorldIT: Mat4Data = new Mat4Data()
    cc_lightingMapUVParam: Vec4Data = new Vec4Data()
    tilingOffset: Vec4Data = new Vec4Data()
    cc_matLightViewProj: Mat4Data = new Mat4Data()
    dataKeys: Map<string, any> = new Map([
        ["cc_matView", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_matProj", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_cameraPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_fogBase", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_fogAdd", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_matWorld", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_matWorldIT", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_lightingMapUVParam", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["tilingOffset", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_matLightViewProj", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_matView", 1],
        ["cc_matProj", 1],
        ["cc_cameraPos", 1],
        ["cc_fogBase", 1],
        ["cc_fogAdd", 1],
        ["cc_matWorld", 1],
        ["cc_matWorldIT", 1],
        ["cc_lightingMapUVParam", 1],
        ["tilingOffset", 1],
        ["cc_matLightViewProj", 1],
    ])
}
export class Impl_fc9cda8a7ac0f0d0d683d3a6c50b263a extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    decode32_V4(__rgba__: Vec4Data): FloatData {
        let rgba: Vec4Data = vec4()
        glSet_V4_V4(rgba, __rgba__)

        glSet_V4_V4(rgba, glMul_V4_N(rgba, float_N(255.0)))
        let Sign: FloatData = float()
        glSet_N_N(
            Sign,
            glSub_N_N(
                float_N(1.0),
                glMul_N_N(step_N_N(float_N(128.0), glAdd_N_N((<any>rgba)[getValueKeyByIndex(int_N(3))], float_N(0.5))), float_N(2.0))
            )
        )
        let Exponent: FloatData = float()
        glSet_N_N(
            Exponent,
            glSub_N_N(
                glAdd_N_N(
                    glMul_N_N(
                        float_N(2.0),
                        mod_N_N(float_N(int_N(glAdd_N_N((<any>rgba)[getValueKeyByIndex(int_N(3))], float_N(0.5)))), float_N(128.0))
                    ),
                    step_N_N(float_N(128.0), glAdd_N_N((<any>rgba)[getValueKeyByIndex(int_N(2))], float_N(0.5)))
                ),
                float_N(127.0)
            )
        )
        let Mantissa: FloatData = float()
        glSet_N_N(
            Mantissa,
            glAdd_N_N(
                glAdd_N_N(
                    glAdd_N_N(
                        glMul_N_N(
                            mod_N_N(float_N(int_N(glAdd_N_N((<any>rgba)[getValueKeyByIndex(int_N(2))], float_N(0.5)))), float_N(128.0)),
                            float_N(65536.0)
                        ),
                        glMul_N_N((<any>rgba)[getValueKeyByIndex(int_N(1))], float_N(256.0))
                    ),
                    (<any>rgba)[getValueKeyByIndex(int_N(0))]
                ),
                float_N(8388608.0)
            )
        )
        return glMul_N_N(glMul_N_N(Sign, exp2_N(glSub_N_N(Exponent, float_N(23.0)))), Mantissa)
    }
    LinearFog_V4(__pos__: Vec4Data): FloatData {
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, __pos__)

        let wPos: Vec4Data = vec4()
        glSet_V4_V4(wPos, pos)
        let cam_dis: FloatData = float()
        glSet_N_N(cam_dis, distance_V4_V4(this.uniformData.cc_cameraPos, wPos))
        let fogStart: FloatData = float()
        glSet_N_N(fogStart, float_N(this.uniformData.cc_fogBase.x))
        let fogEnd: FloatData = float()
        glSet_N_N(fogEnd, float_N(this.uniformData.cc_fogBase.y))
        return clamp_N_N_N(glDiv_N_N(glSub_N_N(fogEnd, cam_dis), glSub_N_N(fogEnd, fogStart)), float_N(0), float_N(1))
    }
    ExpFog_V4(__pos__: Vec4Data): FloatData {
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, __pos__)

        let wPos: Vec4Data = vec4()
        glSet_V4_V4(wPos, pos)
        let fogAtten: FloatData = float()
        glSet_N_N(fogAtten, float_N(this.uniformData.cc_fogAdd.z))
        let fogDensity: FloatData = float()
        glSet_N_N(fogDensity, float_N(this.uniformData.cc_fogBase.z))
        let cam_dis: FloatData = float()
        glSet_N_N(cam_dis, glMul_N_N(glDiv_N_N(distance_V4_V4(this.uniformData.cc_cameraPos, wPos), fogAtten), float_N(4)))
        let f: FloatData = float()
        glSet_N_N(f, exp_N(glMul_N_N(glNegative_N(cam_dis), fogDensity)))
        return f
    }
    ExpSquaredFog_V4(__pos__: Vec4Data): FloatData {
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, __pos__)

        let wPos: Vec4Data = vec4()
        glSet_V4_V4(wPos, pos)
        let fogAtten: FloatData = float()
        glSet_N_N(fogAtten, float_N(this.uniformData.cc_fogAdd.z))
        let fogDensity: FloatData = float()
        glSet_N_N(fogDensity, float_N(this.uniformData.cc_fogBase.z))
        let cam_dis: FloatData = float()
        glSet_N_N(cam_dis, glMul_N_N(glDiv_N_N(distance_V4_V4(this.uniformData.cc_cameraPos, wPos), fogAtten), float_N(4)))
        let f: FloatData = float()
        glSet_N_N(f, exp_N(glMul_N_N(glMul_N_N(glMul_N_N(glNegative_N(cam_dis), cam_dis), fogDensity), fogDensity)))
        return f
    }
    LayeredFog_V4(__pos__: Vec4Data): FloatData {
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, __pos__)

        let wPos: Vec4Data = vec4()
        glSet_V4_V4(wPos, pos)
        let fogAtten: FloatData = float()
        glSet_N_N(fogAtten, float_N(this.uniformData.cc_fogAdd.z))
        let _FogTop: FloatData = float()
        glSet_N_N(_FogTop, float_N(this.uniformData.cc_fogAdd.x))
        let _FogRange: FloatData = float()
        glSet_N_N(_FogRange, float_N(this.uniformData.cc_fogAdd.y))
        let camWorldProj: Vec3Data = vec3()
        glSet_V3_V3(camWorldProj, this.uniformData.cc_cameraPos.xyz)
        camWorldProj.y = float_N(0).v
        let worldPosProj: Vec3Data = vec3()
        glSet_V3_V3(worldPosProj, wPos.xyz)
        worldPosProj.y = float_N(0).v
        let fDeltaD: FloatData = float()
        glSet_N_N(fDeltaD, glMul_N_N(glDiv_N_N(distance_V3_V3(worldPosProj, camWorldProj), fogAtten), float_N(2.0)))
        let fDeltaY: FloatData = float()

        let fDensityIntegral: FloatData = float()
        if (glIsMore_N_N(float_N(this.uniformData.cc_cameraPos.y), _FogTop)) {
            let pos: Vec4Data = vec4()
            glSet_V4_V4(pos, __pos__)

            if (glIsLess_N_N(float_N(wPos.y), _FogTop)) {
                let pos: Vec4Data = vec4()
                glSet_V4_V4(pos, __pos__)

                glSet_N_N(fDeltaY, glMul_N_N(glDiv_N_N(glSub_N_N(_FogTop, float_N(wPos.y)), _FogRange), float_N(2.0)))
                glSet_N_N(fDensityIntegral, glMul_N_N(glMul_N_N(fDeltaY, fDeltaY), float_N(0.5)))
            } else {
                let pos: Vec4Data = vec4()
                glSet_V4_V4(pos, __pos__)

                glSet_N_N(fDeltaY, float_N(0))
                glSet_N_N(fDensityIntegral, float_N(0))
            }
        } else {
            let pos: Vec4Data = vec4()
            glSet_V4_V4(pos, __pos__)

            if (glIsLess_N_N(float_N(wPos.y), _FogTop)) {
                let pos: Vec4Data = vec4()
                glSet_V4_V4(pos, __pos__)

                let fDeltaA: FloatData = float()
                glSet_N_N(
                    fDeltaA,
                    glMul_N_N(glDiv_N_N(glSub_N_N(_FogTop, float_N(this.uniformData.cc_cameraPos.y)), _FogRange), float_N(2))
                )
                let fDeltaB: FloatData = float()
                glSet_N_N(fDeltaB, glMul_N_N(glDiv_N_N(glSub_N_N(_FogTop, float_N(wPos.y)), _FogRange), float_N(2)))
                glSet_N_N(fDeltaY, abs_N(glSub_N_N(fDeltaA, fDeltaB)))
                glSet_N_N(
                    fDensityIntegral,
                    abs_N(
                        glSub_N_N(
                            glMul_N_N(glMul_N_N(fDeltaA, fDeltaA), float_N(0.5)),
                            glMul_N_N(glMul_N_N(fDeltaB, fDeltaB), float_N(0.5))
                        )
                    )
                )
            } else {
                let pos: Vec4Data = vec4()
                glSet_V4_V4(pos, __pos__)

                glSet_N_N(
                    fDeltaY,
                    glMul_N_N(glDiv_N_N(abs_N(glSub_N_N(_FogTop, float_N(this.uniformData.cc_cameraPos.y))), _FogRange), float_N(2))
                )
                glSet_N_N(fDensityIntegral, abs_N(glMul_N_N(glMul_N_N(fDeltaY, fDeltaY), float_N(0.5))))
            }
        }
        let fDensity: FloatData = float()
        if (glIsNotEqual_N_N(fDeltaY, float_N(0))) {
            let pos: Vec4Data = vec4()
            glSet_V4_V4(pos, __pos__)

            glSet_N_N(
                fDensity,
                glMul_N_N(
                    sqrt_N(glAdd_N_N(float_N(1.0), glMul_N_N(glDiv_N_N(fDeltaD, fDeltaY), glDiv_N_N(fDeltaD, fDeltaY)))),
                    fDensityIntegral
                )
            )
        } else {
            let pos: Vec4Data = vec4()
            glSet_V4_V4(pos, __pos__)

            glSet_N_N(fDensity, float_N(0))
        }
        let f: FloatData = float()
        glSet_N_N(f, exp_N(glNegative_N(fDensity)))
        return f
    }
    main(): void {
        let In: StandardVertInput = new StandardVertInput()
        glSet_V4_V4(In.position, vec4_V3_N(this.attributeData.a_position, float_N(1.0)))
        glSet_V3_V3(In.normal, this.attributeData.a_normal)
        glSet_V4_V4(In.tangent, this.attributeData.a_tangent)
        let matWorld: Mat4Data = mat4()

        let matWorldIT: Mat4Data = mat4()
        glSet_M4_M4(matWorld, this.uniformData.cc_matWorld)
        glSet_M4_M4(matWorldIT, this.uniformData.cc_matWorldIT)
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, glMul_M4_V4(matWorld, In.position))
        glSet_V3_V3(this.varyingData.v_position, pos.xyz)
        glSet_V3_V3(this.varyingData.v_normal, normalize_V3(glMul_M4_V4(matWorldIT, vec4_V3_N(In.normal, float_N(0.0))).xyz))
        glSet_V2_V2(
            this.varyingData.v_uv,
            glAdd_V2_V2(glMul_V2_V2(this.attributeData.a_texCoord, this.uniformData.tilingOffset.xy), this.uniformData.tilingOffset.zw)
        )
        glSet_N_N(this.varyingData.v_fog_factor, float_N(1.0))
        glSet_V4_V4(this.varyingData.v_shadowPos, glMul_M4_V4(this.uniformData.cc_matLightViewProj, pos))
        glSet_V4_V4(
            gl_Position,
            glMul_M4_V4(glMul_M4_M4(this.uniformData.cc_matProj, glMul_M4_M4(this.uniformData.cc_matView, matWorld)), In.position)
        )
    }
}
