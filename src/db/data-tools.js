function removeArrayItem(item, array){
    var index = array.indexOf(item);
    if(index !== -1) array.splice(index, 1);
    return array;
}

module.exports = {
    removeArrayItem,
};