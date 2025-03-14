__report = {"info":{"file":"src/upgrades/3.8.0/remove-privilege-slugs.js","fileShort":"src/upgrades/3.8.0/remove-privilege-slugs.js","fileSafe":"src_upgrades_3_8_0_remove_privilege_slugs_js","link":"files/src_upgrades_3_8_0_remove_privilege_slugs_js/index.html"},"complexity":{"methodAggregate":{"cyclomatic":2,"cyclomaticDensity":9.524,"halstead":{"bugs":0.206,"difficulty":8.539,"effort":5274.133,"length":110,"time":293.007,"vocabulary":49,"volume":617.618,"operands":{"distinct":38,"total":59,"identifiers":["__stripped__"]},"operators":{"distinct":11,"total":51,"identifiers":["__stripped__"]}},"params":1,"sloc":{"logical":21,"physical":31}},"settings":{"commonjs":true,"forin":false,"logicalor":true,"switchcase":true,"trycatch":false,"newmi":true},"classes":[],"dependencies":[{"line":5,"path":"../../database","type":"cjs"},{"line":6,"path":"../../groups","type":"cjs"},{"line":7,"path":"../../batch","type":"cjs"}],"errors":[],"lineEnd":31,"lineStart":1,"maintainability":68.336,"methods":[{"cyclomatic":2,"cyclomaticDensity":18.182,"halstead":{"bugs":0.091,"difficulty":7.368,"effort":2004.556,"length":56,"time":111.364,"vocabulary":29,"volume":272.047,"operands":{"distinct":19,"total":28,"identifiers":["__stripped__"]},"operators":{"distinct":10,"total":28,"identifiers":["__stripped__"]}},"params":0,"sloc":{"logical":11,"physical":19},"errors":[],"lineEnd":30,"lineStart":12,"name":"<anonymous>"},{"cyclomatic":1,"cyclomaticDensity":50,"halstead":{"bugs":0.015,"difficulty":1.286,"effort":57.059,"length":14,"time":3.17,"vocabulary":9,"volume":44.379,"operands":{"distinct":7,"total":9,"identifiers":["__stripped__"]},"operators":{"distinct":2,"total":5,"identifiers":["__stripped__"]}},"params":1,"sloc":{"logical":2,"physical":4},"errors":[],"lineEnd":27,"lineStart":24,"name":"<anonymous>"}],"methodAverage":{"cyclomatic":1.5,"cyclomaticDensity":34.091,"halstead":{"bugs":0.053,"difficulty":4.327,"effort":1030.808,"length":35,"time":57.267,"vocabulary":19,"volume":158.213,"operands":{"distinct":13,"total":18.5},"operators":{"distinct":6,"total":16.5}},"params":0.5,"sloc":{"logical":6.5,"physical":11.5}},"module":"src/upgrades/3.8.0/remove-privilege-slugs.js"},"jshint":{"messages":[{"severity":"error","line":3,"column":1,"message":"Use the function form of \"use strict\".","source":"Use the function form of \"use strict\"."},{"severity":"error","line":5,"column":1,"message":"'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).","source":"'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz)."},{"severity":"error","line":6,"column":1,"message":"'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).","source":"'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz)."},{"severity":"error","line":7,"column":1,"message":"'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).","source":"'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz)."},{"severity":"error","line":12,"column":19,"message":"Expected '}' to match '{' from line 9 and instead saw 'function'.","source":"Expected '{a}' to match '{b}' from line {c} and instead saw '{d}'."},{"severity":"error","line":12,"column":28,"message":"Bad invocation.","source":"Bad invocation."},{"severity":"error","line":12,"column":30,"message":"Missing semicolon.","source":"Missing semicolon."},{"severity":"error","line":13,"column":9,"message":"'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).","source":"'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz)."},{"severity":"error","line":13,"column":9,"message":"'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).","source":"'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz)."},{"severity":"error","line":13,"column":30,"message":"If a strict mode function is executed using function invocation, its 'this' value will be undefined.","source":"If a strict mode function is executed using function invocation, its 'this' value will be undefined."},{"severity":"error","line":15,"column":9,"message":"'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).","source":"'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz)."},{"severity":"error","line":15,"column":35,"message":"Missing semicolon.","source":"Missing semicolon."},{"severity":"error","line":15,"column":49,"message":"'template literal syntax' is only available in ES6 (use 'esversion: 6').","source":"'{a}' is only available in ES{b} (use 'esversion: {b}')."},{"severity":"error","line":16,"column":9,"message":"'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).","source":"'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz)."},{"severity":"error","line":17,"column":33,"message":"'for of' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).","source":"'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz)."},{"severity":"error","line":17,"column":14,"message":"'const' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).","source":"'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz)."},{"severity":"error","line":17,"column":14,"message":"'destructuring binding' is available in ES6 (use 'esversion: 6') or Mozilla JS extensions (use moz).","source":"'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz)."},{"severity":"error","line":24,"column":9,"message":"Expected an assignment or function call and instead saw an expression.","source":"Expected an assignment or function call and instead saw an expression."},{"severity":"error","line":24,"column":14,"message":"Missing semicolon.","source":"Missing semicolon."},{"severity":"error","line":24,"column":68,"message":"Expected '(' and instead saw '{'.","source":"Expected '{a}' and instead saw '{b}'."},{"severity":"error","line":25,"column":21,"message":"Expected ')' to match '{' from line 24 and instead saw '.'.","source":"Expected '{a}' to match '{b}' from line {c} and instead saw '{d}'."},{"severity":"error","line":25,"column":21,"message":"'arrow function syntax (=>)' is only available in ES6 (use 'esversion: 6').","source":"'{a}' is only available in ES{b} (use 'esversion: {b}')."},{"severity":"error","line":25,"column":40,"message":"Expected ')' and instead saw ';'.","source":"Expected '{a}' and instead saw '{b}'."},{"severity":"error","line":25,"column":41,"message":"Missing semicolon.","source":"Missing semicolon."},{"severity":"error","line":26,"column":13,"message":"Expected an assignment or function call and instead saw an expression.","source":"Expected an assignment or function call and instead saw an expression."},{"severity":"error","line":26,"column":18,"message":"Missing semicolon.","source":"Missing semicolon."},{"severity":"error","line":26,"column":41,"message":"'template literal syntax' is only available in ES6 (use 'esversion: 6').","source":"'{a}' is only available in ES{b} (use 'esversion: {b}')."},{"severity":"error","line":27,"column":10,"message":"Expected an identifier and instead saw ','.","source":"Expected an identifier and instead saw '{a}'."},{"severity":"error","line":27,"column":10,"message":"Expected an assignment or function call and instead saw an expression.","source":"Expected an assignment or function call and instead saw an expression."},{"severity":"error","line":27,"column":11,"message":"Missing semicolon.","source":"Missing semicolon."},{"severity":"error","line":28,"column":20,"message":"Label 'batch' on 500 statement.","source":"Label '{a}' on {b} statement."},{"severity":"error","line":29,"column":9,"message":"Unexpected '}'.","source":"Unexpected '{a}'."},{"severity":"error","line":28,"column":23,"message":"Expected an assignment or function call and instead saw an expression.","source":"Expected an assignment or function call and instead saw an expression."},{"severity":"error","line":28,"column":24,"message":"Missing semicolon.","source":"Missing semicolon."},{"severity":"error","line":29,"column":10,"message":"Expected an identifier and instead saw ')'.","source":"Expected an identifier and instead saw '{a}'."},{"severity":"error","line":29,"column":10,"message":"Expected an assignment or function call and instead saw an expression.","source":"Expected an assignment or function call and instead saw an expression."},{"severity":"error","line":29,"column":11,"message":"Unrecoverable syntax error. (93% scanned).","source":"Unrecoverable syntax error."}]}}