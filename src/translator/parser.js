/**
 * Created by Dmitry on 26.09.2015.
 */

Translator.prototype.Parser = function () {
    this.stateStr = '';

    var Declare = [];
    var typeExp = 0;
    var TypeI = [];
    var TypeF = [];
    var TypeB = [];
    var TypeS = [];
    var Variables = [];
    var identifierInOperators = [];

    this.Rules = [];
    this.SyntaxErrors = [];

    var currentLexeme = 0;
    var currentRule;

    /*
     * Методы Parser'а
     */
    // Проверка граматики < программа >
    this.Program = function () {
        if(this.Lexemes.length == 0) {
            this.Rules.push('empty');
            return true;
        }

        this.Rules.push(['<программа>','=>','<блок функций>','<тело главной программы>']);
        currentRule = 0;
        if(!this.functionBlock()) {
            this.Rules[currentRule].splice(2,1);
        }
        if(this.mainProgram()) {
            return true;
        }

        return false;
    }

    // Проверка граматики < тело главной программы >
    this.mainProgram = function () {
        if(this.Lexemes[currentLexeme][0] == 'func' && this.Lexemes[currentLexeme+1][0] == 'main' &&
           this.Lexemes[currentLexeme+2][0] == '('  && this.Lexemes[currentLexeme+3][0] == ')' &&
           this.Lexemes[currentLexeme+4][0] == '{')
        {
            currentLexeme += 5;     // Пропускаем 5 обработанных лексем
            this.Rules.push(['<тело главной программы>','=>','func main(){','<блок переменных>','<последовательность операторов>','}']);
            currentRule++;
            var mainProgramRuleIndex = currentRule;
            if(!this.variablesBlock()) {
                this.Rules[mainProgramRuleIndex].splice(3,1);
            }
            if(this.operatorSequence()) {
                return true;
            }
        } else {
            this.SyntaxErrors.push(['main function not found']);
        }
        return false;
    }

    // Проверка граматики < блок переменных >
    this.variablesBlock = function () {
        if(this.Lexemes[currentLexeme][0] == 'var') {
            this.Rules.push(['<блок переменных>','=>','<объявление переменных>','<блок переменных>']);
            currentRule++;
            var varibleBlockRuleIndex = currentRule;
            if(this.variables()) {
                if(!this.variablesBlock()) {
                    this.Rules[varibleBlockRuleIndex].splice(3,1);
                }
                return true;
            }
        }
        return false;
    }

    // Проверка граматики < объявление переменных >
    this.variables = function () {
        if(this.Lexemes[currentLexeme][0] == 'var') {
            currentLexeme++;
            this.Rules.push(['<объявление переменных>','=>','<список имен>','<тип>']);
            currentRule++;
            if(this.nameList()) {
                if(this.variableType()) {
                    return true;
                }
            }
        }
        return false;
    }

    // Проверка граматики < список имен >
    this.nameList = function () {
        if(this.Lexemes[currentLexeme][1] == 40) {
            this.Rules.push(['<список имен>','=>']);
            currentRule++;
            currentLexeme--;
            do {
                currentLexeme++;
                if(this.Lexemes[currentLexeme][1] == 40) {
                    if(!Declare.itemExists(this.Lexemes[currentLexeme][0])) {
                        this.Rules[currentRule].push('ид.');
                        Declare.push(this.Lexemes[currentLexeme][0]);
                        Variables.push(this.Lexemes[currentLexeme][0]);
                    } else {
                        this.SyntaxErrors.push([this.Lexemes[currentLexeme][0]+' - variable declared earlier']);
                        return false;
                    }
                } else {
                    this.SyntaxErrors.push(['not declared identifier, after \',\'']);
                    return false;
                }
                currentLexeme++;
            } while(this.Lexemes[currentLexeme][0] == ',');
        } else {
            this.SyntaxErrors.push(['not declared identifier']);
        }
        return true;
    }

    // Проверка граматики < тип >
    this.variableType = function () {
        // Определяем тип переменной
        this.Rules.push(['<тип>','=>']);
        currentRule++;
        if(this.Lexemes[currentLexeme][0] == '[') {
            if(this.Lexemes[currentLexeme+1][1] == 50 && this.Lexemes[currentLexeme+2][0] == ']') {
                this.Rules[currentRule].push('array');
                this.Rules[currentRule].push(this.Lexemes[currentLexeme + 1][0]);
                currentLexeme += 3;
            } else {
               this.SyntaxErrors.push(['incorrect array size']);
            }
        }
        switch (this.Lexemes[currentLexeme][1]) {
            case 12:    // bool
                TypeB = TypeB.concat(Variables);
                Variables.clear();
                this.Rules[currentRule].push(this.Lexemes[currentLexeme++][0]);
                return true;
            case 13:    // int
                TypeI = TypeI.concat(Variables);
                Variables.clear();
                this.Rules[currentRule].push(this.Lexemes[currentLexeme++][0]);
                return true;
            case 14:    // float
                TypeF = TypeF.concat(Variables);
                Variables.clear();
                this.Rules[currentRule].push(this.Lexemes[currentLexeme++][0]);
                return true;
            case 15:    // string
                TypeS = TypeS.concat(Variables);
                Variables.clear();
                this.Rules[currentRule].push(this.Lexemes[currentLexeme++][0]);
                return true;
            default:
                this.SyntaxErrors.push(['incorrectly declared variable type']);
        }
        return false;
    }

    // Проверка граматики < последовательность операторов >
    this.operatorSequence = function () {
        this.Rules.push(['<последовательность операторов>','=>','<оператор>','<другая последовательность операторов>']);
        currentRule++;
        var operatorSequenceRuleIndex = currentRule;

        if(this.operator()) {
            if(!this.operatorSequence()) {
                this.Rules[operatorSequenceRuleIndex].splice(3,1);
            }
        }
        return false;
    }

    // Проверка граматики < оператор >
    this.operator = function () {
        /****************************************************
         *          Проверка ид. = < выражение >
         ****************************************************/
        if(this.Lexemes[currentLexeme][1] == 40) {
            this.Rules.push(['<оператор>', '=>', 'ид.', '=', '<выражение>']);
            currentRule++;
            var type = variableType(this.Lexemes[currentLexeme][0]);
            identifierInOperators.push(this.Lexemes[currentLexeme++][1]);

            if (this.Lexemes[currentLexeme][1] == 36) {
                currentLexeme++;
                if (this.expression(type)) {
                    return true;
                }
            }
        }
        /****************************************************
         *          Проверка
         ****************************************************/
        else if (false) {

        }

        return false;
    }

    // Определение типа по названию идентификатора
    var variableType = function (identifier) {
        if(TypeB.itemExists(identifier)) {
            return 12;  // Если bool
        } else if (TypeI.itemExists(identifier)) {
            return 13;  // Если int
        } else if (TypeF.itemExists(identifier)) {
            return 14;  // Если float
        } else if (TypeS.itemExists(identifier)) {
            return 15;  // Если string
        }
    }

    // Проверка граматики < выражение >
    this.expression = function (type) {
        switch (type) {
            case 12:    // bool
                currentRule++;
                return this.boolExpression;
            case 13:    // int
                return this.intExpression;
            case 14:    // float
                return this.floatExpression;
            case 15:    // string
                return this.stringExpression;
            default:
                Error.push(['incorrect type of expression']);
                return false;
        }
    }

    // Проверка граматики < целое численное выражение >
    this.intExpression = function () {

        this.Rules.push(['<выражение>','=>','<целое численное выражение>']);
        currentRule++;

        // Проверка на < терм >
        if(this.Lexemes[currentLexeme][1] == 40 || this.Lexemes[currentLexeme][1] == 50
        || this.Lexemes[currentLexeme][1] == 52 || this.Lexemes[currentLexeme][0] == '(')
        {
            // Проверка на < терм > */% < числ. выражение >
            if(this.Lexemes[currentLexeme][1] == 32
            || this.Lexemes[currentLexeme][1] == 18 || this.Lexemes[currentLexeme][1] == 19)
            {
                this.intExpression();
            }
        } else if(false) {

        }

        return false;
    }

    // Проверка граматики < дробное выражение >
    this.floatExpression = function () {

        this.Rules.push(['<выражение>','=>','<дробное выражение>']);
        currentRule++;

        return false;
    }

    // Проверка граматики < логическое выражение >
    this.boolExpression = function () {

        this.Rules.push(['<выражение>','=>','<логическое выражение>']);
        currentRule++;

        return false;
    }

    // Проверка граматики < строковое выражение >
    this.stringExpression = function () {

        this.Rules.push(['<выражение>','=>','<строковое выражение>']);
        currentRule++;

        return false;
    }

    // Проверка граматики < блок функций >
    this.functionBlock = function () {
        if(this.Lexemes[currentLexeme][2] == this.keywords[0][0] && this.Lexemes[currentLexeme+1][2] != this.keywords[1][0]) { // Если текущая лекссема - func и след. не main
            this.Rules.push(['<блок функций>','=>','<функция>','<другой блок функций>']);
            currentRule++;
            var functionBlockRuleIndex = currentRule;
            if(this.function()) {
                if(!this.functionBlock) {
                    this.Rules[functionBlockRuleIndex].splice(3,1);
                }
                return true;
            }
        }
        return false;
    }

    // Проверка граматики < функция >
    this.function = function () {

        return false;
    }

    /*
     * Конструктор Лексического анализатора
     */

    console.log('Program - ' + this.Program());
    console.log('Rules');
    console.log(this.Rules);
    console.log('Syntax Erros');
    console.log(this.SyntaxErrors);
    console.log('Declare');
    console.log(Declare);
    console.log('Type Boolean');
    console.log(TypeB);
    console.log('Type Int');
    console.log(TypeI);
    console.log('Type Float');
    console.log(TypeF);
    console.log('Type String');
    console.log(TypeS);
}