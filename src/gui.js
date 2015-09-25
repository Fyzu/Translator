/**
 * Created by Dmitry on 25.09.2015.
 */

// Выполняем этот код после загрузки окна
window.addEventListener("load", function() {
    // Добавляем простой пример языка Go в textarea
    document.getElementById("source").innerHTML = "func main() {\nvar x int\nvar y string\nfmt.Scan(&y)\nx = 10\nfor x!=0 {\nfmt.Print(y)\nx=x-1\n}\nfmt.Print(\"Hello World\")\n}";

    // Получаем данные с окна и начинаем трансляцию
    document.getElementById("startBtn").addEventListener("click", function (event) {
        console.log("Translator - Start");

        // Транслятор
        var source = document.getElementById("source").value.split('\n');   // Исходный код транслируемого языка
        var translator = new Translator(source);                            // Экземпляр транслятора

        // Вывод...
        var errorsStr = document.getElementById("errors");
        errorsStr.innerHTML = '';
        for(var i = 0; i<translator.Errors.length;i++) {
            errorsStr.innerHTML += "<p>Error: "+translator.Errors[i][1]+" - line: "+translator.Errors[i][2]+" index: "+translator.Errors[i][3]+"</p>";
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
    });
});

/*
 * Расщирение функционала стандартных объектов
 */
// Метод провряющий, состоит ли строка из чисел
String.prototype.isNumber = function (){
    var match = this.match(/[0-9]/gi);
    if (match) {
        return (this.length != 0 && match.length == this.length) ? true : false;
    }
    return false;
}

// Метод проверяющий, состоит ли строка из апострофов
String.prototype.isApostrophe = function () {
    var match = this.match(/[\"]/g);
    if (match) {
        return (this.length != 0 && match.length == this.length) ? true : false;
    }
    return false;
}

// Метод проверяющий, состоит ли строка из латинских букв
String.prototype.isLetter = function () {
    var match = this.match(/[A-Z]/gi);
    if (match) {
        return (this.length != 0 && match.length == this.length) ? true : false;
    }
    return false;
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