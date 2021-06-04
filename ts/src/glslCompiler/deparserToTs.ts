import { builtinDataAtt } from "./builtinAtt"
import { DeparseGlslGlobalVal, InOutType } from "./DeparseGlslGlobalVal"
import {
    builtinFuns,
    builtinValue,
    convertToAbbreviation,
    convertToBuiltinCall,
    convertToTsType,
    glslBuiltinType,
    tsbuiltinFunsWithReturn,
    tsbuiltinOperationFunsWithReturn,
    builtinAbbreviation,
} from "./deparserConverMap"
import { customGetTypeNumStr, splitArrData } from "./deparserFunc"
import { WsManager } from "./WsManager"

var needs_semicolon: any = {
    decl: true,
    return: true,
    break: true,
    continue: true,
    discard: true,
    precision: true,
    expr: true,
    "do-while": true,
    struct: true,
}

const types = {
    binary: deparse_binary,
    break: deparse_break,
    builtin: deparse_builtin,
    continue: deparse_continue,
    decl: deparse_decl,
    decllist: deparse_decllist,
    discard: deparse_discard,
    "do-while": deparse_do_while,
    expr: deparse_expr,
    forloop: deparse_forloop,
    function: deparse_function,
    functionargs: deparse_functionargs,
    ident: deparse_ident,
    if: deparse_if,
    keyword: deparse_keyword,
    literal: deparse_literal,
    precision: deparse_precision,
    preprocessor: deparse_preprocessor,
    return: deparse_return,
    stmt: deparse_stmt,
    stmtlist: deparse_stmtlist,
    struct: deparse_struct,
    assign: deparse_assign,
    unary: deparse_unary,
    whileloop: deparse_whileloop,
    operator: deparse_operator,
    group: deparse_group,
    suffix: deparse_suffix,
    call: deparse_call,
    quantifier: deparse_quantifier,
    ternary: deparse_ternary,
}

let output: string[] = []
let ws: WsManager = null!

let deparseGlobalVal: DeparseGlslGlobalVal = new DeparseGlslGlobalVal()

export function deparseToTs(
    ast: any,
    whitespace_enabled: boolean = false,
    indent_text: string = "  ",
    ud: Map<string, string>,
    vd: Map<string, string>,
    ad: Map<string, string>,
    sdm: Map<string, Map<string, string>>,
    d: Map<string, number | string>,
    isVert: boolean = false,
    hash: string
) {
    output.length = 0
    ws = new WsManager(whitespace_enabled, indent_text)
    deparseGlobalVal.forceInit(ud, vd, ad, sdm, d)

    let attributeStr = "class AttributeDataImpl implements AttributeData {\n"
    let attributerDataKeysStr = "    dataKeys: Map<string, any> = new Map([\n"
    let attributerDataSizeStr = "    dataSize: Map<string, number> = new Map([\n"
    deparseGlobalVal.attributeData.forEach((value, key: string) => {
        let convertType: string = (<any>convertToTsType)[value]
        if (convertType) {
            let arrData = splitArrData(key, deparseGlobalVal.defines)
            let factObjName = arrData.factObjName

            if (arrData && arrData.arrNum > 0) {
                console.error("attribute 变量暂不支持数组")
            }
            let typeNumStr = customGetTypeNumStr(convertType)
            attributerDataKeysStr += `        ["${key}", cpuRenderingContext.cachGameGl.${typeNumStr}],\n`
            attributerDataSizeStr += `        ["${key}", 1],\n`
            attributeStr += `    ${key}: ${convertType} = new ${convertType}()\n`
        } else {
            console.error("不识别的shader 数据结构: " + value)
        }
    })
    attributerDataKeysStr += `    ])\n`
    attributerDataSizeStr += `    ])\n`
    attributeStr += attributerDataKeysStr + attributerDataSizeStr
    attributeStr += "}\n"

    let varyingStr = "class VaryingDataImpl extends VaryingData {\n"
    let dataKeysStr = "    dataKeys: Map<string, any> = new Map([\n"
    let copyFuncStr = `    copy(varying: VaryingDataImpl) {\n`
    deparseGlobalVal.varyingData.forEach((value, key: string) => {
        let convertType: string = (<any>convertToTsType)[value]
        if (convertType) {
            let arrData = splitArrData(key, deparseGlobalVal.defines)
            if (arrData && arrData.arrNum > 0) {
                console.error("varying 变量暂不支持数组")
            }
            varyingStr += `    ${key}: ${convertType} = new ${convertType}()\n`
            let typeNumStr = customGetTypeNumStr(convertType)
            dataKeysStr += `        ["${key}", cpuRenderingContext.cachGameGl.${typeNumStr}],\n`

            let abbreviation = convertToAbbreviation(convertType)
            let setFunc = `glSet_${abbreviation}_${abbreviation}`
            copyFuncStr += `        ${setFunc}(varying.${key}, this.${key})\n`
            deparseGlobalVal.useBuiltinOperators.add(setFunc)
        } else {
            console.error("不识别的shader 数据结构: " + value)
        }
    })
    dataKeysStr += `    ])\n`

    varyingStr += `
    factoryCreate() {
        return new VaryingDataImpl()
    }\n`

    varyingStr += dataKeysStr + copyFuncStr + `    }\n`
    varyingStr += "}\n"

    // 对uniform和struct中的数组对象进行处理
    let tmpUniformData: Map<string, string> = new Map()
    let uniformStr = `class UniformDataImpl implements UniformData {\n`
    let uniformDataKeysStr = "    dataKeys: Map<string, any> = new Map([\n"
    let uniformDataSizeStr = "    dataSize: Map<string, number> = new Map([\n"
    deparseGlobalVal.uniformData.forEach((value, key: string) => {
        let convertType: string = (<any>convertToTsType)[value]
        if (convertType) {
            let arrData = splitArrData(key, deparseGlobalVal.defines)
            let factObjName = arrData.factObjName

            let typeNumStr = customGetTypeNumStr(convertType)
            uniformDataKeysStr += `        ["${factObjName}", cpuRenderingContext.cachGameGl.${typeNumStr}],\n`
            uniformDataSizeStr += `        ["${factObjName}", ${arrData.arrNum || 1}],\n`
            tmpUniformData.set(factObjName, `${convertType}${arrData.arrNum > 0 ? "[]" : ""}`)

            if (arrData.arrNum > 0) {
                uniformStr += `    ${factObjName}: ${convertType}${arrData.arrNum > 0 ? "[]" : ""} = [`
                let lastIndex = arrData.arrNum - 1
                for (let index = 0; index < arrData.arrNum; index++) {
                    uniformStr += `new ${convertType}()`
                    if (index != lastIndex) {
                        uniformStr += `, `
                    }
                }
                uniformStr += `]\n`
            } else {
                uniformStr += `    ${factObjName}: ${convertType}${arrData.arrNum > 0 ? "[]" : ""} = new ${convertType}()\n`
            }
        } else {
            console.error("不识别的shader 数据结构: " + value)
        }
    })
    uniformDataKeysStr += `    ])\n`
    uniformDataSizeStr += `    ])\n`
    uniformStr += uniformDataKeysStr + uniformDataSizeStr + "}\n"
    deparseGlobalVal.uniformData = tmpUniformData

    let structStr = ""
    let tmpStructDataMap: Map<string, Map<string, string>> = new Map()
    deparseGlobalVal.structDataMap.forEach((value: Map<string, string>, key: string) => {
        structStr += `class ${key} implements StructData {\n`

        let tmpStructValue: Map<string, string> = new Map()
        tmpStructDataMap.set(key, tmpStructValue)
        value.forEach((objType: string, objName: string) => {
            let arrData = splitArrData(objName, deparseGlobalVal.defines)
            let factObjName = arrData.factObjName

            let convertType: string = (<any>convertToTsType)[objType]
            let builtinFuncCall = (<any>convertToBuiltinCall)[convertType]
            let createStr = ""
            if (builtinFuncCall) {
                createStr = `${builtinFuncCall}()`
            } else {
                createStr = ` new ${convertType}()`
            }
            if (arrData.arrNum > 0) {
                tmpStructValue.set(factObjName, `${convertType}[]`)
                structStr += `    ${factObjName}: ${convertType}[] = [`

                for (let index = 0; index < arrData.arrNum; index++) {
                    if (index !== arrData.arrNum - 1) {
                        structStr += `${createStr},`
                    } else {
                        structStr += `${createStr}]\n`
                    }
                }
            } else {
                tmpStructValue.set(factObjName, `${convertType}`)
                structStr += `    ${factObjName}: ${convertType} = ${createStr}\n`
            }
        })
        structStr += `}\n`
    })
    deparseGlobalVal.structDataMap = tmpStructDataMap

    deparse(ast)
    let tsScript = output.join("")
    tsScript = tsScript.replace(/\n/g, "\n    ") + "\n"
    if (isVert) {
        tsScript = `    attributeData: AttributeDataImpl = new AttributeDataImpl()\n` + tsScript
        tsScript = `    uniformData: UniformDataImpl = new UniformDataImpl()\n` + tsScript
        tsScript = `    varyingData: VaryingDataImpl = new VaryingDataImpl()\n` + tsScript
    } else {
        tsScript = `    uniformData: UniformDataImpl = new UniformDataImpl()\n` + tsScript
        tsScript = `    varyingData: VaryingDataImpl = new VaryingDataImpl()\n` + tsScript
    }
    tsScript = `export class Impl_${hash} extends ${isVert ? "VertShaderHandle" : "FragShaderHandle"}{\n` + tsScript + "}\n"
    // console.log(hash)

    let defineStr = ""
    deparseGlobalVal.defines.forEach((value: string | number, key: string) => {
        if (!isNaN(parseFloat(<string>value))) {
            defineStr += `let ${key} = new FloatData(${value})\n`
        } else {
            defineStr += `let ${key} = "${value}"\n`
        }
    })
    tsScript = defineStr + structStr + attributeStr + varyingStr + uniformStr + tsScript

    let importStr = "import {\n"
    deparseGlobalVal.useBuiltinFuncs.add("float")
    deparseGlobalVal.useBuiltinFuncs.add("float_N")
    deparseGlobalVal.useBuiltinFuncs.add("bool")
    deparseGlobalVal.useBuiltinFuncs.add("bool_N")
    deparseGlobalVal.useBuiltinFuncs.add("int_N")
    deparseGlobalVal.useBuiltinFuncs.add("int")
    deparseGlobalVal.useBuiltinFuncs.add("vec4")
    deparseGlobalVal.useBuiltinFuncs.add("vec3")
    deparseGlobalVal.useBuiltinFuncs.add("vec2")
    deparseGlobalVal.useBuiltinFuncs.add("mat3")
    deparseGlobalVal.useBuiltinFuncs.add("mat4")
    deparseGlobalVal.useBuiltinFuncs.forEach((funNames: string) => {
        importStr += `    ${funNames},\n`
    })
    importStr += `} from "../builtin/BuiltinFunc"\n`
    importStr += "import {\n"
    deparseGlobalVal.useBuiltinOperators.add("getValueKeyByIndex")
    deparseGlobalVal.useBuiltinOperators.add("getOutValueKeyByIndex")
    deparseGlobalVal.useBuiltinOperators.forEach((funNames: string) => {
        importStr += `    ${funNames},\n`
    })
    importStr += `} from "../builtin/BuiltinOperator"\n`
    importStr += `import { gl_FragData, gl_FragColor, gl_Position, gl_FragCoord, gl_FragDepth, gl_FrontFacing, custom_isDiscard} from "../builtin/BuiltinVar"\n`
    importStr += `import { cpuRenderingContext } from "../../CpuRenderingContext"\n`
    return [importStr, tsScript]
}

function outputPush(str: string) {
    if (!isNaN(parseFloat(str))) {
        if (str.indexOf(".") !== -1) {
            str = `float_N(${str})`
        } else {
            str = `int_N(${str})`
        }
    }
    output.push(str)
}

function outputInsert(index: number, str: string) {
    output.splice(index, 0, str)
}

function outputDel(index: number, length: number) {
    output.splice(index, length)
}

function outputReplace(index: number, str: string) {
    output[index] = str
}

function convertToClassObj(str: string) {
    let objStr: string | undefined
    if (deparseGlobalVal.defines.get(str) !== undefined) {
        objStr = str
    } else {
        objStr = deparseGlobalVal.uniformData.get(str)
        if (!objStr) {
            objStr = deparseGlobalVal.varyingData.get(str)
            if (!objStr) {
                objStr = deparseGlobalVal.attributeData.get(str)
                if (!objStr) {
                    objStr = str
                } else {
                    objStr = `this.attributeData.${str}`
                }
            } else {
                objStr = `this.varyingData.${str}`
            }
        } else {
            objStr = `this.uniformData.${str}`
        }
    }

    return objStr
}

function getStructType(str: string) {
    let sd = deparseGlobalVal.structDataMap.get(str)
    return sd
}

function deparse_binary(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    var is_bracket = node.data === "["
    let operatorReplace: string | null = null
    if (node.data == "+") {
        operatorReplace = "glAdd"
    } else if (node.data == "-") {
        operatorReplace = "glSub"
    } else if (node.data == "*") {
        operatorReplace = "glMul"
    } else if (node.data == "/") {
        operatorReplace = "glDiv"
    } else if (node.data == "!=") {
        operatorReplace = "glIsNotEqual"
    } else if (node.data == "<=") {
        operatorReplace = "glIsLessEqual"
    } else if (node.data == "<") {
        operatorReplace = "glIsLess"
    } else if (node.data == ">=") {
        operatorReplace = "glIsMoreEqual"
    } else if (node.data == ">") {
        operatorReplace = "glIsMore"
    } else if (node.data == "==") {
        operatorReplace = "glIsEqual"
    } else if (node.data == "[") {
    } else if (node.data == "||") {
    } else if (node.data == "&&") {
    } else {
        console.error("无法识别的binary类型")
        debugger
    }

    let leftIndex = output.length
    // if (leftIndex == 877) {
    //     debugger
    // }
    let leftType: string = deparse(node.children[0])
    if (!leftType) {
        debugger
    }

    let leftEnd = output.length
    !is_bracket && !operatorReplace && outputPush(ws.optional(" "))
    let operatorIndex = output.length
    outputPush(node.data)
    !is_bracket && !operatorReplace && outputPush(ws.optional(" "))
    let rightIndex = output.length
    // if (rightIndex == 205) {
    //     debugger
    // }
    let rightType = deparse(node.children[1])
    if (!rightType) {
        debugger
        let testType = deparse(node.children[1])
    }
    if (is_bracket) {
        if (
            leftType == "Vec4Data" ||
            leftType == "Vec3Data" ||
            leftType == "Vec2Data" ||
            leftType == "Mat3Data" ||
            leftType == "Mat4Data" ||
            leftType == "Vec4Data[]" ||
            leftType == "Vec3Data[]" ||
            leftType == "Vec2Data[]" ||
            leftType == "Mat3Data[]" ||
            leftType == "Mat4Data[]"
        ) {
            // 如果左边的对象也是通过中括号得来的话 说明是矩阵
            if (node.children[0].data !== "[") {
                outputInsert(leftEnd - 1, "(<any>")
                outputInsert(leftEnd + 1, ")")
                if (
                    leftType == "Vec4Data" ||
                    leftType == "Vec3Data" ||
                    leftType == "Vec2Data" ||
                    leftType == "Mat3Data" ||
                    leftType == "Mat4Data"
                ) {
                    if (deparseGlobalVal.isLeftSet) {
                        outputInsert(leftEnd + 3, "getValueKeyByIndex(")
                    } else {
                        outputInsert(leftEnd + 3, "getOutValueKeyByIndex(")
                    }
                    outputPush(")")
                } else {
                    outputReplace(leftEnd + 3, output[leftEnd + 3] + ".v")
                }
            } else {
                if (
                    leftType == "Vec4Data" ||
                    leftType == "Vec3Data" ||
                    leftType == "Vec2Data" ||
                    leftType == "Mat3Data" ||
                    leftType == "Mat4Data"
                ) {
                    if (deparseGlobalVal.isLeftSet) {
                        outputInsert(leftEnd + 1, "getValueKeyByIndex(")
                    } else {
                        outputInsert(leftEnd + 1, "getOutValueKeyByIndex(")
                    }
                    outputPush(")")
                } else {
                    outputReplace(leftEnd + 3, output[leftEnd + 3] + ".v")
                }
            }
        } else if (rightType == "NumData" || rightType == "IntData" || rightType == "FloatData") {
            outputPush(".v")
        }
    }
    let rightEnd = output.length
    if (operatorReplace) {
        operatorReplace = operatorReplace + "_" + convertToAbbreviation("" + leftType) + "_" + convertToAbbreviation("" + rightType)
        outputInsert(leftIndex, operatorReplace + "(")
        // // 因为左边插入了
        outputInsert(rightEnd + 1, ")")
        outputReplace(operatorIndex + 1, ",")

        deparseGlobalVal.useBuiltinOperators.add(operatorReplace)
    }
    if (is_bracket) {
        outputPush("]")
        if (leftType == "Vec4Data" || leftType == "Vec3Data" || leftType == "Vec2Data") {
            return "number"
        } else if (leftType == "Mat3Data") {
            return "Vec3Data"
        } else if (leftType == "Mat4Data") {
            return "Vec4Data"
        } else {
            return leftType.substring(0, leftType.lastIndexOf("["))
        }
    }

    if (operatorReplace) {
        return (<any>tsbuiltinOperationFunsWithReturn)[operatorReplace]
    } else {
        if (node.data == "||" || node.data == "&&") {
            return "boolean"
        }
    }
}

function deparse_break(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    outputPush("break")
}

function deparse_builtin(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }

    let parent = node.parent
    let returnType
    // 如果是内建函数
    if (parent.type == "call" && parent.children[0] == node) {
    } else {
        // 否则应该是内建变量
        returnType = (<any>builtinValue)[node.data]
        // 如果不是内建變量 那麽可能是一個正常的变量
        if (returnType === undefined) {
            returnType = getObjType(node.data)
        }
    }
    outputPush(node.data)
    return returnType
}

function deparse_continue(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    outputPush("continue")
}

function deparse_decl(node: any) {
    // it's five long
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }

    var len = node.children.length,
        len_minus_one = len - 1

    let children = node.children

    let hasFunc = false
    for (var i = 0; i < len; ++i) {
        let child = children[i]
        if (child.type == "function") {
            hasFunc = true
            break
        }
    }

    let cachValType
    for (var i = 0; i < len; ++i) {
        let child = children[i]
        if (child.type !== "placeholder") {
            if (child.type == "keyword" || child.type == "ident") {
                if (hasFunc) {
                    deparseGlobalVal.nowFuncTypeCach = child.token.data
                } else {
                    deparseGlobalVal.nowTypeCach = child.token.data
                    cachValType = deparseGlobalVal.nowTypeCach
                }
                continue
            }

            deparse(child)
            if (i !== len_minus_one) {
                outputPush(ws.required(" "))
            }
        }
    }

    // 避免有天才声明了同一个类型在同一个语句中
    // 所以声明语句放在最后添加
    if (deparseGlobalVal.waitPushDecVal.size) {
        deparseGlobalVal.waitPushDecVal.forEach((value: string, key: string) => {
            let setData = deparseGlobalVal.nowFucObj.get(deparseGlobalVal.nowBlockLevel)
            if (!setData) {
                setData = new Map()
                deparseGlobalVal.nowFucObj.set(deparseGlobalVal.nowBlockLevel, setData)
            }
            setData.set(key, value)
        })
        deparseGlobalVal.waitPushDecVal.clear()
    }
    return cachValType || deparseGlobalVal.nowFuncTypeCach
}

function deparse_decllist(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    let tmpCachType = deparseGlobalVal.nowTypeCach
    let decllistBegin = output.length

    let setFunc = "glSet"
    if (tmpCachType == "int" || tmpCachType == "float" || tmpCachType == "double") {
        setFunc = "glSet_N_N"
    } else if (tmpCachType == "bool") {
        setFunc = "glSet_B_B"
    } else if (tmpCachType == "vec2") {
        setFunc = "glSet_V2_V2"
    } else if (tmpCachType == "vec3") {
        setFunc = "glSet_V3_V3"
    } else if (tmpCachType == "vec4") {
        setFunc = "glSet_V4_V4"
    } else if (tmpCachType == "mat3") {
        setFunc = "glSet_M3_M3"
    } else if (tmpCachType == "mat4") {
        setFunc = "glSet_M4_M4"
    } else {
        setFunc = "glSet_Struct_Struct"
    }

    if (deparseGlobalVal.nowTypeCach !== "") {
        // 判断是否数组类型
        let arrTypeStr = ""
        deparseGlobalVal.declArrNum = []
        // 数据定义应该只可能是常量数值 所以不用考虑其它情况
        for (var i = 1, len = node.children.length; i < len; ++i) {
            if (node.children[i].type === "quantifier") {
                arrTypeStr += "[]"
                deparseGlobalVal.declArrNum.push(parseInt(node.children[i].children[0].children[0].data))
            }
        }
        if (deparseGlobalVal.declArrNum.length > 0) {
            deparseGlobalVal.nowTypeCach = deparseGlobalVal.nowTypeCach + arrTypeStr
            tmpCachType = deparseGlobalVal.nowTypeCach
        }
    }

    let isSet = false
    let setFuncIndex: number = 0
    for (var i = 0, len = node.children.length; i < len; ++i) {
        isSet = false
        if (i > 0) {
            if (node.children[i].type !== "ident") {
                if (node.children[i].type !== "quantifier") {
                    if (deparseGlobalVal.inForDefine) {
                        outputPush(ws.optional(" "))
                        outputPush("=")
                        outputPush(ws.optional(" "))
                    } else {
                        setFuncIndex = output.length
                        outputPush(setFunc + "(")
                        outputPush(node.children[i - 1].data)
                        outputPush(", ")
                        isSet = true
                        deparseGlobalVal.useBuiltinOperators.add(setFunc)
                    }
                } else {
                    continue
                }
            } else {
                deparseGlobalVal.nowTypeCach = tmpCachType
                outputPush(ws.required("\n"))
            }
        }
        let type = deparse(node.children[i])
        if (isSet) {
            if (type == "boolean") {
                outputReplace(setFuncIndex, "glSet_B_b(")
                deparseGlobalVal.useBuiltinOperators.add("glSet_B_b")
            }
            outputPush(")")
        }
    }
}

function deparse_discard(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    outputPush("custom_isDiscard.v = true")
}

function deparse_do_while(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    var is_stmtlist = node.children[0].type === "stmtlist"

    outputPush("do")
    if (is_stmtlist) {
        outputPush(ws.optional(" "))
    } else {
        ws.indent()
        outputPush(ws.enabled ? ws.optional("\n") : ws.required(" "))
    }

    deparse(node.children[0])

    if (is_stmtlist) {
        outputPush(ws.optional(" "))
    } else {
        ws.dedent()
        outputPush(ws.optional("\n"))
    }
    outputPush("while(")
    deparse(node.children[1])
    outputPush(")")
}

function deparse_expr(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    if (node.children.length) {
        return deparse(node.children[0])
    }
}

// 测试过for 里面的判断应该不能直接用bool变量
function deparse_forloop(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }

    var is_stmtlist = node.children[3].type === "stmtlist"

    outputPush("for(")
    deparseGlobalVal.inForDefine = true
    deparse(node.children[0])
    deparseGlobalVal.inForDefine = false
    outputPush(";")
    outputPush(ws.optional(" "))
    deparse(node.children[1])
    outputPush(";")
    outputPush(ws.optional(" "))
    deparse(node.children[2])
    outputPush(")")

    if (is_stmtlist) {
        outputPush(ws.optional(" "))
    } else {
        ws.indent()
    }
    deparse(node.children[3])
    if (!is_stmtlist) {
        ws.dedent()
    }
}

function deparse_function(node: any) {
    let funcIndex = output.length
    deparse(node.children[0])
    let funcName = output[output.length - 1]
    outputPush("(")
    let argsDataArr = deparse(node.children[1])
    let returnTypes: string[] = argsDataArr[0]
    let argsInfos: {
        index: number
        inoutType: InOutType
    }[] = argsDataArr[1]

    let customName = funcName
    let replaceIndex = []
    deparseGlobalVal.funcArgsInReplace = []
    let replace
    if (returnTypes.length > 0) {
        for (let index = 0; index < returnTypes.length; index++) {
            const element = returnTypes[index]
            customName += "_" + (convertToAbbreviation((<any>convertToTsType)[element]) || element)

            let argsInfo = argsInfos[index]
            if (argsInfo.inoutType == InOutType.in) {
                let oldData = output[argsInfo.index]
                outputReplace(argsInfo.index, `__${oldData}__`)
                replaceIndex.push(index)
                deparseGlobalVal.funcArgsInReplace.push({ name: oldData, type: (<any>convertToTsType)[element] || element })
            }
        }
    }
    outputPush(")")
    outputPush(": " + (<any>convertToTsType)[deparseGlobalVal.nowFuncTypeCach])
    deparseGlobalVal.customFuns.set(customName, deparseGlobalVal.nowFuncTypeCach)
    // deparseGlobalVal.customFunsInOutType(customName, )
    deparseGlobalVal.nowFuncTypeCach = ""
    outputReplace(funcIndex, customName)

    if (node.children[2]) {
        outputPush(ws.optional(" "))
        deparse(node.children[2])
    }
}

function deparse_functionargs(node: any) {
    var len = node.children.length,
        len_minus_one = len - 1

    deparseGlobalVal.isFuncArgs = true
    let returnTypes = []

    let argsInfoArr = []
    for (var i = 0; i < len; ++i) {
        let childNode = node.children[i]
        let argsInfo = { index: output.length, inoutType: InOutType.in }
        let returnType = deparse(childNode)

        if (childNode.token.data == "inout") {
            argsInfo.inoutType = InOutType.inout
        } else if (childNode.token.data == "out") {
            argsInfo.inoutType = InOutType.out
        }
        argsInfoArr.push(argsInfo)
        returnTypes.push(returnType)
        if (i !== len_minus_one) {
            outputPush(",")
            outputPush(ws.optional(" "))
        }
    }

    deparseGlobalVal.isFuncArgs = false
    return [returnTypes, argsInfoArr]
}

function getFuncObjType(name: string) {
    for (let index = deparseGlobalVal.nowBlockLevel; index >= 0; index--) {
        const setData = deparseGlobalVal.nowFucObj.get(index)
        if (setData && setData.has(name)) {
            return setData.get(name)
        }
    }
    return null
}

function deparse_ident(node: any) {
    if (deparseGlobalVal.nowTypeCach !== "") {
        if (deparseGlobalVal.inFunc) {
            outputPush("let ")
        }
        outputPush(node.data)
        let letType = (<any>convertToTsType)[deparseGlobalVal.nowTypeCach] || deparseGlobalVal.nowTypeCach
        outputPush(": " + letType)

        // let setData = deparseGlobalVal.nowFucObj.get(deparseGlobalVal.nowBlockLevel)
        // if (!setData) {
        //     setData = new Map()
        //     deparseGlobalVal.nowFucObj.set(deparseGlobalVal.nowBlockLevel, setData)
        // }
        // setData.set(node.data, letType)
        deparseGlobalVal.waitPushDecVal.set(node.data, letType)

        let grandParentNode = node.parent.parent

        if (deparseGlobalVal.inFunc && !deparseGlobalVal.inForDefine) {
            outputPush(ws.optional(" "))
            outputPush("=")
            outputPush(ws.optional(" "))

            let sd = getStructType(deparseGlobalVal.nowTypeCach)

            let createStr = ""
            // 判断是否struct 类型
            let splitData = splitArrData(deparseGlobalVal.nowTypeCach, deparseGlobalVal.defines)
            if (sd) {
                createStr = "new " + splitData.factObjName + "()"
            } else {
                createStr = splitData.factObjName + "()"
            }

            if (deparseGlobalVal.declArrNum.length > 0) {
                let copyArrStr = createStr
                for (let index = deparseGlobalVal.declArrNum.length - 1; index >= 0; index--) {
                    let arrNum = deparseGlobalVal.declArrNum[index]
                    let arr = `[`
                    for (let t = 0; t < arrNum; t++) {
                        if (t !== arrNum - 1) {
                            arr += copyArrStr + ","
                        } else {
                            arr += copyArrStr
                        }
                    }
                    arr += `]`
                    copyArrStr = arr
                }
                outputPush(ws.optional(copyArrStr))
            } else {
                outputPush(ws.optional(createStr))
            }
            outputPush("\n")
        }
        deparseGlobalVal.nowTypeCach = ""
    } else if (deparseGlobalVal.nowFuncTypeCach == "") {
        let isFuncObj = false
        for (let index = deparseGlobalVal.nowBlockLevel; index >= 0; index--) {
            const setData = deparseGlobalVal.nowFucObj.get(index)
            if (setData && setData.has(node.data)) {
                isFuncObj = true
                break
            }
        }
        outputPush(isFuncObj ? node.data : convertToClassObj(node.data))
        return getObjType(output[output.length - 1])
    } else {
        outputPush(node.data)
    }
}

function deparse_if(node: any) {
    var needs_indent = true
    for (var j = 1; j < 4; ++j) {
        if (output[output.length - j] === "else") {
            output.length = output.length - j
            outputPush("else ")
            break
        } else if (/[^\s]/.test(output[output.length - j])) {
            break
        }
    }

    var is_first_stmt = node.children[1].type === "stmt",
        has_second = node.children[2],
        is_second_stmt = has_second && node.children[2].children[0].type !== "stmtlist"

    outputPush("if(")
    let type = deparse(node.children[0])
    if (type == "BoolData") {
        outputPush(".v)")
    } else {
        outputPush(")")
    }

    if (is_first_stmt) {
        needs_indent && ws.indent()
        // if语句不要加; 避免断句错误
        outputPush(ws.enabled ? ws.optional("\n", "") : ws.required(" "))
    } else {
        outputPush(ws.optional(" "))
    }
    let sonBlockIndex = output.length
    deparse(node.children[1])
    // gl 语句支持不加{ 但原则上ts中最好不要
    if (output[sonBlockIndex] !== "{") {
        outputReplace(sonBlockIndex, "{\n" + output[sonBlockIndex])
        outputReplace(output.length - 1, output[output.length - 1] + "}\n")
    }

    if (is_first_stmt) {
        needs_indent && ws.dedent()
        outputPush(ws.optional("\n"))
    }

    if (has_second) {
        var is_if_stmt = node.children[2].children[0].type === "if"

        if (output[output.length - 1] === "}") {
            outputPush(ws.optional(" "))
        }
        outputPush("else")
        if (is_second_stmt) {
            !is_if_stmt && ws.indent()
            outputPush(ws.enabled ? ws.optional("\n") : ws.required(" "))
        } else {
            outputPush(ws.optional(" "))
        }

        deparse(node.children[2])

        if (is_second_stmt) {
            !is_if_stmt && ws.dedent()
            outputPush(ws.optional("\n"))
        }
    }
}

function deparse_keyword(node: any) {
    outputPush(node.token.data)
    if (node.token.data == "true" || node.token.data == "false") {
        return "boolean"
    }
}

function deparse_literal(node: any) {
    outputPush(node.data)
    return getObjType(output[output.length - 1])
}

function deparse_precision(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    var len = node.children.length,
        len_minus_one = len - 1

    outputPush("precision")
    outputPush(ws.required(" "))
    for (var i = 0; i < len; ++i) {
        deparse(node.children[i])
        if (i !== len_minus_one) {
            outputPush(ws.required(" "))
        }
    }
}

function deparse_preprocessor(node: any) {
    var level = ws.level

    ws.level = 0

    if (output[output.length - 1] !== "\n") outputPush(ws.required("\n"))
    outputPush(node.token.data)
    outputPush(ws.required("\n"))

    ws.level = level
}

function deparse_return(node: any) {
    outputPush("return")
    if (node.children[0]) {
        outputPush(ws.required(" "))
        deparse(node.children[0])
    }
}

function deparse_stmt(node: any) {
    if (!node.children.length) return

    var has_child = node.children.length > 0,
        semicolon = has_child ? needs_semicolon[node.children[0].type] : "",
        needs_newline = true

    let isFunSet = false
    if (has_child && node.children[0].type === "decl") {
        if (node.children[0].children.length > 5 && node.children[0].children[5].type === "function") {
            isFunSet = true
            deparseGlobalVal.isFuncBlock = true
            semicolon = !node.children[0].children[5].children[2]
        }
    }

    if (has_child && node.children[0].type === "stmtlist") {
        needs_newline = false
    }

    var last = output[output.length - 1]
    if (deparseGlobalVal.isFuncBlock && (!last || last.charAt(0) !== "\n")) {
        needs_newline && outputPush(ws.optional("\n"))
    }

    deparse(node.children[0])
    if (deparseGlobalVal.isFuncBlock) {
        if (semicolon) outputPush(";")
    }
    if (isFunSet) {
        deparseGlobalVal.isFuncBlock = false
    }
}

function deparse_stmtlist(node: any) {
    var has_parent = node.parent !== null && node.parent !== undefined

    if (has_parent) {
        deparseGlobalVal.inFunc = true
        outputPush("{")
        deparseGlobalVal.nowBlockLevel++
        ws.indent()
        outputPush(ws.optional("\n"))

        if (deparseGlobalVal.funcArgsInReplace.length > 0) {
            for (let index = 0; index < deparseGlobalVal.funcArgsInReplace.length; index++) {
                const element = deparseGlobalVal.funcArgsInReplace[index]

                let builtinFuncCall = (<any>convertToBuiltinCall)[element.type]
                if (builtinFuncCall) {
                    outputPush(`let ${element.name}: ${element.type} = ${builtinFuncCall}()\n`)
                } else {
                    // struct类型的new
                    outputPush(`let ${element.name}: ${element.type} = new ${element.type}()\n`)
                }

                let setType = (<any>builtinAbbreviation)[element.type] || "Struct"
                let setFunc = `glSet_${setType}_${setType}`
                outputPush(`${setFunc}(${element.name}, __${element.name}__)\n`)

                deparseGlobalVal.useBuiltinOperators.add(setFunc)
            }
        }
    }

    for (var i = 0, len = node.children.length; i < len; ++i) {
        deparse(node.children[i])
    }

    if (has_parent) {
        deparseGlobalVal.nowFucObj.delete(deparseGlobalVal.nowBlockLevel)
        deparseGlobalVal.nowBlockLevel--
        if (deparseGlobalVal.nowBlockLevel == 0) {
            deparseGlobalVal.inFunc = false
            deparseGlobalVal.nowFucObj.delete(deparseGlobalVal.nowBlockLevel)
        }
        ws.dedent()
        outputPush(ws.optional("\n"))
        outputPush("}")
    }
}

function deparse_struct(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    outputPush("struct")
    outputPush(ws.required(" "))
    deparse(node.children[0])
    outputPush(ws.optional(" "))
    outputPush("{")
    ws.indent()
    outputPush(ws.optional("\n"))

    var len = node.children.length,
        len_minus_one = len - 1

    for (var i = 1, len = node.children.length; i < len; ++i) {
        deparse(node.children[i])
        if (node.children[i].type !== "preprocessor") {
            outputPush(";")
        }
        if (i !== len_minus_one) {
            outputPush(ws.optional("\n"))
        }
    }

    ws.dedent()
    outputPush(ws.optional("\n"))
    outputPush("}")
}

function deparse_assign(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }

    let glOpetatior
    if (node.token.data == "+=") {
        glOpetatior = "glAddSet"
    } else if (node.token.data == "-=") {
        glOpetatior = "glSubSet"
    } else if (node.token.data == "*=") {
        glOpetatior = "glMulSet"
    } else if (node.token.data == "/=") {
        glOpetatior = "glDivSet"
    } else if (node.token.data == "=") {
        glOpetatior = "glSet"
    } else {
        console.error("无法识别的assign类型")
        debugger
    }

    let leftBeginIndex = output.length
    deparseGlobalVal.isLeftSet = true
    let leftAssignType = deparse(node.children[0])
    deparseGlobalVal.isLeftSet = false
    let leftEndIndex = output.length
    outputPush(ws.optional(" "))
    let operatorIndex = output.length
    outputPush(node.token.data)
    outputPush(ws.optional(" "))
    let rightBeginIndex = output.length
    // if (rightBeginIndex == 154) {
    //     debugger
    // }
    let rightAssignType = deparse(node.children[1])
    let returnType
    if (leftAssignType == "number") {
        if (rightAssignType == "NumData" || rightAssignType == "FloatData" || rightAssignType == "IntData") {
            outputPush(".v")
            glOpetatior = null
            returnType = "number"
        } else if (rightAssignType == "number") {
            // 俩边都是number 没必要重写操作符
            glOpetatior = null
            returnType = "number"
        }
    }
    let rightEndIndex = output.length

    if (glOpetatior) {
        glOpetatior = glOpetatior + "_" + convertToAbbreviation("" + leftAssignType) + "_" + convertToAbbreviation("" + rightAssignType)

        outputInsert(leftBeginIndex, glOpetatior + "(")
        // // 因为左边插入了
        outputInsert(rightEndIndex + 1, ")")
        outputReplace(operatorIndex + 1, ",")
        if (glOpetatior.indexOf("undefined") !== -1) {
            debugger
        }
        deparseGlobalVal.useBuiltinOperators.add(glOpetatior)
        return (<any>tsbuiltinOperationFunsWithReturn)[glOpetatior]
    } else {
        return returnType
    }
}

function deparse_unary(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }

    let operatorReplace
    if (node.data == "-") {
        operatorReplace = "glNegative"
    } else if (node.data == "--") {
        operatorReplace = "glFrontSubSelf"
    } else if (node.data == "++") {
        operatorReplace = "glFrontAddSelf"
    } else {
        console.log("无法识别的一元运算符")
        debugger
    }
    let beginIndex = output.length
    outputPush(node.data)
    let deparseType = deparse(node.children[0])
    if (operatorReplace) {
        operatorReplace = operatorReplace + "_" + convertToAbbreviation("" + deparseType)
        outputInsert(beginIndex, operatorReplace + "(")
        // // 因为左边插入了
        outputDel(beginIndex + 1, 1)
        outputPush(")")
        deparseGlobalVal.useBuiltinOperators.add(operatorReplace)
    }
    return deparseType
}

function deparse_whileloop(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    var is_stmtlist = node.children[1].type === "stmtlist"

    outputPush("while(")
    deparse(node.children[0])
    outputPush(")")
    outputPush(is_stmtlist ? ws.optional(" ") : ws.required(" "))
    deparse(node.children[1])
}

function deparse_call(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    var len = node.children.length,
        len_minus_one = len - 1

    let firstChildData = node.children[0]

    if (firstChildData.type != "builtin" && !(<any>builtinFuns)[firstChildData.data]) {
        outputPush("this.")
    }

    let funIndex = output.length
    // if (funIndex === 710) {
    //     debugger
    // }
    deparse(firstChildData)
    outputPush("(")
    let callParamsType: string[] = []
    for (var i = 1; i < len; ++i) {
        let childBegin = output.length
        // if (childBegin == 3788) {
        //     debugger
        // }
        let nowObjType = deparse(node.children[i])
        if (!nowObjType) {
            console.log("error in call")
            debugger
            let test = deparse(node.children[i])
        }
        let childEnd = output.length

        callParamsType.push(convertToAbbreviation("" + nowObjType))
        if (i !== len_minus_one) {
            outputPush(",")
            outputPush(ws.optional(" "))
        }
    }
    let tsFuncName = output[funIndex]
    if (callParamsType.length) {
        tsFuncName += "_" + callParamsType.join("_")
    }
    outputReplace(funIndex, tsFuncName)
    outputPush(")")
    let returnType = (<any>tsbuiltinFunsWithReturn)[tsFuncName] || ""
    if (returnType) {
        deparseGlobalVal.useBuiltinFuncs.add(tsFuncName)
    } else {
        returnType = deparseGlobalVal.customFuns.get(tsFuncName)
        returnType = (<any>convertToTsType)[returnType] || returnType
    }
    if (!returnType) {
        debugger
        console.error("无法获取调用的返回类型")
    }
    return returnType
}

function getObjType(element: string) {
    let nowObjType
    if (
        element.indexOf("int(") == -1 &&
        element.indexOf("float(") == -1 &&
        element.indexOf("int_N(") == -1 &&
        element.indexOf("float_N(") == -1
    ) {
        // 应该优先先查找块定义内的中的
        nowObjType = getFuncObjType(element)
        if (nowObjType) {
            return nowObjType
        }

        // 查找是否内建变量
        nowObjType = (<any>builtinValue)[element]
        if (nowObjType) {
            return nowObjType
        }

        let myIndex = element.indexOf("this.attributeData.")
        if (myIndex !== -1) {
            return (<any>convertToTsType)[deparseGlobalVal.attributeData.get(element.substring(myIndex + "this.attributeData.".length))!]
        }

        myIndex = element.indexOf("this.varyingData.")
        if (myIndex !== -1) {
            return (nowObjType = (<any>convertToTsType)[
                deparseGlobalVal.varyingData.get(element.substring(myIndex + "this.varyingData.".length))!
            ])
        }

        myIndex = element.indexOf("this.uniformData.")
        if (myIndex !== -1) {
            return (nowObjType = deparseGlobalVal.uniformData.get(element.substring(myIndex + "this.uniformData.".length))!)
        }

        nowObjType = deparseGlobalVal.defines.get(element)
        if (nowObjType !== undefined) {
            if (!isNaN(parseFloat(<string>nowObjType))) {
                nowObjType = "number"
            } else {
                debugger
                nowObjType = "string"
            }
        }
        return nowObjType
    } else {
        nowObjType = "NumData"
    }
    return nowObjType
}

function getSonObjType(element: string, parentObjType: string) {
    let nowObjType
    // 先检查是否内置类型 在检查struct类型
    let dataAtt = (<any>builtinDataAtt)[parentObjType!]
    // 内置类型
    if (dataAtt) {
        nowObjType = dataAtt.att[element]
    } else {
        let sd = getStructType(parentObjType!)
        if (sd) {
            let att = sd.get(element)
            if (att) {
                nowObjType = att
            }
        }
    }
    return nowObjType
}

function deparse_operator(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }

    let beginIndex = output.length
    let leftOperatorType = deparse(node.children[0])
    outputPush(node.data)

    let rightIndex = output.length
    let rightOperatorType = deparse(node.children[1])
    if (rightIndex === 209) {
        debugger
    }

    // 替换rgba 和stpq这种格式的代码
    if (node.data === "." && (<any>glslBuiltinType)[leftOperatorType]) {
        let str = output[rightIndex]
        str = str.replace(/r/g, "x")
        str = str.replace(/g/g, "y")
        str = str.replace(/b/g, "z")
        str = str.replace(/a/g, "w")
        str = str.replace(/s/g, "x")
        str = str.replace(/t/g, "y")
        str = str.replace(/p/g, "z")
        str = str.replace(/q/g, "w")
        outputReplace(rightIndex, str)
    }

    let isTop = false
    let callTree: string[] = []
    let callTreeIndex: number[] = []
    let isCallTree = true
    let isArrayCall = false
    let lastIsArrayCall = false
    for (let t = output.length - 1; t >= 0; t--) {
        const code = output[t]
        if (isCallTree) {
            isCallTree = false
            if (code === "]") {
                isArrayCall = true
            } else {
                callTree.push(code)
                callTreeIndex.push(t)
            }
        } else if (isArrayCall) {
            if (code === "[") {
                isArrayCall = false
                lastIsArrayCall = true
            } else {
                let numStr = code.match(/[0-9]+/g)
                if (numStr) {
                    let str = numStr[0]
                    let num = parseInt(str)
                    if (!isNaN(num)) {
                        callTree.push(str)
                        callTreeIndex.push(t)
                    }
                }
            }
        } else {
            if (code == ".") {
                isCallTree = true
            } else if (code == "]") {
                isArrayCall = true
            } else {
                if (lastIsArrayCall) {
                    if (code !== ")") {
                        callTree.push(code)
                        callTreeIndex.push(t)
                        lastIsArrayCall = false
                    }
                } else {
                    isTop = t == beginIndex - 1
                    break
                }
            }
        }
    }

    let nowObjType: string | null | undefined
    for (let index = callTree.length - 1; index >= 0; index--) {
        const element = callTree[index]

        // 说明是数值所以是数组索引 nowObjType 不用变
        if (isNaN(parseInt(element))) {
            if (index == callTree.length - 1) {
                nowObjType = getObjType(element)
            } else {
                nowObjType = getSonObjType(element, nowObjType!)
            }
        }
    }

    if (!nowObjType) {
        nowObjType = getSonObjType(node.children[1].data, leftOperatorType)
        isTop = true
    }

    if (!nowObjType) {
        console.error("error get obj")
        debugger
    }

    // 如果是call的話 且是对子节点的取值 且是自定义函数
    if (node.parent.type == "call" && callTree.length > 1) {
        let firstChildData = node.parent.children[0]
        if (firstChildData.type != "builtin" && !(<any>builtinFuns)[firstChildData.data]) {
            // 查找父节点类型
            let parentType: string | undefined = undefined
            for (let index = callTree.length - 1; index >= 1; index--) {
                const element = callTree[index]
                if (index == callTree.length - 1) {
                    parentType = getObjType(element)
                } else {
                    parentType = getSonObjType(element, nowObjType!)
                }
            }

            if (!parentType) {
                parentType = leftOperatorType
            }

            // 如果是内建對象的話
            if ((<any>glslBuiltinType)[parentType!]) {
                outputReplace(output.length - 1, "out_" + output[output.length - 1])
                if (nowObjType == "number") {
                    nowObjType = "NumData"
                }
            }
        }
    }

    if (deparseGlobalVal.isLeftSet && callTree.length > 1) {
        // 查找父节点类型
        let parentType: string | undefined = undefined
        for (let index = callTree.length - 1; index >= 1; index--) {
            const element = callTree[index]
            if (index == callTree.length - 1) {
                parentType = getObjType(element)
            } else {
                parentType = getSonObjType(element, nowObjType!)
            }
        }

        if (!parentType) {
            parentType = leftOperatorType
        }

        // 如果是内建對象的話
        if ((<any>glslBuiltinType)[parentType!]) {
            outputReplace(output.length - 1, "out_" + output[output.length - 1])
            if (nowObjType == "number") {
                nowObjType = "NumData"
            }
        }
    }

    if (nowObjType == "number") {
        if (isTop) {
            if (
                // 如果是赋值语句的话不用进行变量转换
                !(
                    (node.parent.data == "=" ||
                        node.parent.data == "+=" ||
                        node.parent.data == "-=" ||
                        node.parent.data == "*=" ||
                        node.parent.data == "/=") &&
                    node == node.parent.children[0]
                )
            ) {
                outputInsert(beginIndex, "float_N(")
                outputPush(")")
                nowObjType = "NumData"
            }
        }
    }

    return nowObjType
}

function deparse_group(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    outputPush("(")
    let type = deparse(node.children[0])
    outputPush(")")
    return type
}

function deparse_suffix(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }

    let glOperation
    if (node.data == "++") {
        glOperation = "glAfterAddSelf"
    } else if (node.data == "--") {
        glOperation = "glFrontSubSelf"
    } else {
        console.error("无法识别的suffix 语句")
        debugger
    }
    let beginIndex = output.length
    let type = deparse(node.children[0])
    if (glOperation) {
        glOperation = glOperation + "_" + convertToAbbreviation("" + type)
        outputInsert(beginIndex, glOperation + "(")
        // // 因为左边插入了
        outputPush(")")
        deparseGlobalVal.useBuiltinOperators.add(glOperation)
    } else {
        outputPush(node.data)
    }
}

function deparse_quantifier(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    debugger
    outputPush("[")
    if (node.children[0]) deparse(node.children[0])
    outputPush("]")
}

function deparse_ternary(node: any) {
    if (!deparseGlobalVal.isFuncBlock) {
        return
    }
    deparse(node.children[0])
    outputPush(ws.optional(" "))
    outputPush("?")
    outputPush(ws.optional(" "))
    let type1 = deparse(node.children[1])
    outputPush(ws.optional(" "))
    outputPush(":")
    outputPush(ws.optional(" "))
    let type2 = deparse(node.children[2])
    return type1 || type2
}

function deparse(ast: any) {
    let func: any = (<any>types)[ast.type]
    if (!func) {
        debugger
    }
    return func(ast)
}
