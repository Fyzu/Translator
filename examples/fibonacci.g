func fibonacci(enteredNumber int) int {    
    var result int    
    if enteredNumber == 1 || enteredNumber == 2 {    
        result = (enteredNumber -1)    
    } else {    
        result = fibonacci(enteredNumber-1) + fibonacci(enteredNumber-2)    
    }    
    return result    
}    
    
func main() {    
    var counter, enteredNumber int    
    counter = 0    
    fmt.Print("Введите индекс числа из Ряда Фибоначи: ")    
    fmt.Scan(&enteredNumber)    
    fmt.Print("Число Фибоначи")    
    fmt.Print(fibonacci(enteredNumber + 1))
}