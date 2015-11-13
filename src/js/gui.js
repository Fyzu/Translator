/**
 * Created by Dmitry on 25.09.2015.
 */

// Выполняем этот код после загрузки окна
window.addEventListener("load", function() {
    // Добавляем простой пример языка Go в textarea
    document.getElementById("source").innerHTML = "func testFunc(i int, s string)string{\n    var o, p int\n    fmt.Print(o*p)\n    s = s + \" \" + \"bar\"\n    return s\n}\n    \nfunc main() {\n    var x,z,c int\n    var y,t string\n    var b bool\n    {\n        x = 10 + 33 * 11\n        if 44 > 42 {\n            x = 10\n        } else {\n            t = \"fdfd\"\n        }\n        for true {\n            for 44 > 1 {\n                if true {\n                    fmt.Scan(&y)\n                }\n            }\n        }\n        fmt.Scan(&y)\n        for x == 0 {\n            fmt.Print(y)\n            x=x-1\n        }\n        fmt.Print(\"Hello World\")\n        t = testFunc(x, \"foo\")\n    }\n}";

    // Получаем данные с окна и начинаем трансляцию
    document.getElementById("startBtn").addEventListener("click", function (event) {
        console.log("Translator - Start");

        // Транслятор
        var source = document.getElementById("source").value.split('\n');   // Исходный код транслируемого языка
        var translator = new Translator(source);                            // Экземпляр транслятора

        // Вывод...
        document.getElementById("output").innerHTML = translator.Source;
        //...Таблица ошибок
        var errorsStr = document.getElementById("errors");
        errorsStr.innerHTML = '';
        for(var i = 0; i<translator.Errors.length;i++) {
            errorsStr.innerHTML += "<tr><td>Error: "+translator.Errors[i][1]+" - line: "+translator.Errors[i][2]+" index: "+translator.Errors[i][3]+"</td></tr>";
        }
        for(var i = 0; i<translator.SyntaxErrors.length;i++) {
            errorsStr.innerHTML += "<tr><td>Error: "+translator.SyntaxErrors[i][0]+"</td></tr>";
        }
        //...Таблица лексем
        var lexemesTable = document.getElementById("lexemesTable");
        lexemesTable.innerHTML = "";
        for(var i = 0; i<translator.Lexemes.length;i++) {
            lexemesTable.innerHTML += "<tr><td>"+translator.Lexemes[i][0]+"</td><td>"+translator.Lexemes[i][1]+'.'+translator.Lexemes[i][2]+"</td><td>"+translator.Lexemes[i][3]+"</td></tr>";
        }
        //..Таблица синтаксических правил
        var parseTreeTable = document.getElementById("parseTreeTable");
        parseTreeTable.innerHTML = "";
        var str = "";
        for(var i = 0; i<translator.Rules.length;i++) {
            str = "";
            for(var j = 0;j<translator.Rules[i].length;j++) {
                str += translator.Rules[i][j] + ' ';
            }
            parseTreeTable.innerHTML += "<tr><td>" + str + "</td></tr>";
        }
    });
});

/*
 * Расщирение функционала стандартных объектов
 */
// Метод провряющий, состоит ли строка из чисел
String.prototype.isNumber = function (){
    var match = this.match(/[0-9]/gi);
    if (match) {
        return this.length != 0 && match.length == this.length;
    }
    return false;
};

// Метод проверяющий, состоит ли строка из апострофов
String.prototype.isApostrophe = function () {
    var match = this.match(/["]/g);
    if (match) {
        return this.length != 0 && match.length == this.length;
    }
    return false;
};

// Метод проверяющий, состоит ли строка из латинских букв
String.prototype.isLetter = function () {
    var match = this.match(/[A-Z]/gi);
    if (match) {
        return this.length != 0 && match.length == this.length;
    }
    return false;
};

String.prototype.contains = function (str) {
    return this.indexOf(str) != -1;
};

// Метод String возвращающий кол-во символов
String.prototype.count = function (symbol) {
    return (this.match(new RegExp('['+symbol+']',"g")) || []).length;
};

// Проверяем, есть ли такой item в массиве
Array.prototype.itemExists = function (item){
    for(var i = 0; i<this.length;i++) {
        if(this[i] == item) {
            return true;
        }
    }
    return false;
};

// Очищение массива
Array.prototype.clear = function () {
    this.splice(0,this.length);
};