// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  
  if (typeof exports == "object" && typeof module == "object"){ // CommonJS
    console.log('Sandbox | CodeMirror | CommonJS');
    mod(require("../../lib/codemirror"), require("../../addon/mode/simple"));
  }
  else if (typeof define == "function" && define.amd) {// AMD
    console.log('Sandbox | CodeMirror | AMD');
    define(["../../lib/codemirror", "../../addon/mode/simple"], mod);
  }
  else {// Plain browser env
    console.log('Sandbox | CodeMirror | Plain browser');
    mod(CodeMirror);
  }
})(function(CodeMirror) {
"use strict";

CodeMirror.defineSimpleMode("sandbox-expression",{
  // The start state contains the rules that are initially used
  start: [
    // The regex matches the token, the token property contains the type
    //{regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
    // You can match multiple tokens at once. Note that the captured
    // groups must span the whole string in this case
    //{regex: /(function)(\s+)([a-z$][\w$]*)/, token: ["keyword", null, "variable-2"]},
    // Rules are matched in the order in which they appear, so there is
    // no ambiguity between this one and the one above
    {regex: /(?:if|else|ELSE|max|min|ceil|floor|maxdie|countE|countH)\b/,token: "keyword"},
    {regex: /(?:%)/,token: "keyword"},
    {regex: /true|false|null|undefined/, token: "atom"},
    {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,token: "number"},           
    
    {regex: /--/, token: "sb-citem-property", mode: {spec: "sandbox-expression", end: /--/}},
    
    //{regex: /\/\/.*/, token: "comment"},
    //{regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
    // A next property will cause the mode to move to a different state
    //{regex: /\/\*/, token: "comment", next: "comment"},
    
    {regex: /[-+\/*=<>!]+/, token: "operator"},
    // indent and dedent properties guide autoindentation
    {regex: /[\{\[\(]/, indent: true},
    {regex: /[\}\]\)]/, dedent: true},
    
    
    // You can embed other modes with the mode property.
    {regex: /\$<\d+;/, token: "sb-registration-helper", mode: {spec: "sandbox-expression", end: />/}},
    {regex: /\$\d+/, token: "sb-registration-helper"},
    {regex: /#\{([^}][\S]{0}[\w]+)\}/gm, token: "sb-citem-property"},
    {regex: /@\{([^}][\S]{0}[\w]+)\}/gm, token: "sb-actor-property"},
    {regex: /d\{([^}][\S]{0}[\w]+)\}/gm, token: "sb-dialog-property"},
    {regex: /&&/, token: "keyword", mode: {spec: "sandbox-expression", end: /&&/}},    
    {regex: /__/, token: "sb-actor-property", mode: {spec: "sandbox-expression", end: /__/}},

    
  ],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {
    //dontIndentStates: ["comment"],
    //lineComment: "//"
  }
});

CodeMirror.defineMIME("text/x-sandbox-expressionsrc", "sandbox-expression");
CodeMirror.defineMIME("text/sandbox-expression", "sandbox-expression");
}); 