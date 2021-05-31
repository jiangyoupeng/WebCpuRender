/*
origin glsl source: 
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 37
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 53
#define CC_RECEIVE_SHADOW 0
#define CC_USE_IBL 0
#define USE_LIGHTMAP 0
#define USE_BATCHING 0
#define CC_FORWARD_ADD 0
#define CC_USE_HDR 0
#define CC_PIPELINE_TYPE 0
#define CC_USE_FOG 0

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
uniform mediump vec4 cc_fogBase;
uniform mediump vec4 cc_fogAdd;
vec3 SRGBToLinear (vec3 gamma) {
return gamma * gamma;
}
uniform highp mat4 cc_matLightView;
uniform highp mat4 cc_matLightViewProj;
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
varying vec2 v_uv;
uniform sampler2D cc_gbuffer_albedoMap;
uniform sampler2D cc_gbuffer_positionMap;
uniform sampler2D cc_gbuffer_normalMap;
uniform sampler2D cc_gbuffer_emissiveMap;
void main () {
StandardSurface s;
vec4 albedoMap = texture2D(cc_gbuffer_albedoMap,v_uv);
vec4 positionMap = texture2D(cc_gbuffer_positionMap,v_uv);
vec4 normalMap = texture2D(cc_gbuffer_normalMap,v_uv);
vec4 emissiveMap = texture2D(cc_gbuffer_emissiveMap,v_uv);
s.albedo = albedoMap;
s.position = positionMap.xyz;
s.roughness = positionMap.w;
s.normal = normalMap.xyz;
s.metallic = normalMap.w;
s.emissive = emissiveMap.xyz;
s.occlusion = emissiveMap.w;
float fogFactor;
#if CC_USE_FOG == 0
fogFactor = LinearFog(vec4(s.position, 1));
#elif CC_USE_FOG == 1
fogFactor = ExpFog(vec4(s.position, 1));
#elif CC_USE_FOG == 2
fogFactor = ExpSquaredFog(vec4(s.position, 1));
#elif CC_USE_FOG == 3
fogFactor = LayeredFog(vec4(s.position, 1));
#else
fogFactor = 1.0;
#endif
vec4 shadowPos;
shadowPos = cc_matLightViewProj * vec4(s.position, 1);
vec4 color = CCStandardShadingBase(s, shadowPos) +
CCStandardShadingAdditive(s, shadowPos);
color = vec4(mix(CC_FORWARD_ADD > 0 ? vec3(0.0) : cc_fogColor.rgb, color.rgb, fogFactor), color.a);
gl_FragColor = CCFragOutput(color);
}
*/
import {
    cross_V3_V3,
    dot_V3_V3,
    vec4_N_N_N_N,
    exp2_N,
    min_N_N,
    vec2_N_N,
    clamp_N_N_N,
    vec3_N,
    mix_V3_V3_N,
    normalize_V3,
    abs_N,
    max_N_N,
    vec4_V3_N,
    int_N,
    min_V3_V3,
    sqrt_V3,
    distance_V4_V4,
    exp_N,
    distance_V3_V3,
    sqrt_N,
    texture2D_N_V2,
    float,
    float_N,
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
    glSet_V2_V2,
    glSet_V3_V3,
    glMul_V3_V3,
    glSet_N_N,
    glMul_N_N,
    glAdd_N_N,
    glDiv_N_N,
    glSet_V4_V4,
    glNegative_N,
    glMul_N_V4,
    glAdd_V4_V4,
    glMul_V2_N,
    glAdd_V2_V2,
    glMul_V3_N,
    glAdd_V3_N,
    glSet_Struct_Struct,
    glSub_N_N,
    glSub_V3_V3,
    glNegative_V3,
    glAdd_V3_V3,
    glMul_N_V3,
    glDivSet_V3_N,
    glMulSet_V3_V3,
    glAddSet_V3_V3,
    glMulSet_N_N,
    glDiv_V3_N,
    glIsEqual_N_N,
    glIsLess_N_N,
    glAfterAddSelf_N,
    glIsMoreEqual_N_N,
    glIsMore_N_N,
    glDiv_V3_V3,
    glIsNotEqual_N_N,
    glMul_M4_V4,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(37)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(53)
let CC_RECEIVE_SHADOW = new FloatData(0)
let CC_USE_IBL = new FloatData(0)
let USE_LIGHTMAP = new FloatData(0)
let USE_BATCHING = new FloatData(0)
let CC_FORWARD_ADD = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
let CC_PIPELINE_TYPE = new FloatData(0)
let CC_USE_FOG = new FloatData(0)
let LIGHTS_PER_PASS = new FloatData(1)
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
    cc_cameraPos: Vec4Data = new Vec4Data()
    cc_exposure: Vec4Data = new Vec4Data()
    cc_mainLitDir: Vec4Data = new Vec4Data()
    cc_mainLitColor: Vec4Data = new Vec4Data()
    cc_ambientSky: Vec4Data = new Vec4Data()
    cc_ambientGround: Vec4Data = new Vec4Data()
    cc_fogColor: Vec4Data = new Vec4Data()
    cc_fogBase: Vec4Data = new Vec4Data()
    cc_fogAdd: Vec4Data = new Vec4Data()
    cc_matLightView: Mat4Data = new Mat4Data()
    cc_matLightViewProj: Mat4Data = new Mat4Data()
    cc_shadowNFLSInfo: Vec4Data = new Vec4Data()
    cc_shadowWHPBInfo: Vec4Data = new Vec4Data()
    cc_shadowLPNNInfo: Vec4Data = new Vec4Data()
    cc_shadowColor: Vec4Data = new Vec4Data()
    cc_lightPos: Vec4Data[] = [new Vec4Data()]
    cc_lightColor: Vec4Data[] = [new Vec4Data()]
    cc_lightSizeRangeAngle: Vec4Data[] = [new Vec4Data()]
    cc_lightDir: Vec4Data[] = [new Vec4Data()]
    cc_gbuffer_albedoMap: Sampler2D = new Sampler2D()
    cc_gbuffer_positionMap: Sampler2D = new Sampler2D()
    cc_gbuffer_normalMap: Sampler2D = new Sampler2D()
    cc_gbuffer_emissiveMap: Sampler2D = new Sampler2D()
    dataKeys: Map<string, any> = new Map([
        ["cc_cameraPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_exposure", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_mainLitDir", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_mainLitColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_ambientSky", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_ambientGround", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_fogColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_fogBase", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_fogAdd", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_matLightView", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_matLightViewProj", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_shadowNFLSInfo", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_shadowWHPBInfo", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_shadowLPNNInfo", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_shadowColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_lightPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_lightColor", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_lightSizeRangeAngle", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_lightDir", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_gbuffer_albedoMap", cpuRenderingContext.cachGameGl.SAMPLER_2D],
        ["cc_gbuffer_positionMap", cpuRenderingContext.cachGameGl.SAMPLER_2D],
        ["cc_gbuffer_normalMap", cpuRenderingContext.cachGameGl.SAMPLER_2D],
        ["cc_gbuffer_emissiveMap", cpuRenderingContext.cachGameGl.SAMPLER_2D],
    ])
    dataSize: Map<string, number> = new Map([
        ["cc_cameraPos", 1],
        ["cc_exposure", 1],
        ["cc_mainLitDir", 1],
        ["cc_mainLitColor", 1],
        ["cc_ambientSky", 1],
        ["cc_ambientGround", 1],
        ["cc_fogColor", 1],
        ["cc_fogBase", 1],
        ["cc_fogAdd", 1],
        ["cc_matLightView", 1],
        ["cc_matLightViewProj", 1],
        ["cc_shadowNFLSInfo", 1],
        ["cc_shadowWHPBInfo", 1],
        ["cc_shadowLPNNInfo", 1],
        ["cc_shadowColor", 1],
        ["cc_lightPos", 1],
        ["cc_lightColor", 1],
        ["cc_lightSizeRangeAngle", 1],
        ["cc_lightDir", 1],
        ["cc_gbuffer_albedoMap", 1],
        ["cc_gbuffer_positionMap", 1],
        ["cc_gbuffer_normalMap", 1],
        ["cc_gbuffer_emissiveMap", 1],
    ])
}
export class Impl_a16f945e975039ee6e884533730d85e9 extends FragShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()

    SRGBToLinear_V3(__gamma__: Vec3Data): Vec3Data {
        let gamma: Vec3Data = vec3()
        glSet_V3_V3(gamma, __gamma__)

        return glMul_V3_V3(gamma, gamma)
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
        return vec4_V3_N(finalColor, float_N(s.albedo.w))
    }
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
    CCStandardShadingAdditive_StandardSurface_V4(__s__: StandardSurface, __shadowPos__: Vec4Data): Vec4Data {
        let s: StandardSurface = new StandardSurface()
        glSet_Struct_Struct(s, __s__)
        let shadowPos: Vec4Data = vec4()
        glSet_V4_V4(shadowPos, __shadowPos__)

        let diffuse: Vec3Data = vec3()
        glSet_V3_V3(diffuse, glMul_V3_N(s.albedo.xyz, glSub_N_N(float_N(1.0), s.metallic)))
        let specular: Vec3Data = vec3()
        glSet_V3_V3(specular, mix_V3_V3_N(vec3_N(float_N(0.04)), s.albedo.xyz, s.metallic))
        let diffuseContrib: Vec3Data = vec3()
        glSet_V3_V3(diffuseContrib, glDiv_V3_N(diffuse, float_N(3.14159265359)))
        let N: Vec3Data = vec3()
        glSet_V3_V3(N, normalize_V3(s.normal))
        let V: Vec3Data = vec3()
        glSet_V3_V3(V, normalize_V3(glSub_V3_V3(this.uniformData.cc_cameraPos.xyz, s.position)))
        let NV: FloatData = float()
        glSet_N_N(NV, max_N_N(abs_N(dot_V3_V3(N, V)), float_N(0.001)))
        glSet_V3_V3(specular, this.BRDFApprox_V3_N_N(specular, s.roughness, NV))
        let finalColor: Vec3Data = vec3()
        glSet_V3_V3(finalColor, vec3_N(float_N(0.0)))
        let numLights: IntData = int()
        glSet_N_N(
            numLights,
            glIsEqual_N_N(CC_PIPELINE_TYPE, int_N(0)) ? LIGHTS_PER_PASS : int_N(float_N(this.uniformData.cc_lightDir[int_N(0).v].w))
        )
        for (let i: IntData = int_N(0); glIsLess_N_N(i, LIGHTS_PER_PASS); glAfterAddSelf_N(i)) {
            let s: StandardSurface = new StandardSurface()
            glSet_Struct_Struct(s, __s__)
            let shadowPos: Vec4Data = vec4()
            glSet_V4_V4(shadowPos, __shadowPos__)

            if (glIsMoreEqual_N_N(i, numLights)) {
                break
            }

            let SLU: Vec3Data = vec3()
            glSet_V3_V3(SLU, glSub_V3_V3(this.uniformData.cc_lightPos[i.v].xyz, s.position))
            let SL: Vec3Data = vec3()
            glSet_V3_V3(SL, normalize_V3(SLU))
            let SH: Vec3Data = vec3()
            glSet_V3_V3(SH, normalize_V3(glAdd_V3_V3(SL, V)))
            let SNL: FloatData = float()
            glSet_N_N(SNL, max_N_N(dot_V3_V3(N, SL), float_N(0.001)))
            let SNH: FloatData = float()
            glSet_N_N(SNH, max_N_N(dot_V3_V3(N, SH), float_N(0.0)))
            let distSqr: FloatData = float()
            glSet_N_N(distSqr, dot_V3_V3(SLU, SLU))
            let litRadius: FloatData = float()
            glSet_N_N(litRadius, float_N(this.uniformData.cc_lightSizeRangeAngle[i.v].x))
            let litRadiusSqr: FloatData = float()
            glSet_N_N(litRadiusSqr, glMul_N_N(litRadius, litRadius))
            let illum: FloatData = float()
            glSet_N_N(illum, glMul_N_N(float_N(3.14159265359), glDiv_N_N(litRadiusSqr, max_N_N(litRadiusSqr, distSqr))))
            let attRadiusSqrInv: FloatData = float()
            glSet_N_N(
                attRadiusSqrInv,
                glDiv_N_N(float_N(1.0), max_N_N(float_N(this.uniformData.cc_lightSizeRangeAngle[i.v].y), float_N(0.01)))
            )
            glMulSet_N_N(attRadiusSqrInv, attRadiusSqrInv)
            let att: FloatData = float()
            glSet_N_N(att, this.GetDistAtt_N_N(distSqr, attRadiusSqrInv))
            let lspec: Vec3Data = vec3()
            glSet_V3_V3(lspec, glMul_V3_N(specular, this.CalcSpecular_N_N_V3_V3(s.roughness, SNH, SH, N)))
            if (glIsMore_N_N(float_N(this.uniformData.cc_lightPos[i.v].w), float_N(0.0))) {
                let s: StandardSurface = new StandardSurface()
                glSet_Struct_Struct(s, __s__)
                let shadowPos: Vec4Data = vec4()
                glSet_V4_V4(shadowPos, __shadowPos__)

                let cosInner: FloatData = float()
                glSet_N_N(cosInner, max_N_N(dot_V3_V3(glNegative_V3(this.uniformData.cc_lightDir[i.v].xyz), SL), float_N(0.01)))
                let cosOuter: FloatData = float()
                glSet_N_N(cosOuter, float_N(this.uniformData.cc_lightSizeRangeAngle[i.v].z))
                let litAngleScale: FloatData = float()
                glSet_N_N(litAngleScale, glDiv_N_N(float_N(1.0), max_N_N(float_N(0.001), glSub_N_N(cosInner, cosOuter))))
                let litAngleOffset: FloatData = float()
                glSet_N_N(litAngleOffset, glMul_N_N(glNegative_N(cosOuter), litAngleScale))
                glMulSet_N_N(
                    att,
                    this.GetAngleAtt_V3_V3_N_N(SL, glNegative_V3(this.uniformData.cc_lightDir[i.v].xyz), litAngleScale, litAngleOffset)
                )
            }
            let lightColor: Vec3Data = vec3()
            glSet_V3_V3(lightColor, this.uniformData.cc_lightColor[i.v].xyz)
            glAddSet_V3_V3(
                finalColor,
                glMul_V3_V3(
                    glMul_V3_N(
                        glMul_V3_N(glMul_V3_N(glMul_N_V3(SNL, lightColor), float_N(this.uniformData.cc_lightColor[i.v].w)), illum),
                        att
                    ),
                    glAdd_V3_V3(diffuseContrib, lspec)
                )
            )
        }
        glSet_V3_V3(finalColor, glMul_V3_N(finalColor, s.occlusion))
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
    CCFragOutput_V4(__color__: Vec4Data): Vec4Data {
        let color: Vec4Data = vec4()
        glSet_V4_V4(color, __color__)

        glSet_V3_V3(color.xyz, sqrt_V3(this.ACESToneMap_V3(color.out_xyz)))
        return color
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
        let s: StandardSurface = new StandardSurface()
        let albedoMap: Vec4Data = vec4()
        glSet_V4_V4(albedoMap, texture2D_N_V2(this.uniformData.cc_gbuffer_albedoMap, this.varyingData.v_uv))
        let positionMap: Vec4Data = vec4()
        glSet_V4_V4(positionMap, texture2D_N_V2(this.uniformData.cc_gbuffer_positionMap, this.varyingData.v_uv))
        let normalMap: Vec4Data = vec4()
        glSet_V4_V4(normalMap, texture2D_N_V2(this.uniformData.cc_gbuffer_normalMap, this.varyingData.v_uv))
        let emissiveMap: Vec4Data = vec4()
        glSet_V4_V4(emissiveMap, texture2D_N_V2(this.uniformData.cc_gbuffer_emissiveMap, this.varyingData.v_uv))
        glSet_V4_V4(s.albedo, albedoMap)
        glSet_V3_V3(s.position, positionMap.xyz)
        glSet_N_N(s.roughness, float_N(positionMap.w))
        glSet_V3_V3(s.normal, normalMap.xyz)
        glSet_N_N(s.metallic, float_N(normalMap.w))
        glSet_V3_V3(s.emissive, emissiveMap.xyz)
        glSet_N_N(s.occlusion, float_N(emissiveMap.w))
        let fogFactor: FloatData = float()
        glSet_N_N(fogFactor, this.LinearFog_V4(vec4_V3_N(s.position, int_N(1))))
        let shadowPos: Vec4Data = vec4()
        glSet_V4_V4(shadowPos, glMul_M4_V4(this.uniformData.cc_matLightViewProj, vec4_V3_N(s.position, int_N(1))))
        let color: Vec4Data = vec4()
        glSet_V4_V4(
            color,
            glAdd_V4_V4(
                this.CCStandardShadingBase_StandardSurface_V4(s, shadowPos),
                this.CCStandardShadingAdditive_StandardSurface_V4(s, shadowPos)
            )
        )
        glSet_V4_V4(
            color,
            vec4_V3_N(
                mix_V3_V3_N(
                    glIsMore_N_N(CC_FORWARD_ADD, int_N(0)) ? vec3_N(float_N(0.0)) : this.uniformData.cc_fogColor.xyz,
                    color.xyz,
                    fogFactor
                ),
                float_N(color.w)
            )
        )
        glSet_V4_V4(gl_FragColor, this.CCFragOutput_V4(color))
    }
}
