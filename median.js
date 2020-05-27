const main = () =>{
    const _1 = 0.98; const _2 = 0.99; const _3 = 1.00; const _4 = 1.01; const _5 = 1.02
    const forwards = [_1, _2, _3, _4, _5]
    const backwards = [_5, _4, _3, _2, _1]
    const random = [_2, _5, _1, _4, _3]

    console.log(updatePrice(forwards))
    console.log(updatePrice(backwards))
    console.log(updatePrice(random))
}

function updatePrice(priceArray) {
    var sortedPriceFeed = _sortArray(priceArray);
    const medianPrice = sortedPriceFeed[2];
    return medianPrice
}

const _sortArray = (array) => {
    var l = array.length;
    for(var i = 0; i < l; i++) {
        for(var j = i+1; j < l ;j++) {
            if(array[i] > array[j]) {
                const temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
    }
    return array;
}

main () 