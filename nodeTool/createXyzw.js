let codeStrs = [
    ["x", "y", "z", "w"],
    // ["r", "g", "b", "a"],
    // ["s", "t", "p", "q"],
]
// let codeStr = ["x", "y", "z", "w"]
// let codeStr = ["r", "g", "b", "a"]
// let codeStr = ["s", "t", "p", "q"]
let fs = require("fs")

// function combination(lastCombination, codeNum) {
//     if (codeNum == 1) {
//         for (let index = 0; index < codeStr.length; index++) {
//             const element = codeStr[index]
//         }
//     }
// }

function convertToFact(str) {
    switch (str) {
        case "x":
            return "x"
        case "y":
            return "y"
        case "z":
            return "z"
        case "w":
            return "w"
        case "r":
            return "x"
        case "g":
            return "y"
        case "b":
            return "z"
        case "a":
            return "w"
        case "s":
            return "x"
        case "t":
            return "y"
        case "p":
            return "z"
        case "q":
            return "w"
    }
}

let allXyzwContent = ""
for (let q = 0; q < codeStrs.length; q++) {
    const codeStr = codeStrs[q]

    let combinationNum = 4
    let convertContent = ""
    for (let q = 1; q <= combinationNum; q++) {
        let combination = []
        let combinationBegin = 0
        for (let index = 0; index < q; index++) {
            let lastBegin = combinationBegin
            combinationBegin = combination.length
            for (let z = 0; z < combinationNum; z++) {
                const element = codeStr[z]
                if (index == 0) {
                    combination.push(element)
                } else {
                    for (let j = lastBegin; j < combinationBegin; j++) {
                        let oldCom = combination[j]
                        oldCom += element
                        combination.push(oldCom)
                    }
                }
            }
        }

        let tsContent = ""
        for (let index = combinationBegin; index < combination.length; index++) {
            const element = combination[index]
            if (element === undefined) {
                debugger
            }

            let objType = "number"
            let tsObjTypeCachData = ""
            if (element.length == 2) {
                objType = "Vec2Data"
                tsObjTypeCachData = "vec2Data"
            } else if (element.length == 3) {
                objType = "Vec3Data"
                tsObjTypeCachData = "vec3Data"
            } else if (element.length == 4) {
                objType = "Vec4Data"
                tsObjTypeCachData = "vec4Data"
            } else {
                continue
            }

            let type = "number"
            if (element.length == 4) {
                type = "Vec4Data"
            } else if (element.length == 3) {
                type = "Vec3Data"
            } else if (element.length == 2) {
                type = "Vec2Data"
            }
            convertContent += `                ${element}: "${type}",\n`

            let paramStr = ""
            for (let t = 0; t < element.length; t++) {
                const str = element[t]
                paramStr += `this.out_${convertToFact(str)}`
                if (t != element.length - 1) {
                    paramStr += ", "
                }
            }

            let nStr = ""
            for (let a = 0; a < element.length; a++) {
                nStr += "_N"
            }

            tsContent += `    get ${element}() {\n`
            tsContent += `        let v = ${tsObjTypeCachData}.getData()\n`
            tsContent += `        v.set${nStr}(${paramStr})\n`
            tsContent += `        return v\n`
            tsContent += `    }\n`

            tsContent += `    get out_${element}() {\n`
            tsContent += `        let v = new ${objType}()\n`
            tsContent += `        v.outSet${nStr}(${paramStr})\n`
            tsContent += `        return v\n`
            tsContent += `    }\n`

            // get可以重复 set不能重复
            let isRepeat = false
            for (let t = 0; t < element.length; t++) {
                const str = element[t]
                for (let b = 0; b < element.length; b++) {
                    const test = element[b]
                    if (b !== t && test === str) {
                        isRepeat = true
                        break
                    }
                }
                if (isRepeat) {
                    break
                }
            }
            if (isRepeat) {
                continue
            }
            tsContent += `    set ${element}(other: ${objType}) {\n`
            for (let t = 0; t < element.length; t++) {
                const str = element[t]
                tsContent += `        this.${convertToFact(str)} = other.${convertToFact(codeStr[t])}\n`
                // if (t !== element.length - 1) {
                //     tsContent += "\n"
                // }
            }
            tsContent += `    }\n`
        }
        allXyzwContent += tsContent + "\n"
        // console.log(tsContent)
    }
}
fs.writeFileSync("xyzwContet", allXyzwContent)
// console.log(convertContent)
