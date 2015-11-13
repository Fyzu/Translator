/**
 * Created by Dmitry on 25.09.2015.
 */

// Транслятор
function Translator(source) {
    // Список переменных
    this.source = source;       // Транслируемый язык
    this.strIndex = 0;          // Индекс текущей строки
    this.Lexemes = [];          // Массив лексем
    this.Identifiers = [];      // Массив идентификаторов
    this.Strings = [];          // Массив строк
    this.Numbers = [];          // Массив чисел
    this.Booleans = [];         // Массив логических выражений
    this.Errors = [];           // Массив ошибок
    this.keywords = null;       // Таблица ключевых слов
    var stringKeywords = "[[\"func\",1], [\"main\",2], [\"return\",3], [\"if\",4], [\"else\",5], [\"for\",6], [\"switch\",7], [\"case\",8], [\"break\",9], [\"default\",10], [\"var\",11], [\"bool\",12], [\"int\",13], [\"float\",14], [\"string\",15], [\"fmt.Print\",16], [\"fmt.Scan\",17], [\"math.Pow\",18], [\"math.Sqrt\",19], [\"true\",20], [\"false\",21]]";
    this.symbols = null;        // Таблица сиволов
    var stringSymbols = "[[\"{\",30,0], [\"}\",30,1], [\"==\",31,0], [\"<\",31,1], [\">\",31,2], [\"<=\",31,3], [\">=\",31,4], [\"!=\",31,5], [\"+\",32,0], [\"-\",32,1], [\"*\",32,2], [\"/\",32,3], [\"%\",32,4], [\"!\",33,0], [\"&&\",33,1], [\"||\",33,2], [\"[\",34,0], [\"]\",34,1], [\"(\",35,0], [\")\",35,1], [\"=\",36,0], [\",\",37,0], [\"&\",38,0]]";

    // Парсим JSON лексем
    this.keywords = new JSONParser(stringKeywords).parse();
    this.symbols = new JSONParser(stringSymbols).parse();

    this.Lexer();   // Лексический анализатор
    this.Parser();  // Синтаксический анализатор и Генератор кода
}