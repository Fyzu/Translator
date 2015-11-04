func main() {
    var arr [10]string
    var str string
    var index int
    
    str = "foo" + "bar"
    
    index = 0
    for index < 10 {
        fmt.Scan(& arr[index])
        index = index + 1
    }
    
    index = 0
    for index < 10 {
        if arr[index] == str {
            fmt.Print(index)
        }
        index = index + 1
    }
}