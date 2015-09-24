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
    ['func', 1],
    ['return', 2],
    ['if', 3],
    ['else', 4],
    ['for', 5],
    ['switch', 6],
    ['case', 7],
    ['break', 8],
    ['default', 9],
    ['var', 10],
    ['bool', 11],
    ['int', 12],
    ['float', 13],
    ['string', 14],
    ['fmt.Print', 15],
    ['fmt.Scan', 16],
    ['fmt.Pow', 17],
    ['fmt.Sqrt', 18]
];

var symbols = [
    ['{',30,0],
    ['}',30,1],
    ['==',31,0],
    ['<',31,1],
    ['>',31,2],
    ['<=',31,3],
    ['>=',31,4],
    ['+',32,0],
    ['-',32,1],
    ['*',32,2],
    ['/',32,3],
    ['%',32,4],
    ['!',33,0],
    ['&&',33,1],
    ['||',33,2],
    ['[',34,0],
    [']',34,1],
    ['(',35,0],
    [')',35,1],
    ['=',36,0],
    [',',37,0]
];

document.getElementById("source").innerHTML = "func main() {\nfmt.Print(\"Hello World\")\n}";

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
            if (isLetter(symbol) || symbol == "_") {   // Если буква
                console.log("Symbol - \'" + symbol + "\' is Letter");
                index = parseIdnt(index);
            } else {    // Если не буква
                console.log("Symbol - \'" + symbol + "\' is no Letter");
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
        var match = str.match(/[\"]/g);
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
    var firstEntry = index;

    do {
        lexem += symbol;
        index++;
        symbol = source[strIndex][index];
    } while(isNumber(symbol));
    var item = [lexem, 50, 0, strIndex, firstEntry];
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
    var firstEntry = index;

    if(symbol) {
        while (!isApostrophe(symbol) && index < source[strIndex].length) {
            lexem += symbol;
            index++;
            symbol = source[strIndex][index];
        }
        if (symbol == startSymbol) {
            item = [lexem, 51, 0, strIndex, firstEntry];
            Lexemes.push(item);
            if (!isLexemeExists(item, Strings))
                Strings.push(item);
        } else {
            item = [lexem, "quotes are not closed", strIndex, firstEntry];
            Errors.push(item);
        }
    }
    return index;
}

function parseIdnt(index) {
    var lexem = '';
    var symbol = source[strIndex][index];
    var firstEntry = index;

    do {
        lexem += symbol;
        index++;
        symbol = source[strIndex][index];
    } while(isLetter(symbol) || isNumber(symbol) || symbol == '.');
    for(var i = 0;i<keywords.length;i++) {
        if(keywords[i][0] == lexem) {
            var item = [lexem, keywords[i][1], 0, strIndex, firstEntry];
            Lexemes.push(item);
            return index-1;
        }
    }
    var item = [lexem, 40, 0, strIndex, firstEntry];
    Lexemes.push(item);
    if(!isLexemeExists(item, Identifiers))
        Identifiers.push(item);
    return index-1;
}

function parseSymbol(index) {
    var symbol = source[strIndex][index];
    var firstEntry = index;

    for(var i = 0;i<symbols.length;i++) {
        if(symbols[i][0] == symbol) {
            var item = [symbol, symbols[i][1], symbols[i][2], strIndex, firstEntry];
            Lexemes.push(item);
            return index;
        } else if(symbols[i][0] == symbol+source[strIndex][index+1]) {
            var item = [symbol+source[strIndex][index+1], symbols[i][1], symbols[i][2], strIndex, firstEntry];
            Lexemes.push(item);
            return index;
        } else if(symbol == ' ' || symbol == '\r' || symbol == '\t') {
            return index;
        }
    }
    var item = [symbol, "illegal symbol", strIndex, firstEntry];
    Errors.push(item);
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