export let builtinValue = {
    gl_FragData: "Vec4Data[]",
    gl_Position: "Vec4Data",
    gl_FragCoord: "Vec4Data",
    gl_FragDepth: "FloatData",
    gl_FrontFacing: "BoolData",
    gl_FragColor: "Vec4Data",
}

export let convertToTsType = {
    int: "IntData",
    "int[]": "IntData[]",
    float: "FloatData",
    "float[]": "FloatData[]",
    double: "FloatData",
    "double[]": "FloatData[]",
    vec2: "Vec2Data",
    "vec2[]": "Vec2Data[]",
    vec3: "Vec3Data",
    "vec3[]": "Vec3Data[]",
    vec4: "Vec4Data",
    "vec4[]": "Vec4Data[]",
    mat3: "Mat3Data",
    "mat3[]": "Mat3Data[]",
    mat4: "Mat4Data",
    "mat4[]": "Mat4Data[]",
    sampler2D: "Sampler2D",
    samplerCube: "SamplerCube",
    void: "void",
    bool: "BoolData",
    "bool[]": "BoolData[]",
}

export let convertToBuiltinCall = {
    IntData: "int",
    FloatData: "float",
    Vec2Data: "vec2",
    Vec3Data: "vec3",
    Vec4Data: "vec4",
    Mat3Data: "mat3",
    Mat4Data: "mat4",
    BoolData: "bool",
    Sampler2D: "sampler2D",
    SamplerCube: "samplerCube",
}

export let tsbuiltinOperationFunsWithReturn = {
    glAdd_N_N: "NumData",
    glAdd_N_V2: "Vec2Data",
    glAdd_N_V3: "Vec3Data",
    glAdd_N_V4: "Vec4Data",
    glAdd_V2_N: "Vec2Data",
    glAdd_V2_V2: "Vec2Data",
    glAdd_V3_N: "Vec3Data",
    glAdd_V3_V3: "Vec3Data",
    glAdd_V4_N: "Vec4Data",
    glAdd_V4_V4: "Vec4Data",
    glAdd_M3_M3: "Mat3Data",
    glAdd_M3_N: "Mat3Data",
    glAdd_M4_N: "Mat4Data",
    glAdd_N_M4: "Mat4Data",
    glAdd_N_M3: "Mat3Data",
    glAdd_M4_M4: "Mat4Data",
    glAddSet_N_N: "void",
    glAddSet_V2_N: "void",
    glAddSet_V2_V2: "void",
    glAddSet_V3_N: "void",
    glAddSet_V3_V3: "void",
    glAddSet_V4_N: "void",
    glAddSet_M3_N: "void",
    glAddSet_M4_N: "void",
    glAddSet_M3_M3: "void",
    glAddSet_M4_M4: "void",
    glAddSet_V4_V4: "void",
    glSub_N_N: "NumData",
    glSub_N_V2: "Vec2Data",
    glSub_N_V3: "Vec3Data",
    glSub_N_V4: "Vec4Data",
    glSub_V2_N: "Vec2Data",
    glSub_V2_V2: "Vec2Data",
    glSub_V3_N: "Vec3Data",
    glSub_V3_V3: "Vec3Data",
    glSub_V4_N: "Vec4Data",
    glSub_V4_V4: "Vec4Data",
    glSub_M3_M3: "Mat3Data",
    glSub_M3_N: "Mat3Data",
    glSub_N_M3: "Mat3Data",
    glSub_M4_M4: "Mat4Data",
    glSub_M4_N: "Mat4Data",
    glSub_N_M4: "Mat4Data",
    glSubSet_N_N: "void",
    glSubSet_V2_N: "void",
    glSubSet_V2_V2: "void",
    glSubSet_V3_N: "void",
    glSubSet_V3_V3: "void",
    glSubSet_V4_N: "void",
    glSubSet_V4_V4: "void",
    glSubSet_M3_N: "void",
    glSubSet_M4_N: "void",
    glSubSet_M3_M3: "void",
    gSubSet_M4_M4: "void",
    glMul_N_N: "NumData",
    glMul_N_V2: "Vec2Data",
    glMul_N_V3: "Vec3Data",
    glMul_N_V4: "Vec4Data",
    glMul_V2_N: "Vec2Data",
    glMul_V2_V2: "Vec2Data",
    glMul_V3_N: "Vec3Data",
    glMul_V3_V3: "Vec3Data",
    glMul_V3_M3: "Vec3Data",
    glMul_V4_N: "Vec4Data",
    glMul_V4_V4: "Vec4Data",
    glMul_M3_M3: "Mat3Data",
    glMul_M3_N: "Mat3Data",
    glMul_N_M3: "Mat3Data",
    glMul_M4_M4: "Mat4Data",
    glMul_M4_N: "Mat4Data",
    glMul_N_M4: "Mat4Data",
    glMulSet_N_N: "void",
    glMulSet_V2_N: "void",
    glMulSet_V2_V2: "void",
    glMulSet_V3_N: "void",
    glMulSet_V3_V3: "void",
    glMulSet_V4_N: "void",
    glMulSet_V4_V4: "void",
    glMul_M4_V4: "Vec4Data",
    glMul_V4_M4: "Vec4Data",
    glMulSet_M3_N: "void",
    glMulSet_M4_N: "void",
    glMulSet_M3_M3: "void",
    gMulSet_M4_M4: "void",
    glDiv_N_N: "NumData",
    glDiv_N_V2: "Vec2Data",
    glDiv_N_V3: "Vec3Data",
    glDiv_N_V4: "Vec4Data",
    glDiv_V2_N: "Vec2Data",
    glDiv_V2_V2: "Vec2Data",
    glDiv_V3_N: "Vec3Data",
    glDiv_V3_V3: "Vec3Data",
    glDiv_V4_N: "Vec4Data",
    glDiv_V4_V4: "Vec4Data",
    glDiv_M3_M3: "Mat3Data",
    glDiv_M3_N: "Mat3Data",
    glDiv_N_M3: "Mat3Data",
    glDiv_M4_M4: "Mat4Data",
    glDiv_M4_N: "Mat4Data",
    glDiv_N_M4: "Mat4Data",
    glDivSet_N_N: "void",
    glDivSet_V2_N: "void",
    glDivSet_V2_V2: "void",
    glDivSet_V3_N: "void",
    glDivSet_V3_V3: "void",
    glDivSet_V4_N: "void",
    glDivSet_M3_M3: "void",
    glDivSet_M3_N: "void",
    glDivSet_M4_M4: "void",
    glDivSet_M4_N: "void",
    glNegative_N: "NumData",
    glNegative_V2: "Vec2Data",
    glNegative_V3: "Vec3Data",
    glNegative_V4: "Vec4Data",
    glSet_A_A: "ValueType[]",
    glSet_AA_AA: "ValueType[][]",
    glSet_N_N: "NumData",
    glSet_B_B: "BoolData",
    glSet_B_b: "BoolData",
    glSet_V2_V2: "Vec2Data",
    glSet_V3_V3: "Vec3Data",
    glSet_V4_V4: "Vec4Data",
    glSet_M3_M3: "Mat3Data",
    glSet_M4_M4: "Mat4Data",
    glSet_Struct_Struct: "any",
    glIsNotEqual_N_N: "boolean",
    glIsEqual_N_N: "boolean",
    glIsLessEqual_N_N: "boolean",
    glIsLess_N_N: "boolean",
    glIsMore_N_N: "boolean",
    glIsMoreEqual_N_N: "boolean",
    glFrontAddSelf_N: "NumData",
    glAfterAddSelf_N: "NumData",
    glFrontSubSelf_N: "NumData",
    glAfterSubSelf_N: "NumData",
    glFrontAddSelf_V2: "Vec2Data",
    glAfterAddSelf_V2: "Vec2Data",
    glFrontSubSelf_V2: "Vec2Data",
    glAfterSubSelf_V2: "Vec2Data",
    glFrontAddSelf_V3: "Vec3Data",
    glAfterAddSelf_V3: "Vec3Data",
    glFrontSubSelf_V3: "Vec3Data",
    glAfterSubSelf_V3: "Vec3Data",
    glFrontAddSelf_V4: "Vec4Data",
    glAfterAddSelf_V4: "Vec4Data",
    glFrontSubSelf_V4: "Vec4Data",
    glAfterSubSelf_V4: "Vec4Data",
    glFrontAddSelf_M3: "Mat3Data",
    glAfterAddSelf_M3: "Mat3Data",
    glFrontSubSelf_M3: "Mat3Data",
    glAfterSubSelf_M3: "Mat3Data",
    glFrontAddSelf_M4: "Mat4Data",
    glAfterAddSelf_M4: "Mat4Data",
    glFrontSubSelf_M4: "Mat4Data",
    glAfterSubSelf_M4: "Mat4Data",
    getValueKeyByIndex: "string",
    getOutValueKeyByIndex: "string",
}

export let glslBuiltinType = {
    Mat3Data: true,
    Mat4Data: true,
    Vec4Data: true,
    Vec3Data: true,
    Vec2Data: true,
    Sampler2D: true,
    SamplerCube: true,
}

export let tsbuiltinFunsWithReturn = {
    radians_N: "NumData",
    radians_V2: "Vec2Data",
    radians_V3: "Vec3Data",
    radians_V4: "Vec4Data",
    degrees_N: "NumData",
    degrees_V2: "Vec2Data",
    degrees_V3: "Vec3Data",
    degrees_V4: "Vec4Data",
    sin_N: "NumData",
    sin_V2: "Vec2Data",
    sin_V3: "Vec3Data",
    sin_V4: "Vec4Data",
    cos_N: "NumData",
    cos_V2: "Vec2Data",
    cos_V3: "Vec3Data",
    cos_V4: "Vec4Data",
    tan_N: "NumData",
    tan_V2: "Vec2Data",
    tan_V3: "Vec3Data",
    tan_V4: "Vec4Data",
    asin_N: "NumData",
    asin_V2: "Vec2Data",
    asin_V3: "Vec3Data",
    asin_V4: "Vec4Data",
    acos_N: "NumData",
    acos_V2: "Vec2Data",
    acos_V3: "Vec3Data",
    acos_V4: "Vec4Data",
    atan_N: "NumData",
    atan_V2: "Vec2Data",
    atan_V3: "Vec3Data",
    atan_V4: "Vec4Data",
    atan_N_N: "NumData",
    atan_V2_V2: "Vec2Data",
    atan_V3_V3: "Vec3Data",
    atan_V4_V4: "Vec4Data",
    sinh_N: "NumData",
    sinh_V2: "Vec2Data",
    sinh_V3: "Vec3Data",
    sinh_V4: "Vec4Data",
    cosh_N: "NumData",
    cosh_V2: "Vec2Data",
    cosh_V3: "Vec3Data",
    cosh_V4: "Vec4Data",
    tanh_N: "NumData",
    tanh_V2: "Vec2Data",
    tanh_V3: "Vec3Data",
    tanh_V4: "Vec4Data",
    asinh_N: "NumData",
    asinh_V2: "Vec2Data",
    asinh_V3: "Vec3Data",
    asinh_V4: "Vec4Data",
    acosh_N: "NumData",
    acosh_V2: "Vec2Data",
    acosh_V3: "Vec3Data",
    acosh_V4: "Vec4Data",
    atanh_N: "NumData",
    atanh_V2: "Vec2Data",
    atanh_V3: "Vec3Data",
    atanh_V4: "Vec4Data",
    abs_N: "NumData",
    abs_V2: "Vec2Data",
    abs_V3: "Vec3Data",
    abs_V4: "Vec4Data",
    ceil_N: "NumData",
    ceil_V2: "Vec2Data",
    ceil_V3: "Vec3Data",
    ceil_V4: "Vec4Data",
    clamp_N_N_N: "NumData",
    clamp_V2_N_N: "Vec2Data",
    clamp_V3_N_N: "Vec3Data",
    clamp_V4_N_N: "Vec4Data",
    clamp_V2_V2_V2: "Vec2Data",
    clamp_V3_V3_V3: "Vec3Data",
    clamp_V4_V4_V4: "Vec4Data",
    mix_N_N_N: "NumData",
    mix_V2_V2_N: "Vec2Data",
    mix_V3_V3_N: "Vec3Data",
    mix_V4_V4_N: "Vec4Data",
    mix_V2_V2_V2: "Vec2Data",
    mix_V3_V3_V3: "Vec3Data",
    mix_V4_V4_V4: "Vec4Data",
    floor_N: "NumData",
    floor_V2: "Vec2Data",
    floor_V3: "Vec3Data",
    floor_V4: "Vec4Data",
    fract_N: "NumData",
    fract_V2: "Vec2Data",
    fract_V3: "Vec3Data",
    fract_V4: "Vec4Data",
    exp2_N: "NumData",
    exp2_V2: "Vec2Data",
    exp2_V3: "Vec3Data",
    exp2_V4: "Vec4Data",
    exp_N: "NumData",
    exp_V2: "Vec2Data",
    exp_V3: "Vec3Data",
    exp_V4: "Vec4Data",
    inversesqrt_N: "NumData",
    inversesqrt_V2: "Vec2Data",
    inversesqrt_V3: "Vec3Data",
    inversesqrt_V4: "Vec4Data",
    log_N: "NumData",
    log_V2: "Vec2Data",
    log_V3: "Vec3Data",
    log_V4: "Vec4Data",
    log2_N: "NumData",
    log2_V2: "Vec2Data",
    log2_V3: "Vec3Data",
    log2_V4: "Vec4Data",
    max_N_N: "NumData",
    max_V2_N: "Vec2Data",
    max_V3_N: "Vec3Data",
    max_V4_N: "Vec4Data",
    max_V2_V2: "Vec2Data",
    max_V3_V3: "Vec3Data",
    max_V4_V4: "Vec4Data",
    min_N_N: "NumData",
    min_V2_N: "Vec2Data",
    min_V3_N: "Vec3Data",
    min_V4_N: "Vec4Data",
    min_V2_V2: "Vec2Data",
    min_V3_V3: "Vec3Data",
    min_V4_V4: "Vec4Data",
    mod_N_N: "NumData",
    mod_V2_N: "Vec2Data",
    mod_V3_N: "Vec3Data",
    mod_V4_N: "Vec4Data",
    mod_V2_V2: "Vec2Data",
    mod_V3_V3: "Vec3Data",
    mod_V4_V4: "Vec4Data",
    pow_N_N: "NumData",
    pow_V2_V2: "Vec2Data",
    pow_V3_V3: "Vec3Data",
    pow_V4_V4: "Vec4Data",
    round_N: "NumData",
    round_V2: "Vec2Data",
    round_V3: "Vec3Data",
    round_V4: "Vec4Data",
    sign_N: "NumData",
    sign_V2: "Vec2Data",
    sign_V3: "Vec3Data",
    sign_V4: "Vec4Data",
    smoothstep_N_N_N: "NumData",
    smoothstep_V2_N_N: "Vec2Data",
    smoothstep_V3_N_N: "Vec3Data",
    smoothstep_V4_N_N: "Vec4Data",
    smoothstep_V2_V2_V2: "Vec2Data",
    smoothstep_V3_V3_V3: "Vec3Data",
    smoothstep_V4_V4_V4: "Vec4Data",
    sqrt_N: "NumData",
    sqrt_V2: "Vec2Data",
    sqrt_V3: "Vec3Data",
    sqrt_V4: "Vec4Data",
    step_N_N: "NumData",
    step_N_V2: "Vec2Data",
    step_N_V3: "Vec3Data",
    step_N_V4: "Vec4Data",
    step_V2_V2: "Vec2Data",
    step_V3_V3: "Vec3Data",
    step_V4_V4: "Vec4Data",
    trunc_N: "NumData",
    trunc_V2: "Vec2Data",
    trunc_V3: "Vec3Data",
    trunc_V4: "Vec4Data",
    cross_V3_V3: "Vec3Data",
    distance_N_N: "FloatData",
    distance_V2_V2: "FloatData",
    distance_V3_V3: "FloatData",
    distance_V4_V4: "FloatData",
    dot_N_N: "FloatData",
    dot_V2_V2: "FloatData",
    dot_V3_V3: "FloatData",
    dot_V4_V4: "FloatData",
    equal_N_N: "boolean",
    equal_V2_V2: "boolean",
    equal_V3_V3: "boolean",
    equal_V4_V4: "boolean",
    faceforward_N_N_N: "NumData",
    faceforward_V2_V2_V2: "Vec2Data",
    faceforward_V3_V3_V3: "Vec3Data",
    faceforward_V4_V4_V4: "Vec4Data",
    length_N: "FloatData",
    length_V2: "FloatData",
    length_V3: "FloatData",
    length_V4: "FloatData",
    normalize_N: "NumData",
    normalize_V2: "Vec2Data",
    normalize_V3: "Vec3Data",
    normalize_V4: "Vec4Data",
    notEqual_N_N: "boolean",
    notEqual_V2_V2: "boolean",
    notEqual_V3_V3: "boolean",
    notEqual_V4_V4: "boolean",
    reflect_N_N: "NumData",
    reflect_V2_V2: "Vec2Data",
    reflect_V3_V3: "Vec3Data",
    reflect_V4_V4: "Vec4Data",
    refract_N_N_N: "NumData",
    refract_V2_V2_N: "Vec2Data",
    refract_V3_V3_N: "Vec3Data",
    refract_V4_V4_N: "Vec4Data",
    determinant_M3: "FloatData",
    determinant_M4: "FloatData",
    inverse_M3: "Mat3Data",
    inverse_M4: "Mat4Data",
    int: "IntData",
    int_N: "IntData",
    float: "IntData",
    float_N: "FloatData",
    vec2: "Vec2Data",
    vec2_N: "Vec2Data",
    vec2_N_N: "Vec2Data",
    vec2_V2: "Vec2Data",
    vec3: "Vec3Data",
    vec3_N: "Vec3Data",
    vec3_N_N_N: "Vec3Data",
    vec3_V2_N: "Vec3Data",
    vec3_N_V2: "Vec3Data",
    vec3_V3: "Vec3Data",
    vec4: "Vec4Data",
    vec4_N: "Vec4Data",
    vec4_N_N_N_N: "Vec4Data",
    vec4_N_N_V2: "Vec4Data",
    vec4_N_V3: "Vec4Data",
    vec4_V2_N_N: "Vec4Data",
    vec4_V2_V2: "Vec4Data",
    vec4_V3_N: "Vec4Data",
    vec4_V4: "Vec4Data",
    mat3: "Mat3Data",
    mat3_N_N_N_N_N_N_N_N_N: "Mat3Data",
    mat3_M3: "Mat3Data",
    mat3_M4: "Mat3Data",
    mat3_V3_V3_V3: "Mat3Data",
    mat4: "Mat4Data",
    mat4_M3: "Mat4Data",
    mat4_M4: "Mat4Data",
    mat4_V4_V4_V4_V4: "Mat4Data",
    mat4_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N: "Mat4Data",
    texture2D_N_V2: "Vec4Data",
    textureCube_N_V3: "Vec4Data",
}

export let builtinFuns = {
    radians: true,
    degrees: true,
    sin: true,
    cos: true,
    tan: true,
    asin: true,
    acos: true,
    atan: true,
    sinh: true,
    cosh: true,
    tanh: true,
    asinh: true,
    acosh: true,
    atanh: true,
    abs: true,
    ceil: true,
    clamp: true,
    mix: true,
    floor: true,
    fract: true,
    exp2: true,
    exp: true,
    inversesqrt: true,
    log: true,
    log2: true,
    max: true,
    min: true,
    mod: true,
    pow: true,
    round: true,
    sign: true,
    smoothstep: true,
    sqrt: true,
    step: true,
    trunc: true,
    cross: true,
    distance: true,
    dot: true,
    equal: true,
    faceforward: true,
    length: true,
    normalize: true,
    notEqual: true,
    reflect: true,
    refract: true,
    determinant: true,
    inverse: true,
    int: true,
    float: true,
    vec2: true,
    vec3: true,
    vec4: true,
    mat3: true,
    mat4: true,
}

export const builtinAbbreviation = {
    Vec2Data: "V2",
    "Vec2Data[]": "V2A",
    Vec3Data: "V3",
    "Vec3Data[]": "V3A",
    Vec4Data: "V4",
    "Vec4Data[]": "V4[]",
    Mat3Data: "M3",
    "Mat3Data[]": "M3A",
    Mat4Data: "M4",
    "Mat4Data[]": "M4A",
    FloatData: "N",
    "FloatData[]": "NA",
    IntData: "N",
    "IntData[]": "NA",
    NumData: "N",
    "NumData[]": "NA",
    number: "N",
    "number[]": "NA",
    BoolData: "B",
    "BoolData[]": "BA",
    boolean: "b",
    "boolean[]": "bA",
    Sampler2D: "N",
    SamplerCube: "N",
}

export function convertToAbbreviation(str: string) {
    return (<any>builtinAbbreviation)[str] || str
}
