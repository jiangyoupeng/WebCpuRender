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
uniform highp vec4 cc_cameraPos;
varying vec2 v_uv;
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
In.position.xy = cc_cameraPos.w == 0.0 ? vec2(In.position.xy.x, -In.position.xy.y) : In.position.xy;
gl_Position = In.position;
gl_Position.y = gl_Position.y;
v_uv = a_texCoord;
}
*/
/*
fact do glsl source: 
#define USE_INSTANCING 0
#define CC_USE_BAKED_ANIMATION 0
#define CC_USE_SKINNING 0
#define CC_MORPH_TARGET_HAS_TANGENT 0
#define CC_MORPH_TARGET_HAS_NORMAL 0
#define CC_MORPH_TARGET_HAS_POSITION 0
#define CC_MORPH_PRECOMPUTED 0
#define CC_MORPH_TARGET_COUNT 2
#define CC_USE_MORPH 0
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 37
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 145

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
uniform highp vec4 cc_cameraPos;
varying vec2 v_uv;
void main () {
StandardVertInput In;
In.position = vec4(a_position, 1.0);
In.normal = a_normal;
In.tangent = a_tangent;
In.position.xy = cc_cameraPos.w == 0.0 ? vec2(In.position.xy.x, -In.position.xy.y) : In.position.xy;
gl_Position = In.position;
gl_Position.y = gl_Position.y;
v_uv = a_texCoord;
}
*/
import {
    step_N_N,
    int_N,
    float_N,
    mod_N_N,
    exp2_N,
    vec4_V3_N,
    vec2_N_N,
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
    glSet_V2_V2,
    glSet_V4_V4,
    glMul_V4_N,
    glSet_N_N,
    glAdd_N_N,
    glMul_N_N,
    glSub_N_N,
    glSet_V3_V3,
    glIsEqual_N_N,
    glNegative_N,
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
    dataKeys: Map<string, any> = new Map([["cc_cameraPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4]])
    dataSize: Map<string, number> = new Map([["cc_cameraPos", 1]])
}
export class Impl_c78cd33daefc3c94e3885897a5af679b extends VertShaderHandle {
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
    main(): void {
        let In: StandardVertInput = new StandardVertInput()
        glSet_V4_V4(In.position, vec4_V3_N(this.attributeData.a_position, float_N(1.0)))
        glSet_V3_V3(In.normal, this.attributeData.a_normal)
        glSet_V4_V4(In.tangent, this.attributeData.a_tangent)
        glSet_V2_V2(
            In.position.xy,
            glIsEqual_N_N(float_N(this.uniformData.cc_cameraPos.w), float_N(0.0))
                ? vec2_N_N(float_N(In.position.xy.x), glNegative_N(float_N(In.position.xy.y)))
                : In.position.xy
        )
        glSet_V4_V4(gl_Position, In.position)
        gl_Position.y = float_N(gl_Position.y).v
        glSet_V2_V2(this.varyingData.v_uv, this.attributeData.a_texCoord)
    }
}
