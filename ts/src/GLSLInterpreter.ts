import { deparseToTs } from "./glslCompiler/deparserToTs"
// import { parseArray } from "./glslCompiler/parser/parser"
// import { tokenizeString } from "./glslCompiler/tokenizer/GlslTokenizer"
// import { SparkMD5 } from "./Spark-md5"
let tokenizeString = require("glsl-tokenizer")
let parseArray = require("glsl-parser/direct")
let SparkMD5 = require("Spark-md5")

const shaderBeginContent = `import { AttributeData, FragShaderHandle, UniformData, VaryingData, VertShaderHandle, StructData } from "../../ShaderDefine"
import { IntData, FloatData, Vec2Data, Vec3Data, Vec4Data, Mat3Data, Mat4Data, BoolData, Sampler2D, SamplerCube } from "../builtin/BuiltinData"
`
enum BlockType {
    structBlock,
    funcBlock,
    ifBlock,
    whileBlock,
    defineIfBlock,
    defineElseBlock,
    defineElifBlock,
}

enum JudgeType {
    more,
    moreEqual,
    less,
    lessEqual,
    equal,
    noEqual,
}

class DefineBlockJudgeData {
    public nowLevel: number = 0
    public canCompile: boolean = false
    public blockType: BlockType = null!
    public content: string = ""
}

function getDefineOrConstNum(str: string, define: Map<string, number | string>) {
    let index = str.indexOf("!")
    let logicNeg = false
    if (index !== -1) {
        logicNeg = true
        str = str.substring(index + 1)
    }
    str = str.replace(/\s*/g, "")
    let num = parseFloat(str)
    if (isNaN(num)) {
        num = <number>define.get(str)
    }
    // 在define中找不到其實也正常
    if (num === undefined) {
        console.log("在define中查找不到对应变量 " + str)
        num = 0
    }

    if (logicNeg) {
        num = num !== 0 ? 0 : 1
    }
    return num
}

function compilerJudge(left: string, right: string, type: JudgeType, define: Map<string, number | string>) {
    let leftNum = getDefineOrConstNum(left, define)
    let rightNum = getDefineOrConstNum(right, define)

    let canCompiler = false
    switch (type) {
        case JudgeType.more:
            canCompiler = leftNum > rightNum
            break
        case JudgeType.moreEqual:
            canCompiler = leftNum >= rightNum
            break
        case JudgeType.less:
            canCompiler = leftNum < rightNum
            break
        case JudgeType.lessEqual:
            canCompiler = leftNum <= rightNum
            break
        case JudgeType.equal:
            canCompiler = leftNum == rightNum
            break
        case JudgeType.noEqual:
            canCompiler = leftNum != rightNum
            break
        default:
            console.error("无法识别的类型")
            debugger
    }
    return canCompiler
}

let judgeOperatorStrs = [">", ">=", "<", "<=", "==", "!="]
function interpreterDefine(lineStr: string, defines: Map<string, number | string>, defineCode: string) {
    let judgeLine: string[] = []
    let judgeStr = lineStr.substring(lineStr.indexOf(defineCode) + defineCode.length)
    let isAndArr = []
    while (true) {
        let andIndex = judgeStr.indexOf("&&")
        let orIndex = judgeStr.indexOf("||")
        let spIndex
        if (andIndex * orIndex >= 0) {
            spIndex = Math.min(andIndex, orIndex)
        } else {
            spIndex = Math.max(andIndex, orIndex)
        }
        if (spIndex !== -1) {
            isAndArr.push(spIndex == andIndex)

            judgeLine.push(judgeStr.substring(0, spIndex))
            judgeStr = judgeStr.substring(spIndex + defineCode.length)
        } else {
            judgeLine.push(judgeStr)
            break
        }
    }

    let canCompiler = true
    for (let index = 0; index < judgeLine.length; index++) {
        let isAnd = isAndArr[index]
        if (isAnd === undefined) {
            isAnd = true
        }
        let str = judgeLine[index]
        let isJudgeSuc: boolean = false
        let judgeType: JudgeType | null = null

        let judgeIndex = -1
        for (let index = 0; index < judgeOperatorStrs.length; index++) {
            const element = judgeOperatorStrs[index]
            judgeIndex = str.indexOf(element)
            if (judgeIndex !== -1) {
                judgeType = index
                break
            }
        }

        if (judgeIndex !== -1) {
            let operatorStr = judgeOperatorStrs[judgeType!]
            let leftStr = str.substring(0, judgeIndex)
            let rightStr = str.substring(judgeIndex + operatorStr.length)

            // 去掉空格
            leftStr = leftStr.replace(/\s*/g, "")
            rightStr = rightStr.replace(/\s*/g, "")

            isJudgeSuc = compilerJudge(leftStr, rightStr, judgeType!, defines)
        } else {
            let num = getDefineOrConstNum(str, defines)
            isJudgeSuc = num != 0
        }

        if (isJudgeSuc) {
            if (isAnd) {
                // 继续
            } else {
                canCompiler = true
                break
            }
        } else {
            if (isAnd) {
                canCompiler = false
                break
            } else {
                // 继续
            }
        }
    }
    return canCompiler
}

export class GLSLInterpreter {
    static interpreter(source: string) {
        let lines = source.split("\n")
        let defines: Map<string, number> = new Map()
        let strDefines: Map<string, string> = new Map()

        // 根据块层级定义的defines语句判断
        let nowLevelBlock = 0
        let levelBlockDefinesJudge: Map<Number, DefineBlockJudgeData[]> = new Map()
        let attributeKey = "attribute "
        let varyingKey = "varying "
        let uniformKey = "uniform "
        let structKey = "struct "

        let isVert = source.indexOf("gl_Position") !== -1

        // 不能提前计算define
        // 通过#if 语句排除不执行的语句
        let excludeUnuseLine: string[] = []

        let remainContent = ""
        let bloackStack: any[] = []
        for (let i = 0; i < lines.length; i++) {
            const lineStr = lines[i]
            let strArr = lineStr.split(" ")
            let analysisStr: string[] = []
            strArr.forEach((element) => {
                if (element !== "") {
                    analysisStr.push(element)
                }
            })

            // 所以的语句都会被判断
            // 所以要一直往父节点判断 都是可以编译的 才能编译
            let canHandleLine = false
            if (levelBlockDefinesJudge.size > 0) {
                for (let index = nowLevelBlock; index > 0; index--) {
                    let levelBlockData = levelBlockDefinesJudge.get(index)!
                    let nowBlockData = levelBlockData[levelBlockData.length - 1]
                    canHandleLine = nowBlockData.canCompile
                    if (!canHandleLine) {
                        break
                    }
                }
            } else {
                canHandleLine = true
            }
            if (lineStr.indexOf("#") !== -1) {
                if (lineStr.indexOf("define") !== -1) {
                    if (!canHandleLine) {
                        continue
                    }
                    let index = lineStr.indexOf("define")
                    if (lineStr.indexOf("(") !== -1) {
                        console.error("暂时无法识别define中的(")
                        debugger
                    }
                    let remainStr = lineStr.substr(index + "define".length)
                    let strArr = remainStr.split(" ")
                    let keyValueStr: string[] = []
                    strArr.forEach((element) => {
                        if (element !== "") {
                            keyValueStr.push(element)
                        }
                    })

                    let value: number | string = parseFloat(keyValueStr[1])
                    if (isNaN(value)) {
                        value = keyValueStr[1]
                        strDefines.set(keyValueStr[0], value)
                    } else {
                        defines.set(keyValueStr[0], value)
                    }
                } else if (lineStr.indexOf("#ifdef") !== -1 || lineStr.indexOf("# ifdef") !== -1) {
                    nowLevelBlock++
                    let nowLevelBlockData = new DefineBlockJudgeData()
                    nowLevelBlockData.nowLevel = nowLevelBlock
                    nowLevelBlockData.blockType = BlockType.defineIfBlock
                    nowLevelBlockData.content = lineStr

                    if (levelBlockDefinesJudge.get(nowLevelBlock)) {
                        console.error("不应该在if语句中有同一层级的数据")
                        debugger
                    }

                    // if下的语句可以编译
                    if (defines.get(analysisStr[1])) {
                        nowLevelBlockData.canCompile = true
                        // bloackStack.push({ type: BlockType.defineIfBlock, value: true, canBuild: true })
                    } else {
                        nowLevelBlockData.canCompile = false
                        // 不可编译
                        // bloackStack.push({ type: BlockType.defineIfBlock, value: false, canBuild: false })
                    }
                    levelBlockDefinesJudge.set(nowLevelBlock, [nowLevelBlockData])
                } else if (lineStr.indexOf("#if") !== -1 || lineStr.indexOf("# if") !== -1) {
                    nowLevelBlock++
                    let nowLevelBlockData = new DefineBlockJudgeData()
                    nowLevelBlockData.nowLevel = nowLevelBlock
                    nowLevelBlockData.blockType = BlockType.defineIfBlock
                    nowLevelBlockData.content = lineStr

                    if (levelBlockDefinesJudge.get(nowLevelBlock)) {
                        console.error("不应该在if语句中有同一层级的数据")
                        debugger
                    }
                    // 要进行语句判断
                    let canCompiler = interpreterDefine(lineStr, defines, "if")
                    nowLevelBlockData.canCompile = canCompiler
                    levelBlockDefinesJudge.set(nowLevelBlock, [nowLevelBlockData])

                    // if (canCompiler) {
                    //     bloackStack.push({ type: BlockType.defineIfBlock, value: true, canBuild: true, nowLevel: 0, buildLevel: 0 })
                    // } else {
                    //     // 不可编译
                    //     bloackStack.push({ type: BlockType.defineIfBlock, value: false, canBuild: false })
                    // }
                } else if (lineStr.indexOf("#elif") !== -1 || lineStr.indexOf("# elif") !== -1) {
                    let levelBlockData = levelBlockDefinesJudge.get(nowLevelBlock)!
                    if (!levelBlockData) {
                        console.error("elif语句中必然有同一层级的数据")
                        debugger
                    }

                    // 如果之前有成功编译的条件语句的话 后面的预编译判断都不能生效
                    let hasCompiler = false
                    for (let index = 0; index < levelBlockData.length; index++) {
                        const element = levelBlockData[index]
                        if (element.canCompile) {
                            hasCompiler = true
                            break
                        }
                    }

                    let nowLevelBlockData = new DefineBlockJudgeData()
                    nowLevelBlockData.nowLevel = nowLevelBlock
                    nowLevelBlockData.blockType = BlockType.defineElifBlock
                    nowLevelBlockData.content = lineStr
                    if (hasCompiler) {
                        nowLevelBlockData.canCompile = false
                    } else {
                        let canCompiler = interpreterDefine(lineStr, defines, "elif")
                        nowLevelBlockData.canCompile = canCompiler
                    }
                    levelBlockData.push(nowLevelBlockData)
                } else if (lineStr.indexOf("#else") !== -1 || lineStr.indexOf("# else") !== -1) {
                    let levelBlockData = levelBlockDefinesJudge.get(nowLevelBlock)!
                    if (!levelBlockData) {
                        console.error("elif语句中必然有同一层级的数据")
                        debugger
                    }

                    // 如果之前有成功编译的条件语句的话 后面的预编译判断都不能生效
                    let hasCompiler = false
                    for (let index = 0; index < levelBlockData.length; index++) {
                        const element = levelBlockData[index]
                        if (element.canCompile) {
                            hasCompiler = true
                            break
                        }
                    }

                    let nowLevelBlockData = new DefineBlockJudgeData()
                    nowLevelBlockData.nowLevel = nowLevelBlock
                    nowLevelBlockData.blockType = BlockType.defineElifBlock
                    nowLevelBlockData.content = lineStr
                    if (hasCompiler) {
                        nowLevelBlockData.canCompile = false
                    } else {
                        // 如果是之前都没编译 证明之前的都是false 所以这个else应该生效
                        nowLevelBlockData.canCompile = true
                    }
                    levelBlockData.push(nowLevelBlockData)
                } else if (lineStr.indexOf("#endif") !== -1 || lineStr.indexOf("# endif") !== -1) {
                    let levelBlockData = levelBlockDefinesJudge.get(nowLevelBlock)!
                    if (!levelBlockData) {
                        console.error("endif语句中必然有同一层级的数据")
                        debugger
                    }
                    levelBlockDefinesJudge.delete(nowLevelBlock)
                    nowLevelBlock--
                } else {
                    console.error("未识别的宏定义: " + lineStr)
                }
            } else {
                if (canHandleLine) {
                    let pushStr = lineStr
                    strDefines.forEach((str, replaceStr) => {
                        pushStr = pushStr.replace(new RegExp(replaceStr, "g"), str)
                    })
                    excludeUnuseLine.push(pushStr)
                }
            }
        }

        for (let i = 0; i < excludeUnuseLine.length; i++) {
            const lineStr = excludeUnuseLine[i]
            remainContent += lineStr + "\n"
        }

        // console.log(remainContent)
        // defines.forEach((value: string | number, key: string) => {
        //     remainContent = `#define ${key} ${value}\n` + remainContent
        // })

        let token = tokenizeString(remainContent)
        let ast = parseArray(token)

        let uniformData: Map<string, string> = new Map()
        let varyingData: Map<string, string> = new Map()
        let attributeData: Map<string, string> = new Map()
        let structDataMap: Map<string, Map<string, string>> = new Map()
        let structData: Map<string, string> | null = null

        let logicLines: string[] = []

        // 获取所有的函数外部变量
        for (let i = 0; i < excludeUnuseLine.length; i++) {
            let lineStr = excludeUnuseLine[i]
            // 删掉冒号
            let deleteIndex = lineStr.indexOf(";")
            if (deleteIndex !== -1) {
                lineStr = lineStr.substr(0, deleteIndex)
            }

            let strArr = lineStr.split(" ")
            let analysisStr: string[] = []
            strArr.forEach((element) => {
                if (element !== "") {
                    analysisStr.push(element)
                }
            })

            let index = lineStr.indexOf(varyingKey)
            if (index !== -1) {
                if (analysisStr.length == 4) {
                    varyingData.set(analysisStr[3], analysisStr[2])
                } else {
                    varyingData.set(analysisStr[2], analysisStr[1])
                }
                continue
            }

            index = lineStr.indexOf(attributeKey)
            if (index !== -1) {
                if (analysisStr.length == 4) {
                    attributeData.set(analysisStr[3], analysisStr[2])
                } else {
                    attributeData.set(analysisStr[2], analysisStr[1])
                }
                continue
            }

            index = lineStr.indexOf(uniformKey)
            if (index !== -1) {
                if (analysisStr.length == 4) {
                    uniformData.set(analysisStr[3], analysisStr[2])
                } else {
                    uniformData.set(analysisStr[2], analysisStr[1])
                }
                continue
            }

            index = lineStr.indexOf(structKey)
            if (index !== -1) {
                structData = new Map()
                structDataMap.set(analysisStr[1], structData)
                continue
            }

            if (structData) {
                analysisStr.forEach((str) => {
                    if (str.indexOf("}") !== -1) {
                        structData = null
                    }
                })
                if (analysisStr.length == 2) {
                    structData.set(analysisStr[1], analysisStr[0])
                } else if (analysisStr.length == 3) {
                    structData.set(analysisStr[2], analysisStr[1])
                }
            } else {
                logicLines.push(lineStr)
            }
        }

        let hash = SparkMD5.hash(source)
        // 这里的ts脚本是不包含uniform等变量声明的
        let args = deparseToTs(ast, true, "    ", uniformData, varyingData, attributeData, structDataMap, defines, isVert, hash)
        let importStr = args[0]
        let tsScript = args[1]

        let originSource = "/*\norigin glsl source: \n"
        originSource += source + "\n*/\n"
        // console.log(originSource + tsScript)

        let outStr = originSource + importStr + shaderBeginContent + tsScript

        let win: any = window
        outStr = win.prettier.format(outStr, {
            parser: "typescript",
            plugins: win.prettierPlugins,
            tabWidth: 4,
            useTabs: false,
            semi: false,
            printWidth: 140,
        })
        console.log(outStr)
        return [hash, outStr]
    }
}
