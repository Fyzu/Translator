func bubbleSort(array [100]int, length int) {
    var temp, counter int
    var exit bool
    
    for !exit {
        exit = true
        counter = 0
        for counter < length-1 {
            if array[counter] > array[counter+1] {
                temp = array[counter]
                array[counter] = array[counter+1]
                array[counter+1] = temp
                exit = false
            }
            counter = counter + 1
        }
    }
}

func main() {
    var length, counter int
    var array [100]int
    
    counter = 0
    fmt.Print("Введите размер массива: ")
    fmt.Scan(&length)
    fmt.Print("Введите массива: ")
    for counter < length {
        fmt.Scan(&array[counter])
        counter = counter + 1
    }
    
    bubbleSort(array, length)
    
    fmt.Print("Отсортированный массив: ")
    counter = 0
    for counter < length {
        fmt.Print(array[counter])
        counter = counter + 1
    }
}