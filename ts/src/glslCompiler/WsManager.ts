var Nothing = ""
export class WsManager {
    enabled: boolean = false
    indent_text: string = ""
    level = 0
    tabcache: string[]
    optional: Function = null!

    constructor(whitespace_enabled: boolean = false, indent_text: string = "") {
        this.enabled = whitespace_enabled
        this.indent_text = indent_text
        this.level = 0
        this.tabcache = ["", indent_text, indent_text + indent_text, indent_text + indent_text + indent_text]

        this.optional = whitespace_enabled ? this.required : this.disabled
    }

    indent() {
        ++this.level
    }

    dedent() {
        --this.level
    }

    disabled() {
        return Nothing
    }

    required(c: string) {
        if (c === "\n" && this.enabled) {
            // 增加;一边ts对代码的重排处理
            c += this.tab()
        }
        return c
    }

    tab() {
        // yes, we're caching tabs.
        // why? well, every line is going to be calling this,
        // which would suck if we were indented a bunch in a block.
        if (this.tabcache[this.level]) {
            return this.tabcache[this.level]
        }

        var _ = ""
        for (var i = 0, len = this.level, o = this.indent_text; i < len; ++i) {
            _ += o
        }

        return (this.tabcache[len] = _)
    }
}
