/**
 * Created by Dmitry on 25.09.2015.
 */

// Лексический анализатор
Translator.prototype.Lexer = function () {

    /*
     * Методы Lexer'а
     */
    // Разбор целой константы
    this.parseNumber = function(index){
        var lexem = '';                                     // Получаемая лексема
        var symbol = this.source[this.strIndex][index];     // Обрабатываемый символ
        var firstEntry = index;                             // Индекс первого вхождения

        // Получаем лексему целиком
        do {
            lexem += symbol;
            index++;
            symbol = this.source[this.strIndex][index];
        } while(index<this.source[this.strIndex].length && symbol.isNumber());

        // Добавляем полученную лексему в массивы
        var item = [lexem, 50, 0, this.strIndex, firstEntry];
        this.Lexemes.push(item);
        this.Numbers.push(item);

        return index-1;
    }

    // Разбор строковой константы
    this.parseStr = function(index) {
        var lexem = '';                                             // Получаемая лексема
        var startSymbol = this.source[this.strIndex][index++];      // Начальный символ
        var symbol = this.source[this.strIndex][index];             // Обрабатываемый символ
        var firstEntry = index;                                     // Первое вхождение лексемы

        console.log(this.source[this.strIndex]);
        if(symbol) {    // Если символ не нулевой
            // Получаем полную лексему
            while (index < this.source[this.strIndex].length && (!symbol.isApostrophe() || this.source[this.strIndex][index-1] == '\\')) {
                lexem += symbol;
                index++;
                symbol = this.source[this.strIndex][index];
            }
            // Проверяем, закрыта ли строковая константа
            if (symbol == startSymbol) {    // Если да, то добавляем в массив
                var item = [lexem, 51, 0, this.strIndex, firstEntry];
                this.Lexemes.push(item);
                this.Strings.push(item);
            } else {    // Если нет, то сообщаем об ошибке
                var item = [lexem, "quotes are not closed", this.strIndex, firstEntry];
                this.Errors.push(item);
            }
        }

        return index;
    }

    // Разбор идентификаторов
    this.parseIdnt = function(index) {
        var lexem = '';                                     // Получаемая лексема
        var symbol = this.source[this.strIndex][index];     // Обрабатываемый символ
        var firstEntry = index;                             // Первое вхождение лексемы

        // Получем полную лексему
        do {
            lexem += symbol;
            index++;
            symbol = this.source[this.strIndex][index];
        } while(index<this.source[this.strIndex].length && (symbol.isLetter() || symbol.isNumber() || symbol == '.'));

        // Проверяем является ли лексема ключевым словом
        for(var i = 0;i<this.keywords.length;i++) {
            if(this.keywords[i][0] == lexem) {
                var item = [lexem, this.keywords[i][1], 0, this.strIndex, firstEntry];
                this.Lexemes.push(item);

                return index-1;
            }
        }
        // Если лексема не ключевое слово, то идентификатор
        var item = [lexem, 40, 0, this.strIndex, firstEntry];
        this.Lexemes.push(item);
        this.Identifiers.push(item);

        return index-1;
    }

    // Разбор символа
    this.parseSymbol = function(index) {
        var symbol = this.source[this.strIndex][index];     // Обрабатываемый символ
        var firstEntry = index;                             // Первое вхождение символа

        // Проверяем, корректный ли символ
        for(var i = 0;i<this.symbols.length;i++) {
            if(this.symbols[i][0] == symbol) {
                var item = [symbol, this.symbols[i][1], this.symbols[i][2], this.strIndex, firstEntry];
                this.Lexemes.push(item);
                return index;
            } else if(this.symbols[i][0] == symbol+this.source[this.strIndex][index+1]) {
                var item = [symbol+this.source[this.strIndex][index+1], this.symbols[i][1], this.symbols[i][2], this.strIndex, firstEntry];
                this.Lexemes.push(item);
                return index;
            }
        }

        // Если символ не корректный, то сообщаем об ошибке
        var item = [symbol, "illegal symbol", this.strIndex, firstEntry];
        this.Errors.push(item);

        return index;
    }


    /*
     * Конструктор Lexer'а
     */

    // Проверяем, не пустой ли исходный код получили мы
    if(!this.source || this.source.length == 0) {
        return;
    }

    // Посимвольный разбор исходного кода
    for(this.strIndex = 0;this.strIndex<this.source.length;this.strIndex++) {
        for (var index = 0; index < this.source[this.strIndex].length; index++) {
            var symbol = this.source[this.strIndex][index];
            if (symbol.isNumber()) {    // Если число
                console.log("Symbol - \'" + symbol + "\' is Number");
                index = this.parseNumber(index);
            } else if (symbol.isApostrophe()) {   // Если апостроф(начало строки)
                console.log("Symbol - \'" + symbol + "\' is Apostrophe");
                index = this.parseStr(index);
            } else // Если идентфикаторы и символы
            if (symbol.isLetter() || symbol == "_") {   // Если буква
                console.log("Symbol - \'" + symbol + "\' is Letter");
                index = this.parseIdnt(index);
            } else if (symbol == ' ' || symbol == '\r' || symbol == '\t') {
                continue;
            } else {    // Если не буква
                console.log("Symbol - \'" + symbol + "\' is no Letter");
                index = this.parseSymbol(index);
            }
        }
    }
}