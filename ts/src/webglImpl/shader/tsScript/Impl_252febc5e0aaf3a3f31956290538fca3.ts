/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 49
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 38
#define CC_RENDER_MODE 0
#define CC_USE_WORLD_SPACE 0
#define CC_USE_HDR 0

precision highp float;
vec4 quaternionFromAxis (vec3 xAxis,vec3 yAxis,vec3 zAxis){
mat3 m = mat3(xAxis,yAxis,zAxis);
float trace = m[0][0] + m[1][1] + m[2][2];
vec4 quat;
if (trace > 0.) {
float s = 0.5 / sqrt(trace + 1.0);
quat.w = 0.25 / s;
quat.x = (m[2][1] - m[1][2]) * s;
quat.y = (m[0][2] - m[2][0]) * s;
quat.z = (m[1][0] - m[0][1]) * s;
} else if ((m[0][0] > m[1][1]) && (m[0][0] > m[2][2])) {
float s = 2.0 * sqrt(1.0 + m[0][0] - m[1][1] - m[2][2]);
quat.w = (m[2][1] - m[1][2]) / s;
quat.x = 0.25 * s;
quat.y = (m[0][1] + m[1][0]) / s;
quat.z = (m[0][2] + m[2][0]) / s;
} else if (m[1][1] > m[2][2]) {
float s = 2.0 * sqrt(1.0 + m[1][1] - m[0][0] - m[2][2]);
quat.w = (m[0][2] - m[2][0]) / s;
quat.x = (m[0][1] + m[1][0]) / s;
quat.y = 0.25 * s;
quat.z = (m[1][2] + m[2][1]) / s;
} else {
float s = 2.0 * sqrt(1.0 + m[2][2] - m[0][0] - m[1][1]);
quat.w = (m[1][0] - m[0][1]) / s;
quat.x = (m[0][2] + m[2][0]) / s;
quat.y = (m[1][2] + m[2][1]) / s;
quat.z = 0.25 * s;
}
float len = quat.x * quat.x + quat.y * quat.y + quat.z * quat.z + quat.w * quat.w;
if (len > 0.) {
len = 1. / sqrt(len);
quat.x = quat.x * len;
quat.y = quat.y * len;
quat.z = quat.z * len;
quat.w = quat.w * len;
}
return quat;
}
vec4 quaternionFromEuler (vec3 angle){
float x = angle.x / 2.;
float y = angle.y / 2.;
float z = angle.z / 2.;
float sx = sin(x);
float cx = cos(x);
float sy = sin(y);
float cy = cos(y);
float sz = sin(z);
float cz = cos(z);
vec4 quat = vec4(0);
quat.x = sx * cy * cz + cx * sy * sz;
quat.y = cx * sy * cz + sx * cy * sz;
quat.z = cx * cy * sz - sx * sy * cz;
quat.w = cx * cy * cz - sx * sy * sz;
return quat;
}
mat4 matrixFromRT (vec4 q, vec3 p){
float x2 = q.x + q.x;
float y2 = q.y + q.y;
float z2 = q.z + q.z;
float xx = q.x * x2;
float xy = q.x * y2;
float xz = q.x * z2;
float yy = q.y * y2;
float yz = q.y * z2;
float zz = q.z * z2;
float wx = q.w * x2;
float wy = q.w * y2;
float wz = q.w * z2;
return mat4(
1. - (yy + zz), xy + wz, xz - wy, 0,
xy - wz, 1. - (xx + zz), yz + wx, 0,
xz + wy, yz - wx, 1. - (xx + yy), 0,
p.x, p.y, p.z, 1
);
}
mat4 matFromRTS (vec4 q, vec3 t, vec3 s){
float x = q.x, y = q.y, z = q.z, w = q.w;
float x2 = x + x;
float y2 = y + y;
float z2 = z + z;
float xx = x * x2;
float xy = x * y2;
float xz = x * z2;
float yy = y * y2;
float yz = y * z2;
float zz = z * z2;
float wx = w * x2;
float wy = w * y2;
float wz = w * z2;
float sx = s.x;
float sy = s.y;
float sz = s.z;
return mat4((1. - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
(xy - wz) * sy, (1. - (xx + zz)) * sy, (yz + wx) * sy, 0,
(xz + wy) * sz, (yz - wx) * sz, (1. - (xx + yy)) * sz, 0,
t.x, t.y, t.z, 1);
}
vec4 quatMultiply (vec4 a, vec4 b){
vec4 quat;
quat.x = a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y;
quat.y = a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z;
quat.z = a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x;
quat.w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
return quat;
}
void rotateVecFromQuat (inout vec3 v, vec4 q){
float ix = q.w * v.x + q.y * v.z - q.z * v.y;
float iy = q.w * v.y + q.z * v.x - q.x * v.z;
float iz = q.w * v.z + q.x * v.y - q.y * v.x;
float iw = -q.x * v.x - q.y * v.y - q.z * v.z;
v.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;
v.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
v.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
}
vec3 rotateInLocalSpace (vec3 pos, vec3 xAxis, vec3 yAxis, vec3 zAxis, vec4 q){
vec4 viewQuat = quaternionFromAxis(xAxis, yAxis, zAxis);
vec4 rotQuat = quatMultiply(viewQuat, q);
rotateVecFromQuat(pos, rotQuat);
return pos;
}
void rotateCorner (inout vec2 corner, float angle){
float xOS = cos(angle) * corner.x - sin(angle) * corner.y;
float yOS = sin(angle) * corner.x + cos(angle) * corner.y;
corner.x = xOS;
corner.y = yOS;
}
uniform vec4 mainTiling_Offset;
uniform vec4 frameTile_velLenScale;
uniform vec4 scale;
uniform highp mat4 cc_matView;
uniform highp mat4 cc_matViewInv;
uniform highp mat4 cc_matViewProj;
uniform highp vec4 cc_cameraPos;
uniform highp mat4 cc_matWorld;
varying mediump vec2 uv;
varying mediump vec4 color;
void computeVertPos (inout vec4 pos, vec2 vertOffset, vec4 q, vec3 s
#if CC_RENDER_MODE == 0 || CC_RENDER_MODE == 3
, mat4 viewInv
#endif
#if CC_RENDER_MODE == 1
, vec3 eye
, vec4 velocity
, float velocityScale
, float lengthScale
, float xIndex
#endif
) {
#if CC_RENDER_MODE == 0
vec3 viewSpaceVert = vec3(vertOffset.x * s.x, vertOffset.y * s.y, 0.);
vec3 camX = normalize(vec3(viewInv[0][0], viewInv[1][0], viewInv[2][0]));
vec3 camY = normalize(vec3(viewInv[0][1], viewInv[1][1], viewInv[2][1]));
vec3 camZ = normalize(vec3(viewInv[0][2], viewInv[1][2], viewInv[2][2]));
pos.xyz += rotateInLocalSpace(viewSpaceVert, camX, camY, camZ, q);
#elif CC_RENDER_MODE == 1
vec3 camRight = normalize(cross(pos.xyz - eye, velocity.xyz)) * s.x;
vec3 camUp = velocity.xyz * velocityScale + normalize(velocity.xyz) * lengthScale * s.y;
pos.xyz += (camRight * abs(vertOffset.x) * sign(vertOffset.y)) - camUp * xIndex;
#elif CC_RENDER_MODE == 2
vec3 viewSpaceVert = vec3(vertOffset.x * s.x, vertOffset.y * s.y, 0.);
vec3 camX = vec3(1, 0, 0);
vec3 camY = vec3(0, 0, -1);
pos.xyz += rotateInLocalSpace(viewSpaceVert, camX, camY, cross(camX, camY), q);
#elif CC_RENDER_MODE == 3
vec2 viewSpaceVert = vec2(vertOffset.x * s.x, vertOffset.y * s.y);
rotateCorner(viewSpaceVert, q.z);
vec3 camX = normalize(vec3(cc_matView[0][0], cc_matView[1][0], cc_matView[2][0]));
vec3 camY = vec3(0, 1, 0);
vec3 offset = camX * viewSpaceVert.x + camY * viewSpaceVert.y;
pos.xyz += offset;
#else
pos.x += vertOffset.x;
pos.y += vertOffset.y;
#endif
}
vec2 computeUV (float frameIndex, vec2 vertIndex, vec2 frameTile){
vec2 aniUV = vec2(0, floor(frameIndex * frameTile.y));
aniUV.x = floor(frameIndex * frameTile.x * frameTile.y - aniUV.y * frameTile.x);
#if CC_RENDER_MODE != 4
vertIndex.y = 1. - vertIndex.y;
#endif
return (aniUV.xy + vertIndex) / vec2(frameTile.x, frameTile.y);
}
attribute vec3 a_position;
attribute vec3 a_texCoord;
attribute vec3 a_texCoord1;
attribute vec3 a_texCoord2;
attribute vec4 a_color;
#if CC_RENDER_MODE == 1
attribute vec3 a_color1;
#endif
#if CC_RENDER_MODE == 4
attribute vec3 a_texCoord3;
attribute vec3 a_normal;
attribute vec4 a_color1;
#endif
vec4 lpvs_main () {
vec3 compScale = scale.xyz * a_texCoord1;
vec4 pos = vec4(a_position, 1);
#if CC_RENDER_MODE == 1
vec4 velocity = vec4(a_color1.xyz, 0);
#endif
#if !CC_USE_WORLD_SPACE
pos = cc_matWorld * pos;
#if CC_RENDER_MODE == 1
velocity = cc_matWorld * velocity;
#endif
#endif
#if CC_RENDER_MODE != 4
vec2 cornerOffset = vec2((a_texCoord.xy - 0.5));
#if CC_RENDER_MODE == 0
vec3 rotEuler = a_texCoord2;
#elif CC_RENDER_MODE == 1
vec3 rotEuler = vec3(0.);
#else
vec3 rotEuler = vec3(0., 0., a_texCoord2.z);
#endif
computeVertPos(pos, cornerOffset, quaternionFromEuler(rotEuler), compScale
#if CC_RENDER_MODE == 0 || CC_RENDER_MODE == 3
, cc_matViewInv
#endif
#if CC_RENDER_MODE == 1
, cc_cameraPos.xyz
, velocity
, frameTile_velLenScale.z
, frameTile_velLenScale.w
, a_texCoord.x
#endif
);
color = a_color;
#else
mat4 xformNoScale = matrixFromRT(quaternionFromEuler(a_texCoord2), pos.xyz);
mat4 xform = matFromRTS(quaternionFromEuler(a_texCoord2), pos.xyz, compScale);
pos = xform * vec4(a_texCoord3, 1);
vec4 normal = xformNoScale * vec4(a_normal, 0);
color = a_color * a_color1;
#endif
uv = computeUV(a_texCoord.z, a_texCoord.xy, frameTile_velLenScale.xy) * mainTiling_Offset.xy + mainTiling_Offset.zw;
pos = cc_matViewProj * pos;
return pos;
}
void main() { gl_Position = lpvs_main(); }
*/
import {
    mat3_V3_V3_V3,
    sqrt_N,
    sin_N,
    cos_N,
    vec4_N,
    mat4_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N,
    vec3_N_N_N,
    normalize_V3,
    floor_N,
    vec2_N_N,
    vec4_V3_N,
    vec2_V2,
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
    glSet_V4_V4,
    glSet_V3_V3,
    glSet_M3_M3,
    glSet_N_N,
    glAdd_N_N,
    glIsMore_N_N,
    glDiv_N_N,
    glSub_N_N,
    glMul_N_N,
    glNegative_N,
    glSet_M4_M4,
    glAddSet_V3_V3,
    glAdd_V2_V2,
    glDiv_V2_V2,
    glMul_V3_V3,
    glMul_M4_V4,
    glSub_V2_N,
    glMul_V2_V2,
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
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(49)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(38)
let CC_RENDER_MODE = new FloatData(0)
let CC_USE_WORLD_SPACE = new FloatData(0)
let CC_USE_HDR = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    a_position: Vec3Data = null!
    a_texCoord: Vec3Data = null!
    a_texCoord1: Vec3Data = null!
    a_texCoord2: Vec3Data = null!
    a_color: Vec4Data = null!
    dataKeys: Map<string, any> = new Map([
        ["a_position", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_texCoord", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_texCoord1", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_texCoord2", cpuRenderingContext.cachGameGl.FLOAT_VEC3],
        ["a_color", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
    ])
    dataSize: Map<string, number> = new Map([
        ["a_position", 1],
        ["a_texCoord", 1],
        ["a_texCoord1", 1],
        ["a_texCoord2", 1],
        ["a_color", 1],
    ])
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
    mainTiling_Offset: Vec4Data = new Vec4Data()
    frameTile_velLenScale: Vec4Data = new Vec4Data()
    scale: Vec4Data = new Vec4Data()
    cc_matView: Mat4Data = new Mat4Data()
    cc_matViewInv: Mat4Data = new Mat4Data()
    cc_matViewProj: Mat4Data = new Mat4Data()
    cc_cameraPos: Vec4Data = new Vec4Data()
    cc_matWorld: Mat4Data = new Mat4Data()
    dataKeys: Map<string, any> = new Map([
        ["mainTiling_Offset", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["frameTile_velLenScale", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["scale", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_matView", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_matViewInv", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_matViewProj", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
        ["cc_cameraPos", cpuRenderingContext.cachGameGl.FLOAT_VEC4],
        ["cc_matWorld", cpuRenderingContext.cachGameGl.FLOAT_MAT4],
    ])
    dataSize: Map<string, number> = new Map([
        ["mainTiling_Offset", 1],
        ["frameTile_velLenScale", 1],
        ["scale", 1],
        ["cc_matView", 1],
        ["cc_matViewInv", 1],
        ["cc_matViewProj", 1],
        ["cc_cameraPos", 1],
        ["cc_matWorld", 1],
    ])
}
export class Impl_252febc5e0aaf3a3f31956290538fca3 extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    quaternionFromAxis_V3_V3_V3(__xAxis__: Vec3Data, __yAxis__: Vec3Data, __zAxis__: Vec3Data): Vec4Data {
        let xAxis: Vec3Data = new Vec3Data()
        glSet_V3_V3(xAxis, __xAxis__)
        let yAxis: Vec3Data = new Vec3Data()
        glSet_V3_V3(yAxis, __yAxis__)
        let zAxis: Vec3Data = new Vec3Data()
        glSet_V3_V3(zAxis, __zAxis__)

        let m: Mat3Data = mat3()
        glSet_M3_M3(m, mat3_V3_V3_V3(xAxis, yAxis, zAxis))
        let trace: FloatData = float()
        glSet_N_N(
            trace,
            glAdd_N_N(
                glAdd_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(0))],
                    (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(1))]
                ),
                (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(2))]
            )
        )
        let quat: Vec4Data = vec4()
        if (glIsMore_N_N(trace, float_N(0))) {
            let xAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(xAxis, __xAxis__)
            let yAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(yAxis, __yAxis__)
            let zAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(zAxis, __zAxis__)

            let s: FloatData = float()
            glSet_N_N(s, glDiv_N_N(float_N(0.5), sqrt_N(glAdd_N_N(trace, float_N(1.0)))))
            quat.w = glDiv_N_N(float_N(0.25), s).v
            quat.x = glMul_N_N(
                glSub_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(1))],
                    (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(2))]
                ),
                s
            ).v
            quat.y = glMul_N_N(
                glSub_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(2))],
                    (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(0))]
                ),
                s
            ).v
            quat.z = glMul_N_N(
                glSub_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(0))],
                    (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(1))]
                ),
                s
            ).v
        } else if (
            glIsMore_N_N(
                (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(0))],
                (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(1))]
            ) &&
            glIsMore_N_N(
                (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(0))],
                (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(2))]
            )
        ) {
            let xAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(xAxis, __xAxis__)
            let yAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(yAxis, __yAxis__)
            let zAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(zAxis, __zAxis__)

            let s: FloatData = float()
            glSet_N_N(
                s,
                glMul_N_N(
                    float_N(2.0),
                    sqrt_N(
                        glSub_N_N(
                            glSub_N_N(
                                glAdd_N_N(float_N(1.0), (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(0))]),
                                (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(1))]
                            ),
                            (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(2))]
                        )
                    )
                )
            )
            quat.w = glDiv_N_N(
                glSub_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(1))],
                    (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(2))]
                ),
                s
            ).v
            quat.x = glMul_N_N(float_N(0.25), s).v
            quat.y = glDiv_N_N(
                glAdd_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(1))],
                    (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(0))]
                ),
                s
            ).v
            quat.z = glDiv_N_N(
                glAdd_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(2))],
                    (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(0))]
                ),
                s
            ).v
        } else if (
            glIsMore_N_N(
                (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(1))],
                (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(2))]
            )
        ) {
            let xAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(xAxis, __xAxis__)
            let yAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(yAxis, __yAxis__)
            let zAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(zAxis, __zAxis__)

            let s: FloatData = float()
            glSet_N_N(
                s,
                glMul_N_N(
                    float_N(2.0),
                    sqrt_N(
                        glSub_N_N(
                            glSub_N_N(
                                glAdd_N_N(float_N(1.0), (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(1))]),
                                (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(0))]
                            ),
                            (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(2))]
                        )
                    )
                )
            )
            quat.w = glDiv_N_N(
                glSub_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(2))],
                    (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(0))]
                ),
                s
            ).v
            quat.x = glDiv_N_N(
                glAdd_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(1))],
                    (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(0))]
                ),
                s
            ).v
            quat.y = glMul_N_N(float_N(0.25), s).v
            quat.z = glDiv_N_N(
                glAdd_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(2))],
                    (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(1))]
                ),
                s
            ).v
        } else {
            let xAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(xAxis, __xAxis__)
            let yAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(yAxis, __yAxis__)
            let zAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(zAxis, __zAxis__)

            let s: FloatData = float()
            glSet_N_N(
                s,
                glMul_N_N(
                    float_N(2.0),
                    sqrt_N(
                        glSub_N_N(
                            glSub_N_N(
                                glAdd_N_N(float_N(1.0), (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(2))]),
                                (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(0))]
                            ),
                            (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(1))]
                        )
                    )
                )
            )
            quat.w = glDiv_N_N(
                glSub_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(0))],
                    (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(1))]
                ),
                s
            ).v
            quat.x = glDiv_N_N(
                glAdd_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(2))],
                    (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(0))]
                ),
                s
            ).v
            quat.y = glDiv_N_N(
                glAdd_N_N(
                    (<any>m)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(2))],
                    (<any>m)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(1))]
                ),
                s
            ).v
            quat.z = glMul_N_N(float_N(0.25), s).v
        }

        let len: FloatData = float()
        glSet_N_N(
            len,
            glAdd_N_N(
                glAdd_N_N(
                    glAdd_N_N(glMul_N_N(float_N(quat.x), float_N(quat.x)), glMul_N_N(float_N(quat.y), float_N(quat.y))),
                    glMul_N_N(float_N(quat.z), float_N(quat.z))
                ),
                glMul_N_N(float_N(quat.w), float_N(quat.w))
            )
        )
        if (glIsMore_N_N(len, float_N(0))) {
            let xAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(xAxis, __xAxis__)
            let yAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(yAxis, __yAxis__)
            let zAxis: Vec3Data = new Vec3Data()
            glSet_V3_V3(zAxis, __zAxis__)

            glSet_N_N(len, glDiv_N_N(float_N(1), sqrt_N(len)))
            quat.x = glMul_N_N(float_N(quat.x), len).v
            quat.y = glMul_N_N(float_N(quat.y), len).v
            quat.z = glMul_N_N(float_N(quat.z), len).v
            quat.w = glMul_N_N(float_N(quat.w), len).v
        }
        return quat
    }
    quaternionFromEuler_V3(__angle__: Vec3Data): Vec4Data {
        let angle: Vec3Data = new Vec3Data()
        glSet_V3_V3(angle, __angle__)

        let x: FloatData = float()
        glSet_N_N(x, glDiv_N_N(float_N(angle.x), float_N(2)))
        let y: FloatData = float()
        glSet_N_N(y, glDiv_N_N(float_N(angle.y), float_N(2)))
        let z: FloatData = float()
        glSet_N_N(z, glDiv_N_N(float_N(angle.z), float_N(2)))
        let sx: FloatData = float()
        glSet_N_N(sx, sin_N(x))
        let cx: FloatData = float()
        glSet_N_N(cx, cos_N(x))
        let sy: FloatData = float()
        glSet_N_N(sy, sin_N(y))
        let cy: FloatData = float()
        glSet_N_N(cy, cos_N(y))
        let sz: FloatData = float()
        glSet_N_N(sz, sin_N(z))
        let cz: FloatData = float()
        glSet_N_N(cz, cos_N(z))
        let quat: Vec4Data = vec4()
        glSet_V4_V4(quat, vec4_N(int_N(0)))
        quat.x = glAdd_N_N(glMul_N_N(glMul_N_N(sx, cy), cz), glMul_N_N(glMul_N_N(cx, sy), sz)).v
        quat.y = glAdd_N_N(glMul_N_N(glMul_N_N(cx, sy), cz), glMul_N_N(glMul_N_N(sx, cy), sz)).v
        quat.z = glSub_N_N(glMul_N_N(glMul_N_N(cx, cy), sz), glMul_N_N(glMul_N_N(sx, sy), cz)).v
        quat.w = glSub_N_N(glMul_N_N(glMul_N_N(cx, cy), cz), glMul_N_N(glMul_N_N(sx, sy), sz)).v
        return quat
    }
    matrixFromRT_V4_V3(__q__: Vec4Data, __p__: Vec3Data): Mat4Data {
        let q: Vec4Data = new Vec4Data()
        glSet_V4_V4(q, __q__)
        let p: Vec3Data = new Vec3Data()
        glSet_V3_V3(p, __p__)

        let x2: FloatData = float()
        glSet_N_N(x2, glAdd_N_N(float_N(q.x), float_N(q.x)))
        let y2: FloatData = float()
        glSet_N_N(y2, glAdd_N_N(float_N(q.y), float_N(q.y)))
        let z2: FloatData = float()
        glSet_N_N(z2, glAdd_N_N(float_N(q.z), float_N(q.z)))
        let xx: FloatData = float()
        glSet_N_N(xx, glMul_N_N(float_N(q.x), x2))
        let xy: FloatData = float()
        glSet_N_N(xy, glMul_N_N(float_N(q.x), y2))
        let xz: FloatData = float()
        glSet_N_N(xz, glMul_N_N(float_N(q.x), z2))
        let yy: FloatData = float()
        glSet_N_N(yy, glMul_N_N(float_N(q.y), y2))
        let yz: FloatData = float()
        glSet_N_N(yz, glMul_N_N(float_N(q.y), z2))
        let zz: FloatData = float()
        glSet_N_N(zz, glMul_N_N(float_N(q.z), z2))
        let wx: FloatData = float()
        glSet_N_N(wx, glMul_N_N(float_N(q.w), x2))
        let wy: FloatData = float()
        glSet_N_N(wy, glMul_N_N(float_N(q.w), y2))
        let wz: FloatData = float()
        glSet_N_N(wz, glMul_N_N(float_N(q.w), z2))
        return mat4_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N(
            glSub_N_N(float_N(1), glAdd_N_N(yy, zz)),
            glAdd_N_N(xy, wz),
            glSub_N_N(xz, wy),
            int_N(0),
            glSub_N_N(xy, wz),
            glSub_N_N(float_N(1), glAdd_N_N(xx, zz)),
            glAdd_N_N(yz, wx),
            int_N(0),
            glAdd_N_N(xz, wy),
            glSub_N_N(yz, wx),
            glSub_N_N(float_N(1), glAdd_N_N(xx, yy)),
            int_N(0),
            float_N(p.x),
            float_N(p.y),
            float_N(p.z),
            int_N(1)
        )
    }
    matFromRTS_V4_V3_V3(__q__: Vec4Data, __t__: Vec3Data, __s__: Vec3Data): Mat4Data {
        let q: Vec4Data = new Vec4Data()
        glSet_V4_V4(q, __q__)
        let t: Vec3Data = new Vec3Data()
        glSet_V3_V3(t, __t__)
        let s: Vec3Data = new Vec3Data()
        glSet_V3_V3(s, __s__)

        let x: FloatData = float()
        glSet_N_N(x, float_N(q.x))
        let y: FloatData = float()
        glSet_N_N(y, float_N(q.y))
        let z: FloatData = float()
        glSet_N_N(z, float_N(q.z))
        let w: FloatData = float()
        glSet_N_N(w, float_N(q.w))
        let x2: FloatData = float()
        glSet_N_N(x2, glAdd_N_N(x, x))
        let y2: FloatData = float()
        glSet_N_N(y2, glAdd_N_N(y, y))
        let z2: FloatData = float()
        glSet_N_N(z2, glAdd_N_N(z, z))
        let xx: FloatData = float()
        glSet_N_N(xx, glMul_N_N(x, x2))
        let xy: FloatData = float()
        glSet_N_N(xy, glMul_N_N(x, y2))
        let xz: FloatData = float()
        glSet_N_N(xz, glMul_N_N(x, z2))
        let yy: FloatData = float()
        glSet_N_N(yy, glMul_N_N(y, y2))
        let yz: FloatData = float()
        glSet_N_N(yz, glMul_N_N(y, z2))
        let zz: FloatData = float()
        glSet_N_N(zz, glMul_N_N(z, z2))
        let wx: FloatData = float()
        glSet_N_N(wx, glMul_N_N(w, x2))
        let wy: FloatData = float()
        glSet_N_N(wy, glMul_N_N(w, y2))
        let wz: FloatData = float()
        glSet_N_N(wz, glMul_N_N(w, z2))
        let sx: FloatData = float()
        glSet_N_N(sx, float_N(s.x))
        let sy: FloatData = float()
        glSet_N_N(sy, float_N(s.y))
        let sz: FloatData = float()
        glSet_N_N(sz, float_N(s.z))
        return mat4_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N(
            glMul_N_N(glSub_N_N(float_N(1), glAdd_N_N(yy, zz)), sx),
            glMul_N_N(glAdd_N_N(xy, wz), sx),
            glMul_N_N(glSub_N_N(xz, wy), sx),
            int_N(0),
            glMul_N_N(glSub_N_N(xy, wz), sy),
            glMul_N_N(glSub_N_N(float_N(1), glAdd_N_N(xx, zz)), sy),
            glMul_N_N(glAdd_N_N(yz, wx), sy),
            int_N(0),
            glMul_N_N(glAdd_N_N(xz, wy), sz),
            glMul_N_N(glSub_N_N(yz, wx), sz),
            glMul_N_N(glSub_N_N(float_N(1), glAdd_N_N(xx, yy)), sz),
            int_N(0),
            float_N(t.x),
            float_N(t.y),
            float_N(t.z),
            int_N(1)
        )
    }
    quatMultiply_V4_V4(__a__: Vec4Data, __b__: Vec4Data): Vec4Data {
        let a: Vec4Data = new Vec4Data()
        glSet_V4_V4(a, __a__)
        let b: Vec4Data = new Vec4Data()
        glSet_V4_V4(b, __b__)

        let quat: Vec4Data = vec4()
        quat.x = glSub_N_N(
            glAdd_N_N(
                glAdd_N_N(glMul_N_N(float_N(a.x), float_N(b.w)), glMul_N_N(float_N(a.w), float_N(b.x))),
                glMul_N_N(float_N(a.y), float_N(b.z))
            ),
            glMul_N_N(float_N(a.z), float_N(b.y))
        ).v
        quat.y = glSub_N_N(
            glAdd_N_N(
                glAdd_N_N(glMul_N_N(float_N(a.y), float_N(b.w)), glMul_N_N(float_N(a.w), float_N(b.y))),
                glMul_N_N(float_N(a.z), float_N(b.x))
            ),
            glMul_N_N(float_N(a.x), float_N(b.z))
        ).v
        quat.z = glSub_N_N(
            glAdd_N_N(
                glAdd_N_N(glMul_N_N(float_N(a.z), float_N(b.w)), glMul_N_N(float_N(a.w), float_N(b.z))),
                glMul_N_N(float_N(a.x), float_N(b.y))
            ),
            glMul_N_N(float_N(a.y), float_N(b.x))
        ).v
        quat.w = glSub_N_N(
            glSub_N_N(
                glSub_N_N(glMul_N_N(float_N(a.w), float_N(b.w)), glMul_N_N(float_N(a.x), float_N(b.x))),
                glMul_N_N(float_N(a.y), float_N(b.y))
            ),
            glMul_N_N(float_N(a.z), float_N(b.z))
        ).v
        return quat
    }
    rotateVecFromQuat_V3_V4(v: Vec3Data, __q__: Vec4Data): void {
        let q: Vec4Data = new Vec4Data()
        glSet_V4_V4(q, __q__)

        let ix: FloatData = float()
        glSet_N_N(
            ix,
            glSub_N_N(
                glAdd_N_N(glMul_N_N(float_N(q.w), float_N(v.x)), glMul_N_N(float_N(q.y), float_N(v.z))),
                glMul_N_N(float_N(q.z), float_N(v.y))
            )
        )
        let iy: FloatData = float()
        glSet_N_N(
            iy,
            glSub_N_N(
                glAdd_N_N(glMul_N_N(float_N(q.w), float_N(v.y)), glMul_N_N(float_N(q.z), float_N(v.x))),
                glMul_N_N(float_N(q.x), float_N(v.z))
            )
        )
        let iz: FloatData = float()
        glSet_N_N(
            iz,
            glSub_N_N(
                glAdd_N_N(glMul_N_N(float_N(q.w), float_N(v.z)), glMul_N_N(float_N(q.x), float_N(v.y))),
                glMul_N_N(float_N(q.y), float_N(v.x))
            )
        )
        let iw: FloatData = float()
        glSet_N_N(
            iw,
            glSub_N_N(
                glSub_N_N(glMul_N_N(glNegative_N(float_N(q.x)), float_N(v.x)), glMul_N_N(float_N(q.y), float_N(v.y))),
                glMul_N_N(float_N(q.z), float_N(v.z))
            )
        )
        v.x = glSub_N_N(
            glAdd_N_N(
                glAdd_N_N(glMul_N_N(ix, float_N(q.w)), glMul_N_N(iw, glNegative_N(float_N(q.x)))),
                glMul_N_N(iy, glNegative_N(float_N(q.z)))
            ),
            glMul_N_N(iz, glNegative_N(float_N(q.y)))
        ).v
        v.y = glSub_N_N(
            glAdd_N_N(
                glAdd_N_N(glMul_N_N(iy, float_N(q.w)), glMul_N_N(iw, glNegative_N(float_N(q.y)))),
                glMul_N_N(iz, glNegative_N(float_N(q.x)))
            ),
            glMul_N_N(ix, glNegative_N(float_N(q.z)))
        ).v
        v.z = glSub_N_N(
            glAdd_N_N(
                glAdd_N_N(glMul_N_N(iz, float_N(q.w)), glMul_N_N(iw, glNegative_N(float_N(q.z)))),
                glMul_N_N(ix, glNegative_N(float_N(q.y)))
            ),
            glMul_N_N(iy, glNegative_N(float_N(q.x)))
        ).v
    }
    rotateInLocalSpace_V3_V3_V3_V3_V4(
        __pos__: Vec3Data,
        __xAxis__: Vec3Data,
        __yAxis__: Vec3Data,
        __zAxis__: Vec3Data,
        __q__: Vec4Data
    ): Vec3Data {
        let pos: Vec3Data = new Vec3Data()
        glSet_V3_V3(pos, __pos__)
        let xAxis: Vec3Data = new Vec3Data()
        glSet_V3_V3(xAxis, __xAxis__)
        let yAxis: Vec3Data = new Vec3Data()
        glSet_V3_V3(yAxis, __yAxis__)
        let zAxis: Vec3Data = new Vec3Data()
        glSet_V3_V3(zAxis, __zAxis__)
        let q: Vec4Data = new Vec4Data()
        glSet_V4_V4(q, __q__)

        let viewQuat: Vec4Data = vec4()
        glSet_V4_V4(viewQuat, this.quaternionFromAxis_V3_V3_V3(xAxis, yAxis, zAxis))
        let rotQuat: Vec4Data = vec4()
        glSet_V4_V4(rotQuat, this.quatMultiply_V4_V4(viewQuat, q))
        this.rotateVecFromQuat_V3_V4(pos, rotQuat)
        return pos
    }
    rotateCorner_V2_N(corner: Vec2Data, __angle__: FloatData): void {
        let angle: FloatData = new FloatData()
        glSet_N_N(angle, __angle__)

        let xOS: FloatData = float()
        glSet_N_N(xOS, glSub_N_N(glMul_N_N(cos_N(angle), float_N(corner.x)), glMul_N_N(sin_N(angle), float_N(corner.y))))
        let yOS: FloatData = float()
        glSet_N_N(yOS, glAdd_N_N(glMul_N_N(sin_N(angle), float_N(corner.x)), glMul_N_N(cos_N(angle), float_N(corner.y))))
        corner.x = xOS.v
        corner.y = yOS.v
    }
    computeVertPos_V4_V2_V4_V3_M4(pos: Vec4Data, __vertOffset__: Vec2Data, __q__: Vec4Data, __s__: Vec3Data, __viewInv__: Mat4Data): void {
        let vertOffset: Vec2Data = new Vec2Data()
        glSet_V2_V2(vertOffset, __vertOffset__)
        let q: Vec4Data = new Vec4Data()
        glSet_V4_V4(q, __q__)
        let s: Vec3Data = new Vec3Data()
        glSet_V3_V3(s, __s__)
        let viewInv: Mat4Data = new Mat4Data()
        glSet_M4_M4(viewInv, __viewInv__)

        let viewSpaceVert: Vec3Data = vec3()
        glSet_V3_V3(
            viewSpaceVert,
            vec3_N_N_N(glMul_N_N(float_N(vertOffset.x), float_N(s.x)), glMul_N_N(float_N(vertOffset.y), float_N(s.y)), float_N(0))
        )
        let camX: Vec3Data = vec3()
        glSet_V3_V3(
            camX,
            normalize_V3(
                vec3_N_N_N(
                    (<any>viewInv)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(0))],
                    (<any>viewInv)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(0))],
                    (<any>viewInv)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(0))]
                )
            )
        )
        let camY: Vec3Data = vec3()
        glSet_V3_V3(
            camY,
            normalize_V3(
                vec3_N_N_N(
                    (<any>viewInv)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(1))],
                    (<any>viewInv)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(1))],
                    (<any>viewInv)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(1))]
                )
            )
        )
        let camZ: Vec3Data = vec3()
        glSet_V3_V3(
            camZ,
            normalize_V3(
                vec3_N_N_N(
                    (<any>viewInv)[getValueKeyByIndex(int_N(0))][getValueKeyByIndex(int_N(2))],
                    (<any>viewInv)[getValueKeyByIndex(int_N(1))][getValueKeyByIndex(int_N(2))],
                    (<any>viewInv)[getValueKeyByIndex(int_N(2))][getValueKeyByIndex(int_N(2))]
                )
            )
        )
        glAddSet_V3_V3(pos.xyz, this.rotateInLocalSpace_V3_V3_V3_V3_V4(viewSpaceVert, camX, camY, camZ, q))
    }
    computeUV_N_V2_V2(__frameIndex__: FloatData, __vertIndex__: Vec2Data, __frameTile__: Vec2Data): Vec2Data {
        let frameIndex: FloatData = new FloatData()
        glSet_N_N(frameIndex, __frameIndex__)
        let vertIndex: Vec2Data = new Vec2Data()
        glSet_V2_V2(vertIndex, __vertIndex__)
        let frameTile: Vec2Data = new Vec2Data()
        glSet_V2_V2(frameTile, __frameTile__)

        let aniUV: Vec2Data = vec2()
        glSet_V2_V2(aniUV, vec2_N_N(int_N(0), floor_N(glMul_N_N(frameIndex, float_N(frameTile.y)))))
        aniUV.x = floor_N(
            glSub_N_N(
                glMul_N_N(glMul_N_N(frameIndex, float_N(frameTile.x)), float_N(frameTile.y)),
                glMul_N_N(float_N(aniUV.y), float_N(frameTile.x))
            )
        ).v
        vertIndex.y = glSub_N_N(float_N(1), float_N(vertIndex.y)).v
        return glDiv_V2_V2(glAdd_V2_V2(aniUV.xy, vertIndex), vec2_N_N(float_N(frameTile.x), float_N(frameTile.y)))
    }
    lpvs_main(): Vec4Data {
        let compScale: Vec3Data = vec3()
        glSet_V3_V3(compScale, glMul_V3_V3(this.uniformData.scale.xyz, this.attributeData.a_texCoord1))
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, vec4_V3_N(this.attributeData.a_position, int_N(1)))
        glSet_V4_V4(pos, glMul_M4_V4(this.uniformData.cc_matWorld, pos))
        let cornerOffset: Vec2Data = vec2()
        glSet_V2_V2(cornerOffset, vec2_V2(glSub_V2_N(this.attributeData.a_texCoord.xy, float_N(0.5))))
        let rotEuler: Vec3Data = vec3()
        glSet_V3_V3(rotEuler, this.attributeData.a_texCoord2)
        this.computeVertPos_V4_V2_V4_V3_M4(
            pos,
            cornerOffset,
            this.quaternionFromEuler_V3(rotEuler),
            compScale,
            this.uniformData.cc_matViewInv
        )
        glSet_V4_V4(this.varyingData.color, this.attributeData.a_color)
        glSet_V2_V2(
            this.varyingData.uv,
            glAdd_V2_V2(
                glMul_V2_V2(
                    this.computeUV_N_V2_V2(
                        this.attributeData.a_texCoord.out_z,
                        this.attributeData.a_texCoord.out_xy,
                        this.uniformData.frameTile_velLenScale.out_xy
                    ),
                    this.uniformData.mainTiling_Offset.xy
                ),
                this.uniformData.mainTiling_Offset.zw
            )
        )
        glSet_V4_V4(pos, glMul_M4_V4(this.uniformData.cc_matViewProj, pos))
        return pos
    }
    main(): void {
        glSet_V4_V4(gl_Position, this.lpvs_main())
    }
}
