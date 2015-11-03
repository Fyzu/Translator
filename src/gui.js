/**
 * Created by Dmitry on 25.09.2015.
 */

// Выполняем этот код после загрузки окна
window.addEventListener("load", function() {
    // Добавляем простой пример языка Go в textarea
    document.getElementById("source").innerHTML = "func testFunc(i int, s string)string{\n\tvar o, p int\n\tfmt.Print(o*p)\n\ts = s + \" \" + \"bar\"\n\treturn s\n}\n\t\nfunc main() {\n\tvar x,z,c int\n\tvar y,t string\n\tvar b bool\n\t{\n\t\tx = 10 + 33 * 11\n\t\tif 44 > 42 {\n\t\t\tx = 10\n\t\t} else {\n\t\t\tt = \"fdfd\"\n\t\t}\n\t\tfor true {\n\t\t\tfor 44 > 1 {\n\t\t\t\tif true {\n\t\t\t\t\tfmt.Scan(&y)\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tfmt.Scan(&y)\n\t\tfor x == 0 {\n\t\t\tfmt.Print(y)\n\t\t\tx=x-1\n\t\t}\n\t\tfmt.Print(\"Hello World\")\n\t\tt = testFunc(x, \"foo\")\n\t}\n}";

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
            errorsStr.innerHTML += "<p>Error: "+translator.Errors[i][1]+" - line: "+translator.Errors[i][2]+" index: "+translator.Errors[i][3]+"</p>";
        }
        for(var i = 0; i<translator.SyntaxErrors.length;i++) {
            errorsStr.innerHTML += "<p>Error: "+translator.SyntaxErrors[i][0]+"</p>";
        }
        //...Таблица лексем
        var lexemesTable = document.getElementById("lexemesTable");
        lexemesTable.innerHTML = "<tr><td>Lexeme</td><td>Type</td><td>Line</td></tr>";
        for(var i = 0; i<translator.Lexemes.length;i++) {
            lexemesTable.innerHTML += "<tr><td>"+translator.Lexemes[i][0]+"</td><td>"+translator.Lexemes[i][1]+'.'+translator.Lexemes[i][2]+"</td><td>"+translator.Lexemes[i][3]+"</td></tr>";
        }
        //...Таблица идентификаторов
        var identifiersTable = document.getElementById("identifiersTable");
        identifiersTable.innerHTML = "<tr><td>Identifier</td><td>Line</td></tr>";
        for(var i = 0; i<translator.Identifiers.length;i++) {
            identifiersTable.innerHTML += "<tr><td>"+translator.Identifiers[i][0]+"</td><td>"+translator.Identifiers[i][3]+"</td></tr>";
        }
        //...Таблица строк
        var stringsTable = document.getElementById("stringsTable");
        stringsTable.innerHTML = "<tr><td>String</td><td>Line</td></tr>";
        for(var i = 0; i<translator.Strings.length;i++) {
            stringsTable.innerHTML += "<tr><td>"+translator.Strings[i][0]+"</td><td>"+translator.Strings[i][3]+"</td></tr>";
        }
        //..Таблица чисел
        var numbersTable = document.getElementById("numbersTable");
        numbersTable.innerHTML = "<tr><td>Number</td><td>Line</td></tr>";
        for(var i = 0; i<translator.Numbers.length;i++) {
            numbersTable.innerHTML += "<tr><td>"+translator.Numbers[i][0]+"</td><td>"+translator.Numbers[i][3]+"</td></tr>";
        }
        //..Таблица логических
        var booleansTable = document.getElementById("booleansTable");
        booleansTable.innerHTML = "<tr><td>Boolean</td><td>Line</td></tr>";
        for(var i = 0; i<translator.Booleans.length;i++) {
            booleansTable.innerHTML += "<tr><td>"+translator.Booleans[i][0]+"</td><td>"+translator.Booleans[i][3]+"</td></tr>";
        }
        //..Таблица синтаксических правил
        var parseTreeTable = document.getElementById("parseTreeTable");
        parseTreeTable.innerHTML = "";
        for(var i = 0; i<translator.Rules.length;i++) {
            parseTreeTable.innerHTML += "<tr><td>";
            for(var j = 0;j<translator.Rules[i].length;j++) {
                parseTreeTable.innerHTML += translator.Rules[i][j] + ' ';
            }
            parseTreeTable.innerHTML += "</td></tr>";
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
}

// Метод проверяющий, состоит ли строка из апострофов
String.prototype.isApostrophe = function () {
    var match = this.match(/["]/g);
    if (match) {
        return this.length != 0 && match.length == this.length;
    }
    return false;
}

// Метод проверяющий, состоит ли строка из латинских букв
String.prototype.isLetter = function () {
    var match = this.match(/[A-Z]/gi);
    if (match) {
        return this.length != 0 && match.length == this.length;
    }
    return false;
}

// Метод String возвращающий кол-во символов
String.prototype.count = function (symbol) {
    return (this.match(new RegExp('['+symbol+']',"g")) || []).length;
}

// Проверяем, есть ли такой item в массиве
Array.prototype.itemExists = function (item){
    for(var i = 0; i<this.length;i++) {
        if(this[i] == item) {
            return true;
        }
    }
    return false;
}

// Очищение массива
Array.prototype.clear = function () {
    this.splice(0,this.length);
}