// 对应要替换的glsl代码 用于调试
export let glslShaderHackScript: Map<string, string> = new Map([
    [
        `77fedd74c2ac1ed8214e40882d35ff0e`,
        `#define USE_RGBE_CUBEMAP 0
#define CC_USE_HDR 0
#define CC_USE_IBL 0
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 37
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 37
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0

precision mediump float;
uniform mediump vec4 cc_ambientSky;
uniform samplerCube cc_environment;
vec3 unpackRGBE (vec4 rgbe) {
return rgbe.rgb * pow(2.0, rgbe.a * 255.0 - 128.0);
}
vec3 SRGBToLinear (vec3 gamma) {
return gamma * gamma;
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
varying highp vec4 viewDir;
vec4 frag () {
vec3 c = SRGBToLinear(textureCube(cc_environment, viewDir.xyz).rgb);
return CCFragOutput(vec4(c * cc_ambientSky.w, 1.0));
}
void main() { 
    // gl_FragColor = frag(); 
    gl_FragColor = vec4(viewDir.xyz, 1.);
}
`,
    ],
    [
        `cc942b5cafaaee05ef888728bd9087a3`,
        `#define USE_RGBE_CUBEMAP 0
#define CC_USE_HDR 0
#define CC_USE_IBL 0
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 37
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 37
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4095
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0

precision highp float;
uniform highp mat4 cc_matView;
uniform highp mat4 cc_matProj;
struct StandardVertInput {
highp vec4 position;
vec3 normal;
vec4 tangent;
};
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;
attribute vec4 a_tangent;
varying highp vec4 viewDir;
vec4 vert () {
viewDir = vec4(a_position, 1.0);
mat4 matViewRotOnly = mat4(mat3(cc_matView));
mat4 matProj = cc_matProj;
// if (matProj[3].w > 0.0) {
// vec2 scale = vec2(48.0, 24.0);
// matProj[0].xy *= scale;
// matProj[1].xy *= scale;
// matProj[2].zw = vec2(-1.0);
// matProj[3].zw = vec2(0.0);
// }
vec4 pos = matProj * viewDir;
// vec4 pos = matProj * matViewRotOnly * viewDir;
// pos.z = 0.99999 * pos.w;
return pos;
}
void main() { 
    viewDir = vec4(a_position, 1.0);
    viewDir = cc_matProj * viewDir;
    // gl_Position = vec4(a_position, 1.0);
    gl_Position = viewDir;
    // viewDir = vec4(0.5,0.5,0.5,1);
    // gl_Position = vert(); 
}
`,
    ],
])
