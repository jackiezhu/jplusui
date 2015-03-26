/**
 * @fileOverview 本文件提供文档演示的相关代码，不是组件的一部分。
 * @author xuld
 */

// #region 前后台公用的部分

var Doc = Doc || {};

/**
 * 全局配置。
 */
Doc.Configs = {

    /**
     * 当前项目的基础路径。
     */
    basePath: '../../',

    /**
	 * 用于处理所有前端请求的服务地址。
	 */
    servicePath: 'http://localhost:5373/node/service/api.njs',

    /**
	 * 存放开发系统文件的文件夹。
	 */
    devTools: "devtools",

    /**
	 * 存放源文件的文件夹。
	 */
    sources: "src",

    /**
	 * 存放文档文件的文件夹。
	 */
    demos: "demo",

    /**
	 * 存放模块列表路径的地址。
	 */
    moduleListPath: '{devTools}/assets/data/modulelist.js',

    /**
	 * 存放模板列表路径的地址。
	 */
    templatesPath: '{devTools}/assets/templates',

    /**
	 * 存放数据字段的 meta 节点。
	 */
    moduleInfo: 'module-info',

    /**
	 * 整个项目标配使用的编码。
	 */
    encoding: 'utf-8',

    /**
	 * 组件访问历史最大值。
	 */
    maxModuleHistory: 10,

    /**
	 * 合法的状态值。
	 */
    status: {
        'stable': '稳定版',
        'done': '已完成',
        'beta': '测试版',
        'todo': '计划中',
        'doing': '开发中',
        'deprecated': '已废弃'
    },

    /**
	 * 特性列表。
	 */
    attributes: {
        'mobile': '移动端',
        'pc': 'PC 端',
        'ie8': '兼容IE8+',
        'ie6': '兼容IE6+'
    }

    ///**
    // * 底部 HTML 模板。
    // */
    //footer: '<footer class="doc" style="margin-bottom: 36px; font-size: 12px; line-height: 18px;">\
    //    <hr class="doc">\
    //    <nav class="doc-toolbar">\
    //        <a href="https://www.github.com/jplusui/jplusui">GitHub</a>  |  \
    //        <a href="#">返回顶部</a>\
    //    </nav>\
    //    <span>&copy; 2011-2015 JPlusUI Team</span>\
    //</footer>',


};

Doc.ModuleInfo = {

    /**
     * 获取当前页面指定的控件的信息。
     */
    parse: function (value) {
        var r = {};
        value = value.split(/,\s*/);
        for (var i = 0; i < value.length; i++) {
            var t = value[i],
			    s = t.indexOf('=');
            r[t.substr(0, s)] = t.substr(s + 1);
        }
        return r;
    },

    /**
     * 获取当前页面指定的控件的信息。
     */
    stringify: function (value) {
        var r = [];
        for (var key in value) {
            r.push(key + '=' + value[key]);
        }
        return r.join(', ');
    }

};

// #endregion

// 指示当前系统是否在后台运行。
if (typeof module === 'object') {

    //#region 后台部分

    Doc.Configs.basePath = require('path').resolve(__dirname, Doc.Configs.basePath);

    // 导出 Doc 模块。
    module.exports = Doc;

    //#endregion

} else {

    // #region Utils

    /**
	* DOM辅助处理模块。
	*/
    Doc.Dom = {

        /**
		 * 指示当前是否为 IE6-8 浏览器。
		 */
        isOldIE: !+"\v1",

        /**
         * 为 IE 浏览器提供特殊处理。
         */
        fixBrowser: function () {

            // 令 IE6-8 支持显示 HTML5 新元素。
            if (Doc.Dom.isOldIE) {
                'article section header footer nav aside details summary menu'.replace(/\w+/g, function (tagName) {
                    document.createElement(tagName);
                });
            }

            // IE6-8 缺少 indexOf 函数。
            Array.prototype.indexOf = Array.prototype.indexOf || function (value, startIndex) {
                for (var i = startIndex || 0; i < this.length; i++) {
                    if (this[i] === value) {
                        return i;
                    }
                }
                return -1;
            };

            String.prototype.trim = String.prototype.trim || function () {
                return this.replace(/^\s+|\s+$/g, "");
            };

            // IE6-7 缺少 document.querySelector 函数。
            document.querySelectorAll = document.querySelectorAll || function (selector) {

                // selector 可能为 tagName, .className, tagName[attrName=attrValue]

                var match = /^(\w*)(\.(\w+)|\[(\w+)=(['"]?)([^'"]*)\5\])?$/.exec(selector);
                var list = this.getElementsByTagName(match[1] || '*');
                // 没有其它过滤器，直接返回。
                if (!match[2]) {
                    return list;
                }

                var result = [];

                for (var i = 0, node; node = list[i]; i++) {
                    // 区分是否是属性选择器。
                    if (match[4]) {
                        if (node.getAttribute(match[4]) === match[6]) {
                            result.push(node);
                        }
                    } else {
                        if ((' ' + node.className + ' ').indexOf(' ' + match[3] + ' ') >= 0) {
                            result.push(node);
                        }
                    }
                }

                return result;
            };
            document.querySelector = document.querySelector || function (selector) {
                return document.querySelectorAll(selector)[0] || null;
            };

            window.localStorage = window.localStorage || {};

        },

        /**
		 * 设置 DOM ready 后的回调。
		 */
        ready: function (callback) {
            function check() {
                /in/.test(document.readyState) ? setTimeout(check, 1) : callback();
            }
            check();
        },

        /**
         * 异步载入一个脚本。
         */
        loadScript: function (src, callback) {
            var script = document.createElement('SCRIPT');
            script.type = 'text/javascript';
            script.src = src;
            script.onload = script.onreadystatechange = function () {
                if (!script.readyState || !/in/.test(script.readyState)) {
                    script.onload = script.onreadystatechange = null;
                    callback();
                }
            };
            var head = document.getElementsByTagName('HEAD')[0];
            head.insertBefore(script, head.firstChild);
        }

    };

    /**
	 * 代码处理模块。
	 */
    Doc.Utils = {

        /**
         * 格式化指定的字符串。
         * @param {String} formatString 要格式化的字符串。格式化的方式见备注。
         * @param {Object} ... 格式化参数。
         * @return {String} 格式化后的字符串。
         * @remark 
         * 
         * 格式化字符串中，使用 {0} {1} ... 等元字符来表示传递给 String.format 用于格式化的参数。
         * 如 String.format("{0} 年 {1} 月 {2} 日", 2012, 12, 32) 中， {0} 被替换成 2012，
         * {1} 被替换成 12 ，依次类推。
         * 
         * String.format 也支持使用一个 JSON来作为格式化参数。
         * 如 String.format("{year} 年 {month} 月 ", { year: 2012, month:12});
         * 若要使用这个功能，请确保 String.format 函数有且仅有 2个参数，且第二个参数是一个 Object。
         *
         * 格式化的字符串{}不允许包含空格。
         * 
         * 如果需要在格式化字符串中出现 { 和 }，请分别使用 {{ 和 }} 替代。
         * 不要出现{{{ 和 }}} 这样将获得不可预知的结果。
         * @memberOf String
         * @example <pre>
         * String.format("{0}转换", 1); //  "1转换"
         * String.format("{1}翻译",0,1); // "1翻译"
         * String.format("{a}翻译",{a:"也可以"}); // 也可以翻译
         * String.format("{{0}}不转换, {0}转换", 1); //  "{0}不转换1转换"
         * </pre>
         */
        formatString: function (formatString) {
            var args = arguments;
            return formatString ? formatString.replace(/\{\{|\{(\w+)\}|\}\}/g, function (matched, argName) {
                return argName ? (matched = +argName + 1) ? args[matched] : args[1][argName] : matched[0];
            }) : "";
        },

        /**
         * 删除公共的缩进部分。
         */
        removeIndents: function (value) {
            value = value.replace(/^[\r\n]+/, "").replace(/\s+$/, "");
            var space = /^\s+/.exec(value);

            if (space) {
                space = space[0];
                value = value.split(/[\r\n]/);
                for (var i = value.length - 1; i >= 0; i--) {
                    value[i] = value[i].replace(space, "");
                }
                value = value.join('\r\n');
            }
            return value;
        },

        /**
		 * 编码 HTML 特殊字符。
		 * @param {String} value 要编码的字符串。
		 * @return {String} 返回已编码的字符串。
		 * @remark 此函数主要将 & < > ' " 分别编码成 &amp; &lt; &gt; &#39; &quot; 。
		 */
        encodeHTML: (function () {

            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '\'': '&#39;',
                '\"': '&quot;'
            };

            function replaceMap(v) {
                return map[v];
            }

            return function (value) {
                return value.replace(/[&<>\'\"]/g, replaceMap);
            };
        })(),

        /**
		 * 获取一个函数内的源码。
		 */
        getFunctionSource: function (fn) {
            return Doc.Utils.removeIndents(fn.toString().replace(/^function\s+[^(]*\s*\(.*?\)\s*\{[\r\n]*/, "").replace(/\s*\}\s*$/, "").replace(/\\u([0-9a-f]{3})([0-9a-f])/gi, function (a, b, c) {
                return String.fromCharCode((parseInt(b, 16) * 16 + parseInt(c, 16)))
            }));
        }

    };

    /**
	 * 代码高亮模块。
	 */
    Doc.SyntaxHighligher = (function () {
        // Copyright (C) 2012 xuld
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        //      http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.

        /**
		 * @namespace SyntaxHighligher
		 */
        var SH = {

            /**
			 * 所有可用的刷子。
			 */
            brushes: {
                none: function (sourceCode, position) {
                    return [position, 'plain'];
                }
            },

            /**
			 * 创建一个用于指定规则的语法刷子。
			 * @param {Array} stylePatterns 匹配的正则列表，格式为：。
			 * [[css样式名1, 正则1, 可选的头字符], [css样式名2, 正则2], ...]
			 * 其中，可选的头字符是这个匹配格式的简化字符，如果源码以这个字符里的任何字符打头，表示自动匹配这个正则。
			 * @return {Function} 返回一个刷子函数。刷子函数的输入为：
			 *
			 * - sourceCode {String} 要处理的源码。
			 * - position {Number} 要开始处理的位置。
			 *
			 * 返回值为一个数组，格式为。
			 * [位置1, 样式1, 位置2, 样式2, ..., 位置n-1, 样式n-1]
			 *
			 * 表示源码中， 位置n-1 到 位置n 之间应用样式n-1
			 */
            createBrush: function (stylePatterns) {
                var shortcuts = {},
					tokenizer, stylePatternsStart = 0,
					stylePatternsEnd = stylePatterns.length;
                (function () {
                    var allRegexs = [],
						i, stylePattern, shortcutChars, c;
                    for (i = 0; i < stylePatternsEnd; i++) {
                        stylePattern = stylePatterns[i];
                        if ((shortcutChars = stylePattern[2])) {
                            for (c = shortcutChars.length; --c >= 0;) {
                                shortcuts[shortcutChars.charAt(c)] = stylePattern;
                            }

                            if (i == stylePatternsStart) stylePatternsStart++;
                        }
                        allRegexs.push(stylePattern[1]);
                    }
                    allRegexs.push(/[\0-\uffff]/);
                    tokenizer = combinePrefixPatterns(allRegexs);
                })();

                function decorate(sourceCode, position) {
                    /** Even entries are positions in source in ascending order.  Odd enties
					 * are style markers (e.g., COMMENT) that run from that position until
					 * the end.
					 * @type {Array<number/string>}
					 */
                    var decorations = [position, 'plain'],
						tokens = sourceCode.match(tokenizer) || [],
						pos = 0,
						// index into sourceCode
						styleCache = {},
						ti = 0,
						nTokens = tokens.length,
						token, style, match, isEmbedded, stylePattern;

                    while (ti < nTokens) {
                        token = tokens[ti++];

                        if (styleCache.hasOwnProperty(token)) {
                            style = styleCache[token];
                            isEmbedded = false;
                        } else {

                            // 测试 shortcuts。
                            stylePattern = shortcuts[token.charAt(0)];
                            if (stylePattern) {
                                match = token.match(stylePattern[1]);
                                style = stylePattern[0];
                            } else {
                                for (var i = stylePatternsStart; i < stylePatternsEnd; ++i) {
                                    stylePattern = stylePatterns[i];
                                    match = token.match(stylePattern[1]);
                                    if (match) {
                                        style = stylePattern[0];
                                        break;
                                    }
                                }

                                if (!match) { // make sure that we make progress
                                    style = 'plain';
                                }
                            }

                            if (style in SH.brushes) {
                                if (style === 'none') {
                                    style = SH.guessLanguage(match[1]);
                                }
                                style = SH.brushes[style];
                            }

                            isEmbedded = typeof style === 'function';

                            if (!isEmbedded) {
                                styleCache[token] = style;
                            }
                        }

                        if (isEmbedded) {
                            // Treat group 1 as an embedded block of source code.
                            var embeddedSource = match[1];
                            var embeddedSourceStart = token.indexOf(embeddedSource);
                            var embeddedSourceEnd = embeddedSourceStart + embeddedSource.length;
                            if (match[2]) {
                                // If embeddedSource can be blank, then it would match at the
                                // beginning which would cause us to infinitely recurse on the
                                // entire token, so we catch the right context in match[2].
                                embeddedSourceEnd = token.length - match[2].length;
                                embeddedSourceStart = embeddedSourceEnd - embeddedSource.length;
                            }

                            // Decorate the left of the embedded source
                            appendDecorations(position + pos, token.substring(0, embeddedSourceStart), decorate, decorations);
                            // Decorate the embedded source
                            appendDecorations(position + pos + embeddedSourceStart, embeddedSource, style, decorations);
                            // Decorate the right of the embedded section
                            appendDecorations(position + pos + embeddedSourceEnd, token.substring(embeddedSourceEnd), decorate, decorations);
                        } else {
                            decorations.push(position + pos, style);
                        }
                        pos += token.length;
                    }


                    removeEmptyAndNestedDecorations(decorations);
                    return decorations;
                };

                return decorate;
            },

            /**
			 * 根据源码猜测对应的刷子。
			 * @param {String} sourceCode 需要高亮的源码。
			 * @return {String} 返回一个语言名。
			 */
            guessLanguage: function (sourceCode) {
                // Treat it as markup if the first non whitespace character is a < and
                // the last non-whitespace character is a >.
                return /^\s*</.test(sourceCode) ? 'xml' : 'default';
            },

            /**
			 * 搜索用于处理指定语言的刷子。
			 * @param {String} language 要查找的语言名。
			 * @return {Function} 返回一个刷子，用于高亮指定的源码。
			 */
            findBrush: function (language) {
                return SH.brushes[language] || SH.brushes.none;
            },

            /**
			 * 注册一个语言的刷子。
			 * @param {String} language 要注册的语言名。
			 * @param {Array} stylePatterns 匹配的正则列表。见 {@link SyntaxHighligher.createBrush}
			 * @return {Function} 返回一个刷子，用于高亮指定的源码。
			 */
            register: function (language, stylePatterns) {
                language = language.split(' ');
                stylePatterns = SH.createBrush(stylePatterns);
                for (var i = 0; i < language.length; i++) {
                    SH.brushes[language[i]] = stylePatterns;
                }
            }

        };

        // CAVEAT: this does not properly handle the case where a regular
        // expression immediately follows another since a regular expression may
        // have flags for case-sensitivity and the like.  Having regexp tokens
        // adjacent is not valid in any language I'm aware of, so I'm punting.
        // TODO: maybe style special characters inside a regexp as punctuation.

        /**
		 * Given a group of {@link RegExp}s, returns a {@code RegExp} that globally
		 * matches the union of the sets of strings matched by the input RegExp.
		 * Since it matches globally, if the input strings have a start-of-input
		 * anchor (/^.../), it is ignored for the purposes of unioning.
		 * @param {Array.<RegExp>} regexs non multiline, non-global regexs.
		 * @return {RegExp} a global regex.
		 */
        function combinePrefixPatterns(regexs) {
            var capturedGroupIndex = 0;

            var needToFoldCase = false;
            var ignoreCase = false;
            for (var i = 0, n = regexs.length; i < n; ++i) {
                var regex = regexs[i];
                if (regex.ignoreCase) {
                    ignoreCase = true;
                } else if (/[a-z]/i.test(regex.source.replace(/\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, ''))) {
                    needToFoldCase = true;
                    ignoreCase = false;
                    break;
                }
            }

            function allowAnywhereFoldCaseAndRenumberGroups(regex) {
                // Split into character sets, escape sequences, punctuation strings
                // like ('(', '(?:', ')', '^'), and runs of characters that do not
                // include any of the above.
                var parts = regex.source.match(
				new RegExp('(?:' + '\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]' // a character set
				+
				'|\\\\u[A-Fa-f0-9]{4}' // a unicode escape
				+
				'|\\\\x[A-Fa-f0-9]{2}' // a hex escape
				+
				'|\\\\[0-9]+' // a back-reference or octal escape
				+
				'|\\\\[^ux0-9]' // other escape sequence
				+
				'|\\(\\?[:!=]' // start of a non-capturing group
				+
				'|[\\(\\)\\^]' // start/emd of a group, or line start
				+
				'|[^\\x5B\\x5C\\(\\)\\^]+' // run of other characters
				+
				')', 'g'));
                var n = parts.length;

                // Maps captured group numbers to the number they will occupy in
                // the output or to -1 if that has not been determined, or to
                // undefined if they need not be capturing in the output.
                var capturedGroups = [];

                // Walk over and identify back references to build the capturedGroups
                // mapping.
                for (var i = 0, groupIndex = 0; i < n; ++i) {
                    var p = parts[i];
                    if (p === '(') {
                        // groups are 1-indexed, so max group index is count of '('
                        ++groupIndex;
                    } else if ('\\' === p.charAt(0)) {
                        var decimalValue = +p.substring(1);
                        if (decimalValue && decimalValue <= groupIndex) {
                            capturedGroups[decimalValue] = -1;
                        }
                    }
                }

                // Renumber groups and reduce capturing groups to non-capturing groups
                // where possible.
                for (var i = 1; i < capturedGroups.length; ++i) {
                    if (-1 === capturedGroups[i]) {
                        capturedGroups[i] = ++capturedGroupIndex;
                    }
                }
                for (var i = 0, groupIndex = 0; i < n; ++i) {
                    var p = parts[i];
                    if (p === '(') {
                        ++groupIndex;
                        if (capturedGroups[groupIndex] === undefined) {
                            parts[i] = '(?:';
                        }
                    } else if ('\\' === p.charAt(0)) {
                        var decimalValue = +p.substring(1);
                        if (decimalValue && decimalValue <= groupIndex) {
                            parts[i] = '\\' + capturedGroups[groupIndex];
                        }
                    }
                }

                // Remove any prefix anchors so that the output will match anywhere.
                // ^^ really does mean an anchored match though.
                for (var i = 0, groupIndex = 0; i < n; ++i) {
                    if ('^' === parts[i] && '^' !== parts[i + 1]) {
                        parts[i] = '';
                    }
                }

                // Expand letters to groups to handle mixing of case-sensitive and
                // case-insensitive patterns if necessary.
                if (regex.ignoreCase && needToFoldCase) {
                    for (var i = 0; i < n; ++i) {
                        var p = parts[i];
                        var ch0 = p.charAt(0);
                        if (p.length >= 2 && ch0 === '[') {
                            parts[i] = caseFoldCharset(p);
                        } else if (ch0 !== '\\') {
                            // TODO: handle letters in numeric escapes.
                            parts[i] = p.replace(/[a-zA-Z]/g, function (ch) {
                                var cc = ch.charCodeAt(0);
                                return '[' + String.fromCharCode(cc & ~32, cc | 32) + ']';
                            });
                        }
                    }
                }

                return parts.join('');
            }

            var rewritten = [];
            for (var i = 0, n = regexs.length; i < n; ++i) {
                var regex = regexs[i];
                if (regex.global || regex.multiline) {
                    throw new Error('' + regex);
                }
                rewritten.push('(?:' + allowAnywhereFoldCaseAndRenumberGroups(regex) + ')');
            }

            return new RegExp(rewritten.join('|'), ignoreCase ? 'gi' : 'g');
        }

        function encodeEscape(charCode) {
            if (charCode < 0x20) {
                return (charCode < 0x10 ? '\\x0' : '\\x') + charCode.toString(16);
            }
            var ch = String.fromCharCode(charCode);
            if (ch === '\\' || ch === '-' || ch === '[' || ch === ']') {
                ch = '\\' + ch;
            }
            return ch;
        }

        var escapeCharToCodeUnit = {
            'b': 8,
            't': 9,
            'n': 0xa,
            'v': 0xb,
            'f': 0xc,
            'r': 0xd
        };

        function decodeEscape(charsetPart) {
            var cc0 = charsetPart.charCodeAt(0);
            if (cc0 !== 92 /* \\ */) {
                return cc0;
            }
            var c1 = charsetPart.charAt(1);
            cc0 = escapeCharToCodeUnit[c1];
            if (cc0) {
                return cc0;
            } else if ('0' <= c1 && c1 <= '7') {
                return parseInt(charsetPart.substring(1), 8);
            } else if (c1 === 'u' || c1 === 'x') {
                return parseInt(charsetPart.substring(2), 16);
            } else {
                return charsetPart.charCodeAt(1);
            }
        }

        function caseFoldCharset(charSet) {
            var charsetParts = charSet.substring(1, charSet.length - 1).match(
			new RegExp('\\\\u[0-9A-Fa-f]{4}' + '|\\\\x[0-9A-Fa-f]{2}' + '|\\\\[0-3][0-7]{0,2}' + '|\\\\[0-7]{1,2}' + '|\\\\[\\s\\S]' + '|-' + '|[^-\\\\]', 'g'));
            var groups = [];
            var ranges = [];
            var inverse = charsetParts[0] === '^';
            for (var i = inverse ? 1 : 0, n = charsetParts.length; i < n; ++i) {
                var p = charsetParts[i];
                if (/\\[bdsw]/i.test(p)) { // Don't muck with named groups.
                    groups.push(p);
                } else {
                    var start = decodeEscape(p);
                    var end;
                    if (i + 2 < n && '-' === charsetParts[i + 1]) {
                        end = decodeEscape(charsetParts[i + 2]);
                        i += 2;
                    } else {
                        end = start;
                    }
                    ranges.push([start, end]);
                    // If the range might intersect letters, then expand it.
                    // This case handling is too simplistic.
                    // It does not deal with non-latin case folding.
                    // It works for latin source code identifiers though.
                    if (!(end < 65 || start > 122)) {
                        if (!(end < 65 || start > 90)) {
                            ranges.push([Math.max(65, start) | 32, Math.min(end, 90) | 32]);
                        }
                        if (!(end < 97 || start > 122)) {
                            ranges.push([Math.max(97, start) & ~32, Math.min(end, 122) & ~32]);
                        }
                    }
                }
            }

            // [[1, 10], [3, 4], [8, 12], [14, 14], [16, 16], [17, 17]]
            // -> [[1, 12], [14, 14], [16, 17]]
            ranges.sort(function (a, b) {
                return (a[0] - b[0]) || (b[1] - a[1]);
            });
            var consolidatedRanges = [];
            var lastRange = [NaN, NaN];
            for (var i = 0; i < ranges.length; ++i) {
                var range = ranges[i];
                if (range[0] <= lastRange[1] + 1) {
                    lastRange[1] = Math.max(lastRange[1], range[1]);
                } else {
                    consolidatedRanges.push(lastRange = range);
                }
            }

            var out = ['['];
            if (inverse) {
                out.push('^');
            }
            out.push.apply(out, groups);
            for (var i = 0; i < consolidatedRanges.length; ++i) {
                var range = consolidatedRanges[i];
                out.push(encodeEscape(range[0]));
                if (range[1] > range[0]) {
                    if (range[1] + 1 > range[0]) {
                        out.push('-');
                    }
                    out.push(encodeEscape(range[1]));
                }
            }
            out.push(']');
            return out.join('');
        }

        /**
		 * Apply the given language handler to sourceCode and add the resulting
		 * decorations to out.
		 * @param {number} basePos the index of sourceCode within the chunk of source
		 *    whose decorations are already present on out.
		 */
        function appendDecorations(basePos, sourceCode, brush, out) {
            if (sourceCode) {
                out.push.apply(out, brush(sourceCode, basePos));
            }
        }

        /**
		 * 删除空的位置和相邻的位置。
		 */
        function removeEmptyAndNestedDecorations(decorations) {
            for (var srcIndex = 0, destIndex = 0, length = decorations.length, lastPos, lastStyle; srcIndex < length;) {

                // 如果上一个长度和当前长度相同，或者上一个样式和现在的相同，则跳过。
                if (lastPos === decorations[srcIndex]) {
                    srcIndex++;
                    decorations[destIndex - 1] = lastStyle = decorations[srcIndex++];
                } else if (lastStyle === decorations[srcIndex + 1]) {
                    srcIndex += 2;
                } else {
                    decorations[destIndex++] = lastPos = decorations[srcIndex++];
                    decorations[destIndex++] = lastStyle = decorations[srcIndex++];
                }
            };

            decorations.length = destIndex;

        }

        /**
		 * 高亮单一的节点。
		 * @param {Element} elem 要高亮的节点。
		 * @param {String} [language] 语言本身。系统会自动根据源码猜测语言。
		 * @param {Number} lineNumberStart=null 第一行的计数，如果是null，则不显示行号。
		 */
        SH.one = function (pre, language, lineNumberStart) {

            // Extract tags, and convert the source code to plain text.
            var sourceAndSpans = extractSourceSpans(pre),
				specificLanuage = (pre.className.match(/\bsh-(\w+)(?!\S)/i) || [0, null])[1];

            // 自动决定 language 和 lineNumbers
            if (!language) {
                language = specificLanuage || SH.guessLanguage(sourceAndSpans.sourceCode);
            }

            if (!specificLanuage) {
                pre.className += ' doc-sh-' + language;
            }

            // Apply the appropriate language handler
            // Integrate the decorations and tags back into the source code,
            // modifying the sourceNode in place.
            recombineTagsAndDecorations(sourceAndSpans, SH.findBrush(language)(sourceAndSpans.sourceCode, 0));
        };

        /**
		 * Split markup into a string of source code and an array mapping ranges in
		 * that string to the text nodes in which they appear.
		 *
		 * <p>
		 * The HTML DOM structure:</p>
		 * <pre>
		 * (Element   "p"
		 *   (Element "b"
		 *     (Text  "print "))       ; #1
		 *   (Text    "'Hello '")      ; #2
		 *   (Element "br")            ; #3
		 *   (Text    "  + 'World';")) ; #4
		 * </pre>
		 * <p>
		 * corresponds to the HTML
		 * {@code <p><b>print </b>'Hello '<br>  + 'World';</p>}.</p>
		 *
		 * <p>
		 * It will produce the output:</p>
		 * <pre>
		 * {
		 *   sourceCode: "print 'Hello '\n  + 'World';",
		 *   //              1         2
		 *   //       012345678901234 5678901234567
		 *   spans: [0, #1, 6, #2, 14, #3, 15, #4]
		 * }
		 * </pre>
		 * <p>
		 * where #1 is a reference to the {@code "print "} text node above, and so
		 * on for the other text nodes.
		 * </p>
		 *
		 * <p>
		 * The {@code} spans array is an array of pairs.  Even elements are the start
		 * indices of substrings, and odd elements are the text nodes (or BR elements)
		 * that contain the text for those substrings.
		 * Substrings continue until the next index or the end of the source.
		 * </p>
		 *
		 * @param {Node} node an HTML DOM subtree containing source-code.
		 * @return {Object} source code and the text nodes in which they occur.
		 */
        function extractSourceSpans(node) {

            var chunks = [];
            var length = 0;
            var spans = [];
            var k = 0;

            var whitespace;
            if (node.currentStyle) {
                whitespace = node.currentStyle.whiteSpace;
            } else if (window.getComputedStyle) {
                whitespace = document.defaultView.getComputedStyle(node, null).getPropertyValue('white-space');
            }
            var isPreformatted = whitespace && 'pre' === whitespace.substring(0, 3);

            function walk(node) {
                switch (node.nodeType) {
                    case 1:
                        // Element
                        for (var child = node.firstChild; child; child = child.nextSibling) {
                            walk(child);
                        }
                        var nodeName = node.nodeName;
                        if ('BR' === nodeName || 'LI' === nodeName) {
                            chunks[k] = '\n';
                            spans[k << 1] = length++;
                            spans[(k++ << 1) | 1] = node;
                        }
                        break;
                    case 3:
                    case 4:
                        // Text
                        var text = node.nodeValue;
                        if (text.length) {
                            if (isPreformatted) {
                                text = text.replace(/\r\n?/g, '\n'); // Normalize newlines.
                            } else {
                                text = text.replace(/[\r\n]+/g, '\r\n　');
                                text = text.replace(/[ \t]+/g, ' ');
                            }
                            // TODO: handle tabs here?
                            chunks[k] = text;
                            spans[k << 1] = length;
                            length += text.length;
                            spans[(k++ << 1) | 1] = node;
                        }
                        break;
                }
            }

            walk(node);

            return {
                sourceCode: chunks.join('').replace(/\n$/, ''),
                spans: spans
            };
        }

        /**
		 * Breaks {@code job.sourceCode} around style boundaries in
		 * {@code job.decorations} and modifies {@code job.sourceNode} in place.
		 * @param {Object} job like <pre>{
		 *    sourceCode: {string} source as plain text,
		 *    spans: {Array.<number|Node>} alternating span start indices into source
		 *       and the text node or element (e.g. {@code <BR>}) corresponding to that
		 *       span.
		 *    decorations: {Array.<number|string} an array of style classes preceded
		 *       by the position at which they start in job.sourceCode in order
		 * }</pre>
		 * @private
		 */
        function recombineTagsAndDecorations(sourceAndSpans, decorations) {
            //var isIE = /\bMSIE\b/.test(navigator.userAgent);
            var newlineRe = /\n/g;

            var source = sourceAndSpans.sourceCode;
            var sourceLength = source.length;
            // Index into source after the last code-unit recombined.
            var sourceIndex = 0;

            var spans = sourceAndSpans.spans;
            var nSpans = spans.length;
            // Index into spans after the last span which ends at or before sourceIndex.
            var spanIndex = 0;

            var decorations = decorations;
            var nDecorations = decorations.length;
            var decorationIndex = 0;

            var decoration = null;
            while (spanIndex < nSpans) {
                var spanStart = spans[spanIndex];
                var spanEnd = spans[spanIndex + 2] || sourceLength;

                var decStart = decorations[decorationIndex];
                var decEnd = decorations[decorationIndex + 2] || sourceLength;

                var end = Math.min(spanEnd, decEnd);

                var textNode = spans[spanIndex + 1];
                var styledText;
                if (textNode.nodeType !== 1 // Don't muck with <BR>s or <LI>s
                    // Don't introduce spans around empty text nodes.
				&&
				(styledText = source.substring(sourceIndex, end))) {
                    // This may seem bizarre, and it is.  Emitting LF on IE causes the
                    // code to display with spaces instead of line breaks.
                    // Emitting Windows standard issue linebreaks (CRLF) causes a blank
                    // space to appear at the beginning of every line but the first.
                    // Emitting an old Mac OS 9 line separator makes everything spiffy.
                    // if (isIE) {
                    // styledText = styledText.replace(newlineRe, '\r');
                    // }
                    textNode.nodeValue = styledText;
                    var document = textNode.ownerDocument;
                    var span = document.createElement('SPAN');
                    span.className = 'doc-sh-' + decorations[decorationIndex + 1];
                    var parentNode = textNode.parentNode;
                    parentNode.replaceChild(span, textNode);
                    span.appendChild(textNode);
                    if (sourceIndex < spanEnd) { // Split off a text node.
                        spans[spanIndex + 1] = textNode
						// TODO: Possibly optimize by using '' if there's no flicker.
						=
						document.createTextNode(source.substring(end, spanEnd));
                        parentNode.insertBefore(textNode, span.nextSibling);
                    }
                }

                sourceIndex = end;

                if (sourceIndex >= spanEnd) {
                    spanIndex += 2;
                }
                if (sourceIndex >= decEnd) {
                    decorationIndex += 2;
                }
            }
        }

        // Keyword lists for various languages.
        // We use things that coerce to strings to make them compact when minified
        // and to defeat aggressive optimizers that fold large string constants.
        var FLOW_CONTROL_KEYWORDS = "break continue do else for if return while";
        var C_KEYWORDS = FLOW_CONTROL_KEYWORDS + " auto case char const default double enum extern float goto int long register short signed sizeof " + "static struct switch typedef union unsigned void volatile";
        var COMMON_KEYWORDS = [C_KEYWORDS, "catch class delete false import new operator private protected public this throw true try typeof"];
        var CPP_KEYWORDS = [COMMON_KEYWORDS, "alignof align_union asm axiom bool concept concept_map const_cast constexpr decltype dynamic_cast explicit export friend inline late_check mutable namespace nullptr reinterpret_cast static_assert static_cast template typeid typename using virtual where"];
        var JAVA_KEYWORDS = [COMMON_KEYWORDS, "abstract boolean byte extends final finally implements import instanceof null native package strictfp super synchronized throws transient"];
        var CSHARP_KEYWORDS = [JAVA_KEYWORDS, "as base by checked decimal delegate descending dynamic event fixed foreach from group implicit in interface internal into is lock object out override orderby params partial readonly ref sbyte sealed stackalloc string select uint ulong unchecked unsafe ushort var"];
        var JSCRIPT_KEYWORDS = [COMMON_KEYWORDS, "debugger eval export function get null set undefined var with Infinity NaN"];
        var PERL_KEYWORDS = "caller delete die do dump elsif eval exit foreach for goto if import last local my next no our print package redo require sub undef unless until use wantarray while BEGIN END";
        var PYTHON_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "and as assert class def del elif except exec finally from global import in is lambda nonlocal not or pass print raise try with yield False True None"];
        var RUBY_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "alias and begin case class def defined elsif end ensure false in module next nil not or redo rescue retry self super then true undef unless until when yield BEGIN END"];
        var SH_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "case done elif esac eval fi function in local set then until"];
        var ALL_KEYWORDS = [CPP_KEYWORDS, CSHARP_KEYWORDS, JSCRIPT_KEYWORDS, PERL_KEYWORDS + PYTHON_KEYWORDS, RUBY_KEYWORDS, SH_KEYWORDS];
        var C_TYPES = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)/;

        /**
		 * A set of tokens that can precede a regular expression literal in
		 * javascript
		 * http://web.archive.org/web/20070717142515/http://www.mozilla.org/js/language/js20/rationale/syntax.html
		 * has the full list, but I've removed ones that might be problematic when
		 * seen in languages that don't support regular expression literals.
		 *
		 * <p>Specifically, I've removed any keywords that can't precede a regexp
		 * literal in a syntactically legal javascript program, and I've removed the
		 * "in" keyword since it's not a keyword in many languages, and might be used
		 * as a count of inches.
		 *
		 * <p>The link a above does not accurately describe EcmaScript rules since
		 * it fails to distinguish between (a=++/b/i) and (a++/b/i) but it works
		 * very well in practice.
		 *
		 * @private
		 * @const
		 */
        var REGEXP_PRECEDER_PATTERN = '(?:^^\\.?|[+-]|\\!|\\!=|\\!==|\\#|\\%|\\%=|&|&&|&&=|&=|\\(|\\*|\\*=|\\+=|\\,|\\-=|\\->|\\/|\\/=|:|::|\\;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\@|\\[|\\^|\\^=|\\^\\^|\\^\\^=|\\{|\\||\\|=|\\|\\||\\|\\|=|\\~|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*';
        // token style names.  correspond to css classes
        /**
		 * token style for a string literal
		 * @const
		 */
        var STRING = 'string';
        /**
		 * token style for a keyword
		 * @const
		 */
        var KEYWORD = 'keyword';
        /**
		 * token style for a comment
		 * @const
		 */
        var COMMENT = 'comment';
        /**
		 * token style for a type
		 * @const
		 */
        var TYPE = 'type';
        /**
		 * token style for a literal value.  e.g. 1, null, true.
		 * @const
		 */
        var LITERAL = 'literal';
        /**
		 * token style for a punctuation string.
		 * @const
		 */
        var PUNCTUATION = 'punctuation';
        /**
		 * token style for a punctuation string.
		 * @const
		 */
        var PLAIN = 'plain';

        /**
		 * token style for an sgml tag.
		 * @const
		 */
        var TAG = 'tag';
        /**
		 * token style for a markup declaration such as a DOCTYPE.
		 * @const
		 */
        var DECLARATION = 'declaration';
        /**
		 * token style for embedded source.
		 * @const
		 */
        var SOURCE = 'source';
        /**
		 * token style for an sgml attribute name.
		 * @const
		 */
        var ATTRIB_NAME = 'attrname';
        /**
		 * token style for an sgml attribute value.
		 * @const
		 */
        var ATTRIB_VALUE = 'attrvalue';

        var register = SH.register;

        /** returns a function that produces a list of decorations from source text.
		 *
		 * This code treats ", ', and ` as string delimiters, and \ as a string
		 * escape.  It does not recognize perl's qq() style strings.
		 * It has no special handling for double delimiter escapes as in basic, or
		 * the tripled delimiters used in python, but should work on those regardless
		 * although in those cases a single string literal may be broken up into
		 * multiple adjacent string literals.
		 *
		 * It recognizes C, C++, and shell style comments.
		 *
		 * @param {Object} options a set of optional parameters.
		 * @return {function (Object)} a function that examines the source code
		 *     in the input job and builds the decoration list.
		 */
        var simpleLexer = SH.simpleLexer = function (options) {

            var shortcutStylePatterns = [], fallthroughStylePatterns = [];
            if (options.tripleQuotedStrings) {
                // '''multi-line-string''', 'single-line-string', and double-quoted
                shortcutStylePatterns.push(['string', /^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/, '\'"']);
            } else if (options.multiLineStrings) {
                // 'multi-line-string', "multi-line-string"
                shortcutStylePatterns.push(['string', /^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/, '\'"`']);
            } else {
                // 'single-line-string', "single-line-string"
                shortcutStylePatterns.push(['string', /^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/, '"\'']);
            }
            if (options.verbatimStrings) {
                // verbatim-string-literal production from the C# grammar.  See issue 93.
                fallthroughStylePatterns.push(['string', /^@\"(?:[^\"]|\"\")*(?:\"|$)/]);
            }
            var hc = options.hashComments;
            if (hc) {
                if (options.cStyleComments) {
                    if (hc > 1) {  // multiline hash comments
                        shortcutStylePatterns.push(['comment', /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, '#']);
                    } else {
                        // Stop C preprocessor declarations at an unclosed open comment
                        shortcutStylePatterns.push(['comment', /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\r\n]*)/, '#']);
                    }
                    fallthroughStylePatterns.push(['string', /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/]);
                } else {
                    shortcutStylePatterns.push(['comment', /^#[^\r\n]*/, '#']);
                }
            }
            if (options.cStyleComments) {
                fallthroughStylePatterns.push(['comment', /^\/\/[^\r\n]*/]);
                fallthroughStylePatterns.push(['comment', /^\/\*[\s\S]*?(?:\*\/|$)/]);
            }
            if (options.regexLiterals) {
                fallthroughStylePatterns.push(['regex', new RegExp('^' + REGEXP_PRECEDER_PATTERN + '(' + // A regular expression literal starts with a slash that is
				// not followed by * or / so that it is not confused with
				// comments.
				'/(?=[^/*])'
				// and then contains any number of raw characters,
				+
				'(?:[^/\\x5B\\x5C]'
				// escape sequences (\x5C),
				+
				'|\\x5C[\\s\\S]'
				// or non-nesting character sets (\x5B\x5D);
				+
				'|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+'
				// finally closed by a /.
				+
				'/' + ')')]);
            }

            var types = options.types;
            if (types) {
                fallthroughStylePatterns.push(['type', types]);
            }

            var keywords = ("" + options.keywords).replace(/^ | $/g, '');
            if (keywords.length) {
                fallthroughStylePatterns.push(['keyword', new RegExp('^(?:' + keywords.replace(/[\s,]+/g, '|') + ')\\b')]);
            }

            shortcutStylePatterns.push(['plain', /^\s+/, ' \r\n\t\xA0']);
            fallthroughStylePatterns.push(
			// TODO(mikesamuel): recognize non-latin letters and numerals in idents
			['literal', /^@[a-z_$][a-z_$@0-9]*/i],
			['type', /^(?:[@_]?[A-Z]+[a-z][A-Za-z_$@0-9]*|\w+_t\b)/],
			['plain', /^[a-z_$][a-z_$@0-9]*/i],
			['literal', new RegExp(
				 '^(?:'
				 // A hex number
				 + '0x[a-f0-9]+'
				 // or an octal or decimal number,
				 + '|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)'
				 // possibly in scientific notation
				 + '(?:e[+\\-]?\\d+)?'
				 + ')'
				 // with an optional modifier like UL for unsigned long
				 + '[a-z]*', 'i'), '0123456789'],
			// Don't treat escaped quotes in bash as starting strings.  See issue 144.
			['plain', /^\\[\s\S]?/],
			['punctuation', /^.[^\s\w\.$@\'\"\`\/\#\\]*/]);

            return shortcutStylePatterns.concat(fallthroughStylePatterns);





        }

        register('default', simpleLexer({
            'keywords': ALL_KEYWORDS,
            'hashComments': true,
            'cStyleComments': true,
            'multiLineStrings': true,
            'regexLiterals': true
        }));
        register('regex', [
			[STRING, /^[\s\S]+/]
        ]);
        register('js', simpleLexer({
            'keywords': JSCRIPT_KEYWORDS,
            'cStyleComments': true,
            'regexLiterals': true
        }));
        register('in.tag',
		[
			[PLAIN, /^[\s]+/, ' \t\r\n'],
			[ATTRIB_VALUE, /^(?:\"[^\"]*\"?|\'[^\']*\'?)/, '\"\''],
			[TAG, /^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],
			[ATTRIB_NAME, /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],
			['uq.val', /^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/],
			[PUNCTUATION, /^[=<>\/]+/],
			['js', /^on\w+\s*=\s*\"([^\"]+)\"/i],
			['js', /^on\w+\s*=\s*\'([^\']+)\'/i],
			['js', /^on\w+\s*=\s*([^\"\'>\s]+)/i],
			['css', /^style\s*=\s*\"([^\"]+)\"/i],
			['css', /^style\s*=\s*\'([^\']+)\'/i],
			['css', /^style\s*=\s*([^\"\'>\s]+)/i]
		]);

        register('htm html mxml xhtml xml xsl', [
			['plain', /^[^<?]+/],
			['declaration', /^<!\w[^>]*(?:>|$)/],
			['comment', /^<\!--[\s\S]*?(?:-\->|$)/],
			// Unescaped content in an unknown language
			['in.php', /^<\?([\s\S]+?)(?:\?>|$)/],
			['in.asp', /^<%([\s\S]+?)(?:%>|$)/],
			['punctuation', /^(?:<[%?]|[%?]>)/],
			['plain', /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
			// Unescaped content in javascript.  (Or possibly vbscript).
			['js', /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
			// Contains unescaped stylesheet content
			['css', /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
			['in.tag', /^(<\/?[a-z][^<>]*>)/i]
        ]);

        register('json', simpleLexer({
            'keywords': 'null,true,false'
        }));

        return SH;
    })();

    /**
     * 调用远程 node 服务器完成操作。
     */
    Doc.callService = function (cmdName, params, success, error) {
        var url = Doc.Configs.servicePath + '?cmd=' + cmdName + params;
        if (location.protocol === 'file:') {
            error(Doc.Utils.formatString('通过 file:/// 直接打开文件时，无法 AJAX 调用远程服务，请先执行 [项目跟目录]/{devTools}/node/bootserver.cmd 启动服务器', Doc.Configs.devTools));
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || xhr.status == 1223) {
                    if (xhr.getResponseHeader("content-type") === "text/html") {
                        success(xhr.responseText);
                    } else {
                        error(Doc.Utils.formatString('无效的远程服务器，请先执行 [项目跟目录]/{devTools}/node/bootserver.cmd 启动服务器', Doc.Configs.devTools));
                    }
                } else {
                    error('调用时出错：' + url);
                }
            }
        };
        xhr.send(null);
    };

    // #endregion

    // #region Page

    /**
     * 文档页面模块。
     */
    Doc.DemoPage = {

        // #region 模板字符串

        header: '<div id="doc_toolbar" class="doc-clear" style="font-size: 12px; position: relative;">\
\
            <div class="doc-toolbar">\
                <a href="javascript://查看和修改组件状态" onclick="Doc.DemoPage.toggleDropDown(\'doc_toolbar_moduleinfo\', true, 1);return false;">{status}</a> | \
                <a href="javascript://常用工具" onclick="Doc.DemoPage.toggleDropDown(\'doc_toolbar_tool\', true, 1);return false;" onmouseover="Doc.DemoPage.toggleDropDown(\'doc_toolbar_tool\', true)" onmouseout="Doc.DemoPage.toggleDropDown(\'doc_toolbar_tool\', false)" accesskey="T">工具{arrow}</a> | \
                <a href="javascript://搜索并转到其他组件" onclick="Doc.DemoPage.toggleDropDown(\'doc_toolbar_goto\', true, 1);return false;" onmouseover="Doc.DemoPage.toggleDropDown(\'doc_toolbar_goto\', true)" onmouseout="Doc.DemoPage.toggleDropDown(\'doc_toolbar_goto\', false)" accesskey="F">搜索组件{arrow}</a> | \
                <a href="{modueList}" title="返回组件列表" accesskey="H">返回组件列表</a>\
            </div>\
\
            <style>\
\
                .doc-toolbar-dropdown {\
                    background-color: #ffffff;\
                    border: 1px solid #9b9b9b;\
                    box-shadow: 1px 1px 2px #cccccc;\
                    position: absolute;\
                    right: 0;\
                    top: 26px;\
                    z-index: 99999;\
                    display: none;\
                }\
\
                .doc-toolbar-dropdown a {\
                    color: #333;\
                    cursor: pointer;\
                    line-height: 200%;\
                }\
\
                .doc-toolbar-dropdown-menu a {\
                    -moz-user-select: none;\
                    -ms-user-select: none;\
                    -webkit-user-select: none;\
                    user-select: none;\
                    display: block;\
                    overflow: hidden;\
                    padding-left: 6px;\
                    padding-right: 6px;\
                    text-decoration: none;\
                }\
\
                .doc-toolbar-dropdown-menu a:hover {\
                    text-decoration: none;\
                }\
\
                .doc-toolbar-dropdown-menu-usehover a:hover, a.doc-toolbar-dropdown-menu-hover {\
                    background-color: #ebebeb;\
                }\
\
                #doc-toolbar-moduleinfo input {\
                    vertical-align: -2px;\
                }\
            </style>\
\
        </div>\
        \
        <div class="doc-toolbar" style="margin-top: 9px;">\
            <a href="###">提取源码</a>\
        </div>\
\
        <h1 style="margin-top: -9px; color: #673AB7; font-weight: 600; height: 40px;line-height: 40px;">{title} <small>{path}</small></h1>',

        /**
         * 工具栏模板。
         */
        toolDropDown: '<a href="{devTools}/codehelper/index.html" target="_blank">代码格式化工具</a>\
                    <a href="{devTools}/tools/codesegments/specialcharacters.html" target="_blank">特殊字符</a>\
                    <a href="{devTools}/tools/codesegments/regexp.html" target="_blank">常用正则</a>\
                    <a href="javascript://显示或隐藏页面中自动显示的源码片段" onclick="Doc.DemoPage.toggleSources()" style="border-top: 1px solid #EBEBEB;">折叠页内代码</a>\
                    <a href="javascript://浏览当前组件的源文件" onclick="Doc.DemoPage.exploreSource();">查看源文件</a>',

        gotoDropDown: '<input type="search" class="doc-font" placeholder="搜索组件名或路径..." onfocus="this.select()" style="width: 290px; padding: 2px 5px; border: 0; border-bottom: 1px solid #9B9B9B;">\
                <div style="_height: 300px; _width: 300px; word-break: break-all; max-height: 300px; overflow: auto;" class="doc-toolbar-dropdown-menu"></div>',

        gotoDropDownItem: '<a onmouseover="Doc.DemoPage.gotoSetCurrent(this)" href="{href}">{title} <small style="color: #999">{path}</small></a>',

        // #endregion

        /**
         * 切换显示或隐藏弹窗。
         */
        toggleDropDown: function (id, show, delay) {

            // 所有操作均延时 200 秒操作。后续操作覆盖之前操作。
            if (Doc.DemoPage.dropDownTimer) {
                clearTimeout(Doc.DemoPage.dropDownTimer);
            }

            Doc.DemoPage.dropDownTimer = setTimeout(function () {

                // 隐藏之前的弹窗。
                if (Doc.DemoPage.dropDownShown) {
                    Doc.DemoPage.dropDownShown.style.display = 'none';
                    Doc.DemoPage.dropDownShown = null;
                }

                if (!show) {
                    return;
                }

                // 创建弹窗。
                var dropDown = document.getElementById(id);

                if (!dropDown) {
                    dropDown = document.createElement('div');
                    dropDown.id = id;
                    dropDown.className = 'doc-toolbar-dropdown';
                    document.getElementById('doc_toolbar').appendChild(dropDown);

                    switch (id) {
                        case "doc_toolbar_tool":
                            dropDown.className += ' doc-toolbar-dropdown-menu doc-toolbar-dropdown-menu-usehover';
                            dropDown.style.right = '126px';
                            dropDown.onclick = function (e) {
                                this.onmouseout(e);
                            };
                            dropDown.innerHTML = Doc.Utils.formatString(Doc.DemoPage.toolDropDown, {
                                devTools: Doc.Configs.basePath + Doc.Configs.devTools
                            });
                            break;
                        case "doc_toolbar_goto":
                            dropDown.style.width = '300px';
                            dropDown.innerHTML = Doc.DemoPage.gotoDropDown;
                            dropDown.defaultButton = dropDown.firstChild;
                            dropDown.defaultButton.onkeydown = function (e) {
                                e = e || window.event;
                                var keyCode = e.keyCode;
                                if (keyCode == 40 || keyCode == 38) {
                                    Doc.DemoPage.gotoMoveList(keyCode == 40);
                                }
                            };
                            dropDown.defaultButton.onkeypress = function (e) {
                                e = e || window.event;
                                var keyCode = e.keyCode;
                                if (keyCode == 13 || keyCode == 10) {
                                    var link = Doc.DemoPage.gotoGetCurrent();
                                    if (link) {
                                        location.href = link.href;
                                    }
                                }
                            };
                            dropDown.defaultButton.onkeyup = function (e) {
                                e = e || window.event;
                                var keyCode = e.keyCode;
                                if (keyCode !== 40 && keyCode !== 38 && keyCode != 13 && keyCode != 10) {
                                    Doc.DemoPage.gotoUpdateList();
                                }
                            };
                            Doc.loadModuleList(Doc.DemoPage.gotoUpdateList);
                            break;
                        case "doc_toolbar_moduleinfo":
                            var moduleInfo = Doc.moduleInfo;
                            dropDown.style.cssText = 'padding:5px;*width:260px;';

                            var args = {
                                status: '',
                                attributes: '',
                                deleteHref: 'if(prompt(\'确定删除当前组件吗?  如果确认请输入 yes\') === \'yes\'){Doc.callService(\'deleteModule\', \'&path=' + Doc.moduleInfo.path + '\')}'
                            };

                            i = 1;
                            for (var key in Doc.Configs.status) {
                                args.status += Doc.Utils.formatString('<label for="doc-moduleinfo-status-{key}"><input name="status" type="radio"{checked} id="doc-moduleinfo-status-{key}" value="{key}">{name}</label>', {
                                    key: key,
                                    checked: Doc.moduleInfo.status === key ? ' checked="checked"' : '',
                                    name: Doc.Configs.status[key]
                                });

                                if (i++ % 3 === 0) {
                                    args.status += '<br>';
                                }
                            }

                            i = 1;
                            for (var key in Doc.Configs.attributes) {
                                args.attributes += Doc.Utils.formatString('<label for="doc-moduleinfo-attributes-{key}"><input name="attributes" type="checkbox"{checked} id="doc-moduleinfo-attributes-{key}" value="{key}">{name}</label>', {
                                    key: key,
                                    checked: !Doc.moduleInfo.attributes || Doc.moduleInfo.attributes.split('+').indexOf(key) >= 0 ? ' checked="checked"' : '',
                                    name: Doc.Configs.attributes[key]
                                });

                                if (i++ % 2 === 0) {
                                    args.attributes += '<br>';
                                }
                            }

                            dropDown.innerHTML = Doc.Utils.formatString('<fieldset>\
                        <legend>状态</legend>\
                        {status}\
                    </fieldset>\
                    <fieldset>\
                        <legend>属性</legend>\
                        {attributes}\
                    </fieldset>\
\
                <a href="javascript://彻底删除当前模块及相关源码" onclick="if(prompt(\'确定删除当前模块吗?  如果确认请输入 yes\') === \'yes\')location.href=\'' + Doc.Configs.serverBaseUrl + Doc.Configs.apps + '/modulemanager/server/api.njs?action=delete&path=' + encodeURIComponent(Doc.moduleInfo.path) + '&postback=' + encodeURIComponent(Doc.Configs.serverBaseUrl + Doc.Configs.examples) + '\'">删除组件</a>', args);
                            break;
                    }

                }

                // 如果移到了菜单上，则停止关闭菜单的计时器。
                dropDown.onmouseover = function () {
                    Doc.DemoPage.toggleDropDown(id, true, delay);
                };

                dropDown.onmouseout = function () {
                    Doc.DemoPage.toggleDropDown(id, false, delay);
                };

                dropDown.style.display = 'block';

                dropDown.defaultButton && dropDown.defaultButton.focus();

                Doc.DemoPage.dropDownShown = dropDown;

            }, delay || 300);

        },

        /**
         * 更新组件列表。
         */
        gotoUpdateList: function () {

            // 未载入模块列表，退出。
            if (!window.ModuleList) {
                return;
            }

            var dropDown = document.getElementById('doc_toolbar_goto'),
				filter = dropDown.defaultButton.value.trim().toLowerCase(),
				html = '';

            if (filter) {
                for (var path in ModuleList.demos) {
                    if (path.indexOf(filter) >= 0 || (ModuleList.demos[path].title || '').toLowerCase().indexOf(filter) >= 0) {
                        html += getTpl(path);
                    }
                }
            } else {
                for (var path in ModuleList.demos) {
                    html += getTpl(path);
                }
                // 追加历史记录。
                var docModuleHistory = localStorage.docModuleHistory;
                if (docModuleHistory) {
                    docModuleHistory = docModuleHistory.split(';');
                    for (var i = 0; i < docModuleHistory.length; i++) {
                        // 追加分割线。
                        if (i === 0) {
                            html = html.replace('<a', '<a style="border-top: 1px solid #EBEBEB"');
                        }
                        if (docModuleHistory[i] in ModuleList.demos) {
                            html = getTpl(docModuleHistory[i]) + html;
                        }
                    }
                }
            }

            function getTpl(path) {
                return Doc.Utils.formatString(Doc.DemoPage.gotoDropDownItem, {
                    href: Doc.Configs.basePath + Doc.Configs.demos + "/" + path,
                    title: appendFilter(ModuleList.demos[path].title),
                    path: appendFilter(path.replace(/\.\w+$/, ""))
                });
            }

            function appendFilter(content) {
                if (!filter) {
                    return content;
                }

                return content.replace(filter, '<span class="doc-red">' + filter + '</span>');
            }

            dropDown.lastChild.innerHTML = html;
        },

        gotoMoveList: function (goDown) {
            var currentNode = Doc.DemoPage.gotoGetCurrent();
            if (currentNode) {
                currentNode.className = '';
            }
            if (!currentNode || !currentNode[goDown ? 'nextSibling' : 'previousSibling']) {
                currentNode = document.getElementById('doc_toolbar_goto').lastChild[goDown ? 'firstChild' : 'lastChild'];
            } else {
                currentNode = currentNode[goDown ? 'nextSibling' : 'previousSibling'];
            }
            if (currentNode) {
                currentNode.className = 'doc-toolbar-dropdown-menu-hover';
            }
        },

        gotoSetCurrent: function (newHover) {
            var current = Doc.DemoPage.gotoGetCurrent();
            if (current) {
                current.className = '';
            }
            newHover.className = 'doc-toolbar-dropdown-menu-hover';
        },

        gotoGetCurrent: function () {
            return document.querySelector('#doc_toolbar_goto .doc-toolbar-dropdown-menu-hover');
        },

        moduleInfoUpdate: function (fieldName, fieldValue) {
            //Doc.callService();
        },

        /**
         * 添加模块访问历史记录。
         */
        addModuleHistory: function (modulePath) {
            var docModuleHistory = localStorage.docModuleHistory;
            docModuleHistory = docModuleHistory ? docModuleHistory.split(';') : [];

            var old = docModuleHistory.indexOf(modulePath);
            old >= 0 && docModuleHistory.splice(old, 1);
            docModuleHistory.push(modulePath);

            if (docModuleHistory.length >= Doc.Configs.maxModuleHistory) {
                docModuleHistory.shift();
            }

            localStorage.docModuleHistory = docModuleHistory.join(';');
        },

        exploreSource: function () {
            if (Doc.local) {
                var img = new Image();
                img.src = Doc.Configs.serverBaseUrl + Doc.Configs.apps + "/server/explorer.njs?path=" + encodeURIComponent(location.pathname) + "&_=" + (+new Date()) + Math.random();
            } else {
                location.href = 'view-source:' + location.href;
            }
        },

        /**
		 * 切换折叠或展开全部源码。
		 */
        toggleSources: function (value) {

            Doc.DemoPage.sourceDisplay = Doc.DemoPage.sourceDisplay === 'none' ? '' : 'none';

            Doc.Dom.iterate('PRE', function (node) {
                if (node.className.indexOf('doc-sourcecode') >= 0) {
                    node.style.display = Doc.DemoPage.sourceDisplay;
                }
            });

        },

        init: function () {
            var header = document.createElement('header');
            header.className = 'doc';
            header.innerHTML = Doc.Utils.formatString(Doc.DemoPage.header, {
                title: Doc.moduleInfo.title,
                path: Doc.moduleInfo.path ? Doc.moduleInfo.path.replace(/\.\w+$/, '') : '',
                status: Doc.Configs.status[Doc.moduleInfo.status] || Doc.Configs.status.done,
                arrow: navigator.userAgent.indexOf('Firefox') >= 0 ? '▾' : " ▾",
                modueList: Doc.Configs.basePath + Doc.Configs.demos + '/index.html'
            });
            document.body.insertBefore(header, document.body.firstChild);
        }

    };

    /**
     * 文档页面。
     */
    Doc.WebPage = {

        title: ' - JPlusUI | 最懂你的前端 UI 组件库',

        body: '<header id="doc_header" class="doc-font">\
        <nav id="doc_topbar">\
            <div class="doc-container doc-clear">\
                <a href="{basePath}/index.html" id="doc_logo" class="doc-left">JPlusUI <sup>3.0</sup></a>\
                <ul id="navbar" class="doc-horizonal">\
                    <li><a href="{basePath}/docs/getting-started.html">开始使用</a></li>\
                    <li class="actived"><a href="{basePath}/demo/index.html">组件列表</a></li>\
                    <li><a href="{basePath}/docs/download.html">下载和定制</a></li>\
                    <li><a href="{basePath}/docs/about.html">关于和支持</a></li>\
                    <li class="doc-right"><a href="###">2.0 版本</a></li>\
                </ul>\
            </div>\
        </nav>\
\
        <div class="doc-container">\
\
            <h1>组件列表</h1>\
\
            <p>JPlusUI 提供了 300 多个常用组件，满足常用需求。每个组件依赖性小，多数可以独立使用。</p>\
\
        </div>\
\
    </header>\
\
    <div class="doc-container doc-clear">\
\
        <div class="doc-left doc-font" id="doc_sidebar">\
\
            <input type="search" id="doc_modulelist_filter" class="doc-font" placeholder="搜索组件..." onkeyup="Doc.WebPage.updateModuleList(this.value)" value="{filter}" />\
\
            <div id="doc_modulelist"></div>\
\
        </div>\
\
        <div class="doc-left doc" id="doc_main">\
            \
            <div class="doc-toolbar">\
                <a href="{newWindowUrl}" target="_blank">❒ 在新窗口打开</a>\
            </div>\
\
            <h1>{title} <small>{path}</small></h1>\
\
        </div>\
\
    </div>\
\
    <footer id="doc_footer" class="doc-font doc-container">\
        <span class="doc doc-right"><a href="{basePath}/docs/about.html">关于我们</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<a target="_blank" href="{basePath}/LICENSE.txt">The BSD License</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<a target="_blank" href="https://github.com/jplusui/jplusui/issues/new">提交 BUG</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<a href="{basePath}/docs/community.html">加入我们</a></span>\
        &copy; 2011-2015 JPlusUI Team. All Rights Reserved.\
    </footer>',

        /**
         * 生成组件列表。
         */
        updateModuleList: function () {

            var filter = localStorage.doc_moduleListFilter = document.getElementById('doc_modulelist_filter').value.trim().toLowerCase();

            Doc.loadModuleList(function () {

                var tags = [];

                for (var i = 0; i < ModuleList.index.length; i++) {
                    tags.push('<h2>' + ModuleList.index[i].title + ' <small>' + ModuleList.index[i].name + '</small></h2>');
                    tags.push('<dl>');
                    addChildModules(ModuleList.index[i], 0);

                    // 首先删除之前的无子元素的 <dt>
                    if (/^<dt/.test(tags[tags.length - 1])) {
                        tags.pop();
                    }

                    // 首先删除之前的无子元素的 <dl>
                    if (/^<dl/.test(tags[tags.length - 1])) {
                        tags.pop();
                        tags.pop();
                        continue;
                    }

                    tags.push('</dl>');
                }

                function addChildModules(parentModuleInfo, level, ignoreFilter) {
                    for (var i = 0; i < parentModuleInfo.children.length; i++) {
                        var moduleInfo = parentModuleInfo.children[i];

                        if (moduleInfo.children) {

                            // 首先删除之前的无子元素的 <dt>
                            if (/^<dt/.test(tags[tags.length - 1])) {
                                tags.pop();
                            }

                            tags.push('<dt>' +  appendFilter(moduleInfo.title) + ' <small>' + moduleInfo.name + '</small></dt>');
                            addChildModules(moduleInfo, level + 1, applyFilter(moduleInfo));
                        } else if (ignoreFilter || applyFilter(moduleInfo)) {
                            tags.push('<dd><a href="' + moduleInfo.path + '?frame=web">' + appendFilter(moduleInfo.title) + ' <small>' + appendFilter(moduleInfo.name.replace(/\.\w+$/, '')) + '</small></a></dd>');
                        }
                    }
                }

                function applyFilter(moduleInfo) {
                    return !filter || (moduleInfo.title.toLowerCase().indexOf(filter) >= 0 || moduleInfo.path.toLowerCase().indexOf(filter) >= 0);
                }

                function appendFilter(value) {
                    return filter ? value.replace(filter, '<span class="doc-red">' + filter + '</span>') : value;
                }

                //// 删除无 <dd> 的 <dt>
                //for (var i = 0; i < tags.length; i++) {
                //    if (/^<dt/.test(tags[i]) && /^<(dt|\/dl)/.test(tags[i + 1])) {
                //        tags.splice(i--, 1);
                //    }
                //}

                if (!tags.length) {
                    tags.push('<small>无搜索结果</small>');
                }

                var moduleList = document.getElementById('doc_modulelist');

                moduleList.innerHTML = tags.join('');

            });

        },

        /**
         * 初始化页面为完整网页。
         */
        init: function () {
            document.title += Doc.WebPage.title;
            document.body.id = 'doc_page';

            // 提取文档内容。
            var fragment = document.createDocumentFragment();
            while (document.body.firstChild) {
                fragment.appendChild(document.body.firstChild);
            }

            // 插入页面框架。
            document.body.innerHTML = Doc.Utils.formatString(Doc.WebPage.body, {
                basePath: Doc.Configs.basePath,
                title: Doc.moduleInfo.title,
                path: Doc.moduleInfo.path,
                newWindowUrl: location.href.replace('frame=web', 'frame=demo'),
                filter: localStorage.doc_moduleListFilter || ''
            });

            // 重新拷贝回文档内容。
            document.getElementById('doc_main').appendChild(fragment);

            // 更新模块列表。
            Doc.WebPage.updateModuleList();
        }

    };

    /**
     * 负责管理页内代码。
     */
    Doc.SourceCode = {

        /**
         * 初始化页内的代码区域。
         */
        init: function () {

        }

    };

    /**
	 * 演示模块。
	 */
    Doc.Example = {

        run: function (id) {
            var example = this.data[id],
				ret;

            try {

                if (example[1]) {
                    ret = example[1].call(window);
                } else {
                    ret = window.eval(example[0]);
                }

            } catch (e) {
                this.reportResult(id, '[执行出现错误: ' + e.message + ']');
                console.error(example[0], ' => ', e);
                return;
            }

            if (ret === undefined) {
                console.log(example[0]);
            } else {
                console.log(example[0], " => ", ret);
            }

        },

        runAll: function () {
            var me = this,
				i = 0,
				len = me.data.length,
				needEnd;

            // Support For Alert
            var _alert = window.alert;
            window.alert = function (value) { console.info("alert: ", value); };

            function work() {
                if (i < len) {
                    if (me.data[i][0] === null) {
                        needEnd = true;
                        if (i && console.groupEnd) {
                            console.groupEnd();
                        }

                        if (console.group) {
                            console.group(me.data[i][1]);
                        } else {
                            console.info(me.data[i][1]);
                        }

                        i++;
                        work();
                    } else {
                        me.run(i++);
                        setTimeout(work, 1);
                    }

                } else {
                    needEnd && console.groupEnd && console.groupEnd();
                    window.alert = _alert;
                }
            }

            work();
        },

        speedTest: function (id) {

            // Support For Trace
            trace.disable = true;

            // Support For Alert
            var _alert = window.alert;
            window.alert = function () { };

            var time,
				currentTime,
				start = +new Date(),
				past,
				func = this.data[id][1] || new Function(this.data[id][0]);

            try {

                time = 0;

                do {

                    time += 10;

                    currentTime = 10;
                    while (--currentTime > 0) {
                        func();
                    }

                    past = +new Date() - start;

                } while (past < 100);

                past = '  [' + Math.round(past / time * 1000) / 1000 + 'ms]';

            } catch (e) {
                past = '[执行出现错误: ' + e.message + ']';
            } finally {
                window.alert = _alert;

                trace.disable = false;

            }

            this.reportResult(id, past);

        },

        speedTestAll: function () {
            var me = this, i = 0, len = me.data.length;
            function work() {
                if (i < len) {
                    if (me.data[i][0] === null) {
                        i++;
                        work();
                    } else {
                        me.speedTest(i++);
                        setTimeout(work, 1);
                    }
                }
            }

            work();
        },

        reportResult: function (id, value) {
            id = document.getElementById('doc-example-' + id);

            if (id.lastChild.tagName !== 'SMALL') {
                id.appendChild(document.createElement('SMALL'));
            }

            id.lastChild.innerHTML = value;
        }

    };

    /**
	* 输出示例代码。
	*/
    Doc.writeExamples = function (examples, options) {

        var globalExamples = Doc.Example.data,
			html = '',
			key,
			id,
			example,
			text,
			func;

        // 如果第一次使用测试。则写入全部测试和效率。
        if (!globalExamples) {
            Doc.Example.data = globalExamples = [];
            html = '<nav class="doc doc-toolbar">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="Doc.DemoPage.toggleSources();" href="javascript://切换显示或隐藏全部源码">折叠代码</a> | <a onclick="Doc.Example.speedTestAll();" href="javascript://查看全部代码的执行效率">全部效率</a> | <a onclick="Doc.Example.runAll();" href="javascript://按顺序执行全部代码">全部执行</a></nav>';
        }

        for (key in examples) {
            id = globalExamples.length;
            example = examples[key];

            if (example === '-') {
                text = null;
                func = key;
                html += '<h3 class="doc">' + Doc.Utils.encodeHTML(key) + '</h3>';
            } else {

                if (typeof example === 'function') {
                    func = example;
                    text = Doc.Utils.getFunctionSource(example);
                } else {
                    if (Doc.Beautify) {
                        text = Doc.Beautify.js(example);
                    } else {
                        text = Doc.Utils.getFunctionSource(new Function(example));
                    }
                    func = null;
                }

                html += '<section onmouseover="this.firstChild.style.display=\'block\'" onmouseout="this.firstChild.style.display=\'none\'"><nav class="doc doc-toolbar" style="display: none"><a onclick="Doc.Example.speedTest(' + id + '); return false;" href="javascript://测试代码执行的效率">效率</a> | <a onclick="Doc.Example.run(' + id + '); return false;" href="javascript://执行函数">执行</a></nav><span class="doc" id="doc-example-' + id + '">' + Doc.Utils.encodeHTML(key) + '</span><pre class="doc doc-sourcecode doc-sh-js doc-sh">' + Doc.Utils.encodeHTML(text) + '</pre></section>';

            }

            globalExamples[id] = [text, func];
        }

        document.write(html);
    };

    /**
	 * 载入模块列表。
	 */
    Doc.loadModuleList = function (callback) {

        // 已载入，直接继续。
        if (window.ModuleList) {
            callback();
            return;
        }

        Doc.Dom.loadScript(Doc.Utils.formatString(Doc.Configs.moduleListPath, {
            devTools: Doc.Configs.basePath + Doc.Configs.devTools
        }), callback);

    };

    // 初始化。
    (function () {

        Doc.Dom.fixBrowser();

        // 决定基础路径。
        var docJsSrc = document.getElementsByTagName("script");
        docJsSrc = docJsSrc[docJsSrc.length - 1];
        docJsSrc = docJsSrc.src;

        var a = document.createElement('a');
        a.href = docJsSrc.replace(/\/[^\/]*$/, "/") + Doc.Configs.basePath;

        // IE6-7：需要使用 a.getAttribute('href', 5) 获取绝对路径。
        Doc.Configs.basePath = document.constructor ? a.href : a.getAttribute('href', 5);

        // 判断当前开发系统是否在本地运行。
        Doc.local = location.protocol === 'file' || location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '::1';

        var moduleInfo = document.querySelector('meta[name="' + Doc.Configs.moduleInfo + '"]');
        Doc.moduleInfo = moduleInfo = moduleInfo ? Doc.ModuleInfo.parse(moduleInfo.content) : {};
        moduleInfo.title = moduleInfo.title || document.title;

        var frame = (/[?&]frame=(\w+)/.exec(location.search) || [0, moduleInfo.frame])[1] || 'header';
        if (frame !== 'none') {

            var path = location.pathname;
            if (path.toLowerCase().indexOf('/' + Doc.Configs.demos.toLowerCase() + '/') === 0) {
                moduleInfo.path = path = path.substr(Doc.Configs.demos.length + 2);
                Doc.DemoPage.addModuleHistory(path);
            }

            // 载入 CSS 样式。
            document.write('<link type="text/css" rel="stylesheet" href="' + docJsSrc.replace(/\.js/, '.css') + '" />');

            Doc.Dom.ready(function () {
                frame === 'web' ? Doc.WebPage.init() : Doc.DemoPage.init();
                Doc.SourceCode.init();
            });

        }

        //// 判断当前开发系统的打开模式。
        //// 如果是在一个网页上使用，则不生成其它额外的内容。
        //// 如果是在 docs 里使用，则自动生成标题部分。
        //if (Doc.urlPrefix) {
        //    Doc.writeHeader();
        //}

        //Doc.Dom.ready(function () {

        //    // 处理 script.doc 。
        //    // script.doc[type=text/html] => aside.doc
        //    // script.doc[type=text/javascript] => 插入 pre.doc
        //    // script.doc[type=code/html] => pre.doc
        //    // script.doc[type=code/javascript] => pre.doc
        //    Doc.Dom.iterate('SCRIPT', function (node) {
        //        var value = node.innerHTML.replace(/< (\/?)script/g, "<$1script");
        //        switch (node.type) {
        //            case '':
        //            case 'text/javascript':
        //                insertCode(node, node.innerHTML, 'js', true);
        //                break;
        //            case 'text/html':
        //                var code = document.createElement('ASIDE');
        //                code.className = node.className;
        //                node.parentNode.replaceChild(code, node);
        //                code.$code = value;

        //                if (Doc.Dom.isIE) {
        //                    code.innerHTML = '$' + value;
        //                    code.removeChild(code.firstChild);
        //                } else {
        //                    code.innerHTML = value;
        //                }

        //                // 模拟执行全部脚本。
        //                var scripts = code.getElementsByTagName('SCRIPT');
        //                for (var i = 0; scripts[i]; i++) {
        //                    if (window.execScript) {
        //                        window.execScript(scripts[i].innerHTML);
        //                    } else {
        //                        window.eval(scripts[i].innerHTML);
        //                    }
        //                }
        //                break;
        //            case 'text/markdown':
        //                if (Doc.Markdown) {
        //                    value = Doc.Markdown.toHTML(Doc.Utils.removeIndents(value));
        //                    var div = document.createElement('SECTION');
        //                    div.innerHTML = value;
        //                    var nodes = div.getElementsByTagName('*');
        //                    for (var i = 0; nodes[i]; i++) {
        //                        nodes[i].className = 'doc';
        //                    }
        //                    node.parentNode.replaceChild(div, node);
        //                } else {
        //                    insertCode(node, value, 'text');
        //                }
        //                break;
        //            case 'code/javascript':
        //                insertCode(node, value, 'js');
        //                break;
        //            default:
        //                if (/^code\//.test(node.type)) {
        //                    insertCode(node, value, node.type.substr(5));
        //                } else {
        //                    insertCode(node, value, 'text');
        //                }

        //                break;
        //        }
        //    });

        //    // 处理 aside.doc 。
        //    Doc.Dom.iterate('ASIDE', function (node) {
        //        if (node.className.indexOf('doc-nosrc') <= 0) {
        //            insertCode(node, node.$code || node.innerHTML, 'html', true);
        //        }
        //    });

        //    // 如果存在代码高亮的插件。
        //    if (Doc.SyntaxHighligher) {
        //        setTimeout(function () {
        //            Doc.Dom.iterate('PRE', Doc.SyntaxHighligher.one);
        //        }, 0);
        //    }

        //    function insertCode(node, value, language, canHide) {

        //        var pre = document.createElement('pre');
        //        pre.className = 'doc doc-code-pin doc-sh doc-sh-' + language + (canHide ? ' doc-sourcecode' : '');

        //        // 如果存在格式代码插件，判断当前是否需要格式化代码。
        //        if (Doc.Beautify && (language in Doc.Beautify) && node.className.indexOf('doc-noformat') < 0) {
        //            value = Doc.Beautify[language](value);
        //        } else {
        //            value = Doc.Utils.removeIndents(value);
        //        }

        //        pre.textContent = pre.innerText = value;

        //        pre.innerHTML = pre.innerHTML.replace(/\[bold\]([\s\S]*?)\[\/bold\]/g, "<strong>$1</strong>").replace(/\[u\]([\s\S]*?)\[\/u\]/g, "<u>$1</u>");

        //        node.parentNode.insertBefore(pre, node.nextSibling);
        //    }

        //});
    })();

    // #endregion

}

// #region trace

/**
 * Print variables to console.
 * @param {Object} ... The variable list to print.
 */
function trace() {

    if (!trace.disable) {

        // If no argument exisits. Fill argument as (trace: id).
        // For usages like: callback = trace;
        if (arguments.length === 0) {
            if (!trace.$count)
                trace.$count = 0;
            return trace('(trace: ' + (trace.$count++) + ')');
        }

        // Use console if available.
        if (window.console) {

            // Check console.debug
            if (console.debug && console.debug.apply) {
                return console.debug.apply(console, arguments);
            }

            // Check console.log
            if (console.log && console.log.apply) {
                return console.log.apply(console, arguments);
            }

            // console.log.apply is undefined in IE 7-8.
            if (console.log) {
                return console.log(arguments.length > 1 ? arguments : arguments[0]);
            }

        }

        // Fallback to call trace.write, which calls window.alert by default.
        return trace.write.apply(trace, arguments);

    }
}

trace.disable = false;

/**
 * Display all variables to user. 
 * @param {Object} ... The variable list to print.
 * @remark Differs from trace(), trace.write() preferred to using window.alert. 
 * Overwrite it to disable window.alert.
 */
trace.write = function () {

    var r = [], i = arguments.length;

    // dump all arguments.
    while (i--) {
        r[i] = trace.dump(arguments[i]);
    }

    window.alert(r.join(' '));
};

/**
 * Convert any objects to readable string. Same as var_dump() in PHP.
 * @param {Object} obj The variable to dump.
 * @param {Number} deep=3 The maximum count of recursion.
 * @return String The dumped string.
 */
trace.dump = function (obj, deep, showArrayPlain) {

    if (deep == null)
        deep = 3;
    switch (typeof obj) {
        case "function":
            // 函数
            return deep >= 3 ? obj.toString().replace(/\\u([0-9a-f]{3})([0-9a-f])/gi, function (a, b, c) {
                return String.fromCharCode((parseInt(b, 16) * 16 + parseInt(c, 16)))
            }) : "function()";

        case "object":
            if (obj == null)
                return "null";
            if (deep < 0)
                return obj.toString();

            if (typeof obj.length === "number") {
                var r = [];
                for (var i = 0; i < obj.length; i++) {
                    r.push(trace.inspect(obj[i], ++deep));
                }
                return showArrayPlain ? r.join("   ") : ("[" + r.join(", ") + "]");
            } else {
                if (obj.setInterval && obj.resizeTo)
                    return "window#" + obj.document.URL;
                if (obj.nodeType) {
                    if (obj.nodeType == 9)
                        return 'document ' + obj.URL;
                    if (obj.tagName) {
                        var tagName = obj.tagName.toLowerCase(), r = tagName;
                        if (obj.id) {
                            r += "#" + obj.id;
                            if (obj.className)
                                r += "." + obj.className;
                        } else if (obj.outerHTML)
                            r = obj.outerHTML;
                        else {
                            if (obj.className)
                                r += " class=\"." + obj.className + "\"";
                            r = "<" + r + ">" + obj.innerHTML + "</" + tagName + ">  ";
                        }

                        return r;
                    }

                    return '[Node type=' + obj.nodeType + ' name=' + obj.nodeName + ' value=' + obj.nodeValue + ']';
                }
                var r = "{\r\n", i, flag = 0;
                for (i in obj) {
                    if (typeof obj[i] !== 'function')
                        r += "\t" + i + " = " + trace.inspect(obj[i], deep - 1) + "\r\n";
                    else {
                        flag++;
                    }
                }

                if (flag) {
                    r += '\t... (' + flag + ' more)\r\n';
                }

                r += "}";
                return r;
            }
        case "string":
            return deep >= 3 ? obj : '"' + obj + '"';
        case "undefined":
            return "undefined";
        default:
            return obj.toString();
    }
};

/**
 * Print a log to console.
 * @param {String} message The message to print.
 * @type Function
 */
trace.log = function (message) {
    if (!trace.disable && window.console && console.log) {
        return console.log(message);
    }
};

/**
 * Print a error to console.
 * @param {String} message The message to print.
 */
trace.error = function (message) {
    if (!trace.disable) {
        if (window.console && console.error)
            return console.error(message); // This is a known error which is caused by mismatched argument in most time.
        else
            throw message; // This is a known error which is caused by mismatched argument in most time.
    }
};

/**
 * Print a warning to console.
 * @param {String} message The message to print.
 */
trace.warn = function (message) {
    if (!trace.disable) {
        return window.console && console.warn ? console.warn(message) : trace("[WARNING]", message);
    }
};

/**
 * Print a inforation to console.
 * @param {String} message The message to print.
 */
trace.info = function (message) {
    if (!trace.disable) {
        return window.console && console.info ? console.info(message) : trace("[INFO]", message);
    }
};

/**
 * Print all members of specified variable.
 * @param {Object} obj The varaiable to dir.
 */
trace.dir = function (obj) {
    if (!trace.disable) {
        if (window.console && console.dir)
            return console.dir(obj);
        else if (obj) {
            var r = "", i;
            for (i in obj)
                r += i + " = " + trace.inspect(obj[i], 1) + "\r\n";
            return trace(r);
        }
    }
};

/**
 * Try to clear console.
 */
trace.clear = function () {
    if (window.console && console.clear)
        return console.clear();
};

/**
 * Test the efficiency of specified function.
 * @param {Function} fn The function to test, which will be executed more than 10 times.
 */
trace.time = function (fn) {

    if (typeof fn === 'string') {
        fn = new Function(fn);
    }

    var time = 0,
        currentTime,
        start = +new Date(),
        past;

    try {

        do {

            time += 10;

            currentTime = 10;
            while (--currentTime > 0) {
                fn();
            }

            past = +new Date() - start;

        } while (past < 100);

    } catch (e) {
        return trace.error(e);
    }
    return trace.info("[TIME] " + past / time);
};

// #endregion
