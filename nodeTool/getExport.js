let fs = require("fs")
console.log(__dirname)
let rootPath = __dirname.substr(0, __dirname.lastIndexOf("\\"))
console.log(rootPath)
let str = fs.readFileSync(rootPath + "/assets/script/rasterDebugCom/shader/builtin/BuiltinOperator.ts").toString()

// console.log(str)
let lineStr = str.split("\n")
let importStr = `import {\n`
let exportWithReturn = {}
let funs = {}
let i = 0
lineStr.forEach((str) => {
    i++
    let index = str.indexOf("export ")
    if (index != -1) {
        let oldStr = str
        str = str.substring(index + 7)
        index = str.indexOf("let ")
        if (index != -1) {
            str = str.substring(index + 4)
            str = str.substring(0, str.indexOf(" "))
        } else {
            index = str.indexOf("function ")
            str = str.substring(index + 9)
            str = str.substring(0, str.indexOf("("))
        }
        console.log(str)
        importStr += `    ${str},\n `

        index = oldStr.indexOf("):")
        if (index !== -1) {
            exportWithReturn[str] = oldStr.substring(index + 3, oldStr.indexOf("{") - 1)
        } else {
            console.log(str + " not search return")
        }
        let factIndex = str.indexOf("_")
        if (factIndex != -1) {
            funs[str.substring(0, factIndex)] = true
        } else {
            funs[str] = true
        }
    }
})
importStr += `} from "./builtin/BuiltinOperator"`
console.log(importStr)
console.log(exportWithReturn)
console.log(funs)
