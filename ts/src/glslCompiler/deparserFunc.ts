export function splitArrData(str: string, defines: Map<string, number | string>) {
    let data: any = {}
    let arrIndex = str.indexOf("[")
    data.factObjName = ""
    let arrNum: number = 0
    if (arrIndex !== -1) {
        data.factObjName = str.substring(0, arrIndex)
        let numOrDefineStr = str.substring(arrIndex + 1, str.indexOf("]"))
        arrNum = parseInt(numOrDefineStr)
        if (isNaN(arrNum)) {
            arrNum = <number>defines.get(numOrDefineStr)
        }
    } else {
        data.factObjName = str
    }
    data.arrNum = arrNum
    return data
}

export function customGetTypeNumStr(convertType: string) {
    let typeNumStr
    if (convertType == "IntData") {
        typeNumStr = "INT"
    } else if (convertType == "FloatData") {
        typeNumStr = "FLOAT"
    } else if (convertType == "Vec4Data") {
        typeNumStr = "FLOAT_VEC4"
    } else if (convertType == "Vec3Data") {
        typeNumStr = "FLOAT_VEC3"
    } else if (convertType == "Vec2Data") {
        typeNumStr = "FLOAT_VEC2"
    } else if (convertType == "Mat3Data") {
        typeNumStr = "FLOAT_MAT3"
    } else if (convertType == "Mat4Data") {
        typeNumStr = "FLOAT_MAT4"
    } else if (convertType == "Sampler2D") {
        typeNumStr = "SAMPLER_2D"
    } else if (convertType == "SamplerCube") {
        typeNumStr = "SAMPLER_CUBE"
    } else {
        debugger
        console.error("无法识别的类型转换 in uniform")
    }
    return typeNumStr
}
