/**
 * Created by Dmitry on 22.09.2015.
 */

var source;
var strIndex;

var Lexemes;
var Identifiers;
var Strings;
var Numbers;
var Errors;

var keywords = [
    ['function', 1],
    ['return', 2],
    ['var', 3],
    ['if', 4],
    ['else', 5],
    ['while', 6],
    ['for', 7],
    ['switch', 8],
    ['case', 9],
    ['break', 10]
];

// Получаем данные с окна и начинаем трансляцию
document.getElementById("startBtn").addEventListener("click", function (event) {
    Lexemes = [];
    Identifiers = [];
    Strings = [];
    Numbers = [];
    Errors = [];

    console.log("Translator - Start");
    source = document.getElementById("source").value.split('\n');   // Получаем исходный код транслируемого языка
    console.log(source);
    Lexer();

    console.log("Lexems");
    console.log(Lexemes);
    console.log("Identifiers");
    console.log(Identifiers);
    console.log("Strings");
    console.log(Strings);
    console.log("Numbers");
    console.log(Numbers);
    console.log("Errors");
    console.log(Errors);
});

// Вывод информации в поле output
function output(str) {
    document.getElementById("output").innerHTML = str;
}

// Лексический анализатор
function Lexer() {
    if(!source || source.length == 0) {
        return;
    }

    for(strIndex = 0;strIndex<source.length;strIndex++) {
        for (var index = 0; index < source[strIndex].length; index++) {
            var symbol = source[strIndex][index];

            if (isNumber(symbol)) {    // Если число
                console.log("Symbol - \'" + symbol + "\' is Number");
                index = parseNumber(index);
            } else if (isApostrophe(symbol)) {   // Если апостроф(начало строки)
                console.log("Symbol - \'" + symbol + "\' is Apostrophe");
                index = parseStr(index);
            } else // Если идентфикаторы и символы
            if (isLetter(symbol)) {   // Если буква
                console.log("Symbol - \'" + symbol + "\' is Letter");
                index = parseIdnt(index);
            } else {    // Если не буква
                index = parseSymbol(index);
            }
        }
    }
}

function isNumber(str) {
    if(str) {
        var match = str.match(/[0-9]/gi);
        if (match) {
            return (str.length != 0 && match.length == str.length) ? true : false;
        }
    }
    return false;
}

function isApostrophe(str) {
    if(str) {
        var match = str.match(/[\'|\"]/g);
        if (match) {
            return (str.length != 0 && match.length == str.length) ? true : false;
        }
    }
    return false;
}

function isLetter(str) {
    if(str) {
        var match = str.match(/[A-Z]/gi);
        if (match) {
            return (str.length != 0 && match.length == str.length) ? true : false;
        }
    }
    return false;
}

function parseNumber(index){
    var lexem = '';
    var symbol = source[strIndex][index];

    while(isNumber(symbol)) {
        lexem += symbol;
        index++;
        symbol = source[strIndex][index];
    }
    var item = [lexem, 26, strIndex];
    Lexemes.push(item);
    if(!isLexemeExists(item,Numbers))
        Numbers.push(item);

    return index-1;
}

function parseStr(index) {
    var lexem = '';
    var item;
    var startSymbol = source[strIndex][index++];
    var symbol = source[strIndex][index];

    if(symbol) {
        while (!isApostrophe(symbol) && index < source[strIndex].length) {
            lexem += symbol;
            index++;
            symbol = source[strIndex][index];
        }
        if (symbol == startSymbol) {
            item = [lexem, 27, strIndex];
            Lexemes.push(item);
            if (!isLexemeExists(item, Strings))
                Strings.push(item);
        } else {
            item = [lexem, "quotes are not closed", strIndex];
            Errors.push(item);
        }
    }
    return index;
}

function parseIdnt(index) {
    var lexem = '';
    var symbol = source[strIndex][index];

    while(isLetter(symbol) || isNumber(symbol)) {
        lexem += symbol;
        index++;
        symbol = source[strIndex][index];
    }
    for(var i = 0;i<keywords.length;i++) {
        if(keywords[i][0] == lexem) {
            var item = [lexem, keywords[i][1], strIndex];
            Lexemes.push(item);
        }
    }
    return index;
}

function parseSymbol(index) {
    return index;
}

function isLexemeExists(lexem, arr){
    for(var i = 0; i<arr.length;i++) {
        if(arr[i] == lexem) {
            return true;
        }
    }
    return false;
}