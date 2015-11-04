func bubbleSort(arr [100]int, length int) {
    var temp, counter int
    var ex bool
    
    for !ex {
        ex = true
        counter = 0
        for counter < length-1 {
            if arr[counter] > arr[counter+1] {
                temp = arr[counter]
                arr[counter] = arr[counter+1]
                arr[counter+1] = temp
                ex = false
            }
            counter = counter + 1
        }
    }
	
	fmt.Print("Отсортированный массив: ")
    counter = 0
    for counter < length {
        fmt.Print(arr[counter])
        counter = counter + 1
    }
}

func main() {
    var length, counter int
    var arr [100]int
    
    counter = 0
    fmt.Print("Введите размер массива: ")
    fmt.Scan(&length)
    fmt.Print("Введите массива: ")
    for counter < length {
        fmt.Scan(&arr[counter])
        counter = counter + 1
    }
    
    bubbleSort(arr, length)
   
}