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
    var namesInFunctions = [];
    var paramsInFunctions = [];
    var identifierInFunctions = [];

    this.Rules = [];
    this.SyntaxErrors = [];

    var currentLexeme = 0;
    var currentRule;

    /*
     * Методы Parser'а
     */
    /** Проверка граматики < программа >
     * @return {boolean}
     */
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
                if(this.Lexemes[currentLexeme][0] == '}') {
                    return true;
                } else {
                    this.SyntaxErrors.push(['function is not closed \'}\'']);
                }
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
        if (this.Lexemes[currentLexeme][1] === 12) {
            TypeB = TypeB.concat(Variables);
            Variables.clear();
            this.Rules[currentRule].push(this.Lexemes[currentLexeme++][0]);
            return true;
        } else if (this.Lexemes[currentLexeme][1] === 13) {
            TypeI = TypeI.concat(Variables);
            Variables.clear();
            this.Rules[currentRule].push(this.Lexemes[currentLexeme++][0]);
            return true;
        } else if (this.Lexemes[currentLexeme][1] === 14) {
            TypeF = TypeF.concat(Variables);
            Variables.clear();
            this.Rules[currentRule].push(this.Lexemes[currentLexeme++][0]);
            return true;
        } else if (this.Lexemes[currentLexeme][1] === 15) {
            TypeS = TypeS.concat(Variables);
            Variables.clear();
            this.Rules[currentRule].push(this.Lexemes[currentLexeme++][0]);
            return true;
        } else {
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
            return true;
        } else {
            this.Rules.splice(operatorSequenceRuleIndex,1);
            currentRule--;
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
            var identifier = this.Lexemes[currentLexeme][0];
            var type = variableType(this.Lexemes[currentLexeme++][0]);
            if(this.Lexemes[currentLexeme][0] == '[') {
                if(this.Lexemes[currentLexeme+1][1] == 50 && this.Lexemes[currentLexeme+2][0] == ']') {
                    currentLexeme+=3;
                    identifier += '[' + this.Lexemes[currentLexeme+1][0] + ']';
                    currentRule++;
                } else {
                    this.SyntaxErrors.push(['not closed reference to an array element']);
                    return false;
                }
            }
            identifierInOperators.push(identifier);
            if (this.Lexemes[currentLexeme][1] == 36) {
                currentLexeme++;

                if (this.expression(type)) {
                    return true;
                }
            }
        }
        /****************************************************
         * Проверка if < условие > { < посл. операторов > }
         ****************************************************/
        else if (this.Lexemes[currentLexeme][1] == 4) {
            this.Rules.push(['<оператор>', '=>', 'if']);
            currentRule++;
            currentLexeme++;
            var operatorRuleIndex = currentRule;
            if(this.condition()) {
                this.Rules[operatorRuleIndex].push('<условие>');
                if(this.Lexemes[currentLexeme][0] == '{') {
                    this.Rules[operatorRuleIndex].push('{');
                    currentLexeme++;
                    if(this.operatorSequence()) {
                        this.Rules[operatorRuleIndex].push('<последовательность операторов>');
                        if(this.Lexemes[currentLexeme][0] == '}') {
                            this.Rules[operatorRuleIndex].push('}');
                            currentLexeme++;
                        }
                        if (this.Lexemes[currentLexeme][1] == 5) {
                            this.Rules[operatorRuleIndex].push('else');
                            currentLexeme++;
                            if(this.Lexemes[currentLexeme][0] == '{') {
                                this.Rules[operatorRuleIndex].push('{');
                                currentLexeme++;
                                if (this.operatorSequence()) {
                                    this.Rules[operatorRuleIndex].push('<последовательность операторов>');
                                    if (this.Lexemes[currentLexeme][0] == '}') {
                                        this.Rules[operatorRuleIndex].push('}');
                                        currentLexeme++;
                                        return true;
                                    }
                                }
                            }
                        } else {
                            return true;
                        }
                        return false;
                    }
                }
            }
        }
        /****************************************************
         * Проверка for < условие > { < посл. операторов > }
         ****************************************************/
        else if (this.Lexemes[currentLexeme][1] == 6) {
            this.Rules.push(['<оператор>', '=>', 'for']);
            currentRule++;
            currentLexeme++;
            var operatorRuleIndex = currentRule;
            if(this.condition()) {
                this.Rules[operatorRuleIndex].push('<условие>');
                if(this.Lexemes[currentLexeme][0] == '{') {
                    this.Rules[operatorRuleIndex].push('{');
                    currentLexeme++;
                    if(this.operatorSequence()) {
                        this.Rules[operatorRuleIndex].push('<последовательность операторов>');
                        if(this.Lexemes[currentLexeme][0] == '}') {
                            this.Rules[operatorRuleIndex].push('}');
                            currentLexeme++;
                            return true;
                        }
                    }
                }
            }
        }
        /****************************************************
         *          Проверка fmt.Print ( < выражение > )
         ****************************************************/
        else if (this.Lexemes[currentLexeme][1] == 16) {
            this.Rules.push(['<оператор>', '=>', this.Lexemes[currentLexeme][0]]);
            currentRule++;
            currentLexeme++;
            var operatorRuleIndex = currentRule;
            if(this.Lexemes[currentLexeme][0] == '(') {
                this.Rules[operatorRuleIndex].push('(');
                currentLexeme++;
                var type;
                if(this.Lexemes[currentLexeme][1] == 40)
                    type = variableType(this.Lexemes[currentLexeme][0]);
                else
                    type = this.Lexemes[currentLexeme][1];
                if(this.expression(type)) {
                    this.Rules[operatorRuleIndex].push('<выражение>');
                    if(this.Lexemes[currentLexeme][0] == ')') {
                        this.Rules[operatorRuleIndex].push(')');
                        currentLexeme++;
                        return true;
                    }
                }
            }
        }
        /****************************************************
         *          Проверка fmt.Scan ( ид. )
         ****************************************************/
        else if (this.Lexemes[currentLexeme][1] == 17) {
            this.Rules.push(['<оператор>', '=>', this.Lexemes[currentLexeme][0]]);
            currentRule++;
            currentLexeme++;
            var operatorRuleIndex = currentRule;
            if(this.Lexemes[currentLexeme][0] == '(') {
                this.Rules[operatorRuleIndex].push('(');
                currentLexeme++;
                if(this.Lexemes[currentLexeme][1] == 40) {
                    this.Rules[operatorRuleIndex].push('ид.');
                    identifierInOperators.push(this.Lexemes[currentLexeme++][0]);
                    if(this.Lexemes[currentLexeme][0] == ')') {
                        this.Rules[operatorRuleIndex].push(')');
                        currentLexeme++;
                        return true;
                    }
                }
            }
        }
        /****************************************************
         *  Проверка { < последовательность операторов > }
         ****************************************************/
        else if (this.Lexemes[currentLexeme][0] == '{') {
            this.Rules.push(['<оператор>', '=>', '{']);
            currentRule++;
            currentLexeme++;
            var operatorRuleIndex = currentRule;
            if(this.operatorSequence()) {
                this.Rules[operatorRuleIndex].push('<последовательность операторов>');
                if(this.Lexemes[currentLexeme][0] == '}') {
                    this.Rules[operatorRuleIndex].push('}');
                    currentLexeme++;
                    return true;
                }
            }
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
        } else {
            return 0;
        }
    }

    // Проверка граматики < выражение >
    this.expression = function (type) {
        if (type == 12 || type == 53) {
            this.Rules.push(['<выражение>','=>','<логическое выражение>']);
            currentRule++;
            return this.boolExpression();
        } else if (type == 13 || type == 14 || type == 18 || type == 19 || type == 50 || type == 52) {
            this.Rules.push(['<выражение>','=>','<численное выражение>']);
            currentRule++;
            return this.numExpression();
        } else if (type == 15 || type == 51) {
            this.Rules.push(['<выражение>','=>','<строковое выражение>']);
            currentRule++;
            return this.stringExpression();
        } else {
            this.SyntaxErrors.push(['incorrect type of expression']);
            return false;
        }
    }

    // Проверка граматики < численное выражение >
    this.numExpression = function () {

        this.Rules.push(['<численное выражение>','=>',]);
        currentRule++;
        var numExpressionRuleIndex = currentRule;
        if(this.Lexemes[currentLexeme][1] == 40 || this.Lexemes[currentLexeme][1] == 50 || this.Lexemes[currentLexeme][1] == 52 // идентификатор или целая константа
        || this.Lexemes[currentLexeme][0] == '(') {
            this.Rules[numExpressionRuleIndex].push('<терм>');
            if (this.term()) {
                // Проверка на < терм > */% < числ. выражение >
                if (this.Lexemes[currentLexeme][1] == 18 || this.Lexemes[currentLexeme][1] == 19 || this.Lexemes[currentLexeme][1] == 32) {
                    this.Rules[numExpressionRuleIndex].push(this.Lexemes[currentLexeme++][0], '<численное выражение>');
                    if (!this.numExpression()) {
                        this.SyntaxErrors.push(['no expression after the arithmetic operators']);
                    }
                }
            }
        } else if (this.Lexemes[currentLexeme][1] == 18) {
            this.Rules[numExpressionRuleIndex].push(this.Lexemes[currentLexeme++][0]);
            if(this.Lexemes[currentLexeme][0] == '(') {
                this.Rules[numExpressionRuleIndex].push('(', '<численное выражение>','');
                currentLexeme++;
                if(!this.numExpression()) {
                    this.SyntaxErrors.push(['no expression after the arithmetic operators']);
                }
                if(this.Lexemes[currentLexeme++][0] == ',') {
                    this.Rules[numExpressionRuleIndex].push(',', '<численное выражение>', ')');
                    if (!this.numExpression()) {
                        this.SyntaxErrors.push(['no expression after the arithmetic operators']);
                    }
                    if(this.Lexemes[currentLexeme++][0] != ')') {
                        this.SyntaxErrors.push(['not a closed bracket']);
                    }
                } else {
                    this.SyntaxErrors.push(['math.Pow takes 2 arguments']);
                }
            }
        } else if (this.Lexemes[currentLexeme][1] == 19) {
            this.Rules[numExpressionRuleIndex].push(this.Lexemes[currentLexeme++][0]);
            if(this.Lexemes[currentLexeme][0] == '(') {
                currentLexeme++;
                this.Rules[numExpressionRuleIndex].push('(', '<численное выражение>',')');
                if(!this.numExpression()) {
                    this.SyntaxErrors.push(['no expression after the arithmetic operators']);
                }
            } else {
                this.SyntaxErrors(['no a open bracket after function math.Sqrt']);
            }
        }

        return true;
    }

    // Проверка на < терм >
    this.term = function () {
        if(this.Lexemes[currentLexeme][1] == 40 || this.Lexemes[currentLexeme][1] == 50 || this.Lexemes[currentLexeme][1] == 52 // идентификатор или целая константа
            || this.Lexemes[currentLexeme][0] == '(')
        {
            this.Rules.push(['<терм>','=>',]);
            currentRule++;
            if(this.Lexemes[currentLexeme][1] == 40 || this.Lexemes[currentLexeme][1] == 50 || this.Lexemes[currentLexeme][1] == 52) {
                this.Rules[currentRule].push(this.Lexemes[currentLexeme++][0]);
            } else if(this.Lexemes[currentLexeme][0] == '(') {
                this.Rules[currentRule].push('(', '<численное выражение>',')');
                currentLexeme++;
                if(this.numExpression()) {
                    if(this.Lexemes[currentLexeme][0] == ')') {
                        currentLexeme++;
                    } else {
                        this.Errors.push(['incorrect expression']);
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }


    // Проверка граматики < логическое выражение >
    this.boolExpression = function () {
        this.Rules.push(['<логическое выражение>','=>',]);
        currentRule++;
        var boolExpressionRuleIndex = currentRule;
        if(this.condition()) {
            this.Rules[boolExpressionRuleIndex].push('<условие>');
            return true;
        }
        return false;
    }

    // Проверка граматики < условие >
    this.condition = function () {
        this.Rules.push(['<условие>','=>',]);
        currentRule++;
        var conditionRuleIndex = currentRule;
        if (this.Lexemes[currentLexeme][1] == 33 && this.Lexemes[currentLexeme][2] == 0) {
            currentLexeme++;
            this.Rules[conditionRuleIndex].push('!');
            if(this.condition()){
                this.Rules[conditionRuleIndex].push('<условие>');
                return true;
            } else {
                this.SyntaxErrors.push(['no condition operator after \'!\'']);
            }
        } else if (this.Lexemes[currentLexeme][1] == 40  || this.Lexemes[currentLexeme][1] == 50  || this.Lexemes[currentLexeme][1] == 51
                || this.Lexemes[currentLexeme][1] == 52 || this.Lexemes[currentLexeme][1] == 53 || this.Lexemes[currentLexeme][1] == 18  || this.Lexemes[currentLexeme][1] == 19) {
            if(this.Lexemes[currentLexeme][1] == 53 || this.Lexemes[currentLexeme][1] == 18  || this.Lexemes[currentLexeme][1] == 19) {
                this.Rules[conditionRuleIndex].push(this.Lexemes[currentLexeme++][0]);
            } else {
                this.Rules[conditionRuleIndex].push('<сравнение>');
                if (!this.comparison()) {
                    return false
                }
            }
            if(this.Lexemes[currentLexeme][1] == 33) {
                this.Rules[conditionRuleIndex].push(this.Lexemes[currentLexeme][0]);
                currentLexeme++;
                if(this.condition()) {
                    this.Rules[conditionRuleIndex].push('<условие>');
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    }

    // Проверка граматики < сравнение >
    this.comparison = function () {
        this.Rules.push(['<сравнение>','=>', '<выражение>']);
        currentRule++;
        var comparisonRuleIndex = currentRule;
        var type;
        if(this.Lexemes[currentLexeme][1] == 40)
            type = variableType(this.Lexemes[currentLexeme][0]);
        else
            type = this.Lexemes[currentLexeme][1];
        if(this.expression(type)) {
            if (this.Lexemes[currentLexeme][1] == 31) {
                this.Rules[comparisonRuleIndex].push(this.Lexemes[currentLexeme][0]);
                currentLexeme++;
                if(this.Lexemes[currentLexeme][1] == 40)
                    type = variableType(this.Lexemes[currentLexeme][0]);
                else
                    type = this.Lexemes[currentLexeme][1];
                if(this.expression(type)) {
                    this.Rules[comparisonRuleIndex].push('<выражение>');
                    return true;
                }
            }
        }
        return false;
    }

    // Проверка граматики < строковое выражение >
    this.stringExpression = function () {
        this.Rules.push(['<строковое выражение>','=>',]);
        currentRule++;
        var stringexpressionRuleIndex = currentRule;
        if(this.Lexemes[currentLexeme][1] == 40) {
            this.Rules[stringexpressionRuleIndex].push('ид.');
            identifierInOperators.push(this.Lexemes[currentLexeme++][0]);
            return true;
        } else if(this.stringTerm()) {
            this.Rules[stringexpressionRuleIndex].push('<стр. терм>');
            if(this.Lexemes[currentLexeme][0] == '+') {
                currentLexeme++;
                this.Rules[stringexpressionRuleIndex].push('+');
                if(this.stringExpression()) {
                    this.Rules[stringexpressionRuleIndex].push('<строковое выражение>');
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    }

    // Проверка граматики < стр. терм >
    this.stringTerm = function () {
        this.Rules.push(['<стр. терм>','=>',]);
        currentRule++;
        var stringTermRuleIndex = currentRule;
        if(this.Lexemes[currentLexeme][1] == 40) {
            identifierInOperators.push(this.Lexemes[currentLexeme][0]);
            this.Rules[stringTermRuleIndex].push('ид.');
            currentLexeme++;
            return true;
        } else if (this.Lexemes[currentLexeme][1] == 51) {
            this.Rules[stringTermRuleIndex].push(this.Lexemes[currentLexeme][0]);
            currentLexeme++;
            return true;
        }
        return false;
    }

    // Проверка граматики < блок функций >
    this.functionBlock = function () {
        if(this.Lexemes[currentLexeme][0] == 'func' && this.Lexemes[currentLexeme+1][0] != 'main') { // Если текущая лекссема - func и след. не main
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
        this.Rules.push(['<функция>','=>',]);
        currentRule++;
        var functionRuleIndex = currentRule;
        if(this.Lexemes[currentLexeme][1] == 1) {
            this.Rules[functionRuleIndex].push(this.Lexemes[currentLexeme++][0]);
            if(this.Lexemes[currentLexeme][1] == 40) {
                this.Rules[functionRuleIndex].push('ид.');
                namesInFunctions.push(this.Lexemes[currentLexeme++][0]);
                if(this.Lexemes[currentLexeme][0] == '(') {
                    this.Rules[functionRuleIndex].push('(');
                    currentLexeme++;
                    if(this.Lexemes[currentLexeme][1] == 40) {
                        if (this.inputParam()) {
                            this.Rules[functionRuleIndex].push('<входные параметры>');
                        }
                    }
                    if(this.Lexemes[currentLexeme][0] == ')') {
                        this.Rules[functionRuleIndex].push(')');
                        currentLexeme++;
                        if(this.Lexemes[currentLexeme][1] > 11 && this.Lexemes[currentLexeme][1] < 16) {
                            if(this.variableType()) {
                                this.Rules[functionRuleIndex].push('<тип>');
                            }
                        }
                        if(this.Lexemes[currentLexeme][0] == '{') {
                            this.Rules[functionRuleIndex].push('{');
                            currentLexeme++;
                            if(this.variablesBlock()) {
                                this.Rules[functionRuleIndex].push('<блок переменных>');
                                if(this.operatorSequence()) {
                                    this.Rules[functionRuleIndex].push('<последовательность операторов>');
                                    if(this.Lexemes[currentLexeme][0] == '}') {
                                        this.Rules[functionRuleIndex].push('}');
                                        currentLexeme++;
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    // Проверка граматики < входные параметры >
    this.inputParam = function () {
        this.Rules.push('<входные параметры>');
        currentRule++;
        var inputParamRuleIndex = currentRule;
        if(this.Lexemes[currentLexeme][1] == 40) {
            this.Rules[inputParamRuleIndex].push('ид.');
            paramsInFunctions.push(this.Lexemes[currentLexeme++][0]);
            if(this.variableType()) {
                this.Rules[inputParamRuleIndex].push('<тип>');
                if(this.Lexemes[currentLexeme][0] == ',') {
                    this.Rules[inputParamRuleIndex].push(',');
                    currentLexeme++;
                    if(!this.inputParam()) {
                        return false;
                    }
                    this.Rules[inputParamRuleIndex].push('<входные параметры>');
                }
                return true;
            }
        }
        return false;
    }

    /*
     * Конструктор Лексического анализатора
     */

    console.log('Program - ' + this.Program());
    /*console.log('Rules');
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
    console.log('Identifier In Operators');
    console.log(identifierInOperators);*/
}